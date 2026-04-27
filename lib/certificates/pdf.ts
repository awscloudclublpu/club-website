import path from 'path'
import { readFile } from 'fs/promises'
import QRCode from 'qrcode'
import { toReadableDate } from '@/lib/certificates/core'

type PuppeteerModule = typeof import('puppeteer')

type CertificatePdfPayload = {
  fullName: string
  eventTitle: string
  eventDate: string
  certificateUid: string
}

const CERTIFICATE_BACKGROUND_PATH = path.join(
  process.cwd(),
  'public',
  'image',
  'certificate',
  'workshop.png'
)

let cachedBackgroundDataUrl: string | null = null
let backgroundDataUrlPromise: Promise<string> | null = null
let puppeteerModulePromise: Promise<PuppeteerModule> | null = null
let browserPromise: Promise<import('puppeteer').Browser> | null = null

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function getCertificateBackgroundDataUrl() {
  if (cachedBackgroundDataUrl) {
    return cachedBackgroundDataUrl
  }

  if (backgroundDataUrlPromise) {
    return backgroundDataUrlPromise
  }

  backgroundDataUrlPromise = (async () => {
    const imageBuffer = await readFile(CERTIFICATE_BACKGROUND_PATH)
    const dataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`
    cachedBackgroundDataUrl = dataUrl
    backgroundDataUrlPromise = null
    return dataUrl
  })()

  return backgroundDataUrlPromise
}

async function getPuppeteerModule() {
  if (!puppeteerModulePromise) {
    puppeteerModulePromise = import('puppeteer')
  }

  return puppeteerModulePromise
}

async function createBrowser() {
  const puppeteer = await getPuppeteerModule()

  return puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = createBrowser()
  }

  try {
    return await browserPromise
  } catch (error) {
    browserPromise = null
    throw error
  }
}

export async function generateCertificatePdf(payload: CertificatePdfPayload): Promise<Buffer> {
  const [backgroundDataUrl, qrCodeDataUrl, browser] = await Promise.all([
    getCertificateBackgroundDataUrl(),
    QRCode.toDataURL(`https://awslpu.in/verify/${payload.certificateUid}`, {
      width: 180,
      margin: 1,
    }),
    getBrowser(),
  ])

  let page: import('puppeteer').Page | null = null

  try {
    page = await browser.newPage()

    page.setDefaultNavigationTimeout(30_000)
    page.setDefaultTimeout(30_000)

    await page.setViewport({ width: 1754, height: 1240, deviceScaleFactor: 2 })

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            @page { size: A4 landscape; margin: 0; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              width: 297mm;
              height: 210mm;
              font-family: 'Georgia', 'Times New Roman', serif;
              color: #1f2a44;
            }
            .canvas {
              position: relative;
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            .background {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .name {
              position: absolute;
              left: 50%;
              top: 48%;
              width: 74%;
              transform: translate(-50%, -50%);
              text-align: center;
              font-size: 56px;
              font-weight: 700;
              letter-spacing: 0.02em;
              color: #0c1c3d;
              text-transform: uppercase;
            }
            .attendance-line {
              position: absolute;
              left: 50%;
              top: 56%;
              width: 80%;
              transform: translateX(-50%);
              text-align: center;
              font-size: 30px;
              color: #17325f;
            }
            .uid {
              position: absolute;
              left: 48px;
              bottom: 52px;
              font-size: 14px;
              letter-spacing: 0.1em;
              font-family: 'Courier New', monospace;
              color: #2c4672;
            }
            .qr {
              position: absolute;
              right: 48px;
              bottom: 52px;
              width: 120px;
              height: 120px;
              border: 2px solid #355480;
              border-radius: 10px;
              background: #fff;
              padding: 6px;
            }
          </style>
        </head>
        <body>
          <div class="canvas">
            <img class="background" src="${backgroundDataUrl}" alt="Certificate Background" />
            <div class="name">${escapeHtml(payload.fullName)}</div>
            <div class="attendance-line">For attending &quot;${escapeHtml(payload.eventTitle)}&quot; on ${escapeHtml(toReadableDate(payload.eventDate))}</div>
            <div class="uid">${escapeHtml(payload.certificateUid)}</div>
            <img class="qr" src="${qrCodeDataUrl}" alt="Certificate QR" />
          </div>
        </body>
      </html>
    `

    await page.setContent(html, { waitUntil: 'domcontentloaded' })

    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    })

    return Buffer.from(pdf)
  } catch (error) {
    // If the shared browser became stale, reset so next request relaunches it.
    browserPromise = null
    throw error
  } finally {
    if (page) {
      await page.close()
    }
  }
}

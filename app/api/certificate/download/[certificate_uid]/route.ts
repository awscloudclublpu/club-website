export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateCertificatePdf } from '@/lib/certificates/pdf'
import { getCertificateStoragePath } from '@/lib/certificates/core'

type RouteContext = {
  params: Promise<{
    certificate_uid: string
  }>
}

function buildPdfHeaders(certificateUid: string): HeadersInit {
  return {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${certificateUid}.pdf"`,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  }
}

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const { certificate_uid: certificateUid } = await params
    const url = new URL(req.url)
    const forceRefresh = url.searchParams.get('refresh') === '1'

    if (!certificateUid) {
      return NextResponse.json({ error: 'Invalid certificate UID' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: certificate, error: certificateError } = await supabaseAdmin
      .from('certificates')
      .select('id, user_id, event_id, certificate_uid, issued_at')
      .eq('certificate_uid', certificateUid)
      .maybeSingle()

    if (certificateError) {
      return NextResponse.json({ error: certificateError.message }, { status: 500 })
    }

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    if (certificate.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const bucket = process.env.SUPABASE_CERTIFICATE_BUCKET || 'certificates'
    const filePath = getCertificateStoragePath(certificate.user_id, certificate.certificate_uid)

    if (!forceRefresh) {
      const { data: cachedPdf, error: cachedPdfError } = await supabaseAdmin.storage
        .from(bucket)
        .download(filePath)

      if (!cachedPdfError && cachedPdf) {
        const arrayBuffer = await cachedPdf.arrayBuffer()
        return new Response(arrayBuffer, { headers: buildPdfHeaders(certificate.certificate_uid) })
      }
    }

    const [{ data: profile, error: profileError }, { data: event, error: eventError }] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', certificate.user_id)
        .single(),
      supabaseAdmin
        .from('events')
        .select('title, event_date')
        .eq('id', certificate.event_id)
        .single(),
    ])

    if (profileError || eventError || !profile || !event) {
      return NextResponse.json({ error: 'Certificate source data not found' }, { status: 404 })
    }

    const pdfBuffer = await generateCertificatePdf({
      fullName: profile.full_name || 'Participant',
      eventTitle: event.title,
      eventDate: event.event_date,
      certificateUid: certificate.certificate_uid,
    })

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
        cacheControl: '31536000',
      })

    if (uploadError) {
      console.warn('Certificate upload failed:', uploadError.message)
    }

    return new Response(new Uint8Array(pdfBuffer), { headers: buildPdfHeaders(certificate.certificate_uid) })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

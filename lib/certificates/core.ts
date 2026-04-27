import crypto from 'crypto'

export const CERTIFICATE_TEMPLATE_VERSION = 'v3'

export function isEligibleForCertificate(statuses: string[]): boolean {
  const distinct = new Set(statuses)
  return distinct.has('checkin') && distinct.has('checkout')
}

export function createCertificateUid(eventId: string): string {
  const shortEventId = eventId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'EVENT'
  const random6 = crypto.randomBytes(3).toString('hex').toUpperCase()

  return `EVT-${shortEventId}-${random6}`
}

export function getCertificateStoragePath(userId: string, certificateUid: string): string {
  return `${userId}/${CERTIFICATE_TEMPLATE_VERSION}/${certificateUid}.pdf`
}

export function toReadableDate(dateString: string): string {
  const parsed = new Date(dateString)

  if (Number.isNaN(parsed.getTime())) {
    return dateString
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

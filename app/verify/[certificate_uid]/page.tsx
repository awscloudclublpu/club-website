import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { toReadableDate } from '@/lib/certificates/core'

type VerifyPageProps = {
  params: Promise<{ certificate_uid: string }>
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { certificate_uid: certificateUid } = await params

  const { data: certificate, error: certificateError } = await supabaseAdmin
    .from('certificates')
    .select('user_id, event_id, certificate_uid, issued_at')
    .eq('certificate_uid', certificateUid)
    .maybeSingle()

  const isValid = !certificateError && !!certificate

  if (!isValid || !certificate) {
    return (
      <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,165,0,0.12),transparent_24%),linear-gradient(135deg,#071225_0%,#0B1D3A_45%,#132E59_100%)]" />
        <div className="relative mx-auto max-w-3xl rounded-3xl border border-red-400/30 bg-[#08192F]/85 p-8 shadow-[0_24px_80px_rgba(2,10,24,0.5)] backdrop-blur-xl">
          <h1 className="text-3xl font-bold text-white">Certificate Verification</h1>
          <p className="mt-4 text-lg text-red-300">Status: Invalid</p>
          <p className="mt-2 text-blue-100/75">No certificate found for UID: {certificateUid}</p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center rounded-xl border border-cyan-400/30 bg-blue-950/60 px-4 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const [{ data: profile }, { data: event }] = await Promise.all([
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

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,165,0,0.12),transparent_24%),linear-gradient(135deg,#071225_0%,#0B1D3A_45%,#132E59_100%)]" />

      <div className="relative mx-auto max-w-3xl rounded-3xl border border-emerald-400/30 bg-[#08192F]/85 p-8 shadow-[0_24px_80px_rgba(2,10,24,0.5)] backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-white">Certificate Verification</h1>
        <p className="mt-4 text-lg text-emerald-300">Status: Valid</p>

        <div className="mt-6 grid gap-3 rounded-2xl border border-cyan-400/20 bg-blue-950/55 p-5 text-sm text-blue-100/85">
          <p><span className="font-semibold text-white">Certificate UID:</span> {certificate.certificate_uid}</p>
          <p><span className="font-semibold text-white">Name:</span> {profile?.full_name || 'Participant'}</p>
          <p><span className="font-semibold text-white">Event:</span> {event?.title || 'Unknown Event'}</p>
          <p><span className="font-semibold text-white">Event Date:</span> {event?.event_date ? toReadableDate(event.event_date) : 'Unknown'}</p>
          <p><span className="font-semibold text-white">Issued At:</span> {toReadableDate(certificate.issued_at)}</p>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-xl border border-cyan-400/30 bg-blue-950/60 px-4 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

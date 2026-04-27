import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isEligibleForCertificate } from '@/lib/certificates/core'
import CertificatesClient from '@/components/certificate/CertificatesClient'

type EventRow = {
  id: string
  title: string
  event_date: string
}

type AttendanceRow = {
  event_id: string
  status: string
}

type CertificateRow = {
  event_id: string
  certificate_uid: string
}

export default async function CertificatesPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [{ data: eventsData }, { data: attendanceData }, { data: certificatesData }] = await Promise.all([
    supabaseAdmin
      .from('events')
      .select('id, title, event_date')
      .order('event_date', { ascending: false }),
    supabaseAdmin
      .from('attendance')
      .select('event_id, status')
      .eq('user_id', user.id)
      .in('status', ['checkin', 'checkout']),
    supabaseAdmin
      .from('certificates')
      .select('event_id, certificate_uid')
      .eq('user_id', user.id),
  ])

  const attendanceByEvent = new Map<string, string[]>()

  for (const row of (attendanceData ?? []) as AttendanceRow[]) {
    if (!attendanceByEvent.has(row.event_id)) {
      attendanceByEvent.set(row.event_id, [])
    }

    attendanceByEvent.get(row.event_id)?.push(row.status)
  }

  const certificateByEvent = new Map<string, string>()

  for (const row of (certificatesData ?? []) as CertificateRow[]) {
    certificateByEvent.set(row.event_id, row.certificate_uid)
  }

  const events = ((eventsData ?? []) as EventRow[]).map((event) => ({
    id: event.id,
    title: event.title,
    eventDate: event.event_date,
    eligible: isEligibleForCertificate(attendanceByEvent.get(event.id) ?? []),
    certificateUid: certificateByEvent.get(event.id) ?? null,
  }))

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,165,0,0.12),transparent_24%),linear-gradient(135deg,#071225_0%,#0B1D3A_45%,#132E59_100%)]" />
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(0deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent)] bg-size-[56px_56px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">My Certificates</h1>
          <p className="mt-3 max-w-3xl text-blue-100/80">
            Generate and download certificates for events where you completed both checkin and checkout.
          </p>
        </div>

        {events.length ? (
          <CertificatesClient events={events} />
        ) : (
          <div className="rounded-2xl border border-cyan-400/20 bg-blue-950/50 px-6 py-8 text-blue-100/80">
            No events found yet.
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-xl border border-cyan-400/30 bg-blue-950/60 px-4 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

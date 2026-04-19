import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarDays, MapPin, Ticket, TriangleAlert } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import TicketActions from '@/components/attendance/TicketActions'

type TicketPageProps = {
  searchParams: Promise<{ eventId?: string }>
}

export default async function TicketPage({ searchParams }: TicketPageProps) {
  const params = await searchParams
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, workspace_uid, workspace_name')
    .eq('id', user.id)
    .single()

  const now = new Date()
  const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()

  let event: { id: string; title: string; event_date: string; location: string | null } | null = null

  if (params.eventId) {
    const { data } = await supabaseAdmin
      .from('events')
      .select('id, title, event_date, location')
      .eq('id', params.eventId)
      .single()

    event = data
  } else {
    const { data } = await supabaseAdmin
      .from('events')
      .select('id, title, event_date, location')
      .gte('event_date', windowStart)
      .lte('event_date', windowEnd)
      .order('event_date', { ascending: true })
      .limit(10)

    event =
      data && data.length
        ? data.reduce((closest, current) => {
            const closestDelta = Math.abs(new Date(closest.event_date).getTime() - now.getTime())
            const currentDelta = Math.abs(new Date(current.event_date).getTime() - now.getTime())
            return currentDelta < closestDelta ? current : closest
          })
        : null
  }

  if (!event) {
    return (
      <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,165,0,0.12),transparent_24%),linear-gradient(135deg,#071225_0%,#0B1D3A_45%,#132E59_100%)]" />
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(0deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent)] bg-size-[56px_56px]" />

        <div className="relative mx-auto max-w-3xl rounded-3xl border border-cyan-400/20 bg-[#08192F]/85 p-6 shadow-[0_24px_80px_rgba(2,10,24,0.5)] backdrop-blur-xl sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 px-4 py-2 text-xs font-mono uppercase tracking-[0.24em] text-amber-200">
            <TriangleAlert size={14} />
            Ticket unavailable
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">No upcoming event ticket yet</h1>
          <p className="mt-3 text-blue-100/75">
            We could not find an event within the ticket window (24 hours before to 24 hours after event time). Please check the events page and return closer to event time.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="inline-flex h-11 items-center rounded-xl bg-linear-to-r from-cyan-400 to-sky-300 px-4 text-sm font-semibold text-[#08192F] transition hover:brightness-110"
            >
              Browse Events
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center rounded-xl border border-cyan-400/25 bg-blue-950/60 px-4 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const qrData = JSON.stringify({
    user_id: user.id,
    event_id: event.id,
  })

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrData)}`

  return (
    <div id="ticket" className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 text-white print:min-h-0 print:bg-white print:px-0 print:pb-0 print:pt-0 print:text-slate-900 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,165,0,0.12),transparent_24%),linear-gradient(135deg,#071225_0%,#0B1D3A_45%,#132E59_100%)] print:hidden" />
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(0deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent)] bg-size-[56px_56px] print:hidden" />

      <div className="relative mx-auto max-w-4xl print:max-w-none">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-blue-950/55 px-4 py-2 text-xs font-mono uppercase tracking-[0.28em] text-cyan-200 print:hidden">
          <Ticket size={14} />
          Event ticket
        </div>

        <div id="ticket-print-root" className="overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-[#08192F]/90 shadow-[0_24px_80px_rgba(2,10,24,0.55)] backdrop-blur-xl print:rounded-none print:border-slate-300 print:bg-white print:text-slate-900 print:shadow-none">
          <div className="grid gap-6 p-6 print:p-6 sm:grid-cols-[1fr_auto] sm:p-8">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-300/80 print:text-slate-500">AWS Cloud Club LPU</p>
              <h1 className="mt-3 text-3xl font-bold text-white print:text-slate-900">{event.title}</h1>
              <div className="mt-4 space-y-2 text-sm text-blue-100/80 print:text-slate-700">
                <p className="inline-flex items-center gap-2">
                  <CalendarDays size={16} />
                  {new Date(event.event_date).toLocaleString()}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin size={16} />
                  {event.location || 'Location to be announced'}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-blue-950/55 p-4 text-sm print:border-slate-300 print:bg-slate-50">
                <p className="text-blue-100/75 print:text-slate-700"><span className="font-semibold text-white print:text-slate-900">Attendee:</span> {profile?.full_name || user.email}</p>
                <p className="mt-2 text-blue-100/75 print:text-slate-700"><span className="font-semibold text-white print:text-slate-900">Workspace Name:</span> {profile?.workspace_name || 'Not provided'}</p>
                <p className="mt-2 text-blue-100/75 print:text-slate-700"><span className="font-semibold text-white print:text-slate-900">Workspace UID:</span> {profile?.workspace_uid || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <img
                src={qrUrl}
                alt="Event ticket QR"
                className="rounded-2xl border border-cyan-400/20 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] print:border-slate-300 print:shadow-none"
              />
              <p className="mt-3 text-center text-xs text-blue-100/70 print:text-slate-600">Show this QR during check-in</p>
            </div>
          </div>

          <div className="border-t border-cyan-400/15 bg-blue-950/55 px-6 py-4 text-sm text-blue-100/80 print:border-slate-300 print:bg-slate-100 print:text-slate-700 sm:px-8">
            <p className="inline-flex items-start gap-2">
              We recommend downloading this ticket before arriving to avoid internet issues during check-in.
            </p>
          </div>
        </div>

        <TicketActions backHref="/dashboard" />
      </div>
    </div>
  )
}

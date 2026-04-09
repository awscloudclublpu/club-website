'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BadgeCheck, CalendarDays, CircleGauge, Lock, ShieldCheck, Sparkles, Ticket, Download } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import ProfileCompletionModal from '@/components/ProfileCompletionModal'

type DashboardClientProps = {
  displayName: string
  email: string
  role: string
  isProfileIncomplete: boolean
  workspaceUid: string
  workspaceName: string
  upcomingEvent: {
    id: string
    title: string
    eventDate: string
    location: string | null
  } | null
}

export default function DashboardClient({
  displayName,
  email,
  role,
  isProfileIncomplete,
  upcomingEvent,
}: DashboardClientProps) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (isProfileIncomplete) {
      setShowModal(true)
    }
  }, [isProfileIncomplete])

  return (
    <>
      <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,165,0,0.12),transparent_24%),linear-gradient(135deg,#071225_0%,#0B1D3A_45%,#132E59_100%)]" />
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(0deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent)] bg-size-[56px_56px]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome, {displayName}
            </h1>
            <p className="mt-2 text-sm text-blue-100/75">
              {role === 'admin' ? 'Administrator' : 'Member'} • {email}
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="inline-flex h-10 items-center rounded-xl border border-cyan-400/30 bg-blue-950/60 px-4 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300"
            >
              <CircleGauge size={14} className="mr-2" />
              My Profile
            </Link>
            <Link
              href="/attendance/my"
              className="inline-flex h-10 items-center rounded-xl border border-cyan-400/30 bg-blue-950/60 px-4 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300"
            >
              <CalendarDays size={14} className="mr-2" />
              My Attendance
            </Link>
            {role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex h-10 items-center rounded-xl bg-linear-to-r from-cyan-400 to-sky-300 px-4 text-xs font-semibold text-[#08192F] transition hover:brightness-110"
              >
                <ShieldCheck size={14} className="mr-2" />
                Management Hub
              </Link>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
              <div className="rounded-[1.5rem] border border-cyan-400/20 bg-[#08192F]/80 p-5 shadow-[0_24px_80px_rgba(2,10,24,0.45)] backdrop-blur-xl">
                <div className="mb-4">
                  <div className="text-xs font-mono uppercase tracking-[0.28em] text-cyan-300/75">Quick info</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.24em] text-blue-100/55">Name</p>
                    <p className="mt-1 text-sm font-semibold text-white">{displayName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.24em] text-blue-100/55">Role</p>
                    <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold capitalize text-cyan-200">{role}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.14s' }}>
              <div className="rounded-[1.5rem] border border-cyan-300/25 bg-[#08192F]/85 p-5 shadow-[0_24px_80px_rgba(2,10,24,0.5)] backdrop-blur-xl">
                <div className="mb-4">
                  <div className="text-xs font-mono uppercase tracking-[0.28em] text-cyan-300/75">Event ticket</div>
                </div>

                {upcomingEvent ? (
                  <>
                    <div className="rounded-xl border border-cyan-400/20 bg-[#0A223F] p-3 mb-4">
                      <h3 className="text-sm font-semibold text-white">{upcomingEvent.title}</h3>
                      <p className="mt-1 text-xs text-blue-100/60">
                        {new Date(upcomingEvent.eventDate).toLocaleDateString()}
                        {upcomingEvent.location ? ` • ${upcomingEvent.location}` : ''}
                      </p>
                    </div>

                    <Link
                      href={`/attendance/ticket?eventId=${upcomingEvent.id}`}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-400 to-sky-300 px-4 text-xs font-semibold text-[#08192F] transition hover:brightness-110"
                    >
                      <Ticket size={14} />
                      View Ticket
                    </Link>
                  </>
                ) : (
                  <p className="text-xs text-blue-100/75">No event ready yet. Tickets appear 24h before an event.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileCompletionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  )
}

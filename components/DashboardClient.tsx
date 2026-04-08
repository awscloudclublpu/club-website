'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BadgeCheck, CalendarDays, CircleGauge, Lock, ShieldCheck, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import ProfileCompletionModal from '@/components/ProfileCompletionModal'

type DashboardClientProps = {
  displayName: string
  email: string
  role: string
  qrUrl: string
  isProfileIncomplete: boolean
  workspaceUid: string
  workspaceName: string
}

export default function DashboardClient({
  displayName,
  email,
  role,
  qrUrl,
  isProfileIncomplete,
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

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-blue-950/55 px-4 py-2 text-xs font-mono uppercase tracking-[0.28em] text-cyan-200">
                <Sparkles size={14} />
                Member dashboard
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Welcome, {displayName}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100/80 sm:text-lg">
                This is your AWS Cloud Club member space. Use it to confirm your profile, access your attendance QR, and stay ready for club activity.
              </p>
              <Link
                href="/attendance/my"
                className="mt-5 inline-flex h-11 items-center rounded-xl border border-cyan-400/30 bg-blue-950/60 px-4 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300"
              >
                My Attendance
              </Link>
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="mt-5 ml-3 inline-flex h-11 items-center rounded-xl border border-cyan-400/30 bg-blue-950/60 px-4 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300"
                >
                  Open Management Hub
                </Link>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-90">
              {[
                { label: 'Role', value: role, icon: ShieldCheck as LucideIcon },
                { label: 'Status', value: 'Active', icon: BadgeCheck as LucideIcon },
              ].map((item) => {
                const Icon: LucideIcon = item.icon

                return (
                  <div key={item.label} className="rounded-2xl border border-cyan-400/20 bg-blue-950/55 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.24em] text-cyan-300/75">
                      <Icon size={14} />
                      {item.label}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-white capitalize">{item.value}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
              <div className="rounded-[2rem] border border-cyan-400/20 bg-[#08192F]/80 p-6 shadow-[0_24px_80px_rgba(2,10,24,0.45)] backdrop-blur-xl sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-[0.28em] text-cyan-300/75">Profile</div>
                    <h2 className="mt-2 text-2xl font-bold text-white">Your account details</h2>
                  </div>
                  <div className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.22em] text-cyan-200">
                    Supabase synced
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-cyan-400/15 bg-blue-950/50 p-4">
                    <div className="text-xs font-mono uppercase tracking-[0.24em] text-blue-100/55">Name</div>
                    <div className="mt-2 text-lg font-semibold text-white">{displayName}</div>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/15 bg-blue-950/50 p-4">
                    <div className="text-xs font-mono uppercase tracking-[0.24em] text-blue-100/55">Email</div>
                    <div className="mt-2 text-lg font-semibold text-white break-all">{email}</div>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/15 bg-blue-950/50 p-4 sm:col-span-2">
                    <div className="text-xs font-mono uppercase tracking-[0.24em] text-blue-100/55">Role</div>
                    <div className="mt-2 text-lg font-semibold capitalize text-cyan-300">{role}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Events', value: 'Workshops', icon: CalendarDays as LucideIcon },
                  { label: 'Access', value: 'Member area', icon: Lock as LucideIcon },
                  { label: 'Badge', value: 'Attendance ', icon: CircleGauge as LucideIcon },
                ].map((item) => {
                  const Icon: LucideIcon = item.icon

                  return (
                    <div key={item.label} className="rounded-2xl border border-cyan-400/15 bg-blue-950/50 p-4 backdrop-blur-sm">
                      <Icon className="text-cyan-300" size={18} />
                      <div className="mt-4 text-xs font-mono uppercase tracking-[0.24em] text-blue-100/55">{item.label}</div>
                      <div className="mt-1 text-lg font-semibold text-white">{item.value}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.14s' }}>
              <div className="rounded-[2rem] border border-cyan-300/25 bg-[#08192F]/85 p-6 shadow-[0_24px_80px_rgba(2,10,24,0.5)] backdrop-blur-xl sm:p-8">
                <div className="mb-5">
                  <div className="text-xs font-mono uppercase tracking-[0.28em] text-cyan-300/75">Attendance QR</div>
                  <h2 className="mt-2 text-2xl font-bold text-white">Show this at events</h2>
                  <p className="mt-3 text-sm leading-6 text-blue-100/75">
                    The QR is tied to your registered email and can be used for attendance checks at club sessions.
                  </p>
                </div>

                <div className="flex flex-col items-center rounded-[1.5rem] border border-cyan-400/20 bg-blue-950/55 p-5">
                  <img
                    src={qrUrl}
                    alt="Attendance QR code"
                    className="rounded-2xl border border-cyan-400/20 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                  />
                  <p className="mt-4 max-w-sm text-center text-xs leading-5 text-blue-100/60">
                    Keep this page open during check-in. If your profile info looks wrong, update the club admin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  )
}

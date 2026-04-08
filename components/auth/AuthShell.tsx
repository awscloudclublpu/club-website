import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, BadgeCheck, Cloud, ShieldCheck, Sparkles, Users } from 'lucide-react'

type AuthShellProps = {
  eyebrow?: string
  title: string
  description: string
  footerText: string
  footerHref: string
  footerLinkLabel: string
  compact?: boolean
  children: ReactNode
}

const highlights = [
  {
    icon: Cloud,
    title: 'AWS-first community',
    text: 'Built for students learning cloud fundamentals, certifications, and deployment workflows.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure member access',
    text: 'Registration and login stay aligned with the same Supabase-backed auth flow.',
  },
  {
    icon: Users,
    title: 'Programs and events',
    text: 'Access workshops, hackathons, and club updates from one central account.',
  },
]

export function AuthShell({
  eyebrow = 'Member access',
  title,
  description,
  footerText,
  footerHref,
  footerLinkLabel,
  compact = false,
  children,
}: AuthShellProps) {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24 pb-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,165,0,0.12),transparent_26%),linear-gradient(135deg,#071225_0%,#0B1D3A_45%,#132E59_100%)]" />
      <div className="absolute inset-0 opacity-50 bg-[linear-gradient(0deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent)] bg-size-[56px_56px]" />
      <div className={`relative mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:px-8 ${compact ? 'lg:grid-cols-1' : 'lg:grid-cols-[1.05fr_0.95fr]'}`}>
        {!compact && <div className="flex flex-col justify-center animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/35 bg-blue-950/55 px-4 py-2 text-xs font-mono uppercase tracking-[0.28em] text-cyan-200 shadow-[0_0_0_1px_rgba(0,229,255,0.08)]">
            <Sparkles size={14} />
            {eyebrow}
          </div>

          <div className="mt-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <img src="/image/logo/awslpu.png" alt="AWS Cloud Club" className="h-14 w-14 rounded-full border border-cyan-400/35 bg-blue-950/50 p-2 shadow-[0_0_24px_rgba(0,229,255,0.12)]" />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-300/85">AWS Cloud Club LPU</p>
                <h1 className="mt-1 text-4xl font-bold text-white sm:text-5xl">{title}</h1>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-base leading-7 text-blue-100/85 sm:text-lg">
              {description}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['5,000+', 'Members and learners'],
              ['AWS', 'Hands-on community'],
              ['24/7', 'Secure member access'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-cyan-400/25 bg-blue-950/50 px-4 py-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-cyan-300">{value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-blue-100/70">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-4">
            {highlights.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="flex gap-4 rounded-2xl border border-cyan-400/20 bg-blue-950/45 p-4 shadow-[inset_0_0_0_1px_rgba(0,229,255,0.05)] backdrop-blur-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      {item.title}
                      <BadgeCheck size={14} className="text-cyan-300" />
                    </div>
                    <p className="mt-1 text-sm leading-6 text-blue-100/75">{item.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>}

        <div className="relative flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.18s' }}>
          <div className="absolute -left-6 top-8 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute -right-4 bottom-10 h-40 w-40 rounded-full bg-orange-400/12 blur-3xl" />

          <div className="relative w-full max-w-md rounded-[2rem] border border-cyan-300/30 bg-[#08192F]/85 p-6 shadow-[0_24px_80px_rgba(2,10,24,0.55)] backdrop-blur-xl sm:p-8">
            <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/80 to-transparent" />
            <div className={compact ? 'mb-6' : 'mb-8'}>
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-300/80">Member access</div>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
              {!compact && <p className="mt-3 text-sm leading-6 text-blue-100/75">{description}</p>}
            </div>

            {children}

            <div className="mt-8 border-t border-cyan-400/15 pt-5 text-sm text-blue-100/70">
              {footerText}{' '}
              <Link href={footerHref} className="inline-flex items-center gap-1 font-semibold text-cyan-300 transition-colors hover:text-cyan-200">
                {footerLinkLabel}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
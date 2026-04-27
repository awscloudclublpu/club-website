'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CertificateEventItem = {
  id: string
  title: string
  eventDate: string
  eligible: boolean
  certificateUid: string | null
}

type CertificatesClientProps = {
  events: CertificateEventItem[]
}

export default function CertificatesClient({ events }: CertificatesClientProps) {
  const router = useRouter()
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null)

  const handleGenerate = async (eventId: string) => {
    try {
      setLoadingEventId(eventId)

      const response = await fetch('/api/certificate/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId }),
      })

      const payload = await response.json()

      if (!response.ok) {
        alert(payload?.error || 'Failed to generate certificate')
        return
      }

      router.refresh()
    } finally {
      setLoadingEventId(null)
    }
  }

  return (
    <div className="grid gap-5">
      {events.map((event) => {
        const isGenerating = loadingEventId === event.id

        return (
          <article key={event.id} className="rounded-3xl border border-cyan-400/20 bg-[#08192F]/85 p-6 shadow-[0_24px_80px_rgba(2,10,24,0.5)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{event.title}</h2>
                <p className="mt-2 text-sm text-blue-100/80">
                  {new Date(event.eventDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="mt-2 text-sm">
                  {event.eligible ? (
                    <span className="text-emerald-300">Eligible for certificate</span>
                  ) : (
                    <span className="text-red-300">Not eligible (requires checkin + checkout)</span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {!event.eligible ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-11 cursor-not-allowed items-center rounded-xl border border-red-300/30 bg-red-500/10 px-4 text-sm font-semibold text-red-200"
                  >
                    Not Eligible
                  </button>
                ) : event.certificateUid ? (
                  <a
                    href={`/api/certificate/download/${event.certificateUid}?refresh=1`}
                    className="inline-flex h-11 items-center rounded-xl bg-linear-to-r from-cyan-400 to-sky-300 px-4 text-sm font-semibold text-[#08192F] transition hover:brightness-110"
                  >
                    Download Certificate
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGenerate(event.id)}
                    disabled={isGenerating}
                    className="inline-flex h-11 items-center rounded-xl bg-linear-to-r from-cyan-400 to-sky-300 px-4 text-sm font-semibold text-[#08192F] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Certificate'}
                  </button>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

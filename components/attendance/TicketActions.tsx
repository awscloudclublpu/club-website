'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'

type TicketActionsProps = {
  backHref: string
}

export default function TicketActions({ backHref }: TicketActionsProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    window.print()
    setTimeout(() => setDownloading(false), 600)
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3 print:hidden">
      <Link
        href={backHref}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-cyan-400/25 bg-blue-950/60 px-4 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  )
}

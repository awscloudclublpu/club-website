'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, AlertCircle, ArrowRight } from 'lucide-react'

type ProfileCompletionModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileCompletionModal({ isOpen, onClose }: ProfileCompletionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-4">
      <div className="relative w-full max-w-md rounded-xl border border-cyan-400/30 bg-linear-to-b from-blue-950/80 to-blue-900/60 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-blue-300/70 hover:bg-blue-800/30 hover:text-cyan-300 transition"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="space-y-6 p-6 pt-8">
          {/* Icon & Heading */}
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-amber-950/40 p-3">
                <AlertCircle className="text-amber-400" size={24} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
            <p className="text-sm text-blue-200/70">
              We need a bit more information to set up your account properly
            </p>
          </div>

          {/* Info Items */}
          <div className="space-y-3 rounded-lg bg-blue-950/30 p-4">
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-bold text-cyan-300">1</div>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-200">Workspace UID</p>
                <p className="text-xs text-blue-300/60">Your unique identifier</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-bold text-cyan-300">2</div>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-200">Workspace Name</p>
                <p className="text-xs text-blue-300/60">Your workspace display name</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-blue-400/30 bg-blue-950/40 px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-950/60 hover:border-blue-300"
            >
              Later
            </button>
            <Link
              href="/profile"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-400/80 to-cyan-500/80 px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:from-cyan-300 hover:to-cyan-400"
            >
              Complete Now
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-blue-300/50">
            This information helps us better serve the club community
          </p>
        </div>
      </div>
    </div>
  )
}

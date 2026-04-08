'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    workspace_uid: '',
    workspace_name: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update profile')
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,165,0,0.12),transparent_24%),linear-gradient(135deg,#071225_0%,#0B1D3A_45%,#132E59_100%)]" />
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(0deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent)] bg-size-[56px_56px]" />

      <div className="relative mx-auto max-w-md">
        <div className="space-y-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-950/60 p-3">
              <Sparkles className="text-cyan-300" size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Complete Your Profile</h1>
            <p className="mt-2 text-blue-100/70">Help us know more about you to enhance your club experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-950/30 p-4">
                <AlertCircle size={20} className="shrink-0 text-red-400" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="workspace_uid" className="block text-sm font-medium text-cyan-200 mb-2">
                Workspace UID
              </label>
              <input
                id="workspace_uid"
                name="workspace_uid"
                type="text"
                value={formData.workspace_uid}
                onChange={handleChange}
                placeholder="e.g., 12217859"
                required
                className="w-full rounded-lg border border-cyan-400/30 bg-blue-950/40 px-4 py-2.5 text-white placeholder-blue-300/50 transition focus:border-cyan-300 focus:bg-blue-950/60 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="workspace_name" className="block text-sm font-medium text-cyan-200 mb-2">
                Workspace Name
              </label>
              <input
                id="workspace_name"
                name="workspace_name"
                type="text"
                value={formData.workspace_name}
                onChange={handleChange}
                placeholder="Lovely Professional University"
                required
                className="w-full rounded-lg border border-cyan-400/30 bg-blue-950/40 px-4 py-2.5 text-white placeholder-blue-300/50 transition focus:border-cyan-300 focus:bg-blue-950/60 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-400/80 to-cyan-500/80 px-4 py-3 font-semibold text-blue-950 transition hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Saving...' : (
                <>
                  Complete Profile
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Info Text */}
          <p className="text-center text-xs text-blue-300/60">
            Your information is securely stored and only visible to authorized club administrators.
          </p>
        </div>
      </div>
    </div>
  )
}

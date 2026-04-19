'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight, AlertCircle, UserRound, Mail, Shield, BadgeCheck } from 'lucide-react'

type ProfileResponse = {
  profile: {
    id: string
    email: string | null
    role: 'member' | 'core' | 'admin'
    full_name: string
    avatar_url: string
    workspace_uid: string
    workspace_name: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [accountData, setAccountData] = useState<ProfileResponse['profile'] | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
    workspace_uid: '',
    workspace_name: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile/update', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = (await response.json()) as ProfileResponse & { error?: string }

        if (!response.ok) {
          setError(data.error || 'Failed to load profile')
          setIsFetching(false)
          return
        }

        setAccountData(data.profile)
        setFormData({
          full_name: data.profile.full_name || '',
          avatar_url: data.profile.avatar_url || '',
          workspace_uid: data.profile.workspace_uid || '',
          workspace_name: data.profile.workspace_name || '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsFetching(false)
      }
    }

    void fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

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
        const detailMessage = data?.details
          ? Object.values(data.details).flat().find(Boolean)
          : null
        setError((detailMessage as string) || data.error || 'Failed to update profile')
        setIsLoading(false)
        return
      }

      setSuccessMessage('Profile updated successfully')
      setAccountData((prev) => {
        if (!prev) {
          return prev
        }

        return {
          ...prev,
          full_name: formData.full_name.trim(),
          avatar_url: formData.avatar_url.trim(),
          workspace_uid: formData.workspace_uid.trim(),
          workspace_name: formData.workspace_name.trim(),
        }
      })
      router.refresh()
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,165,0,0.12),transparent_24%),linear-gradient(135deg,#071225_0%,#0B1D3A_45%,#132E59_100%)]" />
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(0deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent)] bg-size-[56px_56px]" />

      <div className="relative mx-auto max-w-5xl">
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-950/60 p-3">
              <Sparkles className="text-cyan-300" size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Your Profile</h1>
            <p className="mt-2 text-blue-100/70">View your account details and update your complete profile information.</p>
          </div>

          {isFetching ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-blue-950/45 p-8 text-center text-blue-100/80">
              Loading profile...
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-cyan-400/20 bg-blue-950/45 p-5 backdrop-blur-xl">
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-cyan-300/80">Account Overview</h2>

              <div className="mt-4 space-y-3 text-sm text-blue-100/80">
                <div className="rounded-xl border border-cyan-400/15 bg-blue-950/40 p-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-cyan-300/65">Name</p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-white">
                    <UserRound size={15} className="text-cyan-300" />
                    {accountData?.full_name || 'Not provided'}
                  </p>
                </div>

                <div className="rounded-xl border border-cyan-400/15 bg-blue-950/40 p-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-cyan-300/65">Email</p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-white break-all">
                    <Mail size={15} className="text-cyan-300" />
                    {accountData?.email || 'Not available'}
                  </p>
                </div>

                <div className="rounded-xl border border-cyan-400/15 bg-blue-950/40 p-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-cyan-300/65">Role</p>
                  <p className="mt-1 flex items-center gap-2 font-medium capitalize text-white">
                    <Shield size={15} className="text-cyan-300" />
                    {accountData?.role || 'member'}
                  </p>
                </div>

                <div className="rounded-xl border border-cyan-400/15 bg-blue-950/40 p-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-cyan-300/65">User ID</p>
                  <p className="mt-1 flex items-center gap-2 font-mono text-[12px] text-blue-100/75 break-all">
                    <BadgeCheck size={15} className="text-cyan-300" />
                    {accountData?.id || '-'}
                  </p>
                </div>
              </div>
            </aside>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-cyan-400/20 bg-blue-950/45 p-6 backdrop-blur-xl">
            {error && (
              <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-950/30 p-4">
                <AlertCircle size={20} className="shrink-0 text-red-400" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-4 text-sm text-emerald-200">
                {successMessage}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="full_name" className="block text-sm font-medium text-cyan-200 mb-2">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  className="w-full rounded-lg border border-cyan-400/30 bg-blue-950/40 px-4 py-2.5 text-white placeholder-blue-300/50 transition focus:border-cyan-300 focus:bg-blue-950/60 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="avatar_url" className="block text-sm font-medium text-cyan-200 mb-2">
                  Avatar URL (optional)
                </label>
                <input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-lg border border-cyan-400/30 bg-blue-950/40 px-4 py-2.5 text-white placeholder-blue-300/50 transition focus:border-cyan-300 focus:bg-blue-950/60 focus:outline-none"
                />
              </div>

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
            </div>

            <button
              type="submit"
              disabled={isLoading || isFetching}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-400/80 to-cyan-500/80 px-4 py-3 font-semibold text-blue-950 transition hover:from-cyan-300 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (
                <>
                  Save Profile Changes
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            </form>
          </div>

          <p className="text-center text-xs text-blue-300/60">
            Your information is securely stored and only visible to authorized club administrators.
          </p>
        </div>
      </div>
    </div>
  )
}

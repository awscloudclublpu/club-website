'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'member' | 'core' | 'admin'

type UserRow = {
  id: string
  full_name: string | null
  email: string | null
  workspace_uid: string | null
  workspace_name: string | null
  role: Role
}

type UserRoleTableProps = {
  users: UserRow[]
  currentUserId: string
}

const ROLE_OPTIONS: Role[] = ['member', 'core', 'admin']

type RowFeedback = {
  type: 'success' | 'error'
  message: string
}

export default function UserRoleTable({ users, currentUserId }: UserRoleTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [rowFeedbackByUserId, setRowFeedbackByUserId] = useState<Record<string, RowFeedback>>({})
  const originalRoleByUserId = useMemo(
    () => Object.fromEntries(users.map((member) => [member.id, member.role])) as Record<string, Role>,
    [users]
  )
  const [roleByUserId, setRoleByUserId] = useState<Record<string, Role>>(
    originalRoleByUserId
  )

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return users.filter((member) => {
      const name = (member.full_name || '').toLowerCase()
      const email = (member.email || '').toLowerCase()
      const workspaceUid = (member.workspace_uid || '').toLowerCase()
      const workspaceName = (member.workspace_name || '').toLowerCase()
      const id = member.id.toLowerCase()
      const selectedRole = roleByUserId[member.id] || member.role
      const matchesTerm =
        !term ||
        name.includes(term) ||
        email.includes(term) ||
        workspaceUid.includes(term) ||
        workspaceName.includes(term) ||
        id.includes(term)
      const matchesRole = roleFilter === 'all' || selectedRole === roleFilter

      return matchesTerm && matchesRole
    })
  }, [users, searchTerm, roleFilter, roleByUserId])

  const updateRole = async (userId: string) => {
    const nextRole = roleByUserId[userId]
    const currentRole = originalRoleByUserId[userId]

    if (!nextRole || nextRole === currentRole) {
      return
    }

    setPendingUserId(userId)
    setRowFeedbackByUserId((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })

    try {
      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: nextRole }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setRowFeedbackByUserId((prev) => ({
          ...prev,
          [userId]: {
            type: 'error',
            message: payload.error || 'Unable to update role',
          },
        }))
        return
      }

      setRowFeedbackByUserId((prev) => ({
        ...prev,
        [userId]: {
          type: 'success',
          message: 'Role updated successfully',
        },
      }))
      router.refresh()
    } catch {
      setRowFeedbackByUserId((prev) => ({
        ...prev,
        [userId]: {
          type: 'error',
          message: 'Network error while updating role',
        },
      }))
    } finally {
      setPendingUserId(null)
    }
  }

  return (
    <>
      <div className="border-b border-cyan-400/15 px-6 py-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, workspace, or user id"
            className="h-10 rounded-xl border border-cyan-400/20 bg-blue-950/70 px-3 text-sm text-cyan-100 outline-none placeholder:text-blue-100/45 focus:border-cyan-300"
          />

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as 'all' | Role)}
            className="h-10 rounded-xl border border-cyan-400/20 bg-blue-950/70 px-3 text-sm capitalize text-cyan-100 outline-none focus:border-cyan-300"
          >
            <option value="all">all roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <p className="text-sm text-blue-100/70">
            Showing {filteredUsers.length} of {users.length}
          </p>
        </div>
      </div>

      <div className="hidden border-b border-cyan-400/15 px-6 py-3 md:grid md:grid-cols-[minmax(0,1fr)_180px_120px] md:items-center">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-300/70">Member details</p>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-300/70">Role access</p>
        <p className="text-right text-xs font-mono uppercase tracking-[0.2em] text-cyan-300/70">Action</p>
      </div>

      <div className="divide-y divide-cyan-400/10">
        {filteredUsers.map((member) => {
          const isCurrentUser = member.id === currentUserId
          const selectedRole = roleByUserId[member.id]
          const originalRole = originalRoleByUserId[member.id]
          const hasChanged = selectedRole !== originalRole
          const isPending = pendingUserId === member.id
          const feedback = rowFeedbackByUserId[member.id]
          const roleBadgeClass =
            originalRole === 'admin'
              ? 'border-amber-400/35 bg-amber-500/15 text-amber-200'
              : originalRole === 'core'
                ? 'border-sky-400/35 bg-sky-500/15 text-sky-200'
                : 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200'

          return (
            <div key={member.id} className="grid gap-4 px-6 py-4 md:grid-cols-[minmax(0,1fr)_180px_120px] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-white">{member.full_name || 'Unnamed Member'}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-xs capitalize ${roleBadgeClass}`}>
                    {originalRole}
                  </span>
                  {hasChanged ? (
                    <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 text-amber-200">
                      unsaved change
                    </span>
                  ) : null}
                  {feedback ? (
                    <span className={`rounded-full px-2 py-0.5 ${feedback.type === 'success' ? 'border border-emerald-400/25 bg-emerald-500/10 text-emerald-200' : 'border border-red-400/25 bg-red-500/10 text-red-200'}`}>
                      {feedback.message}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 space-y-1.5 text-xs text-blue-100/70">
                  <p className="truncate">
                    <span className="text-blue-100/50">Email:</span> {member.email || 'Not available'}
                  </p>
                  <p className="truncate">
                    <span className="text-blue-100/50">Workspace:</span> {member.workspace_name || 'Not provided'}
                  </p>
                  <p className="truncate font-mono text-[11px] text-blue-100/60">
                    <span className="text-blue-100/50">Workspace UID:</span> {member.workspace_uid || 'Not provided'}
                  </p>
                  <p className="truncate font-mono text-[11px] text-blue-100/55">
                    <span className="text-blue-100/45">User ID:</span> {member.id}
                  </p>
                </div>
              </div>

              <div>
                <select
                  value={selectedRole}
                  onChange={(event) => {
                    const nextRole = event.target.value as Role
                    setRoleByUserId((prev) => ({ ...prev, [member.id]: nextRole }))
                    setRowFeedbackByUserId((prev) => {
                      const next = { ...prev }
                      delete next[member.id]
                      return next
                    })
                  }}
                  className="h-10 w-full rounded-xl border border-cyan-400/20 bg-blue-950/70 px-3 text-sm capitalize text-cyan-100 outline-none focus:border-cyan-300"
                  disabled={isPending}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option
                      key={role}
                      value={role}
                      disabled={isCurrentUser && role !== 'admin'}
                    >
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:justify-self-end">
                <button
                  type="button"
                  onClick={() => updateRole(member.id)}
                  disabled={isPending || !hasChanged}
                  className="h-10 w-full rounded-xl bg-linear-to-r from-cyan-400 to-sky-300 px-4 text-sm font-semibold text-[#08192F] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                >
                  {isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )
        })}

        {!filteredUsers.length && (
          <div className="px-6 py-8 text-sm text-blue-100/75">No users found in profiles.</div>
        )}
      </div>
    </>
  )
}

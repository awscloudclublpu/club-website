import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShieldCheck, Users } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import UserRoleTable from '@/components/admin/UserRoleTable'

type Role = 'member' | 'core' | 'admin'

type AdminUser = {
  id: string
  full_name: string | null
  email: string | null
  workspace_uid: string | null
  workspace_name: string | null
  role: Role
}

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (me?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, workspace_uid, workspace_name, role')
    .order('full_name', { ascending: true })

  const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  const emailByUserId = new Map(
    (authUsersData?.users ?? []).map((authUser) => [authUser.id, authUser.email ?? null])
  )

  const mergedUsers: AdminUser[] = (users ?? []).map((profile) => ({
    id: profile.id,
    full_name: profile.full_name,
    email: emailByUserId.get(profile.id) ?? null,
    workspace_uid: profile.workspace_uid,
    workspace_name: profile.workspace_name,
    role: profile.role as Role,
  }))

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,165,0,0.12),transparent_24%),linear-gradient(135deg,#071225_0%,#0B1D3A_45%,#132E59_100%)]" />
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(0deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(14,165,233,0.08)_25%,rgba(14,165,233,0.08)_26%,transparent_27%,transparent_74%,rgba(14,165,233,0.08)_75%,rgba(14,165,233,0.08)_76%,transparent_77%,transparent)] bg-size-[56px_56px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-blue-950/55 px-4 py-2 text-xs font-mono uppercase tracking-[0.28em] text-cyan-200">
              <ShieldCheck size={14} />
              Admin control
            </div>
            <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">User Management</h1>
            <p className="mt-3 max-w-2xl text-blue-100/80">
              Update member permissions across three levels: member, core, and admin.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-blue-950/60 px-4 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#08192F]/85 shadow-[0_24px_80px_rgba(2,10,24,0.5)] backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-cyan-400/15 px-6 py-4">
            <Users className="text-cyan-300" size={18} />
            <p className="text-sm font-mono uppercase tracking-[0.24em] text-cyan-300/80">Club users</p>
          </div>

          <UserRoleTable users={mergedUsers} currentUserId={user.id} />
        </div>
      </div>
    </div>
  )
}

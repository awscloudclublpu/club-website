import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, workspace_uid, workspace_name')
    .eq('id', user.id)
    .single()

  const email = user.email ?? 'No email found'
  const displayName = profile?.full_name || user.user_metadata?.full_name || 'AWS Cloud Club Member'
  const role = profile?.role || 'member'
  const workspaceUid = (profile?.workspace_uid ?? '').trim()
  const workspaceName = (profile?.workspace_name ?? '').trim()
  const qrData = JSON.stringify({ user_id: user.id })

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    qrData
  )}`

  const isProfileIncomplete = !workspaceUid || !workspaceName

  return (
    <DashboardClient
      displayName={displayName}
      email={email}
      role={role}
      qrUrl={qrUrl}
      isProfileIncomplete={isProfileIncomplete}
      workspaceUid={workspaceUid}
      workspaceName={workspaceName}
      />
    )
  }
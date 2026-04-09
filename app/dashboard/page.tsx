import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

  const now = new Date()
  const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()

  const { data: ticketWindowEvents } = await supabaseAdmin
    .from('events')
    .select('id, title, event_date, location')
    .gte('event_date', windowStart)
    .lte('event_date', windowEnd)
    .order('event_date', { ascending: true })
    .limit(10)

  const upcomingEvent =
    ticketWindowEvents && ticketWindowEvents.length
      ? ticketWindowEvents.reduce((closest, current) => {
          const closestDelta = Math.abs(new Date(closest.event_date).getTime() - now.getTime())
          const currentDelta = Math.abs(new Date(current.event_date).getTime() - now.getTime())
          return currentDelta < closestDelta ? current : closest
        })
      : null

  const isProfileIncomplete = !workspaceUid || !workspaceName

  return (
    <DashboardClient
      displayName={displayName}
      email={email}
      role={role}
      isProfileIncomplete={isProfileIncomplete}
      workspaceUid={workspaceUid}
      workspaceName={workspaceName}
      upcomingEvent={
        upcomingEvent
          ? {
              id: upcomingEvent.id,
              title: upcomingEvent.title,
              eventDate: upcomingEvent.event_date,
              location: upcomingEvent.location,
            }
          : null
      }
    />
  )
}
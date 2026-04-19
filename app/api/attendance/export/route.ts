export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const querySchema = z.object({
  eventId: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function GET(req: Request) {
  try {
    const convertToIST = (utcTimestamp: string | null): string => {
      if (!utcTimestamp) return ''
      const date = new Date(utcTimestamp)
      const istFormatter = new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata',
      })
      return istFormatter.format(date)
    }

    const supabase = await createSupabaseServerClient()
    const { searchParams } = new URL(req.url)
    const parsedQuery = querySchema.safeParse({
      eventId: searchParams.get('eventId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    })

    if (!parsedQuery.success) {
      return NextResponse.json({ error: 'Invalid query params' }, { status: 400 })
    }

    const { eventId, startDate, endDate } = parsedQuery.data

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: me } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!me || me.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let query = supabaseAdmin
      .from('attendance')
      .select(`
        event_id,
        status,
        scanned_at,
        profiles (
          full_name,
          email,
          workspace_uid
        ),
        events (
          title,
          event_date,
          location
        )
      `)
      .order('scanned_at', { ascending: false })

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    if (startDate) {
      query = query.gte('scanned_at', `${startDate}T00:00:00.000Z`)
    }

    if (endDate) {
      query = query.lte('scanned_at', `${endDate}T23:59:59.999Z`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const headers = [
      'Name',
      'Email',
      'Workspace UID',
      'Event',
      'Location',
      'Event Date',
      'Check In',
      'Check Out',
    ]

    const grouped = new Map<string, {
      name: string
      email: string
      workspaceUid: string
      event: string
      location: string
      eventDate: string
      checkIn: string | null
      checkOut: string | null
    }>()

    ;(data || []).forEach((row: any) => {
      const name = row.profiles?.full_name || ''
      const email = row.profiles?.email || ''
      const workspaceUid = row.profiles?.workspace_uid || ''
      const event = row.events?.title || ''
      const location = row.events?.location || ''
      const eventDate = row.events?.event_date || ''
      const eventKey = row.event_id || event
      const key = `${email}__${eventKey}`

      const current = grouped.get(key) || {
        name,
        email,
        workspaceUid,
        event,
        location,
        eventDate,
        checkIn: null,
        checkOut: null,
      }

      if (row.status === 'checkin') {
        if (!current.checkIn || new Date(row.scanned_at).getTime() < new Date(current.checkIn).getTime()) {
          current.checkIn = row.scanned_at
        }
      }

      if (row.status === 'checkout') {
        if (!current.checkOut || new Date(row.scanned_at).getTime() > new Date(current.checkOut).getTime()) {
          current.checkOut = row.scanned_at
        }
      }

      grouped.set(key, current)
    })

    const rows = Array.from(grouped.values())
      .sort((a, b) => {
        const dateDiff = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        if (dateDiff !== 0) {
          return dateDiff
        }

        return a.name.localeCompare(b.name)
      })
      .map((item) => [
        item.name,
        item.email,
        item.workspaceUid,
        item.event,
        item.location,
        item.eventDate,
        convertToIST(item.checkIn),
        convertToIST(item.checkOut),
      ])

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    let fileName = 'attendance.csv'

    if (eventId && data && data.length > 0) {
      const firstRow = data[0] as any
      const eventTitle = firstRow.events?.title || 'event'
      const sanitizedTitle = eventTitle.toLowerCase().replace(/\s+/g, '_')
      fileName = `${sanitizedTitle}_attendance.csv`
    } else if (startDate && endDate) {
      fileName = `attendance_${startDate}_to_${endDate}.csv`
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
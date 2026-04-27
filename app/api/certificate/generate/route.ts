export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createCertificateUid, isEligibleForCertificate } from '@/lib/certificates/core'

const generateSchema = z.object({
  event_id: z.string().min(1),
})

function isDuplicateKeyError(message: string | undefined): boolean {
  if (!message) {
    return false
  }

  return message.toLowerCase().includes('duplicate key')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = generateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, event_date')
      .eq('id', parsed.data.event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const { data: existingCertificate, error: existingCertificateError } = await supabaseAdmin
      .from('certificates')
      .select('id, certificate_uid, issued_at')
      .eq('user_id', user.id)
      .eq('event_id', event.id)
      .maybeSingle()

    if (existingCertificateError) {
      return NextResponse.json({ error: existingCertificateError.message }, { status: 500 })
    }

    if (existingCertificate) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        certificate_uid: existingCertificate.certificate_uid,
        issued_at: existingCertificate.issued_at,
      })
    }

    const { data: attendanceRows, error: attendanceError } = await supabaseAdmin
      .from('attendance')
      .select('status')
      .eq('user_id', user.id)
      .eq('event_id', event.id)
      .in('status', ['checkin', 'checkout'])

    if (attendanceError) {
      return NextResponse.json({ error: attendanceError.message }, { status: 500 })
    }

    const eligible = isEligibleForCertificate((attendanceRows ?? []).map((row) => row.status))

    if (!eligible) {
      return NextResponse.json({
        error: 'Not eligible for certificate. Both checkin and checkout are required.',
      }, { status: 403 })
    }

    let inserted:
      | {
          id: string
          certificate_uid: string
          issued_at: string
        }
      | null = null

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const candidateUid = createCertificateUid(event.id)

      const { data, error } = await supabaseAdmin
        .from('certificates')
        .insert([
          {
            user_id: user.id,
            event_id: event.id,
            certificate_uid: candidateUid,
          },
        ])
        .select('id, certificate_uid, issued_at')
        .single()

      if (!error && data) {
        inserted = data
        break
      }

      if (!isDuplicateKeyError(error?.message)) {
        return NextResponse.json({ error: error?.message ?? 'Failed to create certificate' }, { status: 500 })
      }
    }

    if (!inserted) {
      return NextResponse.json({ error: 'Could not generate a unique certificate UID' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      certificate_uid: inserted.certificate_uid,
      issued_at: inserted.issued_at,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

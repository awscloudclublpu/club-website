import { createSupabaseServerClient } from '@/lib/supabase/server'
import { profileUpdateSchema } from '@/app/schemas/auth.schema'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, workspace_uid, workspace_name, role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
      return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
    }

    return NextResponse.json(
      {
        profile: {
          id: user.id,
          email: user.email ?? null,
          role: profile?.role ?? 'member',
          full_name: profile?.full_name ?? '',
          avatar_url: profile?.avatar_url ?? '',
          workspace_uid: profile?.workspace_uid ?? '',
          workspace_name: profile?.workspace_name ?? '',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // 🔐 Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 📋 Parse and validate request body
    const body = await request.json()
  const validation = profileUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const full_name = validation.data.full_name?.trim()
    const avatar_url = validation.data.avatar_url?.trim()
    const workspace_uid = validation.data.workspace_uid?.trim()
    const workspace_name = validation.data.workspace_name?.trim()

    if (workspace_uid !== undefined && !workspace_uid) {
      return NextResponse.json(
        { error: 'Workspace UID cannot be empty' },
        { status: 400 }
      )
    }

    if (workspace_name !== undefined && !workspace_name) {
      return NextResponse.json(
        { error: 'Workspace name cannot be empty' },
        { status: 400 }
      )
    }

    if (full_name !== undefined && !full_name) {
      return NextResponse.json(
        { error: 'Full name cannot be empty' },
        { status: 400 }
      )
    }

    const updates: {
      full_name?: string
      avatar_url?: string | null
      workspace_uid?: string
      workspace_name?: string
    } = {}

    if (full_name !== undefined) {
      updates.full_name = full_name
    }
    if (workspace_uid !== undefined) {
      updates.workspace_uid = workspace_uid
    }
    if (workspace_name !== undefined) {
      updates.workspace_name = workspace_name
    }
    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url || null
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { error: 'No profile changes provided' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

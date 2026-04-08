import { createSupabaseServerClient } from '@/lib/supabase/server'
import { profileCompletionSchema } from '@/app/schemas/auth.schema'
import { NextRequest, NextResponse } from 'next/server'

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
    const validation = profileCompletionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const workspace_uid = validation.data.workspace_uid.trim()
    const workspace_name = validation.data.workspace_name.trim()

    if (!workspace_uid || !workspace_name) {
      return NextResponse.json(
        { error: 'Workspace UID and workspace name are required' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        workspace_uid,
        workspace_name,
      })
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

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          res.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (!user && pathname.startsWith('/certificates')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (user && (
    pathname === '/auth/login' ||
    pathname === '/auth/register'
  )) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  if (pathname.startsWith('/attendance')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    if (pathname.startsWith('/attendance/scan')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'core'].includes(profile.role)) {
        return NextResponse.redirect(new URL('/attendance/my', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/certificates/:path*',
    '/admin/:path*',
    '/attendance/:path*',
    '/auth/login',
    '/auth/register',
  ],
}
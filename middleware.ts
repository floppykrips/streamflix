import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: any) {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              response.cookies.set(name, value, options ?? {})
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/watch') || pathname.startsWith('/admin'))) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (e) {
    console.error('Middleware error:', e)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
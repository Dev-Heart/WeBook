import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // If updateSession returned a redirect, honor it
  if (response.status === 307 || response.status === 308) {
    return response
  }

  const { nextUrl } = request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = nextUrl.pathname.startsWith('/auth')
  const isWelcomePage = nextUrl.pathname === '/welcome'
  const isPublicPage = nextUrl.pathname.startsWith('/book') || nextUrl.pathname.startsWith('/api/public')

  if (!user && !isAuthPage && !isWelcomePage && !isPublicPage && nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  if (!user && nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  if (user && (isAuthPage || isWelcomePage)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

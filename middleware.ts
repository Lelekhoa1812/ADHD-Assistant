import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/server/auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - allow access without authentication
  if (
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // Protect /app routes
  if (pathname.startsWith('/app')) {
    const token = request.cookies.get('session')?.value

    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    try {
      const payload = await verifyToken(token)
      if (!payload) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
      }

      // Token is valid, allow access to the route
      return NextResponse.next()
    } catch (error) {
      // If token verification fails, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }

  // Allow all other routes to pass through
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}


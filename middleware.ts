import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Password-protects /admin with HTTP Basic Auth.
// Set ADMIN_USER and ADMIN_PASS as environment variables on Vercel.
export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next()

  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASS
  if (!user || !pass) {
    return new NextResponse('Admin access is not configured yet.', { status: 503 })
  }

  const header = req.headers.get('authorization') ?? ''
  if (header.startsWith('Basic ')) {
    const [u, p] = Buffer.from(header.slice(6), 'base64').toString('utf-8').split(':')
    if (u === user && p === pass) return NextResponse.next()
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="2027.tours admin"' },
  })
}

export const config = { matcher: ['/admin/:path*'] }

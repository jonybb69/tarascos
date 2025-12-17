import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('authToken')?.value;

  // Si intenta acceder a /admin/* sin token, lo mandamos a login
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.includes('/admin/login')) {
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

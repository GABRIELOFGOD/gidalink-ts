import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getTokenFromRequest } from '@/lib/jwt';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin     = pathname.startsWith('/admin') && !pathname.startsWith('/admin-register');

  if (!isDashboard && !isAdmin) return NextResponse.next();

  const token   = getTokenFromRequest(request);
  const payload = token ? await verifyJWT(token) : null;

  if (!payload) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete('token');
    return res;
  }

  if (isAdmin && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const headers = new Headers(request.headers);
  headers.set('x-user-id',   payload.id);
  headers.set('x-user-role', payload.role);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};

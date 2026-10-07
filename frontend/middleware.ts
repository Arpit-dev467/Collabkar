import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  sub?: string;
  role?: 'creator' | 'brand' | 'admin';
  email?: string | null;
  exp?: number;
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json);
    if (typeof payload?.exp === 'number' && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('collabkar_token')?.value;
  const payload = token ? parseJwtPayload(token) : null;
  const isAuthenticated = Boolean(payload && payload.role);
  const role = payload?.role;

  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // 1. If visiting /login or /signup while already authenticated -> redirect to dashboard
  if (isAuthRoute && isAuthenticated && role) {
    const destination =
      role === 'creator'
        ? '/dashboard/creator'
        : role === 'brand'
          ? '/dashboard/brand'
          : '/dashboard/admin';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 2. If visiting a dashboard route without being authenticated -> redirect to /login
  if (isDashboardRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clean up stale token cookie if it was invalid/expired
    if (token) {
      response.cookies.delete('collabkar_token');
    }
    return response;
  }

  // 3. Role-based routing enforcement for dashboard
  if (isDashboardRoute && isAuthenticated && role) {
    // Top-level /dashboard -> redirect to role-specific dashboard
    if (pathname === '/dashboard') {
      const destination =
        role === 'creator'
          ? '/dashboard/creator'
          : role === 'brand'
            ? '/dashboard/brand'
            : '/dashboard/admin';
      return NextResponse.redirect(new URL(destination, request.url));
    }

    // Role boundary checks
    if (pathname.startsWith('/dashboard/creator') && role !== 'creator' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/brand', request.url));
    }

    if (pathname.startsWith('/dashboard/brand') && role !== 'brand' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/creator', request.url));
    }

    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      const fallback = role === 'brand' ? '/dashboard/brand' : '/dashboard/creator';
      return NextResponse.redirect(new URL(fallback, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};

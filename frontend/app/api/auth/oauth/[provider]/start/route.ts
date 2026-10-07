import { NextRequest, NextResponse } from 'next/server';

function getBackendBase() {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';
}

function sanitizeRedirect(value: string | null) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '/dashboard';
  if (!raw.startsWith('/')) return '/dashboard';
  if (raw.startsWith('//')) return '/dashboard';
  if (raw.includes('://')) return '/dashboard';
  return raw;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const normalized = String(provider || '').toLowerCase();
  if (!['google', 'facebook', 'apple'].includes(normalized)) {
    return NextResponse.json({ ok: false, error: 'Unsupported provider.' }, { status: 400 });
  }

  const redirectTo = sanitizeRedirect(request.nextUrl.searchParams.get('redirect'));
  const role = request.nextUrl.searchParams.get('role');
  const backendBase = getBackendBase().replace(/\/$/, '');
  const target = new URL(`${backendBase}/api/auth/oauth/${normalized}/start`);
  target.searchParams.set('redirect', redirectTo);
  if (role) target.searchParams.set('role', role);

  return NextResponse.redirect(target.toString(), { status: 307 });
}

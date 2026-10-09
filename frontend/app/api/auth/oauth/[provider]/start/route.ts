import { NextRequest, NextResponse } from 'next/server';

function getBackendBase() {
  return (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001').replace(/\/+$/, '');
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (character) => {
    if (character === '&') return '&amp;';
    if (character === '<') return '&lt;';
    if (character === '>') return '&gt;';
    return '&quot;';
  });
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
  const backendBase = getBackendBase();
  const target = new URL(`${backendBase}/api/auth/oauth/${normalized}/start`);
  target.searchParams.set('redirect', redirectTo);
  if (role) target.searchParams.set('role', role);

  let failureMessage = `${normalized[0].toUpperCase()}${normalized.slice(1)} sign-in is temporarily unavailable. Please try again in a moment.`;
  try {
    const response = await fetch(target, {
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(65_000),
    });
    const location = response.headers.get('location');
    const providerHosts: Record<string, string> = {
      google: 'accounts.google.com',
      facebook: 'www.facebook.com',
      apple: 'appleid.apple.com',
    };
    if (response.status >= 300 && response.status < 400 && location) {
      const providerUrl = new URL(location);
      if (providerUrl.protocol === 'https:' && providerUrl.hostname === providerHosts[normalized]) {
        return NextResponse.redirect(providerUrl, { status: 307 });
      }
    }
    if (response.status >= 400) {
      const data = await response.json().catch(() => ({}));
      if (typeof data?.error === 'string' && data.error.length < 200) {
        failureMessage = data.error;
      }
    }
  } catch {
    failureMessage = `${normalized[0].toUpperCase()}${normalized.slice(1)} sign-in could not reach the server. Please try again.`;
  }

  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><title>Sign-in unavailable</title><main><h1>Sign-in unavailable</h1><p>${escapeHtml(failureMessage)}</p><p><a href="/login">Return to login</a></p></main></html>`,
    { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

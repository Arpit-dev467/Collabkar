import { NextRequest, NextResponse } from 'next/server';

function getBackendBase() {
  return (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001').replace(/\/+$/, '');
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const backendBase = getBackendBase();

  try {
    const response = await fetch(`${backendBase}/api/auth/oauth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(65_000),
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    return NextResponse.json(
      {
        ok: false,
        error: timedOut
          ? 'The server took too long to respond. Please try signing in again.'
          : 'Unable to reach the server. Please check your connection and try again.',
      },
      { status: 502 }
    );
  }
}

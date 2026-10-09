'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken } from '../../../lib/authClient';
import { Card, SubtleText, Title } from '../../_components/ui';

function sanitizeRedirect(value: string | null) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/dashboard';

  try {
    const baseUrl = 'https://collabkar.invalid';
    const target = new URL(raw, baseUrl);
    if (target.origin !== baseUrl) return '/dashboard';
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return '/dashboard';
  }
}

function AuthCallbackContent() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = search.get('token');
    const code = search.get('code');
    const redirectTo = sanitizeRedirect(search.get('redirect'));

    if (token) {
      setToken(token);
      router.replace(redirectTo);
      return;
    }

    if (!code) {
      setError('Missing code.');
      return;
    }

    const run = async () => {
      try {
        const response = await fetch('/api/auth/oauth/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
          signal: AbortSignal.timeout(65_000),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || 'oauth_exchange_failed');
        if (!data?.token) throw new Error('oauth_exchange_missing_token');
        setToken(String(data.token));
        router.replace(redirectTo);
      } catch (err) {
        const timedOut = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
        setError(
          timedOut
            ? 'The server took too long to respond. Please try signing in again.'
            : err instanceof Error
              ? err.message
              : 'Unable to complete sign-in. Please try again.'
        );
      }
    };

    run();
  }, [router, search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
      <Card>
        <Title>Signing you in</Title>
        <SubtleText>{error ? error : 'Please wait...'}</SubtleText>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
          <Card>
            <Title>Signing you in</Title>
            <SubtleText>Please wait...</SubtleText>
          </Card>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

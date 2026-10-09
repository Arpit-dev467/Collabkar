'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { login } from '../../lib/authClient';
import { BrandLogo } from '../_components/BrandLogo';
import { SocialAuthWithLoading } from '../_components/SocialAuthWithLoading';
import { Card, Divider, ErrorBanner, Label, PrimaryButton, SubtleText, TextInput, Title } from '../_components/ui';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectTarget =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/dashboard';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(identifier, password);
      // If user had a generic redirect, route directly to their role dashboard
      if (redirectTarget === '/dashboard') {
        const dest =
          user.role === 'creator'
            ? '/dashboard/creator'
            : user.role === 'brand'
              ? '/dashboard/brand'
              : '/dashboard/admin';
        router.replace(dest);
      } else {
        router.replace(redirectTarget);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-6 space-y-3">
        <BrandLogo imageClassName="h-11 w-auto" priority />
        <div>
          <Title>Log in</Title>
          <SubtleText>Sign in to your creator or brand workspace.</SubtleText>
        </div>
      </div>

      <div className="mb-6">
        <SocialAuthWithLoading redirect={redirectTarget} />
      </div>

      <div className="mb-6">
        <Divider />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <TextInput
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com or admin"
            required
            autoComplete="username"
          />
        </div>
        <div>
          <Label>Password</Label>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {error && <ErrorBanner message={error} />}
        {error && error.toLowerCase().includes('not verified') && (
          <div className="text-sm text-gray-700">
            <Link className="text-blue-700 underline" href={`/verify-email?email=${encodeURIComponent(identifier)}`}>
              Verify your email
            </Link>
          </div>
        )}

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Log in'}
        </PrimaryButton>
      </form>

      <div className="mt-4 text-sm text-gray-700">
        No account?{' '}
        <Link
          className="text-blue-700 underline"
          href={redirectTarget !== '/dashboard' ? `/signup?redirect=${encodeURIComponent(redirectTarget)}` : '/signup'}
        >
          Sign up
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
      <Suspense
        fallback={
          <Card>
            <Title>Log in</Title>
            <SubtleText>Loading...</SubtleText>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

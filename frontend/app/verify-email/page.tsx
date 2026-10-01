'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { resendVerification, verifyEmail } from '../../lib/authClient';
import { BrandLogo } from '../_components/BrandLogo';
import { Card, ErrorBanner, GhostButton, Label, SubtleText, TextInput, Title } from '../_components/ui';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';
  const deliveryFailed = searchParams.get('sent') === 'false';

  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(
    deliveryFailed ? 'Your account was created, but we could not send the verification email. Please try again below.' : null
  );
  const [resending, setResending] = useState(false);

  const canVerify = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (!canVerify) return;
    let cancelled = false;

    const run = async () => {
      setStatus('verifying');
      setMessage(null);
      try {
        await verifyEmail(token);
        if (cancelled) return;
        setStatus('verified');
        setMessage('Email verified. Redirecting…');
        setTimeout(() => router.replace('/dashboard'), 800);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [canVerify, router, token]);

  const onResend = async () => {
    setMessage(null);
    setResending(true);
    try {
      await resendVerification(email);
      setMessage('If an unverified account exists for that address, a verification email will arrive shortly.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
      <Card>
        <div className="mb-6">
          <BrandLogo imageClassName="h-11 w-auto" priority />
          <Title>Verify your email</Title>
          <SubtleText>
            {canVerify
              ? 'We are confirming your verification token.'
              : 'Sign up created your account. Verify your email to finish.'}
          </SubtleText>
        </div>

        {!canVerify && (
          <div className="space-y-3 mb-4">
            <Label>Email</Label>
            <TextInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <GhostButton
              onClick={onResend}
              disabled={resending || !email}
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </GhostButton>
          </div>
        )}

        {status === 'verifying' && <div className="text-sm text-gray-700">Verifying…</div>}
        {status !== 'error' && message && <div className="text-sm text-gray-700">{message}</div>}
        {status === 'error' && message && <ErrorBanner message={message} />}

        <div className="mt-6 text-sm text-gray-700">
          <Link className="text-blue-700 underline" href="/login">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
          <Card>
            <Title>Verify your email</Title>
            <SubtleText>Please wait...</SubtleText>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

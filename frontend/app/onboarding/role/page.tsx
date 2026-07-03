'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { setToken } from '../../../lib/authClient';
import { Card, Label, PrimaryButton, Select, SubtleText, Title } from '../../_components/ui';

export default function RoleSelectionPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [role, setRole] = useState<'creator' | 'brand'>('creator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const code = search.get('code');
  const redirect = search.get('redirect') || '/dashboard';

  useEffect(() => {
    if (!code) {
      setError('Missing code. Please retry the sign-in flow.');
    }
  }, [code]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code) return setError('Missing code.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/oauth/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'complete_failed');
      if (!data?.token) throw new Error('missing_token');
      setToken(String(data.token));
      router.replace(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6">
      <Card>
        <Title>Choose account type</Title>
        <SubtleText className="mb-4">Pick whether you're a Brand/MSME or a Creator/Influencer.</SubtleText>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Account type</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value as 'creator' | 'brand')}>
              <option value="creator">Creator / Influencer</option>
              <option value="brand">Brand / MSME</option>
            </Select>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <PrimaryButton type="submit" disabled={loading}>{loading ? 'Completing...' : 'Continue'}</PrimaryButton>
        </form>
      </Card>
    </div>
  );
}

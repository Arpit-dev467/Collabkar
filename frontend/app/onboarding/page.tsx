'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe, type AuthUser } from '../../lib/authClient';
import { OnboardingForm } from '../_components/OnboardingForm';
import { Card, Title } from '../_components/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const u = await fetchMe();
        if (u.onboarding?.isCompleted) {
          router.replace(`/dashboard/${u.role}`);
        } else {
          setUser(u);
          setLoading(false);
        }
      } catch {
        router.replace('/login');
      }
    }
    init();
  }, [router]);

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-4xl mx-auto">
        <Title>Welcome to Collabkar</Title>
        <p className="text-gray-600 mb-6">Let&apos;s set up your profile to get started.</p>
        <OnboardingForm role={user.role} initialData={user.profile} />
      </Card>
    </div>
  );
}
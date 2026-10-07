'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearToken, fetchMe, type AuthUser } from '../../../lib/authClient';
import DashboardShell from './DashboardShell';
import AgencySidebar from './AgencySidebar';

interface AgencyDashboardShellProps {
  title: string;
  user: AuthUser;
  children: React.ReactNode;
}

export function AgencyDashboardShell({ title, user, children }: AgencyDashboardShellProps) {
  const router = useRouter();

  // Check if user is actually an agency
  useEffect(() => {
    if (user.role !== 'agency') {
      router.replace('/dashboard/brand');
    }
  }, [user.role, router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 shrink-0 md:block">
        <AgencySidebar user={user} />
      </aside>

      <div className="min-w-0 flex-1">
        <DashboardShell title={title} user={user}>
          {children}
        </DashboardShell>
      </div>
    </div>
  );
}
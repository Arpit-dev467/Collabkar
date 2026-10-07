'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { clearToken, type AuthUser, type UserRole } from '../../../lib/authClient';

type NavItem = {
  label: string;
  href: string;
  roles?: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Creator', href: '/dashboard/creator', roles: ['creator', 'admin'] },
  { label: 'Brand', href: '/dashboard/brand', roles: ['brand', 'admin'] },
  { label: 'Agency', href: '/dashboard/agency', roles: ['agency', 'admin'] },
  { label: 'Admin', href: '/dashboard/admin', roles: ['admin'] },
];

function initials(email: string | null) {
  if (!email) return 'AD';
  const parts = email.split('@')[0]?.split(/[._-]+/g).filter(Boolean) ?? [];
  const a = parts[0]?.[0]?.toUpperCase() ?? email[0]?.toUpperCase() ?? 'U';
  const b = parts[1]?.[0]?.toUpperCase() ?? parts[0]?.[1]?.toUpperCase() ?? 'S';
  return `${a}${b}`;
}

function accountLabel(user: AuthUser) {
  return user.profile?.displayName || user.profile?.companyName || user.email || 'Account';
}

export default function DashboardShell({
  title,
  user,
  children,
}: {
  title: string;
  user: AuthUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(user.role);
    });
  }, [user.role]);

  const logout = () => {
    clearToken();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#f3f5f2] text-[#17221d]">
      <div className="mx-auto flex max-w-[1600px] gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-4 flex min-h-[calc(100vh-2rem)] flex-col rounded-xl border border-[#dfe5df] bg-white p-4 shadow-[0_8px_30px_rgba(23,34,29,0.04)]">
            <Link href="/" className="mb-6 flex items-center justify-center rounded-lg bg-[#f6f8f5] px-4 py-3">
              <Image
                src="/bg-removed.png"
                alt="Collabkar logo"
                width={220}
                height={64}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-3 border-b border-[#edf0ec] px-1 pb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf0ff] text-sm font-semibold text-[#2e43b7]">
                  {initials(user.email)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold leading-tight">{accountLabel(user)}</div>
                <div className="mt-1 truncate text-xs text-[#77817a]">{user.email ?? 'admin'}</div>
                <div className="mt-2 inline-flex rounded-md bg-[#f1f4f0] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#58645b]">
                  {user.role} workspace
                </div>
              </div>
            </div>

            <nav aria-label="Dashboard navigation" className="mt-5 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? 'border-[#3f5ae0] bg-[#f0f2ff] font-semibold text-[#2e43b7]'
                        : 'border-transparent text-[#58645b] hover:bg-[#f5f7f4]'
                    }`}
                  >
                    <span className="font-medium">{item.label}</span>
                    {active && <span className="text-xs font-semibold">Current</span>}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-[#edf0ec] pt-4">
              <button
                onClick={logout}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#667168] transition-colors hover:bg-[#f5f7f4] hover:text-[#17221d]"
              >
                Log out
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="rounded-xl border border-[#dfe5df] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(23,34,29,0.04)] sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#77817a]">Workspace / {user.role}</div>
                <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="hidden rounded-lg border border-[#dfe5df] bg-white px-3.5 py-2 text-sm font-medium text-[#58645b] transition-colors hover:bg-[#f5f7f4] sm:inline-flex"
                >
                  Home
                </Link>

                <button
                  onClick={() => setMobileNavOpen((s) => !s)}
                  aria-expanded={mobileNavOpen}
                  aria-label={mobileNavOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
                  className="inline-flex items-center justify-center rounded-lg border border-[#dfe5df] bg-white px-3.5 py-2 text-sm font-medium text-[#58645b] hover:bg-[#f5f7f4] md:hidden"
                >
                  Menu
                </button>
              </div>
            </div>

            {mobileNavOpen && (
              <div className="mt-4 rounded-lg border border-[#dfe5df] bg-[#fafbf9] p-2 md:hidden">
                <div className="flex items-center justify-between gap-3 px-2 py-2">
                  <div className="text-sm text-gray-700">Signed in as</div>
                  <div className="text-sm font-medium">{accountLabel(user)}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      aria-current={pathname === item.href ? 'page' : undefined}
                      className={`rounded-md border px-3 py-2 text-center text-sm ${pathname === item.href ? 'border-[#cbd2ff] bg-[#f0f2ff] font-semibold text-[#2e43b7]' : 'border-[#e4e9e3] bg-white text-[#58645b]'}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={logout}
                    className="col-span-2 rounded-md bg-[#263b2c] px-3 py-2 text-sm text-white"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </header>

          <main className="mt-5">{children}</main>
        </div>
      </div>
    </div>
  );
}

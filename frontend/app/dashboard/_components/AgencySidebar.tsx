'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../../_components/BrandLogo';
import { AuthUser } from '../../../lib/authClient';

interface AgencySidebarProps {
  user: AuthUser;
}

const NAV_ITEMS = [
  { href: '/dashboard/agency', label: 'Home', icon: '🏠' },
  { href: '/dashboard/agency/creators', label: 'Creators', icon: '👥' },
  { href: '/dashboard/agency/campaigns', label: 'Campaigns', icon: '📢' },
  { href: '/dashboard/agency/analytics', label: 'Analytics', icon: '📊' },
  { href: '/dashboard/agency/settings', label: 'Settings', icon: '⚙️' },
];

const BOTTOM_ITEMS = [
  { href: '/pricing', label: 'Pricing', icon: '💰' },
  { href: '/support', label: 'Support', icon: '❓' },
];

function getInitials(name: string) {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
        isActive ? 'bg-[#3F5AE0]/10 text-[#3F5AE0]' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export function AgencySidebar({ user }: AgencySidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white/70 p-4 backdrop-blur">
      <div className="mb-8">
        <BrandLogo imageClassName="h-8 w-auto" priority={false} />
      </div>

      <div className="mb-6 flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>

      <div className="mb-6 space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>

      <div className="rounded-xl bg-[#3F5AE0]/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3F5AE0] text-sm font-medium text-white">
            {getInitials(user.profile?.displayName || user.email || 'Agency')}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{user.profile?.displayName || user.email}</div>
            <div className="text-xs text-gray-500">Agency</div>
          </div>
        </div>
      </div>
    </div>
  );
}
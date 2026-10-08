'use client';

import type { ReactNode } from 'react';

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="text-white">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 2.9 19.6v-6.93h-2.1V12h2.1V9.8c0-2.07 1.23-3.22 3.11-3.22.9 0 1.84.16 1.84.16v2.03h-1.04c-1.02 0-1.34.64-1.34 1.29V12h2.28l-.36 2.67h-1.92v6.93A10 10 0 0 0 12 2Z"
      />
    </svg>
  );
}

function IconGoogle() {
  // Simplified multi-color Google "G"
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.01 1.53 7.39 2.8l5.05-4.86C33.35 4.57 29.07 2.5 24 2.5 14.73 2.5 6.72 7.83 2.84 15.57l6.15 4.78C11.1 13.52 17.02 9.5 24 9.5Z"
      />
      <path
        fill="#34A853"
        d="M46.1 24.5c0-1.57-.14-2.7-.45-3.88H24v7.4h12.74c-.26 2-1.66 5.01-4.77 7.03l6.07 4.7c3.64-3.36 8.06-8.3 8.06-16.25Z"
      />
      <path
        fill="#4A90E2"
        d="M9 28.35a14.7 14.7 0 0 1-.77-4.65c0-1.62.28-3.19.76-4.65l-6.15-4.78A24 24 0 0 0 0 23.7c0 3.88.94 7.56 2.84 10.78L9 28.35Z"
      />
      <path
        fill="#FBBC05"
        d="M24 46.5c6.91 0 12.72-2.28 16.96-6.2l-6.07-4.7c-1.63 1.14-3.83 1.95-6.89 1.95-6.93 0-12.83-4.02-14.95-9.71l-6.16 4.78C6.73 40.19 14.74 46.5 24 46.5Z"
      />
    </svg>
  );
}

function IconApple() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="text-white">
      <path
        fill="currentColor"
        d="M16.7 13.4c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.9-1.8-3.5-1.8-1.5-.2-2.9.9-3.6.9s-1.9-.9-3.1-.9c-1.6 0-3.1 1-3.9 2.4-1.7 2.9-.4 7.1 1.2 9.4.8 1.1 1.8 2.4 3 2.3 1.2 0 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.8 1.3 0 2.1-1.1 2.9-2.2.9-1.3 1.2-2.5 1.2-2.6-.1 0-2.4-.9-2.4-3.7Zm-2.3-6.8c.7-.9 1.1-2.2 1-3.5-1 .1-2.3.7-3 1.6-.7.8-1.2 2.1-1.1 3.4 1.1.1 2.4-.6 3.1-1.5Z"
      />
    </svg>
  );
}

type Provider = 'facebook' | 'google' | 'apple';

function Button({
  href,
  label,
  variant,
  icon,
}: {
  href: string;
  label: string;
  variant: Provider;
  icon: ReactNode;
}) {
  const base =
    'relative flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2';

  const classes =
    variant === 'facebook'
      ? `${base} bg-[#1877F2] text-white hover:bg-[#166fe5]`
      : variant === 'apple'
        ? `${base} bg-black text-white hover:bg-gray-900`
        : `${base} border border-gray-200 bg-white text-gray-900 hover:bg-gray-50`;

  // Plain <a> on purpose: these URLs are API routes that redirect to an
  // external OAuth provider, so they need a full browser navigation.
  // next/link would try to fetch an RSC payload and prefetch them.
  return (
    <a href={href} className={classes}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</span>
      <span className="block text-center">{label}</span>
    </a>
  );
}

// Only allow same-site relative paths (blocks "//evil.com" and "https://...").
function safeRedirect(path: string): string {
  return path.startsWith('/') && !path.startsWith('//') ? path : '/dashboard';
}

export function SocialAuthButtons({ redirect = '/dashboard' }: { redirect?: string }) {
  const encoded = encodeURIComponent(safeRedirect(redirect));

  return (
    <div className="grid grid-cols-1 gap-2">
      <Button
        variant="facebook"
        href={`/api/auth/oauth/facebook/start?redirect=${encoded}`}
        label="Continue with Facebook"
        icon={<IconFacebook />}
      />
      <Button
        variant="google"
        href={`/api/auth/oauth/google/start?redirect=${encoded}`}
        label="Continue with Google"
        icon={<IconGoogle />}
      />
      <Button
        variant="apple"
        href={`/api/auth/oauth/apple/start?redirect=${encoded}`}
        label="Continue with Apple"
        icon={<IconApple />}
      />
    </div>
  );
}

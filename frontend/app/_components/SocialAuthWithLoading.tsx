'use client';

import { useState } from 'react';
import { SocialAuthButtons } from './SocialAuthButtons';

export function SocialAuthWithLoading({ redirect, role }: { redirect?: string; role?: string }) {
  const [provider, setProvider] = useState<string | null>(null);

  return (
    <div
      className="relative"
      onClickCapture={(event) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest('a[href*="/api/auth/oauth/"]');
        if (!link) return;
        const label = link.textContent?.trim();
        if (label?.startsWith('Continue with ')) setProvider(label.slice('Continue with '.length));
      }}
    >
      <SocialAuthButtons redirect={redirect} role={role} />
      {provider && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/90">
          <button
            type="button"
            disabled
            className="w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700"
            aria-live="polite"
          >
            Connecting to {provider}...
          </button>
        </div>
      )}
    </div>
  );
}

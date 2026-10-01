'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Container, PrimaryLinkButton } from './marketing';

const NAV = [
  { label: 'Platform', href: '#platform' },
  { label: 'Features', href: '#features' },
  { label: 'Results', href: '#results' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Voices', href: '#voices' },
];

export function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e2e8df] bg-[#f4f6f1]/95 backdrop-blur-xl">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-4">
          <BrandLogo imageClassName="h-8 w-auto sm:h-9" priority />

          <nav aria-label="Main navigation" className="hidden items-center gap-1 text-sm lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 font-medium text-[#58645b] transition hover:bg-white/70 hover:text-[#17241b]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex">
            <PrimaryLinkButton href="#features">Explore AI features</PrimaryLinkButton>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-lg border border-[#d6ded4] bg-white/70 text-[#26362a] transition hover:bg-white lg:hidden"
          >
            <span className={`h-0.5 w-5 bg-current transition-transform ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`h-0.5 w-5 bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-5 bg-current transition-transform ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="border-t border-[#e2e8df] pb-4 pt-3 lg:hidden">
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#58645b] transition hover:bg-white/70 hover:text-[#17241b]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="#features"
              onClick={() => setMenuOpen(false)}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#243b2b] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#172a1d]"
            >
              Explore AI features
            </Link>
          </div>
        )}
      </Container>
    </header>
  );
}

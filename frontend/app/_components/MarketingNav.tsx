import Link from 'next/link';
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
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <Container>
        <div className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-6">
              <BrandLogo imageClassName="h-8 w-auto sm:h-10" priority />
              <nav className="hidden items-center gap-2 text-sm md:flex">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-4 py-2 font-medium text-gray-600 transition hover:bg-white hover:text-gray-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex">
              <PrimaryLinkButton href="/signup">Start with Collabkar AI</PrimaryLinkButton>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:hidden">
            <nav className="flex flex-wrap gap-2 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 font-medium text-gray-600 transition hover:text-gray-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <PrimaryLinkButton href="/signup">Start with Collabkar AI</PrimaryLinkButton>
          </div>
        </div>
      </Container>
    </header>
  );
}

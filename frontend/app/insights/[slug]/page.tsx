import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MarketingFooter } from '@/app/_components/MarketingFooter';
import { MarketingNav } from '@/app/_components/MarketingNav';
import { Container } from '@/app/_components/marketing';
import { getInsightBySlug, insights } from '@/data/insights';

export function generateStaticParams() {
  return insights.map((insight) => ({ slug: insight.slug }));
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);

  if (!insight) {
    notFound();
  }

  return (
    <div className={`min-h-screen text-gray-900 ${insight.theme.bodyBackground}`}>
      <MarketingNav />

      <main>
        <section className={`${insight.theme.heroBackground} overflow-hidden py-16 sm:py-20 lg:py-24`}>
          <Container>
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`rounded-full border border-white/20 px-4 py-2 font-semibold ${insight.theme.heroText}`}>
                  {insight.category}
                </span>
                <span className={`rounded-full border border-white/15 px-4 py-2 ${insight.theme.heroText} opacity-80`}>
                  {insight.estimatedReadTime}
                </span>
              </div>
              <h1 className={`mt-8 text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl lg:text-6xl ${insight.theme.heroText}`}>
                {insight.title.split('Offline AI').length > 1 ? (
                  <>
                    {insight.title.split('Offline AI')[0]}
                    <span className={insight.theme.heroAccent}>Offline AI</span>
                    {insight.title.split('Offline AI').slice(1).join('Offline AI')}
                  </>
                ) : (
                  insight.title
                )}
              </h1>
              <p className={`mt-6 max-w-3xl text-lg leading-8 ${insight.theme.heroText} opacity-75`}>{insight.intro}</p>
              <div className={`mt-8 text-sm ${insight.theme.heroText} opacity-70`}>For {insight.targetAudience}</div>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="mx-auto max-w-3xl">
              {insight.sections.map((section) => (
                <article key={section.heading} className="border-b border-gray-100 py-8 first:pt-0 last:border-b-0 last:pb-0">
                  <h2 className={`border-l-4 ${insight.theme.sectionAccent} pl-4 text-2xl font-semibold tracking-[-0.03em] text-gray-900 sm:text-3xl`}>
                    {section.heading}
                  </h2>
                  <p className="mt-5 text-[17px] leading-8 text-gray-700 sm:text-[18px]">{section.body}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="pb-20 lg:pb-28">
          <Container>
            <div className={`rounded-[32px] ${insight.theme.ctaBackground} p-8 sm:p-10 lg:p-14`}>
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">Next step</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{insight.cta}</h2>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/signup"
                    className={`inline-flex min-h-14 items-center justify-center rounded-full px-6 py-4 text-sm font-semibold ${insight.theme.ctaButton}`}
                  >
                    Start with Collabkar
                  </Link>
                  <Link
                    href="/#insights"
                    className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/25 bg-transparent px-6 py-4 text-sm font-semibold text-white"
                  >
                    Back to insights
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import { insights } from '@/data/insights';

import { Container } from './marketing';

type BentoCard = {
  eyebrow: string;
  title: string;
  description: string;
  tone: string;
  className?: string;
  icon: ReactNode;
};

type Metric = {
  value: string;
  label: string;
  detail: string;
};

type StoryBeat = {
  title: string;
  description: string;
  accent: string;
};

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

function ExploreButton() {
  return (
    <button
      type="button"
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-900/10 bg-white/85 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-white sm:w-auto"
    >
      <span aria-hidden="true">&#10022;</span>
      <span>Explore how</span>
    </button>
  );
}

function SectionRule() {
  return <hr className="border-gray-100" />;
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-4xl lg:text-5xl">{title}</h2>
      {description ? <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">{description}</p> : null}
    </div>
  );
}

function SparkPanelIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14 text-gray-900/80">
      <path d="M32 8v14M32 42v14M8 32h14M42 32h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M19 19l6 6M39 39l6 6M45 19l-6 6M25 39l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function OrbitIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14 text-gray-900/80">
      <circle cx="32" cy="32" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="32" cy="32" rx="22" ry="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="32" cy="32" rx="10" ry="22" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14 text-gray-900/80">
      <path d="M12 24 32 14l20 10-20 10-20-10Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 34 32 41l14-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 43 32 48l10-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-14 w-14 text-gray-900/80">
      <path
        d="M8 38c6 0 6-12 12-12s6 12 12 12 6-12 12-12 6 12 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 24c6 0 6-8 12-8s6 8 12 8 6-8 12-8 6 8 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const bentoCards: BentoCard[] = [
  {
    eyebrow: 'Creator discovery',
    title: 'Find campaign-ready micro-influencers instantly',
    description: 'Search by niche, location, engagement rate, and budget fit - no spreadsheets, no manual DMs, no guesswork.',
    tone: 'bg-[#edf5ff]',
    className: 'lg:col-span-7 lg:min-h-[330px]',
    icon: <OrbitIcon />,
  },
  {
    eyebrow: 'Campaign intelligence',
    title: 'See pricing, fit signals, and brief context beside every creator',
    description: 'Compare deliverables, budget alignment, and audience overlap in one dashboard - so your team makes faster, more confident decisions.',
    tone: 'bg-[#f3f9ef]',
    className: 'lg:col-span-5 lg:min-h-[330px] lg:translate-y-10',
    icon: <SparkPanelIcon />,
  },
  {
    eyebrow: 'Influencer workflow',
    title: 'Go from creator search to campaign shortlist in one flow',
    description: 'Review, compare, and organize high-fit creators without switching tabs or losing context - built for teams running repeatable campaigns.',
    tone: 'bg-[#fff8ea]',
    className: 'lg:col-span-5 lg:min-h-[300px]',
    icon: <LayersIcon />,
  },
  {
    eyebrow: 'Offline AI assistance',
    title: 'AI-powered creator recommendations - no external APIs',
    description: 'Get pricing guidance, fit scores, and match rationale built into every step - powered by local AI models, not paid third-party services.',
    tone: 'bg-[#fdf0f3]',
    className: 'lg:col-span-7 lg:min-h-[300px] lg:-translate-y-8',
    icon: <WaveIcon />,
  },
];

const workflowSteps = [
  {
    number: '01',
    title: 'Set your campaign brief',
    description: 'Define your target audience, budget, niche, and deliverables. Collabkar uses this to filter and rank creators before you see a single result.',
  },
  {
    number: '02',
    title: 'Review AI-ranked creator matches',
    description: 'Browse creators ranked by fit score, pricing alignment, and audience overlap - not just follower count.',
  },
  {
    number: '03',
    title: 'Shortlist and move fast',
    description: 'Save high-fit creators, add notes, compare side by side, and move your campaign forward - all from one organized dashboard.',
  },
];

const metrics: Metric[] = [
  { value: '4.8x', label: 'Faster shortlist creation', detail: 'Brands cut sourcing time by replacing spreadsheets with one structured creator workflow.' },
  { value: '91%', label: 'Higher match confidence', detail: 'AI fit signals and pricing context help teams shortlist the right creators sooner.' },
  { value: '12h', label: 'Saved per launch week', detail: 'Less time on manual research means more time building and running the actual campaign.' },
];

const storyBeats: StoryBeat[] = [
  {
    title: 'Set your brief before the search starts',
    description: 'Define your niche, budget, deliverables, and creator style upfront. Collabkar uses your brief to surface matches that fit - not just creators with high follower counts.',
    accent: 'bg-[#fef3c7]',
  },
  {
    title: 'AI-ranked matches you can actually act on',
    description: 'Each creator recommendation comes with fit signals, pricing context, and audience overlap - displayed visually so your team can make faster decisions during live conversations.',
    accent: 'bg-[#dbeafe]',
  },
  {
    title: 'Shortlist and activate without losing momentum',
    description: 'Notes, outreach status, pricing, and next steps stay beside each match - so your campaign pipeline never resets and nothing falls through the gaps.',
    accent: 'bg-[#dcfce7]',
  },
];

const testimonials: Testimonial[] = [
  {
    quote: 'The page finally feels like the product is ahead of us instead of explaining itself from behind.',
    name: 'Mira Santos',
    role: 'Brand Partnerships Lead',
  },
  {
    quote: 'The long-scroll format helps our team understand the workflow without clicking into a dozen screens.',
    name: 'Dev Kumar',
    role: 'Growth Marketing Manager',
  },
  {
    quote: 'The motion feels premium because every section moves differently and supports the story instead of distracting from it.',
    name: 'Anya Perera',
    role: 'Creative Ops Director',
  },
  {
    quote: 'We can show strategy, AI, creator discovery, and execution in one pass now.',
    name: 'Riya Nair',
    role: 'Founder, Social Commerce Studio',
  },
];

const faqItems = [
  {
    question: 'How do brands find creators on Collabkar?',
    answer: 'Browse creator profiles or use AI-assisted matching with a campaign brief. You can narrow discovery by factors like niche, platform, location, and budget, then review profiles before building a shortlist.',
  },
  {
    question: 'Can creators use Collabkar too?',
    answer: 'Yes. Creator accounts can build a profile, add social channels, and view active campaigns from the creator dashboard.',
  },
  {
    question: 'Are AI pricing estimates guaranteed creator rates?',
    answer: 'No. Treat estimates as a planning guide. Confirm final pricing, deliverables, and terms directly with each creator before launching a campaign.',
  },
  {
    question: 'Can I pay for a plan on the website today?',
    answer: 'Not yet. The plans shown on the pricing page are demo pricing, and billing is not connected in the current product.',
  },
];

function HeroSection() {
  const creators = [
    { image: '/avatars/priya.svg', category: 'Beauty & skincare', platform: 'Instagram' },
    { image: '/avatars/meera.svg', category: 'Lifestyle', platform: 'YouTube' },
    { image: '/avatars/rohit.svg', category: 'Food & culture', platform: 'Instagram' },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-[#f4f6f1] pb-12 pt-12 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20" id="platform">
      <div aria-hidden="true" className="pointer-events-none absolute left-[3%] top-32 hidden h-24 w-24 rounded-full border-[10px] border-[#c9ddc8] lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[5%] top-44 hidden h-14 w-14 rotate-12 rounded-2xl border-2 border-[#dfbd58] lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute left-[14%] top-[27%] hidden h-8 w-8 -rotate-12 rounded-lg border-2 border-[#3f5ae0]/50 lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[14%] top-[51%] hidden h-3 w-16 rotate-[24deg] rounded-full bg-[#d8e6d4] lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-28 left-[10%] hidden grid-cols-3 gap-2 lg:grid">
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className={`h-1.5 w-1.5 rounded-full ${index % 2 === 0 ? 'bg-[#3f5ae0]/50' : 'bg-[#a8bea7]'}`} />
        ))}
      </div>
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#496b52] sm:text-sm">
            The creator campaign platform
          </p>
          <h1 className="mx-auto mt-5 max-w-[16ch] text-[clamp(2rem,6vw,4.5rem)] font-semibold leading-[1.06] text-[#17241b] [text-wrap:balance]">
            Creator campaigns, made simple.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5d685f] sm:mt-6 sm:text-lg sm:leading-8">
            Find the right creators, understand audience fit and pricing, and manage campaigns from one clear workspace.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#243b2b] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#172a1d]"
            >
              Create your account
            </Link>
            <Link
              href="/creators"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#cbd5ca] bg-white px-6 py-3 text-sm font-semibold text-[#26362a] transition-colors hover:bg-[#f9fbf8]"
            >
              Browse creators
            </Link>
          </div>
        </div>

        <div
          aria-label="Sample Collabkar campaign workspace preview"
          className="mx-auto mt-10 max-w-6xl overflow-hidden rounded-xl border border-[#dce3db] bg-white text-left shadow-[0_24px_60px_rgba(33,53,38,0.10)] sm:mt-14"
        >
          <div className="flex min-h-14 items-center justify-between gap-4 border-b border-[#e8ede7] px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-4">
              <Image src="/bg-removed.png" alt="Collabkar" width={130} height={38} className="h-7 w-auto shrink-0" />
              <span className="hidden h-6 border-l border-[#e8ede7] sm:block" />
              <span className="hidden truncate text-xs text-[#7a857c] sm:block">Campaigns / Spring skincare launch</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden items-center gap-1.5 text-xs font-medium text-[#526356] sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-[#4b9861]" />
                In progress
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf0ff] text-[11px] font-semibold text-[#3449b5]">MK</span>
            </div>
          </div>

          <div className="grid md:grid-cols-[180px_minmax(0,1fr)]">
            <aside className="hidden border-r border-[#e8ede7] bg-[#fafbf9] p-4 md:block">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#89928b]">Workspace</p>
              <nav aria-label="Preview workspace navigation" className="mt-3 space-y-1 text-sm">
                <p className="rounded-md px-2.5 py-2 text-[#69746b]">Overview</p>
                <p className="rounded-md px-2.5 py-2 text-[#69746b]">Discover creators</p>
                <p className="rounded-md bg-[#edf0ff] px-2.5 py-2 font-medium text-[#3449b5]">Campaigns</p>
              </nav>
              <div className="mt-7 border-t border-[#e8ede7] pt-4">
                <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#89928b]">Current brief</p>
                <p className="mt-3 px-2 text-xs font-semibold text-[#26362a]">Spring skincare launch</p>
                <p className="mt-1 px-2 text-xs text-[#7a857c]">Beauty · Micro creators</p>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e8ede7] px-4 py-4 sm:px-6">
                <div>
                  <p className="text-xs text-[#7a857c]">Campaign workspace</p>
                  <h2 className="mt-1 text-lg font-semibold text-[#1d2c21]">Creator shortlist</h2>
                </div>
                <span className="rounded-md bg-[#f1f4ef] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#526356]">Sample data</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-b border-[#e8ede7] px-4 py-3 sm:px-6">
                <span className="text-xs text-[#7a857c]">Filters</span>
                <span className="rounded-md border border-[#e1e7df] px-2.5 py-1 text-xs text-[#526356]">Beauty</span>
                <span className="rounded-md border border-[#e1e7df] px-2.5 py-1 text-xs text-[#526356]">Instagram</span>
                <span className="rounded-md border border-[#e1e7df] px-2.5 py-1 text-xs text-[#526356]">India</span>
              </div>
              <div className="divide-y divide-[#edf0ec]">
                {creators.map((creator) => (
                  <div key={creator.category} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                    <Image src={creator.image} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#26362a]">{creator.category} creator</p>
                      <p className="mt-0.5 text-xs text-[#7a857c]">{creator.platform} · Sample profile</p>
                    </div>
                    <span className="hidden shrink-0 rounded-md border border-[#dce3db] px-2.5 py-1.5 text-xs font-medium text-[#526356] sm:inline-flex">Review profile</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function IntroSection() {
  return (
    <motion.section
      className="py-16 sm:py-20 lg:py-24"
      initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0 round 36px)' }}
      whileInView={{ opacity: 1, clipPath: 'inset(0 0 0% 0 round 36px)' }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <Container>
        <SectionRule />
        <div className="grid gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400">Clarity first</p>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-4xl">
                  Every tool your team needs to run creator campaigns - in one place.
                </h2>
              </div>
              <div className="max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
                Collabkar replaces scattered spreadsheets and manual sourcing with a single workflow for creator discovery, AI-assisted matching, and campaign shortlisting - designed for D2C brands and agencies.
              </div>
        </div>
        <SectionRule />
      </Container>
    </motion.section>
  );
}

function FeaturesSection() {
  return (
    <section className="pb-16 sm:pb-20 lg:pb-24" id="features">
      <Container>
        <SectionHeading
            eyebrow="Core features"
            title="Creator discovery, AI ranking, and campaign workflow - built into one platform."
            description="From finding the right micro-influencer to tracking campaign progress, every Collabkar feature is designed to cut sourcing time and improve match confidence."
          />

        <motion.div
          className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.14,
              },
            },
          }}
        >
          {bentoCards.map((card, index) => (
            <motion.article
              key={card.title}
              variants={{
                hidden: {
                  opacity: 0,
                  y: index % 2 === 0 ? 70 : 110,
                  rotate: index % 2 === 0 ? -2 : 2,
                },
                show: {
                  opacity: 1,
                  y: 0,
                  rotate: 0,
                  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className={`${card.tone} ${card.className ?? ''} flex flex-col justify-between rounded-[28px] p-5 sm:p-7 lg:rounded-[32px] lg:p-8`}
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">{card.eyebrow}</p>
                  <h3 className="mt-4 max-w-sm text-[1.75rem] font-semibold tracking-[-0.04em] text-gray-900 sm:text-[2rem]">
                    {card.title}
                  </h3>
                </div>
                <div className="shrink-0 self-start opacity-75">{card.icon}</div>
              </div>
              <div className="mt-6 sm:mt-10">
                <p className="max-w-lg text-base leading-7 text-gray-600 sm:text-lg">{card.description}</p>
                <div className="mt-6 sm:mt-8">
                  <ExploreButton />
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

function MetricsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" id="results">
      <Container>
        <SectionHeading
          eyebrow="Results"
          title="What brands achieve with Collabkar."
          description="From first search to final shortlist, teams using Collabkar move faster, make better matches, and spend less time on manual sourcing."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {metrics.map((metric, index) => (
            <motion.article
              key={metric.label}
              className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-8"
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-5xl font-semibold tracking-[-0.06em] text-gray-900 sm:text-6xl">{metric.value}</p>
              <p className="mt-4 text-lg font-semibold text-gray-900">{metric.label}</p>
              <p className="mt-3 text-base leading-7 text-gray-600">{metric.detail}</p>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function StorySection({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [120, -120]);

  return (
    <section ref={ref} className="overflow-hidden py-16 sm:py-20 lg:py-28" id="story">
      <Container>
        <SectionRule />
        <div className="py-14">
          <SectionHeading
            eyebrow="How Collabkar works"
            title="From campaign brief to creator shortlist - in one connected flow."
            description="This strip slides horizontally against the page scroll so the middle of the site feels different from the stacked sections above it."
          />
          <motion.div style={{ x }} className="mt-12 flex w-max gap-5 pr-10">
            {storyBeats.map((beat) => (
              <article
                key={beat.title}
                className="w-[320px] rounded-[30px] border border-gray-100 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:w-[420px] sm:p-8"
              >
                <div className={`h-2 w-24 rounded-full ${beat.accent}`} />
                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-gray-900">{beat.title}</h3>
                <p className="mt-4 text-base leading-7 text-gray-600">{beat.description}</p>
              </article>
            ))}
          </motion.div>
        </div>
        <SectionRule />
      </Container>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" id="how-it-works">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400">How it works</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-4xl">
              Three steps from campaign idea to creator shortlist.
            </h2>
          </div>
          <div className="grid gap-8">
            {workflowSteps.map((step, index) => (
              <motion.article
                key={step.number}
                className="grid gap-4 border-b border-gray-100 pb-8 sm:grid-cols-[80px_1fr]"
                initial={{ opacity: 0, x: 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="text-sm font-semibold text-gray-400">{step.number}</div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-gray-900">{step.title}</h3>
                  <p className="mt-3 max-w-xl text-base leading-7 text-gray-600">{step.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function SpotlightSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28" id="spotlight">
      <Container>
        <SectionHeading
          eyebrow="Feature deep dive"
          title="The tools inside Collabkar that make campaigns run faster."
          description="A closer look at the three core features that replace manual sourcing, pricing guesswork, and scattered campaign management."
        />

        <div className="mt-12 grid gap-6">
          {[
            {
              title: 'Campaign brief builder',
              description: 'Set your niche, region, creator tone, deliverables, and budget in one structured intake flow - so every search starts with context, not a blank table.',
              tone: 'bg-[#eef6ff]',
            },
            {
              title: 'AI ranking and match rationale',
              description: 'Understand exactly why a creator was surfaced - audience fit percentage, content alignment score, pricing range, and outreach readiness shown side by side.',
              tone: 'bg-[#f4faef]',
            },
            {
              title: 'Shortlist command center',
              description: 'Turn your saved creators into a live campaign hub - track approvals, add notes, compare candidates, and collaborate with your team without losing any context.',
              tone: 'bg-[#fff8eb]',
            },
          ].map((item, index) => (
            <motion.article
              key={item.title}
              className={`${item.tone} rounded-[32px] p-6 sm:p-8 lg:p-10`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -90 : 90, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">Spotlight 0{index + 1}</p>
                  <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-gray-900">{item.title}</h3>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">{item.description}</p>
                </div>
                <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {['Signals', 'Filters', 'Notes', 'AI prompts'].map((label) => (
                      <div key={label} className="rounded-[20px] bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{label}</p>
                        <p className="mt-3 text-lg font-semibold text-gray-900">Ready</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function TestimonialsSection({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const topRowX = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -140]);
  const bottomRowX = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-80, 80]);

  return (
    <section ref={ref} className="overflow-hidden py-16 sm:py-20 lg:py-28" id="voices">
      <Container>
        <SectionRule />
        <div className="py-14">
          <SectionHeading
            eyebrow="Voices"
            title="Social proof that drifts across the page."
            description="Two testimonial rows move at different speeds so this section feels distinct from the hero parallax and the story strip."
          />
          <motion.div style={{ x: topRowX }} className="mt-12 flex gap-5">
            {testimonials.slice(0, 2).map((item) => (
              <article key={item.name} className="min-w-[320px] rounded-[30px] bg-[#f9fafb] p-6 sm:min-w-[420px] sm:p-8">
                <p className="text-xl leading-8 tracking-[-0.03em] text-gray-900">{item.quote}</p>
                <p className="mt-8 text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="mt-1 text-sm text-gray-500">{item.role}</p>
              </article>
            ))}
          </motion.div>
          <motion.div style={{ x: bottomRowX }} className="mt-5 flex gap-5">
            {testimonials.slice(2).map((item) => (
              <article key={item.name} className="min-w-[320px] rounded-[30px] bg-[#eef6ff] p-6 sm:min-w-[420px] sm:p-8">
                <p className="text-xl leading-8 tracking-[-0.03em] text-gray-900">{item.quote}</p>
                <p className="mt-8 text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="mt-1 text-sm text-gray-500">{item.role}</p>
              </article>
            ))}
          </motion.div>
        </div>
        <SectionRule />
      </Container>
    </section>
  );
}

function EditorialSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28" id="insights">
      <Container>
          <SectionHeading
            eyebrow="Insights"
            title="Guides, playbooks, and creator marketing insights."
            description="Practical content for brand teams, agencies, and creators - covering influencer strategy, AI-powered workflows, and micro-influencer campaign execution."
          />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {insights.map((item, index) => (
            <motion.article
              key={item.title}
              className="rounded-[30px] border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-8"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">{item.category}</p>
                <span className="rounded-full border border-gray-900/10 bg-white/70 px-3 py-1 text-xs font-medium text-gray-600">
                  {item.estimatedReadTime}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-gray-900">{item.title}</h3>
              <p className="mt-4 text-base leading-7 text-gray-600">{item.intro}</p>
              <p className="mt-4 text-sm font-medium text-gray-500">For {item.targetAudience}</p>
              <div className="mt-8">
                <Link
                  href={`/insights/${item.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition hover:gap-3"
                >
                  Read more
                  <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" id="faq">
      <Container>
          <SectionHeading
            eyebrow="FAQ"
            title="Answers for brands and creators."
            description="Practical details about matching, creator profiles, pricing estimates, and current plan availability."
          />

        <div className="mt-12 grid gap-4">
          {faqItems.map((item, index) => (
            <motion.article
              key={item.question}
              className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm sm:p-7"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-gray-900">{item.question}</h3>
              <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600">{item.answer}</p>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="pb-20 lg:pb-28">
      <Container>
        <motion.div
          className="rounded-[28px] bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_100%)] p-6 sm:rounded-[36px] sm:p-10 lg:p-14"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400">Get started free</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-gray-900 sm:text-4xl lg:text-5xl">
                Find the right creators for your next campaign.
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Join brands, agencies, and local businesses using Collabkar to discover micro-influencers, compare fit, and move campaigns forward - without spreadsheets or paid AI APIs.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link
                href="/signup"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-gray-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-black sm:px-7"
              >
                Create free account
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 sm:px-7"
              >
                View pricing
              </Link>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export function HomeLanding() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <main className="overflow-x-clip">
      <HeroSection />
      <IntroSection />
      <FeaturesSection />
      <MetricsSection />
      <StorySection reduceMotion={reduceMotion} />
      <WorkflowSection />
      <SpotlightSection />
      <TestimonialsSection reduceMotion={reduceMotion} />
      <EditorialSection />
      <FAQSection />
      <ClosingSection />
    </main>
  );
}

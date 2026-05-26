'use client';

import Link from 'next/link';
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
    question: 'Can this support both brands and creator managers?',
    answer: 'Yes. The longer page now explains discovery, comparison, workflow, and launch readiness in a way that speaks to both sides of the collaboration.',
  },
  {
    question: 'Will the animations hurt responsiveness?',
    answer: 'The motion is based on transforms and in-view triggers, with reduced-motion support so the experience stays smooth and accessible.',
  },
  {
    question: 'Can the new sections be swapped for product screenshots later?',
    answer: 'Absolutely. The structure is intentionally modular, so each content block can be replaced with real demos, analytics, case studies, or campaign media.',
  },
];

function HeroSection({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const headlineY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 110]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.25]);
  const panelY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -70]);
  const panelRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -4]);

  return (
    <motion.section ref={ref} className="overflow-hidden pt-8 sm:pt-14 lg:pt-20" id="platform">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center lg:gap-16">
          <motion.div style={{ y: headlineY, opacity: headlineOpacity }} className="max-w-3xl">
            <div className="inline-flex max-w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-sm sm:text-sm">
              AI-powered creator collaboration for modern brand teams
            </div>
            <h1 className="mt-6 max-w-4xl text-[2.9rem] font-semibold leading-[0.98] tracking-[-0.07em] text-gray-900 sm:mt-8 sm:text-[4.25rem] lg:text-[5.5rem]">
              Find, match, and manage creators - without the chaos.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:mt-8 sm:text-xl sm:leading-8">
              Collabkar is the creator marketplace where brands discover micro-influencers, estimate campaign pricing, and move from brief to shortlist in one clean workflow - powered by offline AI.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link
                href="/signup"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-gray-900 px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(17,24,39,0.14)] transition hover:bg-black sm:px-7"
              >
                Start for free
              </Link>
              <Link
                href="/creators"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 sm:px-7"
              >
                Browse creator profiles
              </Link>
            </div>
          </motion.div>

          <motion.div style={{ y: panelY, rotate: panelRotate }} className="relative w-full min-w-0">
            <div className="absolute inset-x-6 top-10 -z-10 h-56 rounded-full bg-[radial-gradient(circle,#dbeafe_0%,rgba(219,234,254,0)_72%)] blur-3xl sm:inset-x-10 sm:h-64" />
            <div className="rounded-[28px] border border-gray-100 bg-[#fafafa] p-3 shadow-[0_28px_90px_rgba(15,23,42,0.08)] sm:rounded-[32px] sm:p-6">
              <div className="overflow-hidden rounded-[24px] border border-white bg-white sm:rounded-[28px]">
                <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Explore AI matching</p>
                    <p className="mt-1 text-sm text-gray-500">Scroll-reactive showcase for your product demo, metrics, and campaign system.</p>
                  </div>
                  <div className="w-fit rounded-full bg-[#edf5ff] px-3 py-1 text-xs font-semibold text-gray-700">Live preview</div>
                </div>

                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[22px] bg-[linear-gradient(180deg,#f7f9fc_0%,#ffffff_100%)] p-4 sm:rounded-[24px] sm:p-5">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-gray-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Creator signal board
                    </div>
                    <div className="mt-5 grid gap-3">
                      <div className="rounded-[20px] border border-gray-100 bg-white p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">Beauty UGC shortlist</p>
                            <p className="mt-1 text-xs text-gray-500">12 high-fit profiles with pricing context</p>
                          </div>
                          <div className="w-fit rounded-full bg-[#f3f9ef] px-3 py-1 text-xs font-semibold text-gray-700">92% fit</div>
                        </div>
                        <div className="mt-4 h-28 rounded-[18px] bg-[linear-gradient(135deg,#edf5ff_0%,#f7f8fb_55%,#fff8ea_100%)]" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {['Audience overlap', 'AI pricing range', 'Response readiness'].map((item) => (
                          <div key={item} className="rounded-[18px] border border-gray-100 bg-white p-4">
                            <p className="text-xs text-gray-500">{item}</p>
                            <p className="mt-4 text-lg font-semibold text-gray-900">Clear</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[22px] bg-[#f3f9ef] p-4 sm:rounded-[24px] sm:p-5">
                      <p className="text-xs font-medium uppercase tracking-[0.24em] text-gray-400">Assist</p>
                      <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-gray-900 sm:text-2xl">
                        Recommendations that feel built in, not bolted on.
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-[#fdf0f3] p-4 sm:rounded-[24px] sm:p-5">
                      <p className="text-sm font-semibold text-gray-900">Video / dashboard slot</p>
                      <div className="mt-4 flex h-36 items-center justify-center rounded-[20px] border border-dashed border-gray-300 bg-white/70 px-4 text-center text-sm text-gray-500 sm:h-44">
                        Product demo placeholder
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </motion.section>
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
            title="Common questions about Collabkar."
            description="Everything brands, creators, and agencies ask before running their first campaign on the platform."
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
    <main>
      <HeroSection reduceMotion={reduceMotion} />
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

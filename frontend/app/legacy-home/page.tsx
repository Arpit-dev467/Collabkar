'use client';

// Legacy landing page (kept for reference; can be deleted later).
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FormEvent, type MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';

const HeroScene = dynamic(() => import('../../components/HeroScene'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '560px', background: 'transparent' }} />
  ),
});
const AIPricingTool = dynamic(() => import('../../components/AIPricingTool'), {
  ssr: false,
  loading: () => <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">Loading...</div>,
});

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface StatItem {
  end: number;
  label: string;
  prefix?: string;
  suffix?: string;
  detail?: string;
}

interface Testimonial {
  name: string;
  role: string;
  followers: string;
  rating: number;
  quote: string;
  avatar: string;
  highlight: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface PricingPlan {
  label?: string;
  name: string;
  subtitle?: string;
  badge?: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const navLinks = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'For Creators', href: '#for-creators' },
  { label: 'For Brands', href: '#for-brands' },
  { label: 'Pricing', href: '#pricing' },
];

const floatingParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1.5,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 5,
}));

const statsData: StatItem[] = [
  { end: 200, suffix: '+', label: 'Creators', detail: 'Verified profiles in Rajasthan' },
  { end: 50, suffix: '+', label: 'Brands', detail: 'D2C and local brands onboarded' },
  { end: 10, prefix: 'Rs ', suffix: 'L+', label: 'Deals Closed', detail: 'Paid out via escrow' },
  { end: 4, suffix: '', label: 'Cities', detail: 'Jaipur, Jodhpur, Udaipur, Kota' },
];

const testimonialsData: Testimonial[] = [
  {
    name: 'Priya Sharma',
    role: 'Food & Lifestyle, Jaipur',
    followers: '28K followers',
    rating: 5,
    quote:
      "I used to negotiate every deal over WhatsApp and chase payments for weeks. CollabKar got me paid within 2 days of posting. I'm never going back.",
    avatar: '/avatars/priya.svg',
    highlight: 'Paid in 48 hours',
  },
  {
    name: 'Rohit Verma',
    role: 'Tech Creator, Indore',
    followers: '45K followers',
    rating: 5,
    quote:
      "The AI matched me with a brand I'd never have found myself. The deal was Rs 12,000 - my biggest single post ever. And the invoice was auto-generated. Unreal.",
    avatar: '/avatars/rohit.svg',
    highlight: 'Rs 12,000 single post',
  },
  {
    name: 'Meera Patel',
    role: 'Skincare Creator, Surat',
    followers: '19K followers',
    rating: 4,
    quote:
      'I was charging Rs 800 per reel. CollabKar told me similar creators charge Rs 3,500. I updated my rates. Next deal: Rs 3,200. The pricing tool alone is worth everything.',
    avatar: '/avatars/meera.svg',
    highlight: '4x pricing uplift',
  },
];

const allTestimonials: Testimonial[] = [...testimonialsData, ...testimonialsData];

const faqData: FaqItem[] = [
  {
    question: 'Is CollabKar really free for creators?',
    answer:
      'Yes, completely. Creators never pay a subscription. We only earn when a deal completes, and we take our cut from the brand side. You keep 90-92% of every deal.',
  },
  {
    question: 'How does escrow work?',
    answer:
      'When a brand hires you, they pay the full amount to CollabKar upfront. We hold it securely. Once you deliver and the brand approves, payment goes to your account automatically. No chasing. No ghosting.',
  },
  {
    question: 'How does AI matching work?',
    answer:
      'We analyze your niche, engagement rate, audience data, and past deal history to match you with brands whose campaign goals align with your audience. It gets smarter with every deal.',
  },
  {
    question: 'Do I need a lot of followers to join?',
    answer:
      'No. We welcome creators from 1,000 followers. Brands on CollabKar specifically look for micro and nano influencers with engaged audiences - not just big numbers.',
  },
  {
    question: 'Which platforms does scheduling support?',
    answer: 'Instagram, Twitter/X, Facebook, and LinkedIn. YouTube Shorts coming soon.',
  },
  {
    question: 'Is my payment data safe?',
    answer:
      'Payments go through Razorpay, an RBI-licensed gateway. We never store card details. All transactions are encrypted end to end.',
  },
];

const pricingPlans: PricingPlan[] = [
  {
    label: 'Creator - Free',
    name: 'Starter',
    subtitle: 'Nano & micro influencers',
    price: '₹0',
    period: '/mo',
    features: [
      'Profile & rate card builder',
      'Up to 3 active deal proposals',
      'E-contract generation',
      'Basic analytics dashboard',
      '10% platform fee on payments',
    ],
    cta: 'Get started',
  },
  {
    label: 'Creator - Pro',
    badge: 'Most popular',
    name: 'Growth',
    subtitle: 'Serious micro creators',
    price: '₹499',
    period: '/mo',
    features: [
      'Unlimited active proposals',
      'Priority brand discovery',
      'Invoice + GST auto-generation',
      'Escrow payment protection',
      'Engagement analytics + rate benchmarks',
      '8% platform fee on payments',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    label: 'Creator - Elite',
    name: 'Pro',
    subtitle: 'Mid-tier & rising creators',
    price: '₹1,199',
    period: '/mo',
    features: [
      'Everything in Growth',
      'Verified creator badge',
      'Media kit auto-builder',
      'Multi-platform deal bundling',
      'Direct brand intro access',
      '4% platform fee on payments',
    ],
    cta: 'Go Elite',
  },
  {
    label: 'Brand - Starter',
    name: 'Launch',
    subtitle: 'D2C startups & small brands',
    price: '₹2,999',
    period: '/mo',
    features: [
      'Creator discovery with filters',
      'Campaign brief templates',
      '5 active campaigns',
      'Content approval workflow',
      '8% GMV fee on deals booked',
    ],
    cta: 'Start Launch',
  },
  {
    label: 'Brand - Growth',
    badge: 'Best value',
    name: 'Scale',
    subtitle: 'Growing D2C & agencies',
    price: '₹7,999',
    period: '/mo',
    features: [
      'Up to 30 active campaigns',
      'Verified creator pool access',
      'Consolidated reporting dashboard',
      'Bulk deal management',
      'Escrow + auto payment rails',
      '5% GMV fee on deals booked',
    ],
    cta: 'Start Scale',
  },
  {
    label: 'Brand - Enterprise',
    name: 'Agency',
    subtitle: 'Large brands & agencies',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited campaigns',
      'White-label reporting',
      'API access + integrations',
      'Custom contract templates',
      'Dedicated account manager',
      'Negotiated GMV fee (2-4%)',
    ],
    cta: 'Contact sales',
  },
];

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease, staggerChildren: 0.12 } },
};

function useScrollAnimation(delay = 0) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  return { ref, isInView, delay };
}

function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const increment = end / (1500 / 16);
    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= end) {
          clearInterval(timer);
          return end;
        }
        return next;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [end, isInView]);

  return (
    <span ref={ref} className="text-4xl font-bold md:text-5xl">
      {prefix}
      {Math.round(count)}
      {suffix}
    </span>
  );
}

function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const [isTouch] = useState(() => (typeof navigator !== 'undefined' ? navigator.maxTouchPoints > 0 : false));
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { stiffness: 120, damping: 20 });
  const smoothY = useSpring(cursorY, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted || isTouch) return;
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY, mounted, isTouch]);

  if (!mounted || isTouch) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[1] h-[350px] w-[350px] rounded-full"
      style={{
        left: smoothX,
        top: smoothY,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(63,90,224,0.10) 0%, transparent 70%)',
      }}
    />
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [hoveredPricing, setHoveredPricing] = useState<number | null>(null);
  const [particlesReady, setParticlesReady] = useState(false);

  const { scrollY, scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const scrollWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  const navBg = useTransform(scrollY, [0, 50], ['rgba(244,245,247,0)', 'rgba(244,245,247,0.95)']);
  const navBorder = useTransform(scrollY, [0, 50], ['rgba(255,255,255,0)', 'rgba(0,0,0,0.08)']);

  const statsAnim = useScrollAnimation();
  const heroAnim = useScrollAnimation();
  const problemAnim = useScrollAnimation();
  const howAnim = useScrollAnimation();
  const featuresAnim = useScrollAnimation();
  const aiAnim = useScrollAnimation();
  const pricingAnim = useScrollAnimation();
  const testimonialAnim = useScrollAnimation();
  const faqAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();
  const footerAnim = useScrollAnimation();

  const openWaitlistModal = () => {
    setSubmitted(false);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleLogoClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitWaitlist = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');
    setLoading(true);

    try {
      const apiBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001').replace(/\/+$/, '');
      const response = await fetch(`${apiBase}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName, creatorName, email, source }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit email.');
      }

      setSubmitted(true);
      setBrandName('');
      setCreatorName('');
      setEmail('');
      setSource('');
    } catch {
      setSubmitError('Could not save your email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setParticlesReady(true);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,#edf1ff_0%,#f7f7f7_38%,#f6f7fb_100%)] text-[#0B0B0F]">
      <style jsx global>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes dreamFloat {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-7px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes dreamSheen {
          0% {
            transform: translateX(-170%);
          }
          100% {
            transform: translateX(220%);
          }
        }
        html {
          scroll-behavior: smooth;
        }
        .dream-panel {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(64, 91, 224, 0.2);
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(237, 243, 255, 0.82));
          box-shadow: 0 20px 50px rgba(39, 58, 140, 0.12);
          backdrop-filter: blur(8px);
        }
        .dream-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(125deg, rgba(255, 255, 255, 0.45), transparent 56%);
          pointer-events: none;
        }
        .dream-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(31, 45, 122, 0.14);
          background: linear-gradient(150deg, rgba(255, 255, 255, 0.96), rgba(241, 244, 255, 0.88));
          box-shadow: 0 14px 36px rgba(30, 45, 122, 0.1);
          transition: transform 0.35s cubic-bezier(0.21, 0.47, 0.32, 0.98), box-shadow 0.35s cubic-bezier(0.21, 0.47, 0.32, 0.98);
        }
        .dream-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 22px 56px rgba(34, 50, 130, 0.18);
        }
        .dream-sheen::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 42%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.35), transparent);
          transform: translateX(-170%);
          animation: dreamSheen 5.8s linear infinite;
          pointer-events: none;
        }
        .dream-float {
          animation: dreamFloat 6s ease-in-out infinite;
        }
        .marquee-track {
          animation: marquee 28s linear infinite;
          display: flex;
          width: max-content;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <CursorGlow />
      <motion.div className="fixed left-0 top-0 z-50 h-0.5 bg-[#3F5AE0]" style={{ width: scrollWidth }} />

      <motion.nav className="fixed top-0 z-40 w-full border-b backdrop-blur-2xl" style={{ backgroundColor: navBg, borderColor: navBorder }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" onClick={handleLogoClick} className="flex items-center px-1 py-1" aria-label="Go to home top">
              <Image src="/bg-removed.png" alt="CollabKar logo" width={240} height={60} className="h-12 w-auto" priority />
            </Link>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative pb-1 text-lg text-[#4B5563] transition-colors duration-200 hover:text-[#0B0B0F]"
                onMouseEnter={() => setHoveredNav(link.label)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                {link.label}
                {hoveredNav === link.label && <motion.span layoutId="navUnderline" className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-[#3F5AE0]" />}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-xl border border-black/10 bg-white/70 px-5 py-3.5 text-lg text-[#0B0B0F] shadow-[0_12px_28px_rgba(40,55,140,0.08)] transition-all hover:-translate-y-0.5 hover:border-black/20">
              Log in
            </Link>
            <Link href="/signup" className="rounded-xl bg-[#0B0B0F] px-5 py-3.5 text-lg text-white shadow-[0_14px_30px_rgba(11,11,15,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(11,11,15,0.28)]">
              Sign up
            </Link>
          </div>
          <button onClick={() => setMobileOpen((s) => !s)} className="md:hidden">
            <span className="block h-0.5 w-6 bg-[#0B0B0F]" />
            <span className="mt-1 block h-0.5 w-6 bg-[#0B0B0F]" />
            <span className="mt-1 block h-0.5 w-6 bg-[#0B0B0F]" />
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="border-t border-black/10 bg-[#F4F5F7]/95 p-4 md:hidden">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="block py-1 text-base text-[#4B5563]">
                  {link.label}
                </a>
              ))}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/10 pt-4">
                <Link href="/login" className="rounded-lg border border-black/10 bg-white px-4 py-2 text-center text-base text-[#0B0B0F]">
                  Log in
                </Link>
                <Link href="/signup" className="rounded-lg bg-[#0B0B0F] px-4 py-2 text-center text-base text-white">
                  Sign up
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="relative z-10 overflow-hidden pt-24">
        <motion.section ref={heroAnim.ref} initial={{ opacity: 0, y: 40 }} animate={heroAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, ease }} className="relative px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <motion.div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#3F5AE0]/20 blur-3xl" animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="pointer-events-none absolute -right-20 top-48 h-80 w-80 rounded-full bg-[#4B6CFF]/20 blur-3xl" animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particlesReady && floatingParticles.map((particle, i) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: `${particle.size}px`, height: `${particle.size}px`, backgroundColor: i % 2 === 0 ? '#3F5AE0' : '#ffffff', opacity: 0.35 }}
                animate={{ y: [0, -25, 0], x: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>

          <div className="relative mx-auto max-w-6xl">
            <div className="relative z-10 max-w-2xl">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8 inline-flex rounded-full border border-[#3F5AE0]/40 bg-[#3F5AE0]/10 px-5 py-2.5 text-sm tracking-wide text-[#3F5AE0]">Now in Beta - Jaipur & Rajasthan</motion.div>
              <motion.h1 className="text-4xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
                {"India's  Smartest  Brand  Deal  Platform  for  Creators".split(' ').map((word, index) => (
                  <motion.span key={`${word}-${index}`} className="inline-block pr-1" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + index * 0.06, duration: 0.5, ease }}>
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
              <motion.p className="mt-6 max-w-2xl text-lg leading-8 text-[#4B5563] sm:text-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
                Stop managing brand deals over WhatsApp. CollabKar connects micro-influencers with D2C brands using AI matching, escrow payments, and zero agency fees.
              </motion.p>
              <motion.div
                className="mt-10 flex flex-col items-start gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <motion.button onClick={openWaitlistModal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="relative overflow-hidden rounded-lg bg-[#3F5AE0] px-8 py-4 text-base font-medium text-white">
                  <span className="relative z-10">Get Early Access</span>
                  <motion.span className="absolute top-0 h-full w-[60px] -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ['-100px', '300px'] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5, ease: 'linear' }} />
                </motion.button>
                <motion.a href="#how-it-works" whileHover={{ scale: 1.03 }} className="rounded-lg border border-black/10 px-8 py-4 text-base text-[#0B0B0F] transition-colors hover:border-black/20">
                  See How It Works
                </motion.a>
              </motion.div>
              <motion.p className="mt-6 text-base text-[#4B5563]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }}>
                Trusted by 200+ creators across Rajasthan
              </motion.p>
            </div>
            <div className="pointer-events-none absolute right-0 top-10 hidden h-[520px] w-[520px] md:block">
              <div className="hidden md:flex items-center justify-center relative w-full" style={{ minHeight: '560px' }}>
                <HeroScene />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section ref={statsAnim.ref} initial={{ opacity: 0, y: 40 }} animate={statsAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, ease }} className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="dream-panel mx-auto max-w-5xl rounded-[28px] p-8 md:p-10">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#6B7280]">Momentum</p>
                <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Early traction, real results</h2>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 text-xs text-[#4B5563]">
                <span className="h-2 w-2 rounded-full bg-[#4B6CFF]" />
                Updated Feb 2026
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {statsData.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="dream-card dream-sheen rounded-2xl p-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={statsAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AnimatedCounter end={stat.end} prefix={stat.prefix} suffix={stat.suffix} />
                  <p className="mt-2 text-sm font-medium text-[#0B0B0F]">{stat.label}</p>
                  <p className="mt-1 text-xs text-[#4B5563]">{stat.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section ref={problemAnim.ref} initial="hidden" animate={problemAnim.isInView ? 'show' : 'hidden'} variants={sectionVariants} className="px-4 py-28 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-6xl">
            <h2 className="text-4xl font-semibold md:text-5xl">Brand deals shouldn&apos;t happen over WhatsApp</h2>
            <p className="mt-4 max-w-3xl text-lg text-[#4B5563]">
              CollabKar gives creators and brands one trusted workflow for discovery, negotiation, contracts,
              payouts, and scheduling.
            </p>
            <div className="mt-8 grid gap-8 [perspective:1000px] md:grid-cols-3">
              {[
                'No payment protection. Brands ghost. Creators get paid late or not at all.',
                'Zero structure. No contract, no brief, no invoice. Just vibes and a DM.',
                "Brands can't find tier-2 creators. They stick to Mumbai and Delhi. You stay invisible.",
              ].map((copy, index) => (
                <motion.div key={copy} initial={{ opacity: 0, y: 50, rotateX: 8 }} animate={problemAnim.isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 8 }} transition={{ delay: index * 0.15, duration: 0.6, ease }} whileHover={{ y: -8, boxShadow: '0 22px 58px rgba(239,68,68,0.2)' }} className="dream-card dream-sheen rounded-2xl p-8">
                  <motion.div className="absolute left-0 top-0 h-full w-1 bg-red-400/80" initial={{ scaleY: 0 }} animate={problemAnim.isInView ? { scaleY: 1 } : { scaleY: 0 }} style={{ transformOrigin: 'top' }} transition={{ delay: index * 0.15 + 0.3 }} />
                  <p className="text-base text-[#4B5563]">{copy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section id="how-it-works" ref={howAnim.ref} initial={{ opacity: 0, y: 40 }} animate={howAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, ease }} className="px-4 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-4xl font-semibold md:text-5xl">One platform. Every step of the deal.</h2>
            <p className="mt-4 max-w-3xl text-lg text-[#4B5563]">
              No more scattered chats, delayed approvals, or payment confusion. Run the full campaign lifecycle in one place.
            </p>
            <motion.div className="mb-8 mt-8 hidden h-px bg-gradient-to-r from-[#3F5AE0] to-[#4B6CFF] md:block" initial={{ scaleX: 0 }} animate={howAnim.isInView ? { scaleX: 1 } : { scaleX: 0 }} style={{ transformOrigin: 'left' }} transition={{ duration: 0.8, delay: 0.2 }} />
            <div className="grid gap-7 md:grid-cols-4">
              {[
                'Creator builds a profile - niche, rate card, past work, connected socials',
                'Brand posts a campaign brief - budget, content type, target audience',
                'AI matches the right creators - ranked by fit, engagement, and deal history',
                'Deal happens on CollabKar - proposal, agreement, escrow payment, invoice. No WhatsApp needed.',
              ].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0, y: 24 }} animate={howAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ delay: i * 0.12, duration: 0.5 }} whileHover={{ y: -8 }} className="dream-card dream-sheen rounded-2xl p-7">
                  <motion.div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10" initial={{ rotateX: 90, opacity: 0 }} animate={howAnim.isInView ? { rotateX: 0, opacity: 1 } : { rotateX: 90, opacity: 0 }} transition={{ delay: i * 0.2 }}>{i + 1}</motion.div>
                  <p className="text-base text-[#4B5563]">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section ref={featuresAnim.ref} initial={{ opacity: 0, y: 40 }} animate={featuresAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, ease }} className="px-4 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <motion.div
              id="for-creators"
              initial={{ x: -60, opacity: 0 }}
              animate={featuresAnim.isInView ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 }}
              whileHover={{ y: -8, boxShadow: '0 30px 70px rgba(63,90,224,0.22)' }}
              className="group relative overflow-hidden rounded-[28px] border border-[#4B6CFF]/30 bg-[linear-gradient(150deg,rgba(255,255,255,0.95),rgba(235,241,255,0.9))] p-8 shadow-[0_16px_42px_rgba(20,30,80,0.12)] backdrop-blur-sm"
            >
              <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full bg-[#4B6CFF]/20 blur-3xl" />
              <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-white/70 blur-2xl" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.28),transparent_55%)]" />
              <h3 className="relative text-2xl font-semibold text-[#3E56DB]">For Creators</h3>
              <ul className="relative mt-4 space-y-3 text-base text-[#425066]">
                {[
                  'Free forever for creators',
                  'AI-suggested pricing for your niche and follower count',
                  'Escrow payment - get paid every time, guaranteed',
                  'Auto-generated GST invoice on deal close',
                  'Free social media scheduling tools included',
                  'Post to Instagram, Twitter, LinkedIn, Facebook from one dashboard',
                ].map((item, i) => (
                  <motion.li key={item} whileHover={{ x: 6 }} className="flex items-start gap-3 transition-colors duration-300 group-hover:text-[#1F2B55]">
                    <motion.span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#4B6CFF]" initial={{ scale: 0 }} animate={featuresAnim.isInView ? { scale: 1 } : { scale: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 10 }} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              id="for-brands"
              initial={{ x: 60, opacity: 0 }}
              animate={featuresAnim.isInView ? { x: 0, opacity: 1 } : { x: 60, opacity: 0 }}
              whileHover={{ y: -8, boxShadow: '0 30px 70px rgba(36,58,162,0.24)' }}
              className="group relative overflow-hidden rounded-[28px] border border-[#3F5AE0]/30 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(229,236,255,0.92))] p-8 shadow-[0_16px_42px_rgba(15,28,88,0.13)] backdrop-blur-sm"
            >
              <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full bg-[#3F5AE0]/20 blur-3xl" />
              <div className="pointer-events-none absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-white/70 blur-2xl" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.3),transparent_52%)]" />
              <h3 className="relative text-2xl font-semibold text-[#2F48CB]">For Brands</h3>
              <ul className="relative mt-4 space-y-3 text-base text-[#425066]">
                {[
                  'AI matching by niche, city, engagement, audience demographics',
                  'Search 1,000+ verified Indian micro-influencers',
                  'Campaign brief builder - no agency needed',
                  'Track all deals in one dashboard',
                  'Pay securely - funds released only on content delivery',
                  'Plans from ₹2,999/mo',
                ].map((item, i) => (
                  <motion.li key={item} whileHover={{ x: 6 }} className="flex items-start gap-3 transition-colors duration-300 group-hover:text-[#1F2B55]">
                    <motion.span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#3F5AE0]" initial={{ scale: 0 }} animate={featuresAnim.isInView ? { scale: 1 } : { scale: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 10 }} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.section>

        <motion.section ref={aiAnim.ref} initial={{ opacity: 0, y: 40 }} animate={aiAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, ease }} className="relative px-4 py-28 sm:px-6 lg:px-8">
          <motion.div className="pointer-events-none absolute inset-0" animate={{ background: ['radial-gradient(circle at 30% 50%, rgba(63,90,224,0.15) 0%, transparent 60%)', 'radial-gradient(circle at 70% 50%, rgba(43,58,153,0.15) 0%, transparent 60%)', 'radial-gradient(circle at 30% 50%, rgba(63,90,224,0.15) 0%, transparent 60%)'] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl p-[1px]">
            <motion.div className="pointer-events-none absolute -inset-24" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ background: 'conic-gradient(from 0deg, rgba(63,90,224,0.6), rgba(75,108,255,0.5), rgba(63,90,224,0.6))' }} />
            <div className="relative rounded-xl border border-black/10 bg-white p-8">
              <motion.div className="mb-4 inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>Powered by AI</motion.div>
              <h2 className="text-4xl font-semibold md:text-5xl">Not just a filter. Actual intelligence.</h2>
              <div className="mt-6 grid gap-8 md:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={aiAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} className="rounded-xl border border-black/10 bg-white p-7">
                  <h3 className="text-lg font-semibold">Smart Creator Matching</h3>
                  <p className="mt-2 text-base text-[#4B5563]">
                    Our AI analyzes campaign briefs and ranks creators by fit - not just follower count.
                    A skincare brand gets skincare creators with skincare deal history. Every time.
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 24 }} animate={aiAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ delay: 0.12 }} className="rounded-xl border border-black/10 bg-white p-7">
                  <h3 className="text-lg font-semibold">Dynamic Pricing Intelligence</h3>
                  <p className="mt-2 text-base text-[#4B5563]">
                    Creators in tier-2 cities underprice themselves by 60% on average. CollabKar tells
                    you what creators like you actually charge - so you never undersell again.
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 24 }} animate={aiAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ delay: 0.24 }} className="rounded-xl border border-black/10 bg-white p-7">
                  <AIPricingTool />
                </motion.div>
              </div>
              <p className="mt-6 text-sm text-[#4B5563]">Models trained on real Indian creator deal data. Improving every week.</p>
            </div>
          </div>
        </motion.section>

        <motion.section id="pricing" ref={pricingAnim.ref} initial={{ opacity: 0, y: 40 }} animate={pricingAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, ease }} className="px-4 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-4xl font-semibold md:text-5xl">Pricing</h2>
            <p className="mt-4 max-w-3xl text-lg text-[#4B5563]">
              Creator and brand plans with transparent subscription + success-based fees.
            </p>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={`${plan.label || 'plan'}-${plan.name}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={plan.popular && pricingAnim.isInView ? { opacity: 1, y: [0, -8, 0] } : pricingAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  transition={plan.popular ? { delay: 0.15, duration: 3, repeat: Infinity, ease: 'easeInOut' } : { delay: index * 0.15 }}
                  whileHover={{ y: -8, boxShadow: '0 24px 64px rgba(63,90,224,0.25)' }}
                  onHoverStart={() => setHoveredPricing(index)}
                  onHoverEnd={() => setHoveredPricing(null)}
                  className={`relative overflow-hidden rounded-[26px] border p-8 ${plan.popular ? 'border-[#2F48CB] bg-white shadow-[0_20px_50px_rgba(47,73,216,0.22)]' : 'border-[#293b96]/12 bg-[linear-gradient(155deg,rgba(255,255,255,0.98),rgba(243,246,255,0.9))] shadow-[0_16px_40px_rgba(28,44,123,0.12)]'}`}
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#4B6CFF]/20 blur-3xl" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.4),transparent_56%)]" />
                  <div className="relative inline-flex items-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        plan.badge || plan.popular
                          ? 'bg-[#2F48CB] text-white'
                          : 'border border-[#2F48CB]/20 bg-white text-[#2F48CB]'
                      }`}
                    >
                      {[plan.label, plan.badge].filter(Boolean).join(' - ')}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{plan.name}</h3>
                  {plan.subtitle && <p className="mt-1 text-sm text-[#4B5563]">{plan.subtitle}</p>}
                  <p className="mt-3 text-3xl font-bold">
                    {plan.price}
                    {plan.period && <span className="text-base text-[#4B5563]">{plan.period}</span>}
                  </p>
                  <ul className="mt-4 space-y-2 text-base text-[#4B5563]">{plan.features.map((f) => <li key={f}>- {f}</li>)}</ul>
                  <motion.button className="relative mt-5 w-full overflow-hidden rounded-lg bg-[#3F5AE0] px-4 py-2.5 text-sm text-white">
                    {plan.cta}
                    <motion.span className="pointer-events-none absolute left-[-30%] top-0 h-full w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent" animate={hoveredPricing === index ? { x: ['-80px', '280px'], opacity: [0, 1, 0] } : { opacity: 0 }} transition={{ duration: 0.7, ease: 'linear' }} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
            <p className="mt-6 text-base text-[#4B5563]">
              Platform fees vary by plan (creators: 10% to 4%, brands: 8% to 2-4%). No hidden fees.
            </p>
          </div>
        </motion.section>
        <motion.section ref={testimonialAnim.ref} initial={{ opacity: 0, y: 40 }} animate={testimonialAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, ease }} className="px-4 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#6B7280]">Testimonials</p>
                <h2 className="mt-2 text-4xl font-semibold md:text-5xl">Creators already winning with CollabKar</h2>
                <p className="mt-4 max-w-3xl text-lg text-[#4B5563]">
                  Real outcomes from micro-creators in tier-2 cities using AI matching and structured deal workflows.
                </p>
              </div>
              <div className="dream-card inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs text-[#4B5563]">
                <span className="h-2 w-2 rounded-full bg-[#3F5AE0]" />
                4.9 average creator rating
              </div>
            </div>
            <div className="relative mt-12 overflow-hidden">
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#F7F7F7] to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#F7F7F7] to-transparent" />
              <div className="marquee-track">
                {allTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={`${testimonial.name}-${index}`}
                    className="group relative mr-6 min-w-[360px] overflow-hidden rounded-[24px] border border-[#D7DDF8] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(240,244,255,0.92))] p-7 shadow-[0_16px_38px_rgba(35,48,108,0.12)]"
                    whileHover={{ y: -8, boxShadow: '0 26px 58px rgba(37,55,138,0.2)' }}
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#4B6CFF]/18 blur-3xl" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.45),transparent_54%)]" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image src={testimonial.avatar} alt={testimonial.name} width={52} height={52} className="rounded-full border border-black/10" />
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-[#4B5563]">{testimonial.role} · {testimonial.followers}</p>
                          <div className="mt-1 flex items-center gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <span key={`${testimonial.name}-star-${starIndex}`} className={starIndex < testimonial.rating ? 'text-[#F59E0B]' : 'text-[#D1D5DB]'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/5 text-base text-[#3F5AE0]">
                        “
                      </div>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#3F5AE0]/20 bg-white/80 px-3 py-1 text-xs text-[#4B5563]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4B6CFF]" />
                      {testimonial.highlight}
                    </div>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Feedback</p>
                    <p className="mt-2 text-base leading-7 text-[#374151]">&quot;{testimonial.quote}&quot;</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section ref={faqAnim.ref} initial={{ opacity: 0, y: 40 }} animate={faqAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, ease }} className="px-4 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-4xl font-semibold md:text-5xl">Frequently asked questions</h2>
            <p className="mt-4 max-w-3xl text-lg text-[#4B5563]">
              Common questions from creators and brands before joining CollabKar.
            </p>
            <div className="mt-8 space-y-4">
              {faqData.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <motion.div key={faq.question} initial={{ opacity: 0, y: 24 }} animate={faqAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ delay: index * 0.08 }} className="dream-card dream-sheen relative overflow-hidden rounded-2xl border border-black/10 bg-white">
                    <motion.div className="absolute left-0 top-0 h-full w-1 bg-[#3F5AE0]" initial={{ scaleY: 0 }} animate={{ scaleY: isOpen ? 1 : 0 }} style={{ transformOrigin: 'top' }} />
                    <button className="flex w-full items-center justify-between px-5 py-4 text-left" onClick={() => setOpenFaq(isOpen ? null : index)}>
                      <span className="font-medium">{faq.question}</span>
                      <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300 }}>+</motion.span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
                          <p className="px-5 pb-5 text-base text-[#4B5563]">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.section ref={ctaAnim.ref} initial={{ opacity: 0, y: 40 }} animate={ctaAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, ease }} className="relative px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div className="absolute -left-10 top-8 h-44 w-44 rounded-full bg-[#3F5AE0]/20 blur-3xl" animate={{ x: [0, 35, 0], y: [0, 15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="absolute right-0 top-20 h-52 w-52 rounded-full bg-[#4B6CFF]/15 blur-3xl" animate={{ x: [0, -30, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
          </div>
          <div className="dream-panel dream-sheen relative mx-auto max-w-4xl rounded-[30px] border border-black/10 bg-white p-8 text-center">
            {['Stop leaving money on the table.'].map((line, index) => (
              <motion.h2 key={line} className="text-4xl font-semibold md:text-5xl" initial={{ y: 30, opacity: 0 }} animate={ctaAnim.isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }} transition={{ delay: index * 0.15 }}>
                {line}
              </motion.h2>
            ))}
            <p className="mx-auto mt-4 max-w-2xl text-[#4B5563]">
              Join 200+ creators already on the waitlist. Free forever for creators.
            </p>
            <motion.button onClick={openWaitlistModal} className="relative mt-8 overflow-hidden rounded-xl bg-[linear-gradient(140deg,#4A66F0,#3554DA)] px-8 py-4 text-base font-semibold text-white shadow-[0_16px_34px_rgba(53,84,218,0.34)]" whileHover={{ scale: 1.04 }}>
              Claim Your Free Creator Profile
              <motion.span className="absolute top-0 h-full w-[60px] -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ['-100px', '360px'] }} transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.2, ease: 'linear' }} />
            </motion.button>
            <p className="mt-4 text-base text-[#4B5563]">No credit card. No agency. No WhatsApp negotiations.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              {['Secure Payments', 'Free for Creators', 'Made in India'].map((badge, index) => (
                <motion.span key={badge} className="rounded-full border border-black/10 bg-white px-3 py-1" initial={{ opacity: 0, y: 20 }} animate={ctaAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ delay: 0.35 + index * 0.1 }}>
                  {badge}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section ref={footerAnim.ref} initial={{ opacity: 0, y: 40 }} animate={footerAnim.isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, ease }} className="border-t border-[#2f43b4]/15 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-[#4B5563]">
              <div className="flex items-center px-4 py-3">
                <Image src="/bg-removed.png" alt="CollabKar logo" width={320} height={80} className="h-14 w-auto" />
              </div>
              <p>Brand deals made simple for creators and D2C brands.</p>
            </div>
            <div className="grid gap-8 text-base text-[#4B5563] sm:grid-cols-2 lg:grid-cols-4">
              <div><h4 className="mb-3 font-semibold text-[#0B0B0F]">Product</h4><p>How it Works</p><p>Pricing</p><p>AI Features</p><p>Scheduling</p></div>
              <div><h4 className="mb-3 font-semibold text-[#0B0B0F]">Company</h4><p>About</p><p>Blog</p><p>Careers</p><p>Contact</p></div>
              <div><h4 className="mb-3 font-semibold text-[#0B0B0F]">Legal</h4><p>Privacy Policy</p><p>Terms</p><p>Refund Policy</p></div>
              <div><h4 className="mb-3 font-semibold text-[#0B0B0F]">Social</h4><p>Twitter/X</p><p>Instagram</p><p>LinkedIn</p></div>
            </div>
          </div>
          <p className="mx-auto mt-10 max-w-6xl text-sm text-[#6B7280]">© 2026 CollabKar Technologies Pvt. Ltd. · Made in Jaipur, India</p>
        </motion.section>
      </main>

      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)}>
            <div className="flex min-h-full items-center justify-center px-4">
              <motion.div className="relative w-full max-w-md rounded-xl border border-black/10 bg-white p-8" initial={{ scale: 0.88, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.88, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }} onClick={(e) => e.stopPropagation()}>
                <motion.button className="absolute right-4 top-4 text-[#4B5563]" whileHover={{ rotate: 90, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }} onClick={() => setModalOpen(false)}>?</motion.button>
                <h3 className="text-2xl font-semibold">Get early access</h3>
                <p className="mt-2 text-base text-[#4B5563]">Tell us about your brand so we can set you up fast.</p>
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.form key="form" onSubmit={handleSubmitWaitlist} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-5 space-y-4">
                      <motion.input list="brand-options" type="text" required value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Brand name / username" className="w-full rounded-lg border border-black/10 bg-[#F4F5F7] px-4 py-3 text-sm outline-none placeholder:text-[#66667a]" whileFocus={{ boxShadow: '0 0 0 3px rgba(63,90,224,0.4)' }} />
                      <datalist id="brand-options">
                        <option value="@yourbrand" />
                        <option value="Your Brand Pvt Ltd" />
                        <option value="Your Store Name" />
                      </datalist>
                      <motion.input list="creator-options" type="text" required value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="Creator of brand" className="w-full rounded-lg border border-black/10 bg-[#F4F5F7] px-4 py-3 text-sm outline-none placeholder:text-[#66667a]" whileFocus={{ boxShadow: '0 0 0 3px rgba(63,90,224,0.4)' }} />
                      <datalist id="creator-options">
                        <option value="Founder / Owner" />
                        <option value="Marketing Lead" />
                        <option value="Partnerships Manager" />
                      </datalist>
                      <motion.input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" className="w-full rounded-lg border border-black/10 bg-[#F4F5F7] px-4 py-3 text-sm outline-none placeholder:text-[#66667a]" whileFocus={{ boxShadow: '0 0 0 3px rgba(63,90,224,0.4)' }} />
                      <motion.input type="text" required value={source} onChange={(e) => setSource(e.target.value)} placeholder="How did you hear about us?" className="w-full rounded-lg border border-black/10 bg-[#F4F5F7] px-4 py-3 text-sm outline-none placeholder:text-[#66667a]" whileFocus={{ boxShadow: '0 0 0 3px rgba(63,90,224,0.4)' }} />
                      {submitError && <p className="text-sm text-red-300">{submitError}</p>}
                      <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3F5AE0] px-4 py-3 text-sm font-medium text-white">
                        {loading ? <><motion.div className="h-5 w-5 rounded-full border-2 border-t-indigo-300 border-r-transparent border-b-indigo-300 border-l-indigo-300" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />Processing</> : 'Join Waitlist'}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-6 rounded-lg border border-[#4B6CFF]/30 bg-[#4B6CFF]/10 p-7 text-center">
                      <svg viewBox="0 0 52 52" className="mx-auto h-14 w-14 text-[#4B6CFF]">
                        <circle cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                        <motion.path d="M14 27 L23 36 L38 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                      </svg>
                      <motion.p className="mt-3 text-lg font-semibold" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>You&apos;re in! ??</motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


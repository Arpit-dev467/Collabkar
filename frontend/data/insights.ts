export type InsightSection = {
  heading: string;
  body: string;
};

export type InsightTheme = {
  heroBackground: string;
  heroAccent: string;
  heroText: string;
  bodyBackground: string;
  sectionAccent: string;
  ctaBackground: string;
  ctaButton: string;
};

export type Insight = {
  id: number;
  title: string;
  slug: string;
  category: string;
  targetAudience: string;
  estimatedReadTime: string;
  intro: string;
  sections: InsightSection[];
  cta: string;
  theme: InsightTheme;
};

export const insights: Insight[] = [
  {
    id: 1,
    title: 'Why We Built Collabkar Without Paid AI APIs -- And Why It Matters',
    slug: 'collabkar-offline-ai-no-paid-apis',
    category: 'Product & Engineering',
    targetAudience: 'Tech-savvy founders, CTOs, indie hackers',
    estimatedReadTime: '5 min',
    intro:
      "Most SaaS products quietly depend on OpenAI or similar APIs at their core. We didn't want that. Here's why Collabkar runs on local AI -- and what that means for you.",
    sections: [
      {
        heading: 'The hidden risk of external AI dependency',
        body: "When your product's core feature relies on a third-party API, you're one pricing change or outage away from a broken product. We saw this risk early.",
      },
      {
        heading: 'What offline AI actually means',
        body: 'Local models run on your own infrastructure. No data leaves your system. No per-call charges. No vendor lock-in. Just fast, private, predictable matching.',
      },
      {
        heading: 'Why this matters for brands using Collabkar',
        body: "Your campaign data, creator shortlists, and budget context stay private. You're not feeding a third-party model. That's a real competitive advantage.",
      },
      {
        heading: 'The tradeoffs we made',
        body: "Local models require more upfront engineering. We accepted that cost so you don't pay it in API bills or data exposure.",
      },
    ],
    cta: "Try Collabkar's offline AI matching -- no API key needed.",
    theme: {
      heroBackground: 'bg-[#0f172a]',
      heroAccent: 'text-cyan-300',
      heroText: 'text-slate-100',
      bodyBackground: 'bg-white',
      sectionAccent: 'border-emerald-400',
      ctaBackground: 'bg-emerald-500',
      ctaButton: 'bg-slate-950 text-white',
    },
  },
  {
    id: 2,
    title: 'Stop Using Spreadsheets to Manage Influencer Campaigns',
    slug: 'stop-using-spreadsheets-influencer-campaigns',
    category: 'Workflow & Productivity',
    targetAudience: 'D2C brand managers, marketing leads, agency ops',
    estimatedReadTime: '4 min',
    intro:
      "If your influencer workflow lives in a Google Sheet, you're already behind. Here's what a modern campaign pipeline actually looks like.",
    sections: [
      {
        heading: 'The spreadsheet trap',
        body: 'Sheets feel flexible until you have 40 creators, 3 campaign stages, and 2 team members editing at the same time. Then they become a liability.',
      },
      {
        heading: "What you're actually losing",
        body: "Version conflicts, missed follow-ups, no pricing context, and zero visibility into who's been shortlisted vs contacted vs declined.",
      },
      {
        heading: 'What a clean workflow looks like',
        body: "One place to search, shortlist, compare, and track. No tab-switching. No manual data entry. Collabkar's dashboard is built exactly for this.",
      },
      {
        heading: 'Making the switch without disruption',
        body: "You don't need to migrate everything at once. Start your next campaign in Collabkar and feel the difference by the second shortlist.",
      },
    ],
    cta: 'Run your next campaign without a single spreadsheet. Start free on Collabkar.',
    theme: {
      heroBackground: 'bg-[#fafaf9]',
      heroAccent: 'text-emerald-600',
      heroText: 'text-gray-900',
      bodyBackground: 'bg-white',
      sectionAccent: 'border-amber-300',
      ctaBackground: 'bg-gray-900',
      ctaButton: 'bg-white text-gray-900',
    },
  },
  {
    id: 3,
    title: 'Micro-Influencer Campaigns for Local Businesses: Cafes, Gyms, and Salons',
    slug: 'micro-influencer-campaigns-local-businesses',
    category: 'Use Cases',
    targetAudience: 'Local SMB owners, regional marketers, franchise managers',
    estimatedReadTime: '6 min',
    intro:
      "You don't need a massive budget or a celebrity partnership. Local micro-influencers can fill your tables, classes, and chairs -- if you find the right ones.",
    sections: [
      {
        heading: 'Why local creators work better than big names',
        body: "A food blogger with 8,000 followers in your city drives more walk-ins than a national influencer with 500k followers who's never visited your neighbourhood.",
      },
      {
        heading: 'What to look for in a local creator',
        body: 'Location match, engagement rate over follower count, niche alignment (food, fitness, lifestyle), and consistent posting cadence.',
      },
      {
        heading: 'How to structure the campaign',
        body: 'Offer a free visit or service, agree on 1-2 deliverables (a reel and a story), set a deadline, and track foot traffic or bookings in the week after.',
      },
      {
        heading: 'Using Collabkar to find local talent',
        body: 'Filter by location, niche, and budget to surface relevant micro-influencers. No manual DM-ing through Instagram. No guessing on pricing.',
      },
    ],
    cta: 'Find local creators for your next campaign. Browse on Collabkar.',
    theme: {
      heroBackground: 'bg-[linear-gradient(135deg,#c2714f_0%,#fdf6ec_100%)]',
      heroAccent: 'text-[#fff7ed]',
      heroText: 'text-[#1a1a1a]',
      bodyBackground: 'bg-[#fffbf7]',
      sectionAccent: 'border-[#c2714f]',
      ctaBackground: 'bg-[#c2714f]',
      ctaButton: 'bg-[#fff7ed] text-[#2d2d2d]',
    },
  },
  {
    id: 4,
    title: 'What Brands Actually Look for When Shortlisting Creators',
    slug: 'what-brands-look-for-shortlisting-creators',
    category: 'For Creators',
    targetAudience: 'Micro-influencers, UGC creators, lifestyle content creators',
    estimatedReadTime: '5 min',
    intro:
      "You've got the content. But brands still aren't picking you. Here's what's actually happening on their side of the shortlist -- and how to change it.",
    sections: [
      {
        heading: "It's not about follower count",
        body: 'Brands using platforms like Collabkar filter by niche, engagement, and budget fit -- not vanity metrics. A 6k follower account in the right niche beats a 60k account in the wrong one.',
      },
      {
        heading: "What they're actually checking",
        body: 'Consistency of posting, content quality, niche clarity, audience location, and whether your pricing aligns with their budget. All of this before they ever DM you.',
      },
      {
        heading: 'Profile signals that get you shortlisted',
        body: 'A clear niche in your bio, recent posts in one content lane, a media kit or pricing signal, and a professional but authentic tone.',
      },
      {
        heading: 'How Collabkar helps you get found',
        body: 'Collabkar surfaces creators based on match signals -- not just follower numbers. A complete, focused profile puts you in front of brands actively looking for your niche.',
      },
    ],
    cta: 'Create your Collabkar profile and start showing up in brand searches.',
    theme: {
      heroBackground: 'bg-[linear-gradient(180deg,#ede9fe_0%,#ffffff_100%)]',
      heroAccent: 'text-violet-700',
      heroText: 'text-indigo-950',
      bodyBackground: 'bg-white',
      sectionAccent: 'border-violet-300',
      ctaBackground: 'bg-violet-600',
      ctaButton: 'bg-white text-violet-700',
    },
  },
];

export function getInsightBySlug(slug: string) {
  return insights.find((insight) => insight.slug === slug);
}

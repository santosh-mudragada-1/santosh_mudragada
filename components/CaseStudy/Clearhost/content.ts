import type { ReactElement } from 'react';
import type { IconProps } from './icons';
import {
  Compass,
  Crosshair,
  IndianRupee,
  Megaphone,
  PieChart,
  Scissors,
  Share2,
  Sparkles,
  Users,
} from './icons';

/**
 * ClearHost case study — content layer, ported from the source project and
 * re-angled from a Product-Manager voice to a UX / product-design voice.
 *
 * TODO(review): the following are carried over verbatim from the source and
 * should be confirmed before this goes live —
 *   · role framing: "Product Designer · 0→1" (was "Product Manager & Growth")
 *   · team shape: "sole designer · with 5 engineers & a PM" (was "lead a team
 *     of 5 developers and 2 designers")
 *   · timeframe "Feb 2026 → present", stage "Pre-launch · Channex certified"
 *   · live URL https://www.clearhost.in
 *   · every market stat / KPI is real-and-cited or explicitly modelled — see
 *     the source notes kept alongside each block.
 *
 * Voice: first person, Santosh. Market numbers are industry-cited. Anything
 * about outcomes is PRE-LAUNCH and framed as a target or modelled figure,
 * never as a delivered result.
 */

type Ico = (props: IconProps) => ReactElement;

export interface Decision {
  icon: Ico;
  /** The call, stated as a decision (not a feature). */
  decision: string;
  context: string;
  why: string;
  tradeoff: string;
  impact: string;
}

export type ArtifactKind =
  | 'screenshot'
  | 'recording'
  | 'doc'
  | 'sheet'
  | 'design'
  | 'notes'
  | 'board';

export interface Artifact {
  label: string;
  kind: ArtifactKind;
  note?: string;
}

export const clearhost = {
  wordmark: 'clearhost',
  liveUrl: 'https://www.clearhost.in',
  liveLabel: 'clearhost.in',
  role: 'Product Designer · 0→1',
  timeframe: 'Feb 2026 → present',
  status: 'Pre-launch · Channex certified',
  logo: '/clearhost/clearhost logo.png',
  heroVideo: '/clearhost/hero_video.webm',
  headline: 'Unified operating system for hotels.',
  sub: 'Designing an all-in-one hotel management ecosystem — PMS, Channel Manager and a built-in AI Ads Manager — so an owner can run the whole property from one place.',
} as const;

/** Hero problem → solution block: operations aren't broken, they're fragmented. */
export const fragmentation = {
  titleA: "Hotel operations aren't broken.",
  titleB: "They're fragmented.",
  sub: 'Hotels rely on multiple disconnected systems — manual work, operational mistakes, lost revenue.',
  problems: [
    { n: '01', title: 'Disconnected systems', note: 'No shared data.' },
    { n: '02', title: 'Manual operations', note: 'One booking. Entered multiple times.' },
    { n: '03', title: 'Inventory sync issues', note: 'One delayed update. One double booking.' },
    { n: '04', title: 'Revenue leakage', note: 'Small inefficiencies. Big losses.' },
  ],
  leak: {
    n: '05',
    value: '15–25%',
    label:
      'of room revenue lost to OTA commissions alone — before you even count the staff hours spent reconciling five calendars by hand.',
    /** Compact form for layouts where 05 sits beside the other four. */
    short: 'of room revenue lost to OTA commissions.',
    aside: 'And the channel that saves the guest money bills the owner for it.',
  },
  solution: {
    line: 'One system. Every job.',
    pills: ['PMS', 'Channel Manager', 'AI Ads Manager'],
    media: {
      title: 'The ClearHost dashboard',
      note: 'Screenshot or short recording of the live product goes here.',
    },
  },
} as const;

/* ── 1 · Overview ────────────────────────────────────────────────────────── */
/** Short scan-tags above the hero title — first one renders as the accent pill. */
export const heroTags: string[] = ['Product Designer · 0→1', '~6 mo', 'Pre-launch'];

export const heroMeta: { label: string; value: string }[] = [
  { label: 'Role', value: 'Product Designer · 0→1' },
  { label: 'Team', value: 'Sole designer · with 5 engineers & a PM' },
  { label: 'Timeline', value: 'Feb 2026 → now · ~6 mo' },
  { label: 'Stage', value: 'Pre-launch · Channex certified' },
];

export const responsibilities: string[] = [
  'Discovery & user research',
  'Information architecture & user flows',
  'Low-fidelity wireframing',
  'Interaction design & prototyping',
  'Design system & UI',
  'Usability testing & design QA',
];

/* ── 2 · The Opportunity ─────────────────────────────────────────────────── */

/**
 * Immersive workspace story — the scroll version of the discovery board.
 * Raw observations scatter in, cluster into PMS / Channel Manager, surface the
 * gap, then converge into ClearHost. `m` marks the mobile subset. `tone`
 * indexes the sticky palette in WorkspaceStory.
 */
export type WsGroup = 'pms' | 'cm' | 'loose';
export interface WsNote {
  id: string;
  label: string;
  group: WsGroup;
  tone: number;
  m?: boolean;
}
export const workspaceNotes: WsNote[] = [
  // PMS — inside the building
  { id: 'w-dbl', label: 'Double bookings', group: 'pms', tone: 0, m: true },
  { id: 'w-hk', label: 'Housekeeping delays', group: 'pms', tone: 2, m: true },
  { id: 'w-walkin', label: 'Walk-ins on paper', group: 'pms', tone: 1 },
  { id: 'w-audit', label: 'Night audit chaos', group: 'pms', tone: 3 },
  { id: 'w-folio', label: 'Guest folio errors', group: 'pms', tone: 0, m: true },
  { id: 'w-reports', label: 'Reports live in silos', group: 'pms', tone: 4, m: true },
  { id: 'w-refunds', label: 'Refund chaos', group: 'pms', tone: 1 },
  { id: 'w-history', label: 'No guest history', group: 'pms', tone: 2, m: true },
  { id: 'w-gst', label: 'GST done by hand', group: 'pms', tone: 5 },
  { id: 'w-queue', label: 'Check-in queues at 3pm', group: 'pms', tone: 3, m: true },
  // Channel Manager — distribution
  { id: 'w-drift', label: 'OTA rates drift', group: 'cm', tone: 1, m: true },
  { id: 'w-inv', label: 'Inventory mismatch', group: 'cm', tone: 0, m: true },
  { id: 'w-cal', label: 'Calendar sync fails', group: 'cm', tone: 2, m: true },
  { id: 'w-promo', label: "Promo codes don't sync", group: 'cm', tone: 4 },
  { id: 'w-wknd', label: 'Weekend pricing missed', group: 'cm', tone: 0 },
  { id: 'w-oversell', label: 'Overselling peak nights', group: 'cm', tone: 3, m: true },
  { id: 'w-comm', label: 'Commission math opaque', group: 'cm', tone: 5, m: true },
  { id: 'w-abnb', label: 'Airbnb calendar drift', group: 'cm', tone: 1 },
  { id: 'w-rateplan', label: 'Rate-plan confusion', group: 'cm', tone: 2, m: true },
  { id: 'w-minlos', label: 'Restrictions hard to set', group: 'cm', tone: 4 },
  // Loose — the unresolved middle
  { id: 'w-recon', label: 'Manual reconciliation', group: 'loose', tone: 3, m: true },
  { id: 'w-logins', label: 'Five logins a day', group: 'loose', tone: 0, m: true },
  { id: 'w-switch', label: 'Switching tools all day', group: 'loose', tone: 2, m: true },
  { id: 'w-wa', label: 'WhatsApp is the ops layer', group: 'loose', tone: 4, m: true },
  { id: 'w-onelogin', label: 'Owner wants one login', group: 'loose', tone: 1, m: true },
  { id: 'w-yield', label: 'Yield = gut feel', group: 'loose', tone: 5 },
  { id: 'w-training', label: 'Staff training is hard', group: 'loose', tone: 2 },
  { id: 'w-direct', label: 'Direct bookings lost', group: 'loose', tone: 0, m: true },
];

/** Facilitator notes that get circled around the middle cluster. */
export const workspaceAnnotations = [
  'Manual work continues',
  'Switching between tools',
  'Still disconnected',
];

export const workspaceCopy = {
  boardName: 'clearhost — discovery wall',
  meta: 'Week 3 · 14 interviews · patterns emerging',
  /** Three collaborators, each with their own patch of the board. */
  cursors: ['Santosh', 'PM', 'Dev'],
  avatars: ['SM', 'AR', 'D'],
  comment: 'this keeps coming up ↑',
  /** The key insight, written above the middle cluster. */
  missingLayer: 'The Missing Layer',
  clusters: { pms: 'PMS', mid: 'The gap', cm: 'Channel Manager' },
  /** What the three clusters resolve into. */
  finalNodes: ['PMS', 'Operations', 'Channel Manager'],
  finale: 'One connected operating system',
} as const;

export const whiteboardCopy = {
  /** Screen-reader summary of the whole animated board. */
  summary:
    'Field research kept surfacing the same two systems. A PMS runs everything inside the building — front desk, guests, housekeeping, reservations, reports. A channel manager runs distribution outside it — inventory, availability, rates, OTA, pricing. Neither talks to the other, so hotels are forced to run both. ClearHost connects them into one operating system.',
} as const;

/**
 * The ClearHost ecosystem — the finale of the workspace story. Five core
 * modules ring the logo; each one's own features float around it, so the
 * board reads as several small systems joined into one.
 */
export interface EcoModule {
  id: string;
  label: string;
  children: string[];
}
export const ecosystemModules: EcoModule[] = [
  {
    id: 'pms',
    label: 'PMS',
    children: ['Front Desk', 'Reservations', 'Housekeeping', 'Guest Management', 'Room Management'],
  },
  {
    id: 'cm',
    label: 'Channel Manager',
    children: ['Inventory', 'Rate Plans', 'OTA Sync', 'Availability'],
  },
  {
    id: 'booking',
    label: 'Booking Engine',
    children: ['Own Website', 'Direct Bookings'],
  },
  {
    id: 'analytics',
    label: 'Analytics & AI Insights',
    children: ['Revenue Dashboard', 'Occupancy Analytics', 'Forecasting', 'AI Recommendations'],
  },
  {
    id: 'ads',
    label: 'AI Ads Manager',
    children: ['Google Ads', 'Meta Ads', 'Campaign Insights', 'Budget Optimization'],
  },
];

/** Launch GTM — the plan that shaped pricing and who we acquire first. */
export const gtmSignal =
  "Two-thirds of India's rooms are independent — and travel keeps shifting to offbeat towns where independents are often the only stay.";

export const gtmSteps: { k: string; v: string }[] = [
  { k: 'Who first', v: 'Owner-operated stays, 5–40 rooms — homestays, hostels, boutique hotels.' },
  {
    k: 'Where',
    v: 'The regions I researched — the Northeast, Himachal, Rajasthan — where I know owners by name.',
  },
  { k: 'How', v: 'Warm intros through owner networks; I onboard the first cohort myself.' },
  { k: 'Pricing', v: "A flat monthly price in rupees — less than one weekend's OTA commission." },
];

/**
 * Verified 2025–26 sources: Hotelivate "Sizing Up Indian Hospitality" (68% of
 * ~2.48M rooms); NITI Aayog–IAMAI "Rethinking Homestays" Aug 2025 (₹4,722 Cr /
 * ~11% CAGR to 2031, and the Ministry of Tourism 2L+ room-shortfall estimate);
 * Skyscanner Smarter Summer Report India, Apr 2026 (81%).
 */
export const marketStats: { value: string; label: string }[] = [
  { value: '68%', label: "of India's ~2.5 million rooms are independent & unbranded" },
  { value: '2 L+', label: 'hotel-room shortfall in India that homestays are tipped to fill' },
  { value: '81%', label: 'of Indian travellers are open to lesser-known destinations' },
  { value: '₹4,722 Cr', label: 'homestay market, growing ~11% a year through 2031' },
];

/* ── 3 · Discovery & Research ────────────────────────────────────────────── */
export const researchRegions =
  'Rajasthan, Himachal, the Northeast, Goa & Coorg — wherever I could sit with an owner';

/** Before designing anything: demo research — how existing platforms think. */
export const demoResearch: string[] = [
  'Top 3 competitor hospitality platforms explored',
  'Watched workflow demos end to end',
  'Channex API documentation studied',
  'Understood hospitality terminologies',
];

export const interviewQuestions: string[] = [
  'Walk me through your last double booking. What actually happened?',
  "It's 6 PM. How do you decide tonight's price?",
  "Show me how you'd block tomorrow on Agoda right now.",
  'What do you do when the internet drops at the front desk?',
  'How much did you pay MakeMyTrip last year — roughly?',
  "How would you find out last month's occupancy?",
];

/**
 * Primary user persona — the owner-operator every decision was made for.
 *
 * A representative composite: firmographics from the discovery survey, goals
 * and frustrations drawn from patterns that repeated across interviews. The
 * frustrations and the success statements are verbatim owner quotes.
 */
export interface Quoted {
  text: string;
  /** Exact substring to run the highlighter over. Must match `text`. */
  mark: string;
}

export const persona = {
  title: '#User Persona',
  name: 'AGASTHYA',
  /** Shown top-right of the notes page. */
  noteDate: '12 March 2026',
  role: 'Owner & General Manager',
  profile: [
    { icon: 'age', k: 'Age', v: '28' },
    { icon: 'property', k: 'Portfolio', v: '2 Properties' },
    { icon: 'rooms', k: 'Rooms', v: '38 Rooms' },
    { icon: 'team', k: 'Team Size', v: '10–12 Staff' },
    { icon: 'location', k: 'Location', v: 'India' },
    { icon: 'est', k: 'Established', v: '2025' },
  ],
  /** What he actually runs the hotel on today. */
  tools: [
    { label: 'MakeMyTrip Extranet', logo: 'logo-makemytrip.png' },
    { label: 'Booking.com Extranet', logo: 'logo-booking.png' },
    { label: 'Airbnb', logo: 'logo-airbnb.png' },
    { label: 'Legacy PMS', logo: null },
    { label: 'WhatsApp', logo: 'logo-whatsapp.png' },
    { label: 'Excel', logo: 'logo-excel.png' },
  ],
  quote: 'I built this place for guests, not spreadsheets.',
  /** Phrases the highlighter runs over, in order. */
  quoteMarks: ['guests', 'not'],
  footnote:
    'Representative persona created from recurring patterns across interviews with independent hotel owners.',
  goals: [
    'Increase occupancy throughout the year',
    'Reduce OTA dependency',
    'Improve direct bookings',
    'Get one view of reservations, revenue and occupancy',
    'Spend less time managing operations',
    'Grow to 4–5 properties without hiring a large operations team',
  ],
  /** Verbatim, from the interviews. */
  frustrations: [
    {
      text: 'I spend more time switching between software than managing my hotel.',
      mark: 'switching between software',
    },
    {
      text: 'I still have to check three dashboards before making a pricing decision.',
      mark: 'three dashboards',
    },
    {
      text: "My PMS manages operations but doesn’t help me grow bookings.",
      mark: "doesn’t help me grow",
    },
    {
      text: "My marketing agency sends reports that don’t match booking data.",
      mark: "don’t match",
    },
    {
      text: "When one system goes down, I don’t know which numbers to trust.",
      mark: 'numbers to trust',
    },
  ],
  /** What pushes an owner from coping to buying. */
  triggers: [
    'Opening another property',
    'Staff making operational mistakes',
    'Too many OTA commissions',
    'Growing software costs',
    "Losing bookings because systems don’t sync",
    'Wanting more direct bookings',
  ],
  success: [
    { text: 'I can run both my properties from one dashboard.', mark: 'one dashboard' },
    { text: "I know exactly where today’s bookings came from.", mark: 'exactly where' },
    {
      text: 'I spend less time managing operations and more time strategising.',
      mark: 'more time strategising',
    },
    {
      text: 'My team can operate without constantly calling me.',
      mark: 'without constantly calling me',
    },
  ],
  jtbd: [
    {
      kind: 'Functional',
      icon: 'ico-property.png',
      body: 'Help me manage reservations, inventory and operations without jumping between multiple systems.',
    },
    {
      kind: 'Emotional',
      icon: 'ico-hands.png',
      body: 'Help me feel in control of my business instead of reacting to operational issues every day.',
    },
    {
      kind: 'Social',
      icon: 'ico-chat.png',
      body: 'Help me run my hotel like a modern hospitality business without needing an enterprise-sized team.',
    },
  ],
} as const;

export interface Insight {
  headline: string;
  body: string;
}
export const insights: Insight[] = [
  {
    headline: "They didn't lack software. They were drowning in it.",
    body: 'Every property already had tools — a PMS here, a channel manager there, Excel, WhatsApp. The problem was that every workflow lived in a different tool, and none of them talked.',
  },
  {
    headline: '18% is a floor, not a price.',
    body: "OTAs sell ranking. Owners can raise their own commission 3–5% to rank higher — while rate-parity rules bar them from a cheaper price on their own site. The trap isn't the fee. It's that they can't respond to it.",
  },
  {
    headline: 'Every OTA booking is a few future direct stays, quietly lost.',
    body: "The platform keeps the guest — the owner gets a masked email that dies in days. Guests owned via a hotel's own list rebook at ~33%; OTA guests at ~6%. The real cost isn't the commission, it's the lifetime.",
  },
  {
    headline: 'In this market, simplicity survives churn.',
    body: 'Hospitality staff turnover runs 31–50%. A tool you need training for gets re-taught every few months — or abandoned. Simple wasn’t a nicety. It was the only thing that would last.',
  },
  {
    headline: "For an independent, distribution isn't a marketplace. It's a landlord.",
    body: 'MakeMyTrip + Goibibo alone are ~55–60% of bookings. "Diversify across OTAs" is theatre. The only real leverage is direct — and no single tool owned that end to end. That unowned seam became the product.',
  },
];

/* ── 4 · Defining the Product ────────────────────────────────────────────── */
export const problemStatement =
  "India's independent hosts don't need more software. They need their software to stop fighting them — and to help them win back the guest the OTAs took.";

export const icp = {
  who: 'Owner-operated independent properties',
  types: [
    'Homestays & vacation rentals',
    'Hostels & budget stays',
    'Boutique hotels',
    'Small chains (2–10)',
  ],
  buyer: 'The owner is the operator — front desk, revenue manager and accountant, all one person.',
  not: 'Not enterprise hotels with ops teams and a revenue desk.',
};

export const vision =
  "One platform to run the property and grow direct — leaner ops, guests you actually own, pricing that isn't a guess.";

/**
 * The positioning deck — one card per decision that had to be settled before
 * a single screen was designed. Rendered as an overlapping stack that spreads
 * on hover.
 *
 * `tint` is a fixed, saturated colour rather than a theme token — the deck is
 * a brand moment that looks identical in light and dark, like the sticky notes
 * elsewhere in this case study. Ink is near-black on every card.
 */
export interface DefinitionCard {
  id: string;
  /** The call, in one line — the big type on the card. */
  statement: string;
  /** Which piece of the positioning work this is. */
  aspect: string;
  /** One-line qualifier under the aspect. */
  note: string;
  icon: Ico;
  tint: string;
  /** Resting tilt, degrees. */
  rot: number;
}

export const definingCards: DefinitionCard[] = [
  {
    id: 'positioning',
    statement:
      'Not another PMS. The operating system that runs the property and fills it — one login, one set of numbers.',
    aspect: 'Positioning',
    note: 'How we say it',
    icon: Compass,
    tint: '#E8412A',
    rot: -2.4,
  },
  {
    id: 'icp',
    statement:
      'Owner-operated stays, 5–40 rooms, 1–3 properties — where the owner is also the front desk and the revenue manager.',
    aspect: 'ICP',
    note: 'Who we build for',
    icon: Users,
    tint: '#EE9A34',
    rot: 1.8,
  },
  {
    id: 'market',
    statement:
      'Independent hotels are the majority of India’s rooms and the least served by software. That’s the market, not a niche.',
    aspect: 'Market sizing',
    note: 'How big it gets',
    icon: PieChart,
    tint: '#F2D04A',
    rot: -1.4,
  },
  {
    id: 'benchmark',
    statement:
      'PMS vendors stop at the front desk; channel managers stop at the OTA. Every competitor solves half the hotel — we scoped the seam.',
    aspect: 'Benchmarking',
    note: 'Who we’re up against',
    icon: Crosshair,
    tint: '#A9DC3F',
    rot: 2.2,
  },
  {
    id: 'pricing',
    statement:
      'Flat monthly price in rupees, per property, no commission and no per-booking cut — priced under one weekend of OTA fees.',
    aspect: 'Pricing',
    note: 'What it costs',
    icon: IndianRupee,
    tint: '#45BE9B',
    rot: -2,
  },
  {
    id: 'usp',
    statement:
      'The only one that closes the loop: sync the rooms, then go win the direct booking — ads and inventory in the same system.',
    aspect: 'USP',
    note: 'Why us',
    icon: Sparkles,
    tint: '#A9D9F2',
    rot: 1.5,
  },
];

export interface SuccessMetric {
  target: string;
  label: string;
}
export const successMetrics: SuccessMetric[] = [
  {
    target: '80/20 → 40/60',
    label: 'shift the OTA-to-direct mix toward the ratio the segment itself calls healthy',
  },
  { target: '→ 0', label: 'double bookings on synced inventory' },
  { target: '15 hrs → 2', label: 'weekly hours lost to updating portals by hand' },
  { target: '~33%', label: 'repeat-direct rebooking rate — the north-star retention number' },
];

/* ── 5 · Design Strategy & Key Decisions ─────────────────────────────────── */
export const decisions: Decision[] = [
  {
    icon: Users,
    decision: 'Design for owner-operators, not enterprise hotels.',
    context:
      "The enterprise-PMS shelf is crowded and built for ops teams. But 68% of India's supply is independent and underserved.",
    why: 'An owner-operator buys simplicity and cash saved, not feature depth — and simplicity is the only thing that survives 31–50% staff churn.',
    tradeoff: 'Smaller deal sizes and no enterprise logos. The product has to stay ruthlessly simple, forever.',
    impact: 'One clear user. Every later call — UI, onboarding, pricing — got easier because we knew exactly who we were saying no to.',
  },
  {
    icon: Share2,
    decision: 'Ship the Channel Manager before the PMS.',
    context:
      "A PMS is table stakes. But it doesn't stop the 9:47 PM cancellation — updating rates across 8–10 OTA portals by hand does.",
    why: 'The channel sync is the acute, bleeding pain that makes an owner switch today. Solve the reason they’d move first.',
    tradeoff:
      "It made the 'hotel software' feel incomplete early, and forced us through Channex certification — the hardest integration — up front.",
    impact: 'A reason to onboard before the full suite even existed. We led with the wound, not the feature list.',
  },
  {
    icon: Megaphone,
    decision: 'Design AI Ads Management — not another dashboard.',
    context:
      "Every rival tool stops at reservations. 'Get me more direct bookings' had no owner, and ad spend never reconciled with OTA data, so ROAS looked fake.",
    why: "A dashboard tells an owner what happened. Ads management changes it. Direct bookings are the whole game, and owners can't run Meta/Google alone.",
    tradeoff: 'Far harder to build — needs booking data, ad-platform hooks and a model. Easy to over-promise on.',
    impact: "ClearHost owns 'grow direct' — the seam no PMS, channel manager or ad tool owns end to end.",
  },
  {
    icon: Scissors,
    decision: 'Cut cancellation policies from the MVP.',
    context:
      'Design done, flows done — then we found the Channex API had no endpoints for it. Building our own sync would eat the certification deadline.',
    why: 'The spine that stops the bleeding — sync, direct bookings, reconciliation — mattered more than a policy engine for launch.',
    tradeoff: "Some owners will ask for it on day one. We're honest that it's next, not now.",
    impact: 'Certified in six months. Lesson banked: validate the API before you design, not after.',
  },
];

/* ── 6 · Execution — the module roadmap ──────────────────────────────────── */
export type ModuleTone = 'primary' | 'pop' | 'success' | 'marker' | 'chart4';
export interface BuildModule {
  label: string;
  phase: string;
  work: string;
  why: string;
  start: number;
  len: number;
  tone: ModuleTone;
}
export const buildTimelineWeeks = 24;
export const modules: BuildModule[] = [
  {
    label: 'M0',
    phase: 'Foundation',
    work: 'auth · org · property',
    why: 'Nothing syncs without a clean property model underneath it.',
    start: 0,
    len: 2,
    tone: 'success',
  },
  {
    label: 'M1',
    phase: 'Distribution',
    work: 'channel manager · booking engine · tax',
    why: 'The acute pain first — stop double bookings and open a 0%-commission direct channel.',
    start: 2,
    len: 5,
    tone: 'primary',
  },
  {
    label: 'M2',
    phase: 'PMS',
    work: 'front desk → housekeeping',
    why: 'Once inventory is trustworthy, the daily ops layer can sit on top of it.',
    start: 7,
    len: 5,
    tone: 'pop',
  },
  {
    label: 'M3',
    phase: 'Money',
    work: 'invoices · GST/OTA reconciliation · dashboards',
    why: 'Surface the hidden leak — payouts net of commission, GST and TCS — in one view.',
    start: 12,
    len: 5,
    tone: 'marker',
  },
  {
    label: 'M4',
    phase: 'Growth',
    work: 'AI ads management · QA',
    why: 'The north star, built last because it feeds on all the booking data above it.',
    start: 17,
    len: 3,
    tone: 'chart4',
  },
  {
    label: 'Finale',
    phase: 'Certification',
    work: 'Channex · real-hotel E2E',
    why: 'Prove it in front of a live examiner, then in a real property.',
    start: 20,
    len: 4,
    tone: 'primary',
  },
];

/* ── 7 · Validation & QA ─────────────────────────────────────────────────── */
export interface QaStep {
  step: string;
  detail: string;
}
export const qaLoop: QaStep[] = [
  { step: 'Ship to staging', detail: 'Every module went to staging before the next one started.' },
  {
    step: 'I break it',
    detail: "Annotated screenshots, bug lists, UX nitpicks — from the owner's chair, not the dev's.",
  },
  {
    step: 'Fix as a line item',
    detail: '"Bugs from the last module" was standing sprint capacity, never an afterthought.',
  },
  { step: 'Only then, next', detail: 'No module moved forward until the one before it held up.' },
];

export const edgeCases: string[] = [
  'Two OTAs confirm the same room in the same second — who wins?',
  'Internet drops mid-check-in at a hill-town front desk.',
  'A payout lands net of commission, 18% GST and 1% TCS — does the ledger still reconcile?',
  'A walk-in pays cash and negotiates 30% off on the spot.',
  'A rate crosses ₹7,500 and flips the GST slab mid-season.',
];

/* ── 8 · Outcome ─────────────────────────────────────────────────────────── */
export interface ReadinessItem {
  label: string;
  state: 'done' | 'progress';
  note: string;
}
export const readiness: ReadinessItem[] = [
  { label: 'Distribution, PMS & Money modules', state: 'done', note: 'shipped to staging' },
  { label: 'Channex certification', state: 'done', note: 'passed for production' },
  { label: 'AI Ads Management', state: 'done', note: 'built — first model live' },
  { label: 'Pilot with real hotels', state: 'progress', note: 'onboarding first cohort' },
];

/** Modeled / target KPIs — explicitly aspirational for a pre-launch product. */
export interface TargetKpi {
  value: string;
  label: string;
}
export const targetKpis: TargetKpi[] = [
  { value: '~₹4.4 L', label: 'modeled yearly saving for a 10-room property that moves to a 40/60 mix' },
  { value: '9 → 1', label: 'disconnected tools replaced by one platform' },
  { value: '→ 0', label: 'double bookings on synced inventory (target)' },
  { value: '~6 mo', label: 'kickoff to production certification (done)' },
];

/* ── 9 · Learnings ───────────────────────────────────────────────────────── */
export interface Learning {
  before: string;
  after: string;
}
export const learnings: Learning[] = [
  {
    before: 'I thought a good interview was a list of the right questions.',
    after: 'The best insight came from watching an owner update Agoda at the front desk — not from anything they told me they wanted.',
  },
  {
    before: 'I worried that picking one narrow user would shrink the product.',
    after: "The moment we said 'owner-operators, not hotels,' the roadmap wrote itself. A narrow ICP is a decision-making engine.",
  },
  {
    before: 'I assumed more features would mean more value.',
    after: 'In a market with 31–50% staff churn, the tool that survives is the one you never need training for. Simplicity became the moat.',
  },
  {
    before: 'I designed the cancellation flow, then checked the API.',
    after: "Now I validate the integration before a single screen. And I'd start the pilot in parallel with the build, not after it.",
  },
];

/* ── Proof-of-work placeholders (per section) ────────────────────────────── */
export const discoveryProof: Artifact[] = [
  { label: 'Interview notes', kind: 'notes', note: 'raw, per owner' },
  { label: 'Front-desk recordings', kind: 'recording', note: 'watching the real workflow' },
  { label: 'Competitor teardown', kind: 'sheet', note: 'tools × gaps' },
  { label: 'Affinity map', kind: 'board', note: 'pains clustered' },
];

export const executionProof: Artifact[] = [
  { label: 'Design specs', kind: 'doc', note: 'one per module' },
  { label: 'Figma flows', kind: 'design', note: 'channel sync, booking engine' },
  { label: 'Sprint board', kind: 'board', note: 'module by module' },
  { label: 'Prioritisation grid', kind: 'sheet', note: 'impact × effort' },
];

export const qaProof: Artifact[] = [
  { label: 'QA sheets', kind: 'sheet', note: 'per-module, per-flow' },
  { label: 'Annotated bugs', kind: 'screenshot', note: 'marked-up screens' },
  { label: 'Channex certificate', kind: 'doc', note: 'production green flag' },
  { label: 'Pilot walkthrough', kind: 'recording', note: 'real hotel E2E' },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  "How I design products" — the workspace board (12 real design artifacts).  */
/* ═══════════════════════════════════════════════════════════════════════════ */

export type WorkflowKind =
  | 'sticky'
  | 'notion'
  | 'cluster'
  | 'priority'
  | 'linear'
  | 'flow'
  | 'sprint'
  | 'build'
  | 'qa'
  | 'launch'
  | 'learn'
  | 'iterate';

interface StepBase {
  id: string;
  /** Board sequence number, shown as a tiny pinned tag. */
  n: string;
  title: string;
  /** Revealed on hover/tap — the metadata a designer would actually keep on it. */
  hover: string[];
}

export type WorkflowStep =
  | (StepBase & { kind: 'sticky'; insight: string })
  | (StepBase & { kind: 'notion'; count: string; date: string; quote: string })
  | (StepBase & { kind: 'cluster'; notes: string[]; core: string })
  | (StepBase & {
      kind: 'priority';
      rows: {
        label: string;
        impact: number;
        effort: number;
        chip: 'Must' | 'Should' | 'Could';
      }[];
    })
  | (StepBase & {
      kind: 'linear';
      ref: string;
      status: string;
      summary: string;
      owner: string;
      version: string;
      comments: number;
    })
  | (StepBase & { kind: 'flow'; nodes: string[]; edgeCases: number })
  | (StepBase & { kind: 'sprint'; sprint: string; tasks: number; done: number; blocked: number })
  | (StepBase & { kind: 'build'; branch: string; tasks: { label: string; done: boolean }[] })
  | (StepBase & { kind: 'qa'; passed: number; needsFix: number; open: number })
  | (StepBase & { kind: 'launch'; env: string; badge: string; release: string; note: string })
  | (StepBase & {
      kind: 'learn';
      caption: string;
      series: number[];
      stats: { label: string; value: string }[];
    })
  | (StepBase & { kind: 'iterate'; heading: string; items: string[] });

export const workflowSteps: WorkflowStep[] = [
  {
    id: 'opportunity',
    n: '01',
    kind: 'sticky',
    title: 'Opportunity',
    insight: "Owners are in four tools before 9am — and still don't trust the number.",
    hover: ['Source · field notes', 'Feb 2026'],
  },
  {
    id: 'interviews',
    n: '02',
    kind: 'notion',
    title: 'Customer interviews',
    count: '14 conversations',
    date: 'Feb – Mar 2026',
    quote: 'The real numbers are in my diary. The software is for the auditor.',
    hover: ['Homestays · hostels · small hotels', 'Raw notes + recordings'],
  },
  {
    id: 'jtbd',
    n: '03',
    kind: 'cluster',
    title: 'Jobs to be done',
    notes: [
      'Stop double bookings',
      'See every channel at once',
      "Know tonight's price",
      'Get paid without chasing',
    ],
    core: 'Run the whole property from one screen — without training.',
    hover: ['4 clusters from 14 interviews', 'Core need highlighted'],
  },
  {
    id: 'prioritisation',
    n: '04',
    kind: 'priority',
    title: 'Prioritisation',
    rows: [
      { label: 'Channel sync', impact: 5, effort: 3, chip: 'Must' },
      { label: 'Booking engine', impact: 5, effort: 4, chip: 'Must' },
      { label: 'AI ads manager', impact: 4, effort: 5, chip: 'Should' },
      { label: 'Cancellation policies', impact: 2, effort: 5, chip: 'Could' },
    ],
    hover: ['Impact × effort', 'MoSCoW · reviewed weekly'],
  },
  {
    id: 'prd',
    n: '05',
    kind: 'linear',
    title: 'Design spec',
    ref: 'SPEC-014',
    status: 'Ready for review',
    summary: 'Channel manager — rate & inventory sync',
    owner: 'SM',
    version: 'v1.3',
    comments: 3,
    hover: ['Epic CH-2 · Distribution', 'Flows + states attached'],
  },
  {
    id: 'flow',
    n: '06',
    kind: 'flow',
    title: 'User flow',
    nodes: ['Search', 'Select room', 'Pay', 'Confirmed'],
    edgeCases: 2,
    hover: ['Happy path first', 'Low-fi wireframes attached'],
  },
  {
    id: 'sprint',
    n: '07',
    kind: 'sprint',
    title: 'Sprint planning',
    sprint: 'Sprint 07',
    tasks: 24,
    done: 18,
    blocked: 2,
    hover: ['2-week cycle', 'Bug capacity reserved'],
  },
  {
    id: 'build',
    n: '08',
    kind: 'build',
    title: 'Design → dev',
    branch: 'feat/channel-sync',
    tasks: [
      { label: 'Rate & inventory push', done: true },
      { label: 'Booking pull + dedupe', done: true },
      { label: 'Retry on webhook fail', done: false },
    ],
    hover: ['5 devs · 1 designer', 'Staging before the next module'],
  },
  {
    id: 'qa',
    n: '09',
    kind: 'qa',
    title: 'QA',
    passed: 62,
    needsFix: 7,
    open: 3,
    hover: ['I test every module myself', 'Annotated screenshots'],
  },
  {
    id: 'launch',
    n: '10',
    kind: 'launch',
    env: 'Production-ready',
    title: 'Launch',
    badge: 'Certified',
    release: 'v1.0 · pilot cohort',
    note: 'Channex certified on the third attempt',
    hover: ['Certification passed', 'Onboarding the first hotels'],
  },
  {
    id: 'learn',
    n: '11',
    kind: 'learn',
    title: 'Learn',
    caption: 'Direct share',
    series: [22, 26, 24, 31, 35, 33, 40, 44],
    stats: [
      { label: 'Direct mix', value: '20% → 40%' },
      { label: 'Repeat rate', value: '~33%' },
    ],
    hover: ['Modeled · pre-launch target', 'Instrumented, not yet measured'],
  },
  {
    id: 'iterate',
    n: '12',
    kind: 'iterate',
    title: 'Iterate',
    heading: 'v2 candidates',
    items: [
      'Cancellation policies (deferred from v1)',
      'Multi-property switcher',
      'WhatsApp confirmations',
    ],
    hover: ['v2 candidates', 'Re-scored against impact × effort'],
  },
];

/** Marker connectors between artifacts — the labels carry the decisions. */
export const workflowLinks: { from: string; to: string; label?: string }[] = [
  { from: 'opportunity', to: 'interviews', label: 'Validated' },
  { from: 'interviews', to: 'jtbd' },
  { from: 'jtbd', to: 'prioritisation', label: 'Worth building' },
  { from: 'prioritisation', to: 'prd', label: 'v1 only' },
  { from: 'prd', to: 'flow' },
  { from: 'flow', to: 'sprint', label: 'Scoped' },
  { from: 'sprint', to: 'build' },
  { from: 'build', to: 'qa' },
  { from: 'qa', to: 'launch', label: 'Signed off' },
  { from: 'launch', to: 'learn' },
  { from: 'learn', to: 'iterate', label: 'Need more data' },
];

export const workflowCopy = {
  eyebrow: 'How I design products',
  headline: 'From idea to production.',
  headlineAccent: 'to production.',
  sub: 'Not a lifecycle diagram — the actual artifacts, in the order they get made.',
  /** Handwritten marginalia, scattered as easter eggs (desktop only). */
  margin: {
    parked: 'Not now →',
    reserved: 'bug capacity reserved',
    epic: 'EPIC CH-2',
  },
  /** Screen-reader narration; the board itself is decorative. */
  summary:
    'How I design products, in twelve artifacts: an opportunity sticky, customer interviews, jobs-to-be-done clusters, an impact-versus-effort prioritisation, a design spec, a user flow, sprint planning, design-to-dev handoff, QA, launch, what we learn, and the next iteration.',
} as const;

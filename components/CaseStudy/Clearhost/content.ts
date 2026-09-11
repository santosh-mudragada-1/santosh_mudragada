import type { ReactElement } from 'react';
import type { IconProps } from './icons';
import { Compass, Crosshair, IndianRupee, PieChart, Sparkles, Users } from './icons';

/**
 * ClearHost case study — content layer, ported from the source project and
 * re-angled from a Product-Manager voice to a UX / product-design voice.
 *
 * TODO(review): the following are carried over verbatim from the source and
 * should be confirmed before this goes live —
 *   · role/team confirmed by Santosh (2026-09-07): "Product Design Lead" on a
 *     team of 2 designers, 5 engineers and 2 PMs — replaces the source's
 *     "sole designer · with 5 engineers & a PM" framing everywhere below.
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
  role: 'Product Design Lead · 0→1',
  timeframe: 'Feb 2026 → present',
  status: 'Pre-launch · Channex certified',
  logo: '/clearhost/clearhost logo.webp',
  wordmarkLogo: '/clearhost/Clear Host Logo.webp',
  heroVideo: '/clearhost/hero_video.webm',
  headline: 'Unified operating system for hotels.',
  sub: 'Designing an all-in-one hotel management ecosystem (PMS, Channel Manager and a built-in AI Ads Manager) so an owner can run the whole property from one place.',
} as const;

/** Hero problem → solution block: operations aren't broken, they're fragmented. */
export const fragmentation = {
  titleA: "Hotel operations aren't broken.",
  titleB: "They're fragmented.",
  sub: 'Hotels rely on multiple disconnected systems: manual work, operational mistakes, lost revenue.',
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
      'of room revenue lost to OTA commissions alone, before you even count the staff hours spent reconciling five calendars by hand.',
    /** Compact form for layouts where 05 sits beside the other four. */
    short: 'of room revenue lost to OTA commissions.',
    aside: 'And the channel that saves the guest money bills the owner for it.',
  },
  solution: {
    media: {
      title: 'The ClearHost dashboard',
      note: 'Screenshot or short recording of the live product goes here.',
    },
  },
} as const;

/* ── 1 · Overview ────────────────────────────────────────────────────────── */
/** Short scan-tags above the hero title — first one renders as the accent pill. */
export const heroTags: string[] = ['Product Design Lead · 0→1', '~6 mo', 'Pre-launch'];

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
  boardName: 'clearhost · discovery wall',
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
    'Field research kept surfacing the same two systems. A PMS runs everything inside the building: front desk, guests, housekeeping, reservations, reports. A channel manager runs distribution outside it: inventory, availability, rates, OTA, pricing. Neither talks to the other, so hotels are forced to run both. ClearHost connects them into one operating system.',
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
  "Two-thirds of India's rooms are independent, and travel keeps shifting to offbeat towns where independents are often the only stay.";

export const gtmSteps: { k: string; v: string }[] = [
  { k: 'Who first', v: 'Owner-operated stays, 5–40 rooms: homestays, hostels, boutique hotels.' },
  {
    k: 'Where',
    v: 'The regions I researched (the Northeast, Himachal, Rajasthan) where I know owners by name.',
  },
  { k: 'How', v: 'Warm intros through owner networks; I onboard the first cohort myself.' },
  { k: 'Pricing', v: "A flat monthly price in rupees, less than one weekend's OTA commission." },
];

/* ── 3 · Discovery & Research ────────────────────────────────────────────── */
export const researchRegions =
  'Rajasthan, Himachal, the Northeast, Goa & Coorg, wherever I could sit with an owner';

/** Before designing anything: demo research — how existing platforms think. */
export const demoResearch: string[] = [
  'Top 3 competitor hospitality platforms explored',
  'Watched workflow demos end to end',
  'Channex API documentation studied',
  'Understood hospitality terminologies',
];

export interface IndustryLearning {
  label: string;
  body: string;
}

/** What the demo research and interviews actually taught, industry-side. */
export const industryLearnings: IndustryLearning[] = [
  {
    label: 'Room types & rate plans',
    body: 'Hotels sell room categories, each carrying multiple pricing strategies.',
  },
  {
    label: 'Inventory & OTA distribution',
    body: 'Availability has to stay in sync across every booking channel, in real time.',
  },
  {
    label: 'Hotel operations',
    body: 'Reservations, front desk, housekeeping and guest stays are connected, but serve different jobs.',
  },
  {
    label: 'Multi-property management',
    body: 'Hotel groups need centralized control, alongside property-specific teams and permissions.',
  },
  {
    label: 'Revenue management',
    body: 'Pricing, occupancy and booking source directly decide how the business performs.',
  },
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

export interface Insight {
  headline: string;
  body: string;
}
export const insights: Insight[] = [
  {
    headline: "They didn't lack software. They were drowning in it.",
    body: 'Every property already had a PMS, channel manager, spreadsheets and messaging tools. The problem was that every workflow lived somewhere different.',
  },
  {
    headline: 'Every booking channel adds revenue. And another thing to manage.',
    body: 'Hotels sell through OTAs, websites, phones, walk-ins and more. Each channel adds another place to manage rates, availability and reservations.',
  },
  {
    headline: "An OTA can fill tonight's room and still make tomorrow's booking harder.",
    body: 'OTAs bring valuable demand, but the hotel gives up part of the guest relationship. Building a direct channel means owning more of what comes next.',
  },
  {
    headline: 'In hospitality, simplicity survives churn.',
    body: 'Staff changes constantly, so complex workflows have to be relearned again and again. Hotel software needs to make everyday work easy for whoever joins next.',
  },
  {
    headline: "Distribution shouldn't mean dependence.",
    body: 'OTAs are essential for reaching guests. But relying too heavily on them leaves hotels with less control over margins, customer relationships and where future bookings come from.',
  },
];

/* ── 4 · Defining the Product ────────────────────────────────────────────── */
export const problemStatement =
  "India's independent hosts don't need more software. They need their software to stop fighting them, and to help them win back the guest the OTAs took.";

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
    statement: 'Not another PMS. The operating system that runs the property.',
    aspect: 'Positioning',
    note: 'How we say it',
    icon: Compass,
    tint: '#E8412A',
    rot: -2.4,
  },
  {
    id: 'icp',
    statement: 'Owner-operated stays need one place to manage the whole business.',
    aspect: 'ICP',
    note: 'Who we build for',
    icon: Users,
    tint: '#EE9A34',
    rot: 1.8,
  },
  {
    id: 'market',
    statement:
      'Independent hotels are a massive market, but most hotel software serves pieces of it.',
    aspect: 'Market sizing',
    note: 'How big it gets',
    icon: PieChart,
    tint: '#F2D04A',
    rot: -1.4,
  },
  {
    id: 'benchmark',
    statement: 'PMS vendors stop at the front desk. Channel managers stop at the OTA.',
    aspect: 'Benchmarking',
    note: 'Who we’re up against',
    icon: Crosshair,
    tint: '#A9DC3F',
    rot: 2.2,
  },
  {
    id: 'pricing',
    statement: 'Flat monthly pricing, no commission and no per-booking cut.',
    aspect: 'Pricing',
    note: 'What it costs',
    icon: IndianRupee,
    tint: '#45BE9B',
    rot: -2,
  },
  {
    id: 'usp',
    statement:
      'The only system that connects the rooms, distribution and direct booking.',
    aspect: 'USP',
    note: 'Why us',
    icon: Sparkles,
    tint: '#A9D9F2',
    rot: 1.5,
  },
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
  { label: 'AI Ads Management', state: 'done', note: 'built, first model live' },
  { label: 'Pilot with real hotels', state: 'progress', note: 'onboarding first cohort' },
];

/** Product goals — not yet measured, framed as intent rather than a delivered number. */
export interface ProductGoal {
  title: string;
  body: string;
}
export const productGoals: ProductGoal[] = [
  { title: 'Less tool switching', body: 'Bring core hotel workflows into one system.' },
  {
    title: 'Zero inventory mismatches',
    body: 'Keep rates and availability aligned across channels.',
  },
  { title: 'More direct bookings', body: 'Give hotels a stronger channel they control.' },
  {
    title: 'Less manual work',
    body: 'Reduce repetitive updates across booking channels.',
  },
];

/* ── 9 · Learnings ───────────────────────────────────────────────────────── */
export interface Learning {
  before: string;
  after: string;
}
export const learnings: Learning[] = [
  {
    before: 'I learned that the interface comes last.',
    after: 'ClearHost taught me that complex products are really systems of rules. I had to understand pricing, taxes, availability, reservations and distribution before I could design the interface properly.',
  },
  {
    before: 'I assumed the API would define how the product should work.',
    after: 'While working through Channex, I found gaps and confusing logic around taxes, dormitory pricing and cancellation policies. I learned to question the integration instead of designing around it blindly.',
  },
  {
    before: 'I wanted to solve every problem I found.',
    after: 'ClearHost had far more possible features than we could build at once. Prioritising the core workflows taught me that good product design is often about deciding what not to build yet.',
  },
  {
    before: 'I thought simplifying a workflow meant removing options.',
    after: 'The dormitory pricing work changed my thinking. The better solution was to understand the underlying rules, remove unnecessary choices and make the system handle the complexity for the user.',
  },
];

/* ── Proof-of-work placeholders (per section) ────────────────────────────── */
export const qaProof: Artifact[] = [
  { label: 'QA sheets', kind: 'sheet', note: 'per-module, per-flow' },
  { label: 'Annotated bugs', kind: 'screenshot', note: 'marked-up screens' },
  { label: 'Channex certificate', kind: 'doc', note: 'production green flag' },
  { label: 'Pilot walkthrough', kind: 'recording', note: 'real hotel E2E' },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Product tour — three module walkthrough videos, one scroll scene.          */
/*  The device flips on the X axis between videos while a giant heading        */
/*  marquees behind it; the marquee text swaps with each module.               */
/* ═══════════════════════════════════════════════════════════════════════════ */
export interface TourSlide {
  id: string;
  /** Giant background marquee text for this module. */
  heading: string;
  /** Tag overlaid on the device. */
  label: string;
  /** Two chips, bottom-right of the device. */
  pills: [string, string];
  /** webm in /public/clearhost/. */
  video: string;
}

export const productTour: TourSlide[] = [
  {
    id: 'pms',
    heading: 'Property Management System',
    label: 'PMS',
    pills: ['Reservations', 'Housekeeping'],
    video: '/clearhost/PMS Module.webm',
  },
  {
    id: 'channel-manager',
    heading: 'Channel Manager',
    label: 'Channel Manager',
    pills: ['Inventory', 'Rooms & Rates'],
    video: '/clearhost/Channel Manager.webm',
  },
  {
    id: 'booking-engine',
    heading: 'Booking Engine',
    label: 'Booking Engine',
    pills: ['Live Links', 'Coupons'],
    video: '/clearhost/Booking Engine.webm',
  },
];

export const productTourCopy = {
  eyebrow: 'Product tour',
  titleA: 'Three modules,',
  titleB: 'one system.',
  sub: 'The three surfaces an owner actually lives in: the PMS at the front desk, the channel manager for distribution, the booking engine for direct bookings. Scroll to move through each.',
} as const;

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
        chip: 'Must' | 'Should' | 'Could';
      }[];
    })
  | (StepBase & { kind: 'linear'; status: string; summary: string })
  | (StepBase & { kind: 'flow'; nodes: string[]; edgeCases: number })
  | (StepBase & { kind: 'sprint'; sprint: string; tasks: number; done: number; blocked: number })
  | (StepBase & { kind: 'build'; branch: string; tasks: { label: string; done: boolean }[] })
  | (StepBase & { kind: 'qa'; items: string[] })
  | (StepBase & { kind: 'launch'; env: string; release: string; note: string })
  | (StepBase & { kind: 'learn'; caption: string; items: string[] })
  | (StepBase & { kind: 'iterate'; heading: string; items: string[] });

export const workflowSteps: WorkflowStep[] = [
  {
    id: 'opportunity',
    n: '01',
    kind: 'sticky',
    title: 'Opportunity',
    insight: 'Owners jump between tools before they can see the full picture.',
    hover: ['Source · field notes'],
  },
  {
    id: 'interviews',
    n: '02',
    kind: 'linear',
    title: 'Product findings',
    status: 'Pricing · Taxes · Rate plans',
    summary: 'Hotel logic is complicated.',
    hover: ['Source · product research'],
  },
  {
    id: 'jtbd',
    n: '03',
    kind: 'cluster',
    title: 'Jobs to be done',
    notes: [
      'Stop double bookings',
      'See every channel at once',
      "Know today's rates",
      'Get paid without chasing',
    ],
    core: 'Run the property from one place, without a steep learning curve.',
    hover: ['Synthesized from product research'],
  },
  {
    id: 'prioritisation',
    n: '04',
    kind: 'priority',
    title: 'Prioritisation',
    rows: [
      { label: 'Channel sync', impact: 5, chip: 'Must' },
      { label: 'Booking engine', impact: 5, chip: 'Must' },
      { label: 'Rate management', impact: 4, chip: 'Should' },
      { label: 'AI ads manager', impact: 3, chip: 'Could' },
      { label: 'Cancellation policies', impact: 2, chip: 'Could' },
    ],
    hover: ['Impact × effort · MoSCoW'],
  },
  {
    id: 'prd',
    n: '05',
    kind: 'linear',
    title: 'Design spec',
    status: 'Ready for review',
    summary: 'Channel manager · rate & inventory sync',
    hover: ['Epic · Distribution', 'Flows + states attached'],
  },
  {
    id: 'flow',
    n: '06',
    kind: 'flow',
    title: 'User flow',
    nodes: ['Search', 'Select room', 'Add guest', 'Pay', 'Confirmed'],
    edgeCases: 2,
    hover: ['Happy path first', 'Low-fi wireframes attached'],
  },
  {
    id: 'sprint',
    n: '07',
    kind: 'iterate',
    title: 'Build plan',
    heading: 'Core modules',
    items: ['Channel sync', 'Booking engine', 'Rate management'],
    hover: ['Design → build → test', 'Core flows first'],
  },
  {
    id: 'build',
    n: '08',
    kind: 'build',
    title: 'Design → dev',
    branch: 'Channel sync',
    tasks: [
      { label: 'Rate & inventory push', done: true },
      { label: 'Reservation pull + dedupe', done: true },
      { label: 'Modification + cancellation sync', done: true },
      { label: 'Retry on webhook fail', done: false },
    ],
    hover: ['Design + engineering handoff', 'Staging before the next module'],
  },
  {
    id: 'qa',
    n: '09',
    kind: 'qa',
    title: 'QA',
    items: ['Core flows checked', 'Edge cases reviewed', 'Integration states tested'],
    hover: ['I tested every module myself', 'Annotated screenshots'],
  },
  {
    id: 'launch',
    n: '10',
    kind: 'launch',
    env: 'Pilot release',
    title: 'Launch',
    release: 'v1.0 · Core flows ready',
    note: 'PMS, distribution and booking workflows brought together for the first release.',
    hover: ['API flows validated', 'Ready for pilot'],
  },
  {
    id: 'learn',
    n: '11',
    kind: 'learn',
    title: 'Learn',
    caption: 'What I needed to learn',
    items: [
      'Direct booking mix',
      'Repeat booking rate',
      'Channel profitability',
      'Time saved for hotel teams',
    ],
    hover: ['Pre-launch targets', 'To be validated after pilot'],
  },
  {
    id: 'iterate',
    n: '12',
    kind: 'iterate',
    title: 'Iterate',
    heading: 'V2 candidates',
    items: ['Cancellation policies', 'Multi-property switcher', 'WhatsApp confirmations'],
    hover: ['Next to test', 'Re-scored against impact × effort'],
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
  headline: 'From what I found to what I built.',
  headlineAccent: 'to what I built.',
  sub: 'The decisions, artifacts and trade-offs that shaped ClearHost.',
  /** Handwritten marginalia, scattered as easter eggs (desktop only). */
  margin: {
    parked: 'Not now →',
    epic: 'Epic · Distribution',
  },
  /** Screen-reader narration; the board itself is decorative. */
  summary:
    'How I design products, in twelve artifacts: an opportunity note, the product findings, jobs-to-be-done clusters, an impact-versus-effort prioritisation, a design spec, a user flow, a build plan, design-to-dev handoff, module QA, the pilot release, what I needed to learn, and the next iteration.',
} as const;

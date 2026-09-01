export type WorkProject = {
  slug: string;
  slot: 'a' | 'b' | 'c';
  index: string;
  title: string;
  discipline: string;
  year: string;
  /** CSS aspect-ratio for the card frame. */
  ratio: string;
  src: string;
  /** One-line role summary for the detail/preview. */
  owned: string;
  /** Where the card links. Case studies live at /work/<slug>. */
  href: string;
};

// PLACEHOLDER content. `src` points at Unsplash's CDN (CORS-enabled, so it can
// be used as a WebGL texture) — swap these for the real project imagery.
const U = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const WORK: WorkProject[] = [
  {
    slug: 'northwind',
    slot: 'a',
    index: '01',
    title: 'Northwind',
    discipline: 'Product design',
    year: '2025',
    ratio: '5 / 3',
    src: U('1517180102446-f3ece451e9d8', 1500, 900),
    owned: 'End-to-end product design, from strategy to shipped v1.',
    href: '/work',
  },
  {
    slug: 'nextrail',
    slot: 'b',
    index: '02',
    title: 'Nextrail',
    discipline: 'AI travel experience',
    year: '2025',
    ratio: '3 / 4',
    // Real project imagery — served same-origin from /public, so the WorkCardGL
    // bake stays untainted and the bow runs.
    src: '/nextrail_casestudy/people/friends.jpg',
    owned: 'Turning saved travel inspiration into an actionable trip — Feed2Fly.',
    href: '/work/nextrail',
  },
  {
    slug: 'chess-com',
    slot: 'c',
    index: '03',
    title: 'Chess.com',
    discipline: 'Game-based learning',
    year: '2026',
    ratio: '3 / 2',
    // PLACEHOLDER — swap for a real Chess.com prototype still (CORS-enabled so
    // it can be a WebGL texture).
    src: U('1529699211952-734e80c4d42b', 1500, 1000),
    owned: 'Your own blunders, handed back as engine-verified puzzles.',
    href: '/work/chess-com',
  },
];

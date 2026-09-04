// ---------------------------------------------------------------------------
// AboutEditorial — the scroll-driven "map" collage for /about.
//
// One pinned cream window. Inside a clipped container, a camera pans across a
// wide canvas of STOPS. Each stop = one oversized red word + a scattered set of
// printed-photo cards + a short supporting paragraph. As you scroll the camera
// travels right, dropping and rising between stops so it reads like panning
// across a map. Three parallax layers move at different rates:
//
//     word layer   1.00x   (deepest, travels farthest, letters clipped)
//     copy layer   0.86x
//     card layer   0.72x   (nearest; plus per-card independent drift)
//
// To drop in real photography later: change ONLY the `src` values in `IMAGES`.
// Card geometry is independent of the image files (every card is object-fit
// cover). To retune the motion: everything lives in TIMING / LAYER_RATE / STOPS.
// ---------------------------------------------------------------------------

import { ABOUT_LAYERS } from '@/lib/content/about';

// --- Master timeline (seconds) --------------------------------------------
// The ScrollTrigger scrub maps scroll distance onto this timeline, so only the
// ratios matter. Travel is continuous; `hold` is the settled beat on each stop.
export const TIMING = {
  introHold: 0.8, // brief settle on stop 1 before the camera leaves
  move: 2.4, // one stop -> next (kept short so the pan doesn't dwell in the gap)
  stopHold: 2.1, // settled beat on stops 2..4 — most of the scroll is spent here
} as const;

// Stop-centre times + timeline end, derived from TIMING.
export const STOP_TIME = (() => {
  const { introHold, move, stopHold } = TIMING;
  const t0 = 0;
  const t1 = introHold + move;
  const t2 = t1 + stopHold + move;
  const t3 = t2 + stopHold + move;
  return { times: [t0, t1, t2, t3], end: t3 + stopHold };
})();

// --- Canvas geometry ----------------------------------------------------
// Horizontal distance the WORD layer travels between two stops, as a multiple
// of the clip width; the other layers travel this * their LAYER_RATE. Small
// enough that a giant letterform is always crossing the window mid-pan (no
// hollow centre); the words are oversized enough that a settled one is still
// clipped hard on both edges.
export const GAP_FACTOR = 1.15;
export const LAYER_RATE = { word: 1, copy: 0.86, card: 0.72 } as const;

// Cluster width knob — scales every card's horizontal scatter (dx). Lower =
// tighter clusters that stay separated even with the short word gap above.
export const SPREAD_X = 0.92;

// Vertical offset of each stop on the map path, as a fraction of clip height.
// Baked into each element's authored `top`; the layer animates by -offset*rate
// to re-centre it. Alternating sign => the camera dips then climbs => "map".
export const STOP_SY = [0, 0.16, -0.11, 0.14] as const;

// How many viewport-heights of scroll drive the whole sequence.
export const SCROLL_SCREENS = { base: 7, compact: 5 } as const;

// --- Stops --------------------------------------------------------------
const stripStars = (s: string) => s.replace(/\*/g, '');

export type Stop = {
  id: string;
  /** the oversized red word — intentionally wider than the window */
  word: string;
  /**
   * font-size multiplier. Every word should render to roughly the same width
   * (~1.2 * window) so a letterform always bridges the window mid-pan AND the
   * next word never peeks at a settled stop. Shorter words need a bigger value.
   */
  size?: number;
  /** small label, top-left of the stop (only the first stop uses it) */
  label?: string[];
  /** supporting paragraph, lower-left of the stop */
  paragraph: string[];
  /** paragraph weight — the reference goes light -> bold across stops */
  paraTone?: 'muted' | 'bold';
};

export const STOPS: Stop[] = [
  {
    id: 's1',
    word: 'CURIOUS',
    size: 1,
    label: ['Hi, I’m Santosh', 'Product Designer & Builder'],
    paragraph: [
      'I’m usually curious about how',
      'things work — and, more often,',
      'about why they don’t.',
    ],
    paraTone: 'muted',
  },
  {
    id: 's2',
    word: 'MESSY',
    size: 1.3,
    paragraph: [
      'Most good ideas start messy,',
      'well before they start',
      'making any sense.',
    ],
    paraTone: 'muted',
  },
  {
    id: 's3',
    word: 'SYSTEMS',
    size: 0.98,
    paragraph: [
      'I TURN IDEAS, PROBLEMS AND',
      'COMPLICATED SYSTEMS INTO',
      'PRODUCTS PEOPLE CAN ACTUALLY USE.',
    ],
    paraTone: 'bold',
  },
  {
    id: 's4',
    word: 'EXPLORE',
    size: 1,
    paragraph: [
      'THERE’S STILL A LOT I WANT',
      'TO EXPLORE. FOR NOW — HERE’S',
      'SOME OF WHAT I’VE MADE.',
    ],
    paraTone: 'bold',
  },
];

// Real, ordered About text for screen readers / crawlers (animation is decorative).
export const SR_PARAGRAPHS = ABOUT_LAYERS.map((l) => stripStars(l.text));

// ---------------------------------------------------------------------------
// Placeholder images — REPLACE THESE PATHS with the real photos later.
// Nothing else changes. 20 varied duotone compositions so tilt / overlap /
// clipping can be judged before the real assets exist.
// ---------------------------------------------------------------------------
const IMG = '/about-collage';
export const IMAGES: Record<string, string> = Object.fromEntries(
  Array.from({ length: 20 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return [`p${n}`, `${IMG}/placeholder-${n}.svg`];
  }),
);

// --- Cards ------------------------------------------------------------
// One flat list. `stop` places the card in that stop's cluster; `dx`/`dy` are
// the card centre's offset from the cluster centre, as a % of clip width /
// height (so the spread is wide enough to overlap the word and clip the window
// edges — the Frame 9 density). `rot`/`scale` are the resting pose; the master
// timeline adds slow independent drift on top. `sm` keeps the card on mobile.
export type Card = {
  id: string;
  stop: number;
  src: string;
  /** card box — CSS length strings, independent of the image's real pixels */
  w: string;
  h: string;
  dx: number;
  dy: number;
  rot: number;
  scale: number;
  z: number;
  /** 0..1 — shadow depth (higher = nearer) */
  depth: number;
  /** printed-photo white border */
  framed?: boolean;
  sm?: boolean;
};

const I = IMAGES;

// Card box sizes — a handful of named formats keeps the collage coherent.
const BOX = {
  tallBig: { w: 'clamp(135px,14.5vw,225px)', h: 'clamp(175px,19vw,295px)' },
  tall: { w: 'clamp(112px,12vw,180px)', h: 'clamp(140px,15vw,232px)' },
  wide: { w: 'clamp(146px,15.5vw,236px)', h: 'clamp(96px,10vw,158px)' },
  wideSm: { w: 'clamp(120px,12.5vw,190px)', h: 'clamp(82px,8.6vw,132px)' },
  squareish: { w: 'clamp(112px,11.5vw,176px)', h: 'clamp(104px,10.6vw,160px)' },
  small: { w: 'clamp(92px,9.6vw,146px)', h: 'clamp(112px,11.6vw,178px)' },
} as const;

// Each stop uses the same 7-slot rhythm (big anchor left-of-centre, wide top,
// portrait right, a few smalls) with its own images, tilts and nudges so no two
// stops read alike. Text lanes are kept clear: label pocket ≈ dx[-38..-12] /
// dy[-38..-16]; paragraph lane ≈ dx[-38..-8] / dy[16..38].
// prettier-ignore
export const CARDS: Card[] = [
  // ---- Stop 1 · CURIOUS ------------------------------------------------
  { id: 'a1', stop: 0, src: I.p01, ...BOX.tallBig,   dx: -19, dy:  5,  rot: -6, scale: 1.00, z: 7, depth: 0.55, framed: true, sm: true },
  { id: 'a2', stop: 0, src: I.p15, ...BOX.wide,      dx:   7, dy: -23, rot:  4, scale: 0.94, z: 8, depth: 0.7,  framed: true, sm: true },
  { id: 'a3', stop: 0, src: I.p05, ...BOX.tall,      dx:  27, dy:  9,  rot:  9, scale: 0.9,  z: 9, depth: 0.82, framed: true, sm: true },
  { id: 'a4', stop: 0, src: I.p10, ...BOX.wideSm,    dx: -31, dy:  7,  rot: -9, scale: 0.8,  z: 5, depth: 0.38, framed: true, sm: true },
  { id: 'a5', stop: 0, src: I.p07, ...BOX.wideSm,    dx:  23, dy: -31, rot: -7, scale: 0.74, z: 4, depth: 0.32, framed: true },
  { id: 'a6', stop: 0, src: I.p18, ...BOX.small,     dx:  34, dy: -11, rot: 12, scale: 0.7,  z: 3, depth: 0.28, framed: true },
  { id: 'a7', stop: 0, src: I.p03, ...BOX.squareish, dx:  11, dy:  27, rot:  6, scale: 0.78, z: 6, depth: 0.45, framed: true },

  // ---- Stop 2 · MESSY ------------------------------------------------
  { id: 'b1', stop: 1, src: I.p09, ...BOX.tallBig,   dx: -21, dy:  3,  rot:  6, scale: 0.98, z: 8, depth: 0.6,  framed: true, sm: true },
  { id: 'b2', stop: 1, src: I.p11, ...BOX.wide,      dx:   5, dy: -24, rot: -5, scale: 0.92, z: 9, depth: 0.78, framed: true, sm: true },
  { id: 'b3', stop: 1, src: I.p16, ...BOX.tall,      dx:  29, dy:  11, rot: -9, scale: 0.88, z: 7, depth: 0.7,  framed: true, sm: true },
  { id: 'b4', stop: 1, src: I.p02, ...BOX.wideSm,    dx: -32, dy: -6,  rot:  9, scale: 0.78, z: 5, depth: 0.36, framed: true, sm: true },
  { id: 'b5', stop: 1, src: I.p19, ...BOX.small,     dx:  19, dy:  29, rot:  4, scale: 0.76, z: 6, depth: 0.42, framed: true },
  { id: 'b6', stop: 1, src: I.p06, ...BOX.small,     dx:  34, dy: -18, rot: 13, scale: 0.68, z: 4, depth: 0.3,  framed: true },
  { id: 'b7', stop: 1, src: I.p14, ...BOX.squareish, dx:  -7, dy:  25, rot: -7, scale: 0.74, z: 3, depth: 0.32, framed: true },

  // ---- Stop 3 · SYSTEMS ------------------------------------------------
  { id: 'c1', stop: 2, src: I.p20, ...BOX.tallBig,   dx: -20, dy: -1,  rot: -6, scale: 1.0,  z: 8, depth: 0.6,  framed: true, sm: true },
  { id: 'c2', stop: 2, src: I.p04, ...BOX.wide,      dx:   8, dy: -23, rot:  5, scale: 0.9,  z: 9, depth: 0.8,  framed: true, sm: true },
  { id: 'c3', stop: 2, src: I.p12, ...BOX.tall,      dx:  29, dy:   9, rot:  10,scale: 0.86, z: 7, depth: 0.68, framed: true, sm: true },
  { id: 'c4', stop: 2, src: I.p08, ...BOX.wideSm,    dx: -31, dy:  10, rot: -8, scale: 0.78, z: 5, depth: 0.38, framed: true, sm: true },
  { id: 'c5', stop: 2, src: I.p17, ...BOX.small,     dx:  21, dy:  28, rot: -4, scale: 0.76, z: 6, depth: 0.44, framed: true },
  { id: 'c6', stop: 2, src: I.p13, ...BOX.small,     dx:  34, dy: -24, rot: 11, scale: 0.7,  z: 4, depth: 0.3,  framed: true },
  { id: 'c7', stop: 2, src: I.p01, ...BOX.squareish, dx:  -8, dy:  25, rot:  7, scale: 0.72, z: 3, depth: 0.28, framed: true },

  // ---- Stop 4 · EXPLORE ------------------------------------------------
  { id: 'd1', stop: 3, src: I.p20, ...BOX.tallBig,   dx: -21, dy:  3,  rot:  7, scale: 0.98, z: 8, depth: 0.6,  framed: true, sm: true },
  { id: 'd2', stop: 3, src: I.p14, ...BOX.wide,      dx:   6, dy: -24, rot: -5, scale: 0.92, z: 9, depth: 0.8,  framed: true, sm: true },
  { id: 'd3', stop: 3, src: I.p12, ...BOX.tall,      dx:  29, dy:  11, rot: -10,scale: 0.88, z: 7, depth: 0.7,  framed: true, sm: true },
  { id: 'd4', stop: 3, src: I.p16, ...BOX.wideSm,    dx: -32, dy: -5,  rot:  8, scale: 0.78, z: 5, depth: 0.36, framed: true, sm: true },
  { id: 'd5', stop: 3, src: I.p05, ...BOX.small,     dx:  19, dy:  29, rot:  5, scale: 0.76, z: 6, depth: 0.42, framed: true },
  { id: 'd6', stop: 3, src: I.p11, ...BOX.small,     dx:  34, dy: -20, rot: 12, scale: 0.68, z: 4, depth: 0.3,  framed: true },
  { id: 'd7', stop: 3, src: I.p08, ...BOX.squareish, dx:  -8, dy:  25, rot: -7, scale: 0.74, z: 3, depth: 0.32, framed: true },
];

// Per-card independent drift for the whole scroll (composited on top of the
// card layer's parallax so no two cards move alike). Keyed by card id;
// anything missing falls back to a gentle default.
export const CARD_DRIFT: Record<
  string,
  { rot: number; x: number; y: number; ease: string }
> = {
  a1: { rot: 3, x: 14, y: -10, ease: 'sine.inOut' },
  a2: { rot: -4, x: -10, y: 12, ease: 'power1.inOut' },
  a3: { rot: 5, x: 18, y: 8, ease: 'sine.inOut' },
  a4: { rot: -3, x: -16, y: -12, ease: 'power1.inOut' },
  a5: { rot: 6, x: 10, y: 16, ease: 'sine.inOut' },
  a6: { rot: -5, x: -12, y: 10, ease: 'sine.inOut' },
  a7: { rot: 4, x: 12, y: -14, ease: 'power1.inOut' },
  b1: { rot: -3, x: -12, y: 12, ease: 'sine.inOut' },
  b2: { rot: 4, x: 14, y: -10, ease: 'power1.inOut' },
  b3: { rot: -5, x: -16, y: 8, ease: 'sine.inOut' },
  b4: { rot: 5, x: 10, y: 14, ease: 'sine.inOut' },
  b5: { rot: -4, x: -14, y: -12, ease: 'power1.inOut' },
  b6: { rot: 6, x: 12, y: 10, ease: 'sine.inOut' },
  b7: { rot: -3, x: -10, y: 16, ease: 'sine.inOut' },
  c1: { rot: 3, x: 12, y: -12, ease: 'sine.inOut' },
  c2: { rot: -4, x: -14, y: 10, ease: 'power1.inOut' },
  c3: { rot: 5, x: 16, y: 8, ease: 'sine.inOut' },
  c4: { rot: -5, x: -10, y: -14, ease: 'sine.inOut' },
  c5: { rot: 4, x: 14, y: 12, ease: 'power1.inOut' },
  c6: { rot: -3, x: -16, y: 10, ease: 'sine.inOut' },
  c7: { rot: 6, x: 10, y: -10, ease: 'sine.inOut' },
  d1: { rot: -3, x: -12, y: 12, ease: 'sine.inOut' },
  d2: { rot: 4, x: 14, y: -12, ease: 'power1.inOut' },
  d3: { rot: -5, x: -16, y: 8, ease: 'sine.inOut' },
  d4: { rot: 5, x: 10, y: 14, ease: 'sine.inOut' },
  d5: { rot: -4, x: -14, y: -10, ease: 'power1.inOut' },
  d6: { rot: 6, x: 12, y: 12, ease: 'sine.inOut' },
  d7: { rot: -3, x: -10, y: 16, ease: 'sine.inOut' },
};

import { WORK, type WorkProject } from '@/lib/content/work';

/**
 * Presentation layer for the "Selected work" section (the DRIFT direction,
 * live on / and /work; also the INDEX draft at /work-showcase-v3).
 *
 * This file adds NOTHING to the projects themselves — it re-reads `WORK`
 * (lib/content/work.ts) and layers on the extra editorial copy and the
 * per-project background atmosphere the composition needs. The retained
 * classic <SelectedWork> component still reads `WORK` directly and is
 * unaffected by anything here.
 *
 * To reorder the showcase, reorder `ORDER`. To retune the colour story,
 * edit `tone` — keep them within a hair of --paper (#f4f0e9); the whole
 * point is a change of light, not a change of palette.
 */

export interface ShowcaseProject extends WorkProject {
  /** Big editorial descriptor under the title — the one-line "what it is". */
  descriptor: string;
  /** Category / role chip. */
  category: string;
  /** Optional supporting sentence (2 lines max at display size). */
  supporting: string;
  /** Section background tone. Closely related warm off-whites only. */
  tone: string;
  /** A restrained per-project ink accent for the index numeral / rule. */
  accent: string;
}

type Meta = Pick<
  ShowcaseProject,
  'descriptor' | 'category' | 'supporting' | 'tone' | 'accent'
>;

// Keyed by slug so it stays correct however `WORK` / `ORDER` are arranged.
const META: Record<string, Meta> = {
  clearhost: {
    descriptor: 'A unified operating system for India’s independent hotels.',
    category: 'Product Design Lead · 0→1',
    supporting:
      'Field research with homestay owners through to a Channex-certified platform: PMS, channel manager and a built-in AI ads manager, run from one place.',
    tone: '#F3EFE8',
    accent: '#b0512b',
  },
  nextrail: {
    descriptor: 'Turning saved travel inspiration into an actual trip.',
    category: 'AI travel experience · Group project',
    supporting:
      'Feed2Fly takes the reels and clips you already save, groups them by destination, and walks that pile of links into a day-by-day plan.',
    tone: '#EFECE4',
    accent: '#5b47c7',
  },
  'chess-com': {
    descriptor: 'Your own blunders, handed back as engine-verified puzzles.',
    category: 'Game-based learning · Concept',
    supporting:
      'A concept for Chess.com: the engine catches the move you missed and returns it as a fair, verified puzzle built from your own game.',
    tone: '#F1EEE9',
    accent: '#3f7d34',
  },
};

/** Showcase order — slugs, in the sequence the user scrolls through. */
const ORDER = ['clearhost', 'nextrail', 'chess-com'] as const;

const bySlug = new Map(WORK.map((p) => [p.slug, p]));

export const SHOWCASE_PROJECTS: ShowcaseProject[] = ORDER.map((slug) => {
  const base = bySlug.get(slug);
  const meta = META[slug];
  if (!base || !meta) {
    throw new Error(`showcase.content: no project/meta for "${slug}"`);
  }
  return { ...base, ...meta };
});

export const SHOWCASE_COUNT = SHOWCASE_PROJECTS.length;

/** Ordered tone list — consumed directly by the stacked background layers. */
export const SHOWCASE_TONES = SHOWCASE_PROJECTS.map((p) => p.tone);

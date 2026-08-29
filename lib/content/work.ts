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
  },
  {
    slug: 'field-notes',
    slot: 'b',
    index: '02',
    title: 'Field Notes',
    discipline: 'Design system',
    year: '2024',
    ratio: '3 / 4',
    src: U('1499750310107-5fef28a66643', 900, 1200),
    owned: 'A cross-platform design system and its adoption program.',
  },
  {
    slug: 'halflight',
    slot: 'c',
    index: '03',
    title: 'Halflight',
    discipline: 'Prototyping',
    year: '2024',
    ratio: '3 / 2',
    src: U('1498050108023-c5249f4df085', 1500, 1000),
    owned: 'Interaction prototypes that set the bar for engineering.',
  },
];

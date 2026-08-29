export type GalleryItem = {
  type: 'image' | 'video';
  src: string;
  /** Poster frame for videos (also the fallback if the video is missing). */
  poster?: string;
  label: string;
  /** Which parallax row it belongs to. */
  row: 0 | 1;
};

// PLACEHOLDER imagery — two rows of large landscape cards that drift opposite
// ways on scroll. Video slots point at paths you still need to provide
// (public/videos/*.mp4) and fall back to the poster.
const IMGS = [
  '/images/gallery-01.svg',
  '/images/gallery-02.svg',
  '/images/gallery-03.svg',
  '/images/gallery-04.svg',
  '/images/gallery-05.svg',
  '/images/gallery-06.svg',
];

const img = (i: number, label: string, row: 0 | 1): GalleryItem => ({
  type: 'image',
  src: IMGS[i % IMGS.length],
  label,
  row,
});

export const GALLERY: GalleryItem[] = [
  // row 0 — 7
  img(1, 'Screens', 0),
  { type: 'video', src: '/videos/reel-01.mp4', poster: IMGS[4], label: 'Motion study', row: 0 },
  img(2, 'System detail', 0),
  img(0, 'Exploration', 0),
  img(5, 'Grid', 0),
  img(3, 'Type test', 0),
  img(4, 'Sketch', 0),
  // row 1 — 7
  img(3, 'Draft', 1),
  img(4, 'Sketch', 1),
  { type: 'video', src: '/videos/reel-02.mp4', poster: IMGS[1], label: 'Prototype', row: 1 },
  img(2, 'Detail', 1),
  img(0, 'Frame', 1),
  img(5, 'Layout', 1),
  img(1, 'Screens', 1),
];

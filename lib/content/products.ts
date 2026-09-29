export type Product = {
  name: string;
  blurb: string;
  status: 'Live' | 'Beta' | 'Building' | 'Archived';
  href: string;
  /** Looping product-reel clip — the card's primary visual. */
  video: string;
  /** Shown immediately and while the video buffers. */
  poster: string;
};

export const PRODUCTS: Product[] = [
  {
    name: 'Metric',
    blurb: 'Reflex and memory games, built for speed — reaction time, aim training, the chimp test and more.',
    status: 'Live',
    href: '/products/metric',
    video: '/products/product-metric.webm',
    poster: '/products/product-metric-poster.webp',
  },
  {
    name: 'InkRiot',
    blurb: 'A draw-and-guess party game — doodle avatars, a 20-color palette, and combo streaks with friends.',
    status: 'Live',
    href: '/products/inkriot',
    video: '/products/product-inkriot.mov',
    poster: '/products/product-inkriot-poster.webp',
  },
];

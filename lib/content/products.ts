export type Product = {
  name: string;
  blurb: string;
  status: 'Live' | 'Beta' | 'Building' | 'Archived';
  href: string;
  src: string;
};

// PLACEHOLDER — replace with real experiments / side projects.
export const PRODUCTS: Product[] = [
  {
    name: 'Tempo',
    blurb: 'A calmer way to plan a week. Time-blocking without the guilt.',
    status: 'Beta',
    href: '#',
    src: '/images/product-01.svg',
  },
  {
    name: 'Grainy',
    blurb: 'Film-grain and halation for the web, as a tiny drop-in library.',
    status: 'Live',
    href: '#',
    src: '/images/product-02.svg',
  },
  {
    name: 'Northstar',
    blurb: 'Personal metrics dashboard. One number that matters per day.',
    status: 'Building',
    href: '#',
    src: '/images/product-03.svg',
  },
  {
    name: 'Pocket Atlas',
    blurb: 'Offline city guides made from the places friends actually go.',
    status: 'Building',
    href: '#',
    src: '/images/product-04.svg',
  },
];

// The five "saved content" cards reused across all three what-we-found
// scenes (flow / scroll-expand / pinned fan) — same deck carried from one
// scene into the next, like inspiration you already have. Photos are the
// existing travel collage set. Card chrome uses the site's one accent colour
// (see FoundReveal.module.scss) rather than a per-card hue, so kept
// deliberately short (trimmed from 8) so each scene's cards have real
// breathing space instead of crowding.
export type DestCard = {
  src: string;
  city: string;
  country: string;
};

const B = '/nextrail_casestudy/insights/collage';

export const DEST_CARDS: DestCard[] = [
  { src: `${B}/street.webp`, city: 'London', country: 'United Kingdom' },
  { src: `${B}/beach.webp`, city: 'Bali', country: 'Indonesia' },
  { src: `${B}/road.webp`, city: 'California', country: 'United States' },
  { src: `${B}/lake.webp`, city: 'Banff', country: 'Canada' },
  { src: `${B}/sunset.webp`, city: 'Lofoten', country: 'Norway' },
];

// Plain, uncarded photos for the scroll scene — mixed in with the destination
// cards so that scene isn't just the same five cards again. Deliberately
// varied aspect ratios so the burst reads as a real scattered mix of
// content, not a uniform grid. The collage set only has 12 unique photos, so
// past that this deliberately re-crops a few already used by the cards
// above (different aspect ratio, so it doesn't read as a literal repeat) —
// scene density matters more here than every image being unique.
export type ExtraImage = { src: string; ratio: string };

export const EXTRA_IMAGES: ExtraImage[] = [
  { src: `${B}/travelers.webp`, ratio: '4 / 5' },
  { src: `${B}/aerial.webp`, ratio: '16 / 9' },
  { src: `${B}/falls.webp`, ratio: '2 / 3' },
  { src: `${B}/dock.webp`, ratio: '3 / 2' },
  { src: `${B}/shore.webp`, ratio: '1 / 1' },
  { src: `${B}/autumn.webp`, ratio: '4 / 5' },
  { src: `${B}/towers.webp`, ratio: '3 / 4' },
  { src: `${B}/street.webp`, ratio: '16 / 9' },
  { src: `${B}/beach.webp`, ratio: '1 / 1' },
  { src: `${B}/road.webp`, ratio: '4 / 5' },
  { src: `${B}/lake.webp`, ratio: '3 / 2' },
  { src: `${B}/sunset.webp`, ratio: '2 / 3' },
];

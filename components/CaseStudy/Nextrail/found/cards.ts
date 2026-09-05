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
  { src: `${B}/street.jpg`, city: 'London', country: 'United Kingdom' },
  { src: `${B}/beach.jpg`, city: 'Bali', country: 'Indonesia' },
  { src: `${B}/road.jpg`, city: 'California', country: 'United States' },
  { src: `${B}/lake.jpg`, city: 'Banff', country: 'Canada' },
  { src: `${B}/sunset.jpg`, city: 'Lofoten', country: 'Norway' },
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
  { src: `${B}/travelers.jpg`, ratio: '4 / 5' },
  { src: `${B}/aerial.jpg`, ratio: '16 / 9' },
  { src: `${B}/falls.jpg`, ratio: '2 / 3' },
  { src: `${B}/dock.jpg`, ratio: '3 / 2' },
  { src: `${B}/shore.jpg`, ratio: '1 / 1' },
  { src: `${B}/autumn.jpg`, ratio: '4 / 5' },
  { src: `${B}/towers.jpg`, ratio: '3 / 4' },
  { src: `${B}/street.jpg`, ratio: '16 / 9' },
  { src: `${B}/beach.jpg`, ratio: '1 / 1' },
  { src: `${B}/road.jpg`, ratio: '4 / 5' },
  { src: `${B}/lake.jpg`, ratio: '3 / 2' },
  { src: `${B}/sunset.jpg`, ratio: '2 / 3' },
];

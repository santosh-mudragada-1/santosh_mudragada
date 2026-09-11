// The interactive paint/eraser "About me" section. Six warm colour panels,
// each painted with one short statement plus 2–3 physical-cutout stickers from
// public/stickers/. You scratch a panel away — colour, text and stickers
// together — to reveal the next one underneath.
//
// In each `text`, words wrapped in *asterisks* are rendered in the accent face
// (Erica One) instead of the body face (Bricolage Grotesque).

export type AboutSticker = {
  /** transparent cutout in /public/stickers — original artwork, never recoloured */
  src: string;
  /** centre position, fraction of the panel (0..1) */
  x: number;
  y: number;
  /** width as a fraction of the panel's shorter side */
  scale: number;
  /** resting tilt, degrees */
  rot: number;
};

export type AboutLayer = {
  text: string;
  stickers: AboutSticker[];
};

const S = '/stickers';

// Stickers live in the top / bottom bands only, clear of the centred
// statement — close enough to frame it, never behind the words.
export const ABOUT_LAYERS: AboutLayer[] = [
  // 1 — introduction: an idea becoming something tangible
  {
    text: "Hi, I'm *Santosh*. I design *digital experiences* that make sense.",
    stickers: [
      { src: `${S}/Bulb.webp`, x: 0.19, y: 0.19, scale: 0.22, rot: -8 },
      { src: `${S}/Pencil.webp`, x: 0.81, y: 0.81, scale: 0.17, rot: 14 },
    ],
  },
  // 2 — curiosity: exploration and investigation
  {
    text: "I'm usually *curious* about how things *work* and why they don't.",
    stickers: [
      { src: `${S}/Search.webp`, x: 0.17, y: 0.18, scale: 0.22, rot: -10 },
      { src: `${S}/Lab.webp`, x: 0.83, y: 0.82, scale: 0.25, rot: 8 },
    ],
  },
  // 3 — design process: experimental, a little unpredictable
  {
    text: 'Most good ideas start *messy* before they start *making sense*.',
    stickers: [
      { src: `${S}/Camera.webp`, x: 0.16, y: 0.18, scale: 0.24, rot: -13 },
      { src: `${S}/Cassette.webp`, x: 0.84, y: 0.82, scale: 0.23, rot: 11 },
      { src: `${S}/Dice.webp`, x: 0.6, y: 0.12, scale: 0.14, rot: -6 },
    ],
  },
  // 4 — work: building, and taking ideas forward
  {
    text: 'I turn *ideas*, *problems*, and complicated *systems* into products people can *actually use*.',
    stickers: [
      { src: `${S}/Old%20PC.webp`, x: 0.19, y: 0.83, scale: 0.28, rot: -6 },
      { src: `${S}/Rocket.webp`, x: 0.82, y: 0.17, scale: 0.2, rot: 13 },
    ],
  },
  // 5 — personal: chess, records, getting lost in ideas
  {
    text: "Outside design, you'll probably find me playing *chess* or getting *lost in random ideas*.",
    stickers: [
      { src: `${S}/Chess%20King.webp`, x: 0.14, y: 0.16, scale: 0.21, rot: -9 },
      { src: `${S}/Vinyl%20Record.webp`, x: 0.86, y: 0.17, scale: 0.25, rot: 14 },
      { src: `${S}/Coffee.webp`, x: 0.5, y: 0.87, scale: 0.19, rot: 6 },
    ],
  },
  // 6 — exploration / closing: expansive, a lead-in to the work
  {
    text: "There's still a lot I want to *explore*. For now, here's some of *what I've made*.",
    stickers: [
      { src: `${S}/Earth.webp`, x: 0.83, y: 0.16, scale: 0.23, rot: 8 },
      { src: `${S}/World%20Map.webp`, x: 0.19, y: 0.84, scale: 0.28, rot: -7 },
      { src: `${S}/Moon%20and%20Sun.webp`, x: 0.4, y: 0.12, scale: 0.17, rot: -12 },
    ],
  },
];

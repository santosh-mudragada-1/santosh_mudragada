// ---------------------------------------------------------------------------
// /about — "There's more to me than what I design."
//
// A long-form visual essay. Copy is written to be spoken, not recited: short
// lines, fragments where a fragment is the honest length, a bit dry. It states
// the thesis plainly once or twice and otherwise lets the photographs carry it.
// No "passionate", no "outside of work", and no "photography taught me
// composition" — the essay actively refuses that move twice.
//
// Photographs live in /public/about/<slug>.webp (+ -sm.webp for srcset). DIMS
// holds each file's real pixel size so every <figure> can reserve its box and
// the page never shifts as images stream in.
//
// NOTE FOR SANTOSH — the one place real detail is missing is the jump from the
// aeronautical degree to the first design job (2021 → 2023). The copy in
// ENGINEERING.transition is deliberately non-specific; drop the real story in
// there when you want it and nothing else needs to change.
// ---------------------------------------------------------------------------

export type Dim = { w: number; h: number; ar: number };

export const DIMS: Record<string, Dim> = {
  'open-clouds': { w: 1800, h: 1350, ar: 1.3337 },
  'open-bridge-fog': { w: 1013, h: 1800, ar: 0.5627 },
  'eng-plane': { w: 1205, h: 1800, ar: 0.6692 },
  'eng-team': { w: 854, h: 640, ar: 1.3344 },
  'eng-nose': { w: 1350, h: 1800, ar: 0.75 },
  'eng-wing-sky': { w: 1800, h: 1013, ar: 1.7778 },
  'ppl-beach': { w: 1024, h: 483, ar: 2.1201 },
  'ppl-sunset': { w: 1800, h: 1350, ar: 1.3337 },
  'ppl-forest': { w: 1800, h: 1350, ar: 1.3337 },
  'ppl-fair': { w: 960, h: 1280, ar: 0.75 },
  'trv-boats': { w: 1013, h: 1800, ar: 0.5627 },
  'trv-lanterns': { w: 1013, h: 1800, ar: 0.5627 },
  'trv-halong': { w: 1800, h: 1013, ar: 1.7778 },
  'trv-stalls': { w: 1013, h: 1800, ar: 0.5627 },
  'trv-yellow': { w: 871, h: 1108, ar: 0.7861 },
  'trv-moto': { w: 1013, h: 1800, ar: 0.5627 },
  'trv-falls': { w: 1350, h: 1800, ar: 0.75 },
  'trv-halong-dawn': { w: 1800, h: 1013, ar: 1.7778 },
  'trv-oldtown': { w: 1013, h: 1800, ar: 0.5627 },
  'trv-green-bldg': { w: 1013, h: 1800, ar: 0.5627 },
  'trv-gate': { w: 1013, h: 1800, ar: 0.5627 },
  'trv-night-food': { w: 1013, h: 1800, ar: 0.5627 },
  'trv-rail': { w: 1800, h: 1336, ar: 1.3469 },
  'pho-street-framed': { w: 1311, h: 1800, ar: 0.7281 },
  'pho-fans': { w: 911, h: 1214, ar: 0.7504 },
  'pho-tower': { w: 1035, h: 1800, ar: 0.5751 },
  'pho-lookup': { w: 1013, h: 1800, ar: 0.5627 },
  'pho-dragon': { w: 383, h: 215, ar: 1.7814 },
  'pho-balloon': { w: 1013, h: 1800, ar: 0.5627 },
  'pho-dog': { w: 1350, h: 1800, ar: 0.75 },
  'pho-myna': { w: 1800, h: 1253, ar: 1.4367 },
  'pho-valley': { w: 1800, h: 1013, ar: 1.7778 },
  'pho-kids': { w: 1800, h: 1013, ar: 1.7778 },
  'pho-stream': { w: 1800, h: 1200, ar: 1.4995 },
  'cof-breakfast': { w: 1800, h: 1013, ar: 1.7778 },
  'cof-counter': { w: 1013, h: 1800, ar: 0.5627 },
  'cof-toast': { w: 1800, h: 1355, ar: 1.3281 },
  'cof-iced': { w: 1013, h: 1800, ar: 0.5627 },
  'adv-kayak': { w: 1800, h: 1776, ar: 1.0133 },
  'adv-moto-rocks': { w: 1800, h: 1201, ar: 1.4989 },
  'adv-coaster': { w: 1012, h: 1800, ar: 0.5625 },
  'adv-snowman': { w: 1350, h: 1800, ar: 0.75 },
  'adv-wings': { w: 1012, h: 1800, ar: 0.5625 },
  'qui-sonamarg': { w: 1800, h: 1201, ar: 1.4989 },
  'qui-sonamarg2': { w: 1800, h: 1201, ar: 1.4989 },
  'qui-pines': { w: 1336, h: 1800, ar: 0.7424 },
  'qui-clocktower': { w: 1013, h: 1800, ar: 0.5627 },
  'qui-walk': { w: 927, h: 1238, ar: 0.7488 },
  'qui-karst': { w: 1013, h: 1800, ar: 0.5627 },
  'qui-mist-house': { w: 1800, h: 1201, ar: 1.4992 },
  'care-toddler': { w: 1280, h: 1280, ar: 1.0 },
  'care-peek': { w: 1350, h: 1800, ar: 0.75 },
};

/** alt text — plain description of what's in frame, for screen readers */
export const ALT: Record<string, string> = {
  'open-clouds':
    'Santosh in a dark jacket, seen from the side, looking out over a sea of cloud with snow peaks beyond.',
  'open-bridge-fog':
    'Three friends in white rain ponchos on the Golden Bridge at Bà Nà Hills, giant stone hands rising into thick fog.',
  'eng-plane': 'Santosh leaning against the nose of a parked twin-propeller aircraft on a college campus.',
  'eng-team':
    'Five engineering students with a camouflage-painted model aircraft wing and a small trophy under a Hindustan Institute of Technology and Science banner.',
  'eng-nose': 'Two friends messing around on the nose cone of a small aircraft in bright sun on red dirt.',
  'eng-wing-sky': 'An aircraft wing over a floor of cloud, shot from a window seat.',
  'ppl-beach': 'Four friends huddled together laughing on a rocky shore as a wave breaks behind them.',
  'ppl-sunset': 'Two friends sitting close, silhouetted against a hazy sunset.',
  'ppl-forest': 'A group of friends posed together in a palm forest on a trip.',
  'ppl-fair': 'Santosh at a lit-up night fair, smiling at the camera.',
  'trv-boats': 'Small boats moving between jungle-covered limestone cliffs on a river in Ninh Bình.',
  'trv-lanterns': 'A night street lined with glowing paper lanterns and a wet, reflective road.',
  'trv-halong': 'Cruise boats scattered among the karst towers of Hạ Long Bay at dusk.',
  'trv-stalls': 'A row of brightly lit lantern stalls on a wet cobbled street at night.',
  'trv-yellow': 'Santosh leaning against a bright yellow colonial wall with arched windows in Hội An.',
  'trv-moto':
    'Santosh on a motorbike at the Nam Xay viewpoint above Vang Vieng, Laos, a patchwork valley and karst peaks behind.',
  'trv-falls': 'Santosh sitting beside the turquoise tiers of Kuang Si Falls.',
  'trv-halong-dawn': 'Boats on still water among karst islands under a soft pink dawn.',
  'trv-oldtown': 'A foggy stone street of an old hill town, warm lamps, people under umbrellas.',
  'trv-green-bldg': 'A pale green colonial building with shuttered balconies and palm trees.',
  'trv-gate': 'Santosh in front of a warmly lit temple gate at night, motorbikes parked alongside.',
  'trv-night-food': 'A night food stall wreathed in steam and neon signage, someone eating in a rain poncho.',
  'trv-rail': 'A long steel truss railway bridge stretching across water under a dramatic dusk sky.',
  'pho-street-framed': 'A foggy dusk street with bare trees and warm streetlamps, printed with a white border.',
  'pho-fans': 'A woman making red paper fans and calligraphy scrolls by lamplight in a dim shop.',
  'pho-tower': 'A curved modern skyscraper rising behind an older building against a flat grey sky.',
  'pho-lookup': 'Looking straight up a gap between buildings at a tapering tower and overcast sky.',
  'pho-dragon': 'A wall mural of a samurai and a red dragon around a red sun.',
  'pho-balloon': 'A single hot-air balloon drifting past a tall cloud in a pale sky, wires below.',
  'pho-dog': 'A black-and-white street dog on gravel, a hand reaching down towards it.',
  'pho-myna': 'A myna bird holding still on a painted railing.',
  'pho-valley': 'A wide river valley and a small town below a mountain ridge and heavy cloud.',
  'pho-kids': 'Three small children at a low table, pulling faces at the camera.',
  'pho-stream': 'A long-exposure of water sliding over mossy rocks in green shade.',
  'cof-breakfast':
    'An overhead view of a breakfast: a cappuccino, two croissants and a black coffee on a patched cloth.',
  'cof-counter': 'The counter of a small café, a barista at work under warm string lights.',
  'cof-toast': 'An overhead breakfast of toast, fries and a milky tea on a concrete table.',
  'cof-iced': 'A tall iced coffee held up in one hand under a yellow umbrella.',
  'adv-kayak': 'A man paddling a green kayak through a mangrove channel.',
  'adv-moto-rocks': 'A motorcyclist in full gear picking a line through a rocky, washed-out mountain road.',
  'adv-coaster': 'A first-person view of legs stretched out on an alpine cart, rice fields and hills below.',
  'adv-snowman': 'A very small snowman wearing a black cap, someone sliding through snow in the distance.',
  'adv-wings': 'Santosh standing in front of a colourful painted-wings mural.',
  'qui-sonamarg': 'A glacial river winding through a valley below dark snow-streaked mountains.',
  'qui-sonamarg2': 'Bare ridgelines and drifting cloud over a high mountain valley.',
  'qui-pines': 'Looking straight up the trunks of a tall pine forest to a bright centre of sky.',
  'qui-clocktower': 'A lone figure standing small in front of a colonial clock tower at dusk.',
  'qui-walk': 'Santosh walking a red-dirt path along a rocky coastline lined with palms.',
  'qui-karst': 'Dark limestone hills under a heavy, low sky.',
  'qui-mist-house': 'A single wooden house on a green mountainside, half lost in mist.',
  'care-toddler': 'Santosh holding a small child up to look at a leaf he is holding out.',
  'care-peek': 'A small child in a white shirt peering around a weathered wooden post.',
};

export const src = (slug: string) => `/about/${slug}.webp`;
export const srcSm = (slug: string) => `/about/${slug}-sm.webp`;

// --- Narration ------------------------------------------------------------
// Each entry is one on-scroll block. `*asterisks*` mark a word set in the
// accent face (Erica One), matching the rest of the site.

export const OPENING = {
  kicker: 'Santosh, off the clock',
  headline: ['There is more to me', 'than what I design.'],
  sub: 'You have seen the work. This is the rest of it. A few years of it, roughly in order.',
  thesis:
    'I spend a lot of my time making things. I spend about as much of it just experiencing them.',
};

export const ORIGIN = {
  lines: [
    'I am from *Rajahmundry*, a town on the Godavari, in Andhra Pradesh.',
    'Wide river. Long afternoons. A lot of sky to look at.',
    'I did not grow up planning to be a designer. I am not sure I was planning anything.',
  ],
};

export const ENGINEERING = {
  chapter: '01',
  title: ['I did not', 'start here.'],
  intro: [
    'I studied *aeronautical engineering*. Four years of it, in Chennai.',
    'I liked the part where you take a thing apart to understand why it stays in the air. I liked the model competitions more than the exams.',
  ],
  // ↓↓↓ non-specific on purpose — see the note at the top of this file
  transition:
    'People ask how I got from wings to interfaces. I have never had a tidy answer. I kept following the part of the work I actually enjoyed, and after a while it had turned into something else.',
  pull: "It took a few turns to get here. I wouldn't change them.",
};

export const PEOPLE = {
  chapter: '02',
  title: ['But I have always liked', 'figuring things out.', 'Usually with these people.'],
  lines: [
    'Some of the days I remember best had almost nothing to do with where we were.',
    'Same few people. New backgrounds.',
  ],
  caption: 'The work lot, off the clock for once.',
};

export const TRAVEL = {
  chapter: '03',
  title: ['Then I started', 'going places.'],
  lines: [
    'I like getting a little lost. Turning up somewhere before I have read anything about it, and finding out what it feels like first.',
    'I keep trips as fragments. A wall, a smell, the light at six. More than itineraries.',
  ],
  // frames in the pinned reel, in order. `note` is the small tag under each.
  reel: [
    { slug: 'trv-boats', note: 'Ninh Bình, on the water' },
    { slug: 'trv-oldtown', note: 'up in the hills, in the fog' },
    { slug: 'trv-halong', note: 'Hạ Long, going dark' },
    { slug: 'trv-yellow', note: 'Hội An, that yellow' },
    { slug: 'trv-stalls', note: 'the lantern street, after rain' },
    { slug: 'trv-moto', note: 'Vang Vieng. You climb up to this one' },
    { slug: 'trv-falls', note: 'Kuang Si, colder than it looks' },
    { slug: 'trv-night-food', note: 'dinner, standing up' },
    { slug: 'trv-green-bldg', note: 'somebody still lives here' },
    { slug: 'trv-rail', note: 'a bridge on the way home' },
    { slug: 'trv-halong-dawn', note: 'same bay, six hours later' },
  ],
  close: 'None of it made me better at my job. That was never why I went.',
};

export const PHOTOGRAPHY = {
  chapter: '04',
  title: ['And started keeping', 'pieces of them.'],
  lines: [
    'I take a lot of photos. Not because everything in front of me is beautiful.',
    'More because I want to remember how a place *felt* while I was standing in it.',
  ],
  hint: 'drag',
  // the scattered "prints" — each caption is what actually made the shutter go.
  // first seven are the ones the phone column keeps, so they lead.
  prints: [
    { slug: 'pho-street-framed', cap: 'Six pm. Could not feel my hands. Stayed anyway.' },
    { slug: 'pho-fans', cap: 'She had been folding these longer than I have been alive.' },
    { slug: 'pho-valley', cap: 'Stood here a lot longer than I meant to.' },
    { slug: 'pho-dog', cap: 'He allowed it.' },
    { slug: 'pho-balloon', cap: 'It was in no hurry. Neither was I.' },
    { slug: 'pho-kids', cap: 'They were more interested in the camera than I was in the view.' },
    { slug: 'pho-tower', cap: 'Old building, newer building, same grey sky.' },
    { slug: 'pho-myna', cap: 'Held still for exactly one frame.' },
    { slug: 'pho-lookup', cap: 'Looked up at the wrong moment. Kept it.' },
    { slug: 'pho-dragon', cap: 'Somebody spent a week on this. Everyone walks straight past.' },
    { slug: 'pho-stream', cap: 'Ten seconds of shutter. Water does the rest.' },
  ],
};

export const COFFEE = {
  line: 'Somewhere between a long walk and a cup of coffee, I usually stop trying to get anywhere.',
  small: 'This is the slow part of the page. No hurry.',
};

export const ADVENTURE = {
  chapter: '05',
  title: ['Sometimes it is', 'just going', 'to find out.'],
  lines: [
    'I have got comfortable saying yes before I know exactly what I have said yes to.',
    'Kayaks. Bikes on roads that barely were. One that turned out to be a riverbed. A very small snowman.',
  ],
  close: 'It is rarely as dramatic as it sounds afterwards. Mostly it is just: go, and see.',
};

export const QUIET = {
  chapter: '06',
  title: ['And sometimes it is', 'the opposite of that.'],
  lines: [
    'I like being around people. I also like disappearing for a while.',
    'Mountains help. So does fog, and water, and being somewhere my phone gives up.',
    'I am not always after the next thing. Some days, standing still is the whole plan.',
  ],
};

export const CARE = {
  chapter: '07',
  title: ['And then there are the little moments', 'I end up carrying home.'],
  line: 'That is about all I will say here.',
};

export const PRESENT = {
  chapter: '08',
  title: ['Somewhere in all of that,', 'I became a designer.'],
  lines: [
    'Not because a trip taught me a lesson I could put on a slide.',
    'More that the same habit, poke at it, look closer, follow the part that is actually interesting, turned out to be a job.',
  ],
  pull: ['Design is what I do.', 'Curiosity is the thing underneath it.'],
};

export const ENDING = {
  line: 'Anyway. That is a bit more of me.',
  cta: 'Back to the work',
  ctaHref: '/work',
};

// Real, ordered prose for crawlers / screen readers — the scroll piece is
// decorative and much of the meaning is in the pictures.
export const SR_PARAGRAPHS: string[] = [
  "There's more to me than what I design. I spend a lot of my time making things, and about as much of it just experiencing them.",
  "I'm from Rajahmundry, on the Godavari in Andhra Pradesh. I didn't grow up planning to be a designer.",
  'I studied aeronautical engineering for four years in Chennai. I liked taking things apart to understand why they fly, and I liked the model competitions more than the exams. The path from there to product design was not a straight line.',
  "I've always liked figuring things out, usually alongside the same few friends. Some of the days I remember best had little to do with where we were.",
  "At some point I started travelling: Vietnam, Laos, the Indian mountains, the Kerala coast. I like arriving somewhere before I've read about it. I remember trips as fragments more than itineraries.",
  'I photograph a lot of what I see, fog, shopfronts, the good hour of light, people, mostly to remember how a place felt rather than because it was beautiful. None of that was in service of the work.',
  'I like cafés and slow mornings. I like saying yes to things, kayaking, rented motorbikes, bad roads, before I know quite what they involve. I also like solitude: mountains, water, being somewhere unreachable.',
  'There are a few people I would put everything else down for.',
  'Somewhere across all of that I became a designer. Not because any one experience taught me a lesson, but because the habit underneath it, look closer, follow the interesting part, turned into the work. Design is what I do; curiosity is the thing underneath it.',
];

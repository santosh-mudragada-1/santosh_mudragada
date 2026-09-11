// Framer Motion shared tokens. Framer owns: menu transitions, page transitions,
// preloader states, small React UI transitions. It must never drive an element
// that GSAP is also animating.

import type { Transition, Variants } from 'framer-motion';

type Bezier = [number, number, number, number];

// Cubic-bezier curves — identical to styles/_variables.scss + lib/gsap.
export const EASE = {
  expoOut: [0.16, 1, 0.3, 1] as Bezier,
  quartInOut: [0.76, 0, 0.24, 1] as Bezier, // primary transition curve
  quintOut: [0.22, 1, 0.36, 1] as Bezier,
  circOut: [0, 0.55, 0.45, 1] as Bezier,
};

export const DUR = {
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
  xslow: 1.15,
} as const;

export const transitions = {
  base: { duration: DUR.base, ease: EASE.quartInOut } satisfies Transition,
  slow: { duration: DUR.slow, ease: EASE.quartInOut } satisfies Transition,
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.6,
  } satisfies Transition,
};

// Small reusable variants for section reveals (used from Stage 3 on).
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.slow, ease: EASE.expoOut },
  },
};

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// Single GSAP entry point for the whole app.
// Import `{ gsap, ScrollTrigger, useGSAP }` from here — never register plugins
// anywhere else, so registration happens exactly once.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Project-wide defaults so tweens feel consistent unless a component overrides.
gsap.defaults({ ease: 'power3.out', duration: 0.8 });

// GSAP is authoritative for scroll-linked work; keep ScrollTrigger from
// smoothing over frame drops during heavy scenes so scrubbed animation stays
// locked to scroll position.
ScrollTrigger.config({ ignoreMobileResize: true });

// Named eases mirrored from the CSS custom properties / Framer config.
export const GSAP_EASE = {
  primary: 'power4.out',
  inOut: 'power3.inOut',
  expoOut: 'expo.out',
  quartInOut: 'power4.inOut',
} as const;

export const GSAP_DUR = {
  fast: 0.4,
  base: 0.7,
  slow: 1,
} as const;

export { gsap, ScrollTrigger, useGSAP };

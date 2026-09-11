// Single GSAP entry point for the whole app.
// Import `{ gsap, ScrollTrigger, useGSAP }` from here. ScrollTrigger is used
// everywhere so it's registered up front; heavier, single-use plugins
// (Draggable / InertiaPlugin) are imported lazily by the component that needs
// them so they stay out of the shared bundle.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

gsap.defaults({ ease: 'power3.out', duration: 0.8 });

// Keep ScrollTrigger from smoothing over frame drops during heavy scenes so
// scrubbed animation stays locked to scroll position.
ScrollTrigger.config({ ignoreMobileResize: true });

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

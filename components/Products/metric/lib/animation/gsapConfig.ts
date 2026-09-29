import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// registerPlugin is idempotent — safe to call again even though the portfolio's
// own lib/gsap/gsap.ts also registers ScrollTrigger elsewhere on the same gsap
// singleton.
gsap.registerPlugin(CustomEase, ScrollTrigger);

// The "brand" overshoot curve used for every pop-in / press-release across
// Metric's own UI so motion reads as one system rather than per-component one-offs.
// Scoped to this module — doesn't touch the portfolio's own GSAP eases.
CustomEase.create('dialedOut', 'M0,0 C0.34,1.56 0.64,1 1,1');

export const EASE = {
  out: 'dialedOut',
  smooth: 'power2.out',
} as const;

export const DURATION = {
  instant: 0.08,
  fast: 0.12,
  base: 0.22,
} as const;

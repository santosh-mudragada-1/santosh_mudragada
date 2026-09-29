import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// registerPlugin is idempotent — safe to call again even though the portfolio's
// own lib/gsap/gsap.ts also registers ScrollTrigger elsewhere on the same gsap
// singleton.
gsap.registerPlugin(CustomEase, ScrollTrigger);

// A springy sticker "pop" — the overshoot curve used for every card lift /
// stamp bounce across InkRiot's own UI, so motion reads as one system rather
// than per-component one-offs. Scoped to this module.
CustomEase.create('inkPop', 'M0,0 C0.32,1.72 0.6,1 1,1');

export const EASE = {
  pop: 'inkPop',
  smooth: 'power2.out',
} as const;

export const DURATION = {
  instant: 0.08,
  fast: 0.14,
  base: 0.24,
} as const;

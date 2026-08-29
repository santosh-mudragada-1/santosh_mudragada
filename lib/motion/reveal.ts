import { gsap, ScrollTrigger } from '@/lib/gsap/gsap';

type RevealOptions = {
  y?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
};

/**
 * Enter animation for a set of elements as they scroll into view. Transform +
 * opacity only. Call inside a `useGSAP` callback and return the cleanup.
 *
 * Not scrubbed — this is a one-shot "appear" and is fine to be time-based.
 * Scroll-linked continuous motion always uses `scrub` elsewhere.
 */
export function revealUp(
  targets: gsap.TweenTarget,
  {
    y = 28,
    duration = 0.9,
    stagger = 0.08,
    start = 'top 82%',
    once = true,
  }: RevealOptions = {},
) {
  const els = gsap.utils.toArray<HTMLElement>(targets);
  if (!els.length) return () => {};

  const tween = gsap.from(els, {
    y,
    autoAlpha: 0,
    duration,
    stagger,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: els[0],
      start,
      toggleActions: once ? 'play none none none' : 'play none none reverse',
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

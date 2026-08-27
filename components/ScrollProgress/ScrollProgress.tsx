'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './ScrollProgress.module.scss';

/**
 * Thin top-of-page progress bar.
 *
 * Doubles as the Stage 1 proof that Lenis and ScrollTrigger are in sync:
 * `scrub: true` ties the bar's scaleX directly to scroll progress with no
 * numeric smoothing, so if Lenis is driving ScrollTrigger correctly the bar
 * tracks the smooth-scroll position exactly — no lag, no stepping.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReduced) {
        gsap.set(barRef.current, { scaleX: 0 });
        return;
      }

      const tween = gsap.fromTo(
        barRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 0,
            end: 'max',
            scrub: true,
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <div className={styles.track} aria-hidden>
      <div ref={barRef} className={styles.bar} />
    </div>
  );
}

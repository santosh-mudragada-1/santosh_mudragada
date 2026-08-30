'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './ScrollProgress.module.scss';

/**
 * Thin top-of-page progress bar.
 *
 * Reads `scrollY / maxScroll` directly rather than driving a scrubbed
 * ScrollTrigger tween — `end: "max"` was being cached while the document was
 * still short (preloader up, images/fonts pending), so the bar filled within
 * the first screen. `max` here is re-measured whenever the page height changes
 * (ResizeObserver on <body>, plus load / fonts / preloader), and only `scrollY`
 * is read per frame, on the shared gsap.ticker (no extra rAF loop).
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (reduced) {
      gsap.set(bar, { scaleX: 0 });
      return;
    }

    let max = 1;
    const measure = () => {
      max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
    };
    measure();

    let last = -1;
    const update = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      if (Math.abs(p - last) > 0.0004) {
        last = p;
        gsap.set(bar, { scaleX: p });
      }
    };
    gsap.ticker.add(update);

    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    window.addEventListener('preloader:done', measure);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      gsap.ticker.remove(update);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
      window.removeEventListener('preloader:done', measure);
    };
  }, [reduced]);

  return (
    <div className={styles.track} aria-hidden>
      <div ref={barRef} className={styles.bar} />
    </div>
  );
}

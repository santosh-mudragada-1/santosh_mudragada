'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { HeroReveal } from './HeroReveal';
import styles from './Hero.module.scss';

/**
 * Full-bleed hero: one layered SVG composition (HeroReveal) — a
 * background-removed cutout, the with-background photo revealed through a
 * cursor-driven liquid mask, a curved marquee of the wordmark, scattered
 * copy, and a foreground crop for depth. All text flips to a light "negative"
 * wherever the reveal uncovers the photo.
 */
export function Hero() {
  const reduced = usePrefersReducedMotion();
  const [play, setPlay] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // start the entrance once the preloader hands off (or immediately if gone)
  useEffect(() => {
    if (!document.documentElement.classList.contains('is-loading')) {
      setPlay(true);
      return;
    }
    const on = () => setPlay(true);
    window.addEventListener('preloader:done', on, { once: true });
    return () => window.removeEventListener('preloader:done', on);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      data-nav-boundary
      aria-label="Introduction"
    >
      <HeroReveal play={reduced || play} />
    </section>
  );
}

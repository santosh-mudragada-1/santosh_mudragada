'use client';

import { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './HeroPhones.module.scss';

const BASE = '/nextrail_casestudy/ui';

// Back → front. `rot` is the resting tilt; `depth` scales the scroll parallax.
const PHONES = [
  { src: `${BASE}/trip-summary.png`, alt: 'Nextrail trip summary built from Feed2Fly', rot: -7, depth: 1 },
  { src: `${BASE}/feed2fly-grid.png`, alt: 'Feed2Fly — shared travel content grouped by destination', rot: 4, depth: 1.9 },
  { src: `${BASE}/home.png`, alt: 'Nextrail home screen', rot: -3, depth: 2.8 },
];

/**
 * Hero phone composition. Three framed Nextrail screens fanned on the right,
 * a faint world map behind. Desktop: progressive entrance, a gentle CSS idle
 * float per phone, and a small scroll-scrub parallax by depth. Tablet drops
 * the back phone; mobile keeps one screen as a low bleed-off accent. All
 * motion is transform / opacity only and is skipped under reduced motion.
 */
export function HeroPhones() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const q = gsap.utils.selector(wrap);
      const phones = q<HTMLElement>(`.${styles.phone}`);
      const map = q<HTMLElement>(`.${styles.map}`);
      if (!phones.length) return;

      // resting tilt is data-driven so GSAP owns the full transform
      phones.forEach((el) => {
        gsap.set(el, { rotate: Number(el.dataset.rot) || 0 });
      });

      if (reduced) {
        gsap.set([...phones, ...map], { autoAlpha: 1, y: 0 });
        return;
      }

      const kill: Array<() => void> = [];

      // progressive entrance — after the hero title mask (~0.1 + 0.25s)
      const intro = gsap.from(phones, {
        y: 46,
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.12,
        delay: 0.35,
      });
      kill.push(() => intro.kill());

      if (map.length) {
        const mIntro = gsap.from(map, { autoAlpha: 0, duration: 1.4, ease: 'power2.out', delay: 0.2 });
        kill.push(() => mIntro.kill());
      }

      // scroll parallax — subtle, per-phone depth, transform only
      phones.forEach((el) => {
        const depth = Number(el.dataset.depth) || 1;
        const tw = gsap.fromTo(
          el,
          { yPercent: 3.5 * depth },
          {
            yPercent: -3.5 * depth,
            ease: 'none',
            scrollTrigger: {
              trigger: wrap,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
        kill.push(() => {
          tw.scrollTrigger?.kill();
          tw.kill();
        });
      });

      ScrollTrigger.refresh();
      return () => kill.forEach((f) => f());
    },
    { scope: wrapRef, dependencies: [reduced] },
  );

  return (
    <div ref={wrapRef} className={styles.wrap} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.map} src="/nextrail_casestudy/worldmap.png" alt="" />

      <div className={styles.fan}>
        {PHONES.map((p, i) => (
          <div
            key={p.src}
            className={styles.phone}
            data-i={i}
            data-rot={p.rot}
            data-depth={p.depth}
          >
            <div className={styles.float}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} loading="eager" decoding="async" draggable={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

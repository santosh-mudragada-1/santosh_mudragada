'use client';

import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './HeroMarquee.module.scss';

const S = '/nextrail_casestudy/screens';

// Real Nextrail screens (frameless) — order only matters for the diagonal
// spread. Native pixel size travels with each screen: most are 393x852, but
// a few (08, 14, 15, 17) are genuinely a different size/ratio. Carrying the
// real numbers as <img width height> lets the browser reserve each card's
// exact box before the (lazy) file has loaded, off a single fixed guess —
// that mismatch was what made the belt's height drift as images arrived,
// which is what read as the marquee "resetting" mid-loop.
const SCREEN_SIZE: Record<number, [number, number]> = {
  8: [402, 852],
  14: [460, 997],
  15: [460, 997],
  17: [460, 997],
};

const SCREENS = Array.from({ length: 17 }, (_, i) => {
  const n = i + 1;
  const [w, h] = SCREEN_SIZE[n] ?? [393, 852];
  return { src: `${S}/screen-${String(n).padStart(2, '0')}.png`, w, h };
});

// three diagonal columns, alternating scroll direction, middle a touch slower
const COLS = [
  { dir: 'up' as const, dur: 52, items: SCREENS.filter((_, i) => i % 3 === 0) },
  { dir: 'down' as const, dur: 60, items: SCREENS.filter((_, i) => i % 3 === 1) },
  { dir: 'up' as const, dur: 56, items: SCREENS.filter((_, i) => i % 3 === 2) },
];

/**
 * Hero backdrop: three columns of Nextrail screens bleeding off the
 * top-right corner, laid out as a plain flat sheet. Each column is a
 * seamless CSS marquee (transform only), neighbours scroll opposite ways,
 * and the whole sheet carries a single 3D tilt (see HeroMarquee.module.scss
 * for why the tilt lives on the sheet, once, and not per card). Freezes
 * into a static composition under reduced motion.
 */
export function HeroMarquee() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.rig}>
        {COLS.map((col, i) => (
          <div key={i} className={styles.col}>
            <div
              className={styles.track}
              data-dir={col.dir}
              style={reduced ? undefined : { animationDuration: `${col.dur}s` }}
            >
              {[...col.items, ...col.items].map((screen, j) => (
                <div key={j} className={styles.card}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screen.src}
                    width={screen.w}
                    height={screen.h}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

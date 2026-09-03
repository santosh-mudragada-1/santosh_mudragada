'use client';

import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './HeroMarquee.module.scss';

const S = '/nextrail_casestudy/screens';

// Real Nextrail screens (frameless) — order only matters for the diagonal spread.
const SCREENS = Array.from(
  { length: 17 },
  (_, i) => `${S}/screen-${String(i + 1).padStart(2, '0')}.png`,
);

// three diagonal columns, alternating scroll direction, middle a touch slower
const COLS = [
  { dir: 'up' as const, dur: 52, items: SCREENS.filter((_, i) => i % 3 === 0) },
  { dir: 'down' as const, dur: 60, items: SCREENS.filter((_, i) => i % 3 === 1) },
  { dir: 'up' as const, dur: 56, items: SCREENS.filter((_, i) => i % 3 === 2) },
];

/**
 * Hero backdrop: three tilted columns of Nextrail screens bleeding off the
 * top-right corner. Each column is a seamless CSS marquee (transform only),
 * neighbours scroll opposite ways, and the whole rig carries a light 3D tilt.
 * Freezes into a static composition under reduced motion.
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
              {[...col.items, ...col.items].map((src, j) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={j} src={src} alt="" loading="lazy" decoding="async" draggable={false} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

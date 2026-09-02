'use client';

import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './HeroMarquee.module.scss';

const UI = '/nextrail_casestudy/ui';

// Real Nextrail screens — order only matters for the diagonal spread.
const SCREENS = [
  'home', 'blend-sheet', 'organize-reels', 'feed2fly-grid', 'organize-reels-2',
  'organize-filter', 'plan-who', 'plan-when', 'plan-when-flex', 'plan-budget',
  'plan-amenities', 'itinerary-edit', 'itinerary-map', 'trip-summary',
  'itinerary-hotel', 'booking-flight', 'booking-results', 'booking-pass',
  'booking-passenger', 'blend-sheet-2',
].map((n) => `${UI}/${n}.png`);

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

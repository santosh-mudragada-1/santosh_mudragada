'use client';

import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './HeroMarquee.module.scss';

const S = '/nextrail_casestudy/screens';

// Real Nextrail screens (frameless) — order only matters for the diagonal
// spread. All 17 are a uniform 590x1278. Carrying that as <img width
// height> lets the browser reserve every card's exact box before the
// (lazy) file has loaded — without it, each image arriving nudges the
// track's total height mid-animation, and since the loop keyframe is
// `translateY(-50%)` (relative to that height), every late load shifts
// the target and the belt visibly jumps.
const SCREEN_W = 590;
const SCREEN_H = 1278;

const SCREENS = Array.from({ length: 17 }, (_, i) => ({
  src: `${S}/screen-${String(i + 1).padStart(2, '0')}.webp`,
  w: SCREEN_W,
  h: SCREEN_H,
}));

// three diagonal columns, alternating scroll direction, middle a touch slower.
// `delay` is negative on purpose: a CSS animation with a negative delay
// starts already that many seconds into its cycle, so on first paint every
// column is already mid-scroll instead of sitting at its untouched rest
// position — that "everything at 0%, all at once" moment is what read as
// the marquee "just getting started". Three different offsets also keep
// the columns from ever re-syncing into a visible rhythm.
const COLS = [
  { dir: 'up' as const, dur: 52, delay: -17, items: SCREENS.filter((_, i) => i % 3 === 0) },
  { dir: 'down' as const, dur: 60, delay: -38, items: SCREENS.filter((_, i) => i % 3 === 1) },
  { dir: 'up' as const, dur: 56, delay: -9, items: SCREENS.filter((_, i) => i % 3 === 2) },
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
              style={
                reduced
                  ? undefined
                  : { animationDuration: `${col.dur}s`, animationDelay: `${col.delay}s` }
              }
            >
              {[...col.items, ...col.items].map((screen, j) => (
                <div key={j} className={styles.card}>
                  {/* Eager on purpose: this belt scrolls every duplicate into
                      "first time visible" territory continuously, not just
                      once on scroll-into-viewport, so `loading="lazy"` here
                      meant new cards popped in mid-loop right as they
                      arrived — that was the "glitching mid" scroll. Only 17
                      unique files repeat, so there's nothing to defer. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screen.src}
                    width={screen.w}
                    height={screen.h}
                    alt=""
                    loading="eager"
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

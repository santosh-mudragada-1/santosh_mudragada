'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useMediaQueryLayout } from '@/lib/hooks/useMediaQueryLayout';
import { FrameViewport } from './FrameViewport';
import styles from './InsightAnim.module.scss';

const B = '/nextrail_casestudy/insights/collage';

type Shot = {
  src: string;
  left: number; // % — left edge
  top: number; // % — top edge (may be negative; it's clipped + faded)
  h: number; // % of the frame height
  rot: number; // resting tilt (hover owns rotation; float only bobs)
  z: number;
  fy: number; // float amplitude, px
  dur: number; // seconds
  delay: number;
};

// Saved at every size, overlapping edge to edge so the frame is covered.
// Order = paint order; `z` only nudges the lower row forward. Two layers: a
// big upper band and a smaller, more tilted foreground row. Hand-placed and
// fixed — nothing random.
const SHOTS: Shot[] = [
  { src: `${B}/beach.jpg`, left: -7, top: -11, h: 88, rot: -4, z: 1, fy: 10, dur: 6.6, delay: 0.0 },
  { src: `${B}/falls.jpg`, left: 22, top: -13, h: 92, rot: 3, z: 1, fy: 12, dur: 8.0, delay: 1.5 },
  { src: `${B}/autumn.jpg`, left: 50, top: -8, h: 80, rot: -3, z: 1, fy: 9, dur: 6.1, delay: 0.6 },
  { src: `${B}/dock.jpg`, left: 80, top: -15, h: 120, rot: -6, z: 2, fy: 13, dur: 8.9, delay: 0.9 },
  { src: `${B}/towers.jpg`, left: -6, top: 40, h: 78, rot: 4, z: 3, fy: 11, dur: 7.3, delay: 2.0 },
  { src: `${B}/travelers.jpg`, left: 26, top: 46, h: 64, rot: 5, z: 4, fy: 8, dur: 5.4, delay: 1.1 },
  { src: `${B}/road.jpg`, left: 52, top: 41, h: 72, rot: -5, z: 3, fy: 14, dur: 7.7, delay: 2.4 },
  { src: `${B}/lake.jpg`, left: 71, top: 47, h: 60, rot: 7, z: 4, fy: 10, dur: 6.4, delay: 0.4 },
];

/**
 * ANIMATION 02 — ACCUMULATION. Travel photos saved at every size, scattered
 * and overlapping until they cover the frame, each bobbing on its own gentle
 * float. The headline is knocked through the pile with a luminosity blend so
 * it takes its colour from whatever it's lying on. The whole block feathers
 * away on all four edges. Saved for later; lost forever.
 *
 * Hovering the pile tilts every photo a random touch and lifts it slightly —
 * the saved stuff stirs, but still goes nowhere. Float is vertical-only so
 * hover can own rotation without fighting a tween. Deterministic; no reset.
 */
export function InsightAccumulate() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shotRefs = useRef<(HTMLImageElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const mobile = useMediaQueryLayout('(max-width: 640px)');

  const shots = mobile ? SHOTS.filter((_, i) => i % 3 !== 2).slice(0, 5) : SHOTS;

  useGSAP(
    () => {
      const imgs = shotRefs.current.slice(0, shots.length).filter(Boolean) as HTMLImageElement[];
      const root = rootRef.current;

      imgs.forEach((el, i) => gsap.set(el, { rotation: shots[i].rot, x: 0, y: 0 }));
      if (reduced) return;

      // idle — a gentle vertical bob only; rotation is reserved for hover
      imgs.forEach((el, i) => {
        const s = shots[i];
        gsap.fromTo(
          el,
          { y: -s.fy },
          { y: s.fy, duration: s.dur, delay: s.delay, ease: 'sine.inOut', repeat: -1, yoyo: true },
        );
      });

      if (!root) return;

      const enter = () => {
        imgs.forEach((el, i) => {
          gsap.to(el, {
            rotation: shots[i].rot + gsap.utils.random(-9, 9),
            scale: 1.035,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto',
            delay: i * 0.02,
          });
        });
      };
      const leave = () => {
        imgs.forEach((el, i) => {
          gsap.to(el, {
            rotation: shots[i].rot,
            scale: 1,
            duration: 0.6,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        });
      };

      root.addEventListener('mouseenter', enter);
      root.addEventListener('mouseleave', leave);
      return () => {
        root.removeEventListener('mouseenter', enter);
        root.removeEventListener('mouseleave', leave);
        gsap.killTweensOf(imgs);
      };
    },
    { scope: rootRef, dependencies: [reduced, mobile] },
  );

  return (
    <FrameViewport variant="collage" sides>
      <div className={styles.collage} ref={rootRef}>
        {shots.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            alt=""
            className={styles.collageShot}
            style={{ left: `${s.left}%`, top: `${s.top}%`, height: `${s.h}%`, zIndex: s.z }}
            loading="lazy"
            decoding="async"
            draggable={false}
            ref={(el) => {
              shotRefs.current[i] = el;
            }}
          />
        ))}

        <p className={styles.collageText}>
          Saved for later.
          <br />
          Lost forever.
        </p>
      </div>
    </FrameViewport>
  );
}

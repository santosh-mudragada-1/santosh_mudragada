'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useMediaQueryLayout } from '@/lib/hooks/useMediaQueryLayout';
import { FrameViewport } from './FrameViewport';
import styles from './InsightAnim.module.scss';

const B = '/nextrail_casestudy/insights/collage';
const MAP = '/nextrail_casestudy/worldmap-2.png';

type Shot = {
  src: string;
  left: number; // %
  top: number; // %
  h: number; // % of frame height
  rot: number; // resting tilt (hover owns rotation; float only bobs)
  fy: number; // float amplitude, px
  dur: number;
  delay: number;
};

// Twelve saved photos ringing the map, each pushed almost entirely off-frame
// so only a sliver peeks in. First eight = two per side (mobile keeps these);
// last four add the third per side on desktop. The map owns the whole middle.
const SHOTS: Shot[] = [
  { src: `${B}/beach.jpg`, left: -34, top: -34, h: 50, rot: -5, fy: 7, dur: 6.4, delay: 0.0 }, // top-left
  { src: `${B}/autumn.jpg`, left: 66, top: -35, h: 50, rot: 6, fy: 6, dur: 6.1, delay: 0.5 }, // top-right
  { src: `${B}/street.jpg`, left: 90, top: 2, h: 50, rot: -5, fy: 8, dur: 7.1, delay: 1.6 }, // right upper
  { src: `${B}/dock.jpg`, left: 91, top: 60, h: 62, rot: -4, fy: 9, dur: 8.2, delay: 1.9 }, // right lower
  { src: `${B}/road.jpg`, left: 64, top: 88, h: 48, rot: 5, fy: 8, dur: 6.9, delay: 0.8 }, // bottom-right
  { src: `${B}/shore.jpg`, left: -32, top: 86, h: 48, rot: 5, fy: 9, dur: 7.4, delay: 0.3 }, // bottom-left
  { src: `${B}/towers.jpg`, left: -40, top: 34, h: 52, rot: -3, fy: 7, dur: 6.6, delay: 1.1 }, // left lower
  { src: `${B}/aerial.jpg`, left: -38, top: 2, h: 50, rot: 4, fy: 8, dur: 7.7, delay: 2.0 }, // left upper
  { src: `${B}/falls.jpg`, left: 34, top: -40, h: 46, rot: 3, fy: 7, dur: 7.5, delay: 1.3 }, // top centre
  { src: `${B}/sunset.jpg`, left: 90, top: 32, h: 52, rot: 4, fy: 8, dur: 6.8, delay: 0.6 }, // right mid
  { src: `${B}/travelers.jpg`, left: 34, top: 90, h: 46, rot: -4, fy: 6, dur: 5.6, delay: 2.4 }, // bottom centre
  { src: `${B}/lake.jpg`, left: -38, top: 66, h: 50, rot: 6, fy: 9, dur: 7.9, delay: 1.5 }, // left lower-2
];

/**
 * ANIMATION 03 — RESET. A full-bleed map sits behind everything — the planning
 * surface, with nothing plotted on it. Across it, on every side, sit the
 * travel photos you already saved, drifting gently. Nothing connects the two.
 * You have the inspiration; planning still begins from a blank map.
 *
 * Hover tilts each photo a random touch and zooms the map — the pieces stir,
 * the surface shifts, and they still never meet. No markers, no pins.
 */
export function InsightConnect() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const shotRefs = useRef<(HTMLImageElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const mobile = useMediaQueryLayout('(max-width: 640px)');

  const shots = mobile ? SHOTS.slice(0, 8) : SHOTS;

  useGSAP(
    () => {
      const imgs = shotRefs.current.slice(0, shots.length).filter(Boolean) as HTMLImageElement[];
      const root = rootRef.current;

      imgs.forEach((el, i) => gsap.set(el, { rotation: shots[i].rot }));
      if (reduced) return;

      // idle — a gentle vertical bob; the map stays still
      imgs.forEach((el, i) => {
        const s = shots[i];
        gsap.fromTo(
          el,
          { y: -s.fy },
          { y: s.fy, duration: s.dur, delay: s.delay, ease: 'sine.inOut', repeat: -1, yoyo: true },
        );
      });

      if (!root) return;

      // hover — a small stir, nothing dramatic: photos drift a few px and
      // tilt a couple of degrees (float owns `y`, so hover uses `x`); the map
      // eases in a hair.
      const enter = () => {
        gsap.to(mapRef.current, { scale: 1.035, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
        imgs.forEach((el, i) => {
          gsap.to(el, {
            x: gsap.utils.random(-6, 6),
            rotation: shots[i].rot + gsap.utils.random(-4, 4),
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto',
            delay: i * 0.015,
          });
        });
      };
      const leave = () => {
        gsap.to(mapRef.current, { scale: 1, duration: 0.9, ease: 'power2.out', overwrite: 'auto' });
        imgs.forEach((el, i) => {
          gsap.to(el, {
            x: 0,
            rotation: shots[i].rot,
            duration: 0.7,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      };

      root.addEventListener('mouseenter', enter);
      root.addEventListener('mouseleave', leave);
      return () => {
        root.removeEventListener('mouseenter', enter);
        root.removeEventListener('mouseleave', leave);
        gsap.killTweensOf([...imgs, mapRef.current]);
      };
    },
    { scope: rootRef, dependencies: [reduced, mobile] },
  );

  return (
    <FrameViewport variant="collage" sides>
      <div className={styles.mapScene} ref={rootRef}>
        <div className={styles.mapStage} ref={mapRef}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.mapImg} src={MAP} alt="" />
        </div>

        {shots.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            alt=""
            className={styles.collageShot}
            style={{ left: `${s.left}%`, top: `${s.top}%`, height: `${s.h}%`, zIndex: 1 }}
            loading="lazy"
            decoding="async"
            draggable={false}
            ref={(el) => {
              shotRefs.current[i] = el;
            }}
          />
        ))}
      </div>
    </FrameViewport>
  );
}

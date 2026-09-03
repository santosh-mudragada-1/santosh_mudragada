'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useMediaQueryLayout } from '@/lib/hooks/useMediaQueryLayout';
import { Card } from './Card';
import { FrameViewport } from './FrameViewport';
import styles from './InsightAnim.module.scss';

const W = 560;
const H = 280;
const CW = 60;
const CH = 44;
const DEST = { x: 372, y: 150 }; // the destination point — right of centre

const START_X = -CW - 70;
const END_X = W + 70;
const SPAN = END_X - START_X;

type Lane = {
  y: number; // entry height; the first and last sit inside the gradient bands
  drift: number; // gentle vertical drift across the whole pass
  dur: number; // seconds edge-to-edge — hand-picked, non-harmonic
  scale: number;
  rot: number;
  variant: 'media' | 'lines' | 'pin';
  connect: boolean; // does it briefly reach toward DEST as it passes
  offset: number; // starting phase within its own loop, so the frame is full on load
};

const LANES: Lane[] = [
  { y: -14, drift: 20, dur: 15, scale: 0.9, rot: -3, variant: 'media', connect: false, offset: 0.62 },
  { y: 42, drift: -14, dur: 19, scale: 1.03, rot: 2, variant: 'pin', connect: true, offset: 0.14 },
  { y: 96, drift: 14, dur: 13, scale: 0.86, rot: -2, variant: 'lines', connect: false, offset: 0.45 },
  { y: 140, drift: -10, dur: 17, scale: 1.0, rot: 3, variant: 'media', connect: true, offset: 0.8 },
  { y: 192, drift: 12, dur: 14.5, scale: 0.95, rot: -3, variant: 'lines', connect: false, offset: 0.28 },
  { y: 240, drift: -18, dur: 21, scale: 1.05, rot: 1, variant: 'pin', connect: true, offset: 0.53 },
  { y: 290, drift: -22, dur: 12, scale: 0.9, rot: -1, variant: 'media', connect: false, offset: 0.07 },
];

const GAP = 2.6; // calm beat before a lane sends its next card

/**
 * ANIMATION 01 — FLOW. A continuous stream of content cards drifts across an
 * invisible viewport at a steady, unhurried pace: reels, posts and places
 * entering from beyond one edge and leaving past the other, never stopping.
 * A subtle orange destination point sits right of centre; a few cards briefly
 * reach a thread toward it as they pass, most don't. Inspiration is already
 * happening — from everywhere — before any planning begins, and it never ends.
 *
 * Each lane runs its own infinite timeline: a single constant-velocity glide
 * (no easing hitches), its own speed, and its own starting phase, so the
 * stream is full from the first frame and never visibly loops.
 */
export function InsightFlow() {
  const rootRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<(SVGGElement | null)[]>([]);
  const linkRefs = useRef<(SVGLineElement | null)[]>([]);
  const ringRef = useRef<SVGCircleElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const reduced = usePrefersReducedMotion();
  const desktop = useMediaQueryLayout('(min-width: 1024px)');
  const tablet = useMediaQueryLayout('(min-width: 640px)');

  const count = desktop ? LANES.length : tablet ? 6 : 4;

  useGSAP(
    () => {
      const lanes = LANES.slice(0, count);
      const cards = cardRefs.current.slice(0, count);
      const links = linkRefs.current.slice(0, count);
      if (cards.some((c) => !c)) return;

      const isEdge = (lane: Lane) => lane.y < 2 || lane.y > H - 14;

      if (reduced) {
        cards.forEach((el, i) => {
          const lane = lanes[i];
          const t = (i + 0.5) / count;
          gsap.set(el, {
            x: START_X + SPAN * (0.16 + 0.66 * t),
            y: lane.y + lane.drift * t,
            scale: lane.scale,
            rotation: lane.rot,
            opacity: isEdge(lane) ? 0.45 : 0.9,
            transformOrigin: '50% 50%',
          });
        });
        links.forEach((l) => l && gsap.set(l, { opacity: 0 }));
        gsap.set([ringRef.current, pulseRef.current], { opacity: 0 });
        return;
      }

      // ambient breathing ring at the destination — slow, restrained
      gsap.fromTo(
        ringRef.current,
        { scale: 0.85, opacity: 0.32, transformOrigin: '50% 50%' },
        { scale: 2.4, opacity: 0, duration: 4, ease: 'sine.out', repeat: -1 },
      );
      gsap.set(pulseRef.current, { opacity: 0 });

      cards.forEach((el, i) => {
        const lane = lanes[i];
        const link = links[i];
        const edge = isEdge(lane);
        const y0 = lane.y;
        const y1 = lane.y + lane.drift;
        // moment the card centre lines up with the destination
        const tPass = ((DEST.x - CW / 2 - START_X) / SPAN) * lane.dur;

        const tl = gsap.timeline({
          repeat: -1,
          onUpdate:
            lane.connect && link
              ? () => {
                  const lt = tl.time();
                  if (lt < tPass - 1 || lt > tPass + 1.4) return;
                  link.setAttribute('x1', String((gsap.getProperty(el, 'x') as number) + CW / 2));
                  link.setAttribute('y1', String((gsap.getProperty(el, 'y') as number) + CH / 2));
                }
              : undefined,
        });

        tl.set(el, {
          x: START_X,
          y: y0,
          scale: lane.scale,
          rotation: lane.rot,
          opacity: 0,
          transformOrigin: '50% 50%',
        })
          // one continuous, constant-velocity glide — nothing to stutter
          .to(el, { x: END_X, y: y1, duration: lane.dur, ease: 'none' }, 0)
          // fades touch opacity only, never the motion
          .to(el, { opacity: edge ? 0.5 : 0.92, duration: lane.dur * 0.16, ease: 'sine.inOut' }, 0)
          .to(el, { opacity: 0, duration: lane.dur * 0.18, ease: 'sine.inOut' }, lane.dur * 0.82)
          .to({}, { duration: GAP });

        if (lane.connect && link) {
          gsap.set(link, { attr: { x2: DEST.x, y2: DEST.y }, opacity: 0 });
          tl.to(link, { opacity: 0.5, duration: 0.7, ease: 'sine.inOut' }, tPass - 0.8)
            .to(link, { opacity: 0, duration: 0.9, ease: 'sine.inOut' }, tPass + 0.15)
            .fromTo(
              pulseRef.current,
              { scale: 0.85, opacity: 0.5, transformOrigin: '50% 50%' },
              { scale: 2, opacity: 0, duration: 1.2, ease: 'sine.out', overwrite: true },
              tPass - 0.1,
            );
        }

        // one-time phase offset — a clean seek, no repeatRefresh
        tl.progress(lane.offset);
      });
    },
    { scope: rootRef, dependencies: [reduced, desktop, tablet] },
  );

  return (
    <FrameViewport>
      <svg
        ref={rootRef}
        className={styles.canvas}
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden
        focusable="false"
      >
        {LANES.slice(0, count).map((lane, i) => (
          <Card
            key={`c-${i}`}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            variant={lane.variant}
            withDot={lane.connect}
            w={CW}
            h={CH}
          />
        ))}

        {LANES.slice(0, count).map((_, i) => (
          <line
            key={`lnk-${i}`}
            ref={(el) => {
              linkRefs.current[i] = el;
            }}
            className={styles.intentTrail}
            opacity={0}
          />
        ))}

        <circle cx={DEST.x} cy={DEST.y} r={15} className={styles.markerRing} />
        <circle ref={ringRef} cx={DEST.x} cy={DEST.y} r={5} className={styles.dotRing} />
        <circle ref={pulseRef} cx={DEST.x} cy={DEST.y} r={5} className={styles.dotRing} />
        <circle cx={DEST.x} cy={DEST.y} r={4.5} className={styles.dot} />
      </svg>
    </FrameViewport>
  );
}

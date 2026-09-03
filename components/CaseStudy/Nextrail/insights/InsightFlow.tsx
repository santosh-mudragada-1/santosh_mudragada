'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { Card } from './Card';
import { FrameViewport } from './FrameViewport';
import styles from './InsightAnim.module.scss';

const W = 560;
const H = 280;
const CW = 60;
const CH = 44;
const DEST = { x: 372, y: 150 }; // the destination point — right of centre

type Lane = {
  y: number; // entry height; a couple sit inside the top / bottom fade
  drift: number; // vertical drift across the whole pass
  dur: number; // seconds edge-to-edge — hand-picked, non-harmonic
  scale: number;
  rot: number;
  variant: 'media' | 'lines' | 'pin';
  connect: boolean; // does it briefly reach toward DEST as it passes
};

// Seven lanes spread top-to-bottom; the first and last bleed into the gradient
// bands. Only some reach toward the destination — the stream never converges.
const LANES: Lane[] = [
  { y: -16, drift: 24, dur: 12.5, scale: 0.9, rot: -3, variant: 'media', connect: false },
  { y: 40, drift: -18, dur: 15.5, scale: 1.04, rot: 2, variant: 'pin', connect: true },
  { y: 96, drift: 16, dur: 10.5, scale: 0.86, rot: -2, variant: 'lines', connect: false },
  { y: 140, drift: -12, dur: 13.5, scale: 1.0, rot: 3, variant: 'media', connect: true },
  { y: 192, drift: 14, dur: 11.5, scale: 0.96, rot: -4, variant: 'lines', connect: false },
  { y: 238, drift: -22, dur: 16.5, scale: 1.06, rot: 1, variant: 'pin', connect: true },
  { y: 290, drift: -26, dur: 9.5, scale: 0.9, rot: -1, variant: 'media', connect: false },
];

/**
 * ANIMATION 01 — FLOW. A continuous stream of content cards drifts across an
 * invisible viewport: reels, posts and places entering from beyond one edge
 * and leaving past the other, never stopping. A subtle orange destination
 * point sits right of centre; some cards briefly reach toward it as they
 * pass, most don't. Inspiration is already happening — from everywhere —
 * before any planning begins, and the feed never ends.
 *
 * Each lane runs its OWN infinite timeline (its own speed, phase and pause),
 * so there is never a frame where everything is back at the start — no
 * visible loop.
 */
export function InsightFlow() {
  const rootRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<(SVGGElement | null)[]>([]);
  const linkRefs = useRef<(SVGLineElement | null)[]>([]);
  const ringRef = useRef<SVGCircleElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const reduced = usePrefersReducedMotion();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const tablet = useMediaQuery('(min-width: 640px)');

  const count = desktop ? LANES.length : tablet ? 6 : 4;
  const lanes = LANES.slice(0, count);

  useGSAP(
    () => {
      const cards = cardRefs.current.slice(0, count);
      const links = linkRefs.current.slice(0, count);
      if (cards.some((c) => !c)) return;

      const startX = -CW - 60;
      const endX = W + 60;

      if (reduced) {
        cards.forEach((el, i) => {
          const lane = lanes[i];
          const t = (i + 0.5) / count;
          const edge = lane.y < 4 || lane.y > H - 16;
          gsap.set(el, {
            x: gsap.utils.interpolate(20, W - CW - 20, t),
            y: lane.y + lane.drift * t,
            scale: lane.scale,
            rotation: lane.rot,
            opacity: edge ? 0.5 : 0.9,
            transformOrigin: '50% 50%',
          });
        });
        links.forEach((l) => l && gsap.set(l, { opacity: 0 }));
        gsap.set(ringRef.current, { opacity: 0 });
        gsap.set(dotRef.current, { opacity: 1 });
        return;
      }

      // ambient pulse at the destination — slow, restrained
      gsap.fromTo(
        ringRef.current,
        { scale: 1, opacity: 0.4, transformOrigin: '50% 50%' },
        { scale: 2.6, opacity: 0, duration: 3.6, repeat: -1, ease: 'sine.out' },
      );

      cards.forEach((el, i) => {
        const lane = lanes[i];
        const link = links[i];
        const edge = lane.y < 4 || lane.y > H - 16;
        const yAt = (x: number) =>
          lane.y + lane.drift * gsap.utils.mapRange(startX, endX, 0, 1, x);

        // three unhurried segments: glide in, ease past the point, glide out
        const d1 = lane.dur * 0.42;
        const d2 = lane.dur * 0.12;
        const d3 = lane.dur * 0.46;
        const linkX = DEST.x - CW - 16; // where the card sits when it reaches
        const passX = DEST.x - CW / 2;

        const tl = gsap.timeline({ repeat: -1, repeatRefresh: true });

        tl.set(el, {
          x: startX,
          y: yAt(startX),
          scale: lane.scale,
          rotation: lane.rot,
          opacity: 0,
          transformOrigin: '50% 50%',
        })
          .to(el, { opacity: edge ? 0.5 : 0.92, duration: d1 * 0.42, ease: 'sine.out' }, 0)
          .to(el, { x: linkX, y: yAt(linkX), duration: d1, ease: 'none' }, 0)
          .to(el, { x: passX, y: yAt(passX), duration: d2, ease: 'sine.inOut' }, d1)
          .to(el, { x: endX, y: yAt(endX), duration: d3, ease: 'none' }, d1 + d2)
          .to(el, { opacity: 0, duration: d3 * 0.5, ease: 'sine.in' }, d1 + d2 + d3 * 0.5);

        if (lane.connect && link) {
          const cx = linkX + CW / 2;
          const cy = yAt(linkX) + CH / 2;
          gsap.set(link, {
            attr: { x1: cx, y1: cy, x2: DEST.x, y2: DEST.y },
            opacity: 0,
          });
          tl.to(link, { opacity: 0.55, duration: 0.45, ease: 'sine.out' }, d1 - 0.2)
            .to(link, { opacity: 0, duration: 0.75, ease: 'sine.in' }, d1 + 0.4)
            .to(
              dotRef.current,
              {
                scale: 1.5,
                duration: 0.3,
                transformOrigin: '50% 50%',
                ease: 'sine.out',
                overwrite: 'auto',
              },
              d1 - 0.05,
            )
            .to(dotRef.current, { scale: 1, duration: 0.55, ease: 'sine.inOut' }, d1 + 0.25);
        }

        // an occasional pause between passes, fresh each cycle
        tl.to({}, { duration: () => gsap.utils.random(0.6, 2.6) });

        // desync: start each lane at a different point in its own cycle
        tl.time(((i + 1) / (count + 1)) * lane.dur);
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
        {lanes.map((lane, i) => (
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

        {lanes.map((_, i) => (
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
        <circle ref={dotRef} cx={DEST.x} cy={DEST.y} r={4.5} className={styles.dot} />
      </svg>
    </FrameViewport>
  );
}

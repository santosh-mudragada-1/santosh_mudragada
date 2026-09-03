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

type Slot = {
  x: number;
  y: number;
  r: number;
  revisit?: boolean; // lifts forward once, holds, nothing happens, sinks back
  far?: boolean; // drifts further as it ages
};

// A loose central cluster — hand-placed so it reads as a considered pile, not
// a grid. Two cards get a "revisit" beat; a couple drift wider as they age.
const SLOTS: Slot[] = [
  { x: 250, y: 114, r: -8 },
  { x: 288, y: 130, r: 6, revisit: true },
  { x: 232, y: 150, r: -14, far: true },
  { x: 302, y: 148, r: 11 },
  { x: 262, y: 172, r: -4, revisit: true },
  { x: 292, y: 102, r: 15, far: true },
  { x: 244, y: 190, r: -11 },
];

const V: Array<'media' | 'lines' | 'pin'> = [
  'media',
  'lines',
  'pin',
  'media',
  'lines',
  'pin',
  'media',
];

function randomEdge() {
  const s = Math.floor(gsap.utils.random(0, 4));
  const along = gsap.utils.random(0.12, 0.88);
  if (s === 0) return { x: -CW - gsap.utils.random(14, 80), y: along * H };
  if (s === 1) return { x: W + gsap.utils.random(14, 80), y: along * H };
  if (s === 2) return { x: 60 + along * (W - 200), y: -CH - gsap.utils.random(14, 70) };
  return { x: 60 + along * (W - 200), y: H + gsap.utils.random(14, 70) };
}

/**
 * ANIMATION 02 — ACCUMULATION. Cards keep arriving from every edge and settle
 * into a loose central pile: saved, briefly organised. Then attention moves
 * on — the card bodies fade back while their orange save-markers stay lit
 * (the intent to return outlives the content), the pile drifts and tilts, and
 * each card eventually recycles in again from a fresh edge. Now and then one
 * card is revisited: it lifts forward, holds, and nothing happens — it sinks
 * back into the pile.
 *
 * Each card runs its own long, phase-shifted loop, so the pile is always
 * part-built and always churning — it rebuilds itself continuously with no
 * single reset frame.
 */
export function InsightAccumulate() {
  const rootRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<(SVGGElement | null)[]>([]);
  const bodyRefs = useRef<(SVGGElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const tablet = useMediaQuery('(min-width: 640px)');

  const count = desktop ? SLOTS.length : tablet ? 5 : 4;
  const slots = SLOTS.slice(0, count);

  useGSAP(
    () => {
      const cards = cardRefs.current.slice(0, count);
      const bodies = bodyRefs.current.slice(0, count);
      const dots = dotRefs.current.slice(0, count);
      if (cards.some((c) => !c)) return;

      if (reduced) {
        cards.forEach((el, i) => {
          const s = slots[i];
          gsap.set(el, {
            x: s.x,
            y: s.y,
            rotation: s.r,
            scale: s.revisit ? 1.06 : 1,
            opacity: 1,
            transformOrigin: '50% 50%',
          });
          gsap.set(bodies[i], { opacity: i % 3 === 2 ? 0.24 : 1 });
          gsap.set(dots[i], { opacity: 0.9 });
        });
        return;
      }

      cards.forEach((el, i) => {
        const s = slots[i];
        const body = bodies[i];
        const dot = dots[i];
        const spawn = { x: 0, y: 0 };
        const jig = () => gsap.utils.random(-9, 9);
        const farK = s.far ? 1 : 0.4;

        const tl = gsap.timeline({ repeat: -1, repeatRefresh: true });

        tl.set(el, { opacity: 0, scale: 0.9, transformOrigin: '50% 50%' })
          .set(body, { opacity: 1 })
          .set(dot, { opacity: 0.9 })
          .call(() => Object.assign(spawn, randomEdge()))
          .set(el, {
            x: () => spawn.x,
            y: () => spawn.y,
            rotation: () => s.r * 0.4 + jig(),
          })
          // ARRIVE — slide in from the edge, settle into a slot
          .to(el, { opacity: 1, duration: 0.55, ease: 'sine.out' })
          .to(
            el,
            {
              x: () => s.x + jig(),
              y: () => s.y + jig(),
              rotation: () => s.r + gsap.utils.random(-4, 4),
              scale: 1,
              duration: 2.6,
              ease: 'power2.out',
            },
            '<',
          )
          // SAVED — sits in the pile, organised
          .to({}, { duration: () => gsap.utils.random(1.6, 3.4) });

        if (s.revisit) {
          tl.to(el, { scale: 1.09, x: '-=5', y: '-=12', duration: 0.85, ease: 'power2.out' })
            .to({}, { duration: 0.8 })
            // nothing happens — back to the pile
            .to(el, { scale: 1, x: '+=5', y: '+=12', duration: 1.1, ease: 'power2.inOut' });
        }

        // AGE — body dims, the marker stays lit, the pile drifts and tilts
        tl.to(body, { opacity: 0.22, duration: 2.4, ease: 'sine.inOut' }, s.revisit ? '+=0.3' : '+=0.2')
          .to(
            el,
            {
              x: () => '+=' + gsap.utils.random(-24, 30) * farK,
              y: () => '+=' + gsap.utils.random(-12, 28) * farK,
              rotation: () => '+=' + gsap.utils.random(-12, 12),
              duration: 3.2,
              ease: 'sine.inOut',
            },
            '<',
          )
          .to(dot, { opacity: 0.82, duration: 1 }, '<')
          .to({}, { duration: () => gsap.utils.random(0.6, 2) })
          // RECYCLE — finally the marker fades too and the card leaves
          .to(dot, { opacity: 0, duration: 0.9, ease: 'sine.in' })
          .to([body, el], { opacity: 0, duration: 0.7, ease: 'sine.in' }, '<0.15')
          .to({}, { duration: () => gsap.utils.random(0.4, 1.6) });

        // desync every card's phase
        tl.time(gsap.utils.random(0, 9 + i * 3));
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
        {slots.map((_, i) => (
          <Card
            key={`c-${i}`}
            variant={V[i]}
            withDot
            halo
            w={CW}
            h={CH}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            bodyRef={(el) => {
              bodyRefs.current[i] = el;
            }}
            dotRef={(el) => {
              dotRefs.current[i] = el;
            }}
          />
        ))}
      </svg>
    </FrameViewport>
  );
}

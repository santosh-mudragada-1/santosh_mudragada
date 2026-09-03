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

type Beat = {
  enter: { x: number; y: number }; // fixed off-frame origin (some via the gradient bands)
  slot: { x: number; y: number; r: number }; // resting place in the pile
  age: { x: number; y: number; r: number }; // drift applied as it ages
  dur: { in: number; hold: number; age: number; linger: number; gap: number };
  revisit?: boolean; // lifts forward once, holds, nothing happens, sinks back
  dims?: boolean; // ages to a fainter state — "visible but inactive"
  off: number; // starting phase within its own loop
};

// Every value hand-tuned and fixed — no per-cycle randomness, so nothing can
// pop. Variety comes from seven distinct periods drifting out of phase.
const BEATS: Beat[] = [
  { enter: { x: -104, y: 92 }, slot: { x: 248, y: 110, r: -8 }, age: { x: -24, y: 10, r: -10 }, dur: { in: 2.8, hold: 3.2, age: 3.8, linger: 1.4, gap: 2.0 }, off: 0.08 },
  { enter: { x: 652, y: 82 }, slot: { x: 292, y: 126, r: 7 }, age: { x: 22, y: 16, r: 9 }, dur: { in: 3.0, hold: 2.4, age: 4.2, linger: 1.0, gap: 1.6 }, revisit: true, off: 0.52 },
  { enter: { x: 236, y: 352 }, slot: { x: 230, y: 150, r: -14 }, age: { x: -30, y: 18, r: -12 }, dur: { in: 3.2, hold: 2.8, age: 3.6, linger: 1.8, gap: 1.4 }, dims: true, off: 0.3 },
  { enter: { x: -116, y: 168 }, slot: { x: 304, y: 146, r: 11 }, age: { x: 26, y: 12, r: 10 }, dur: { in: 2.6, hold: 3.6, age: 4.0, linger: 1.2, gap: 2.2 }, off: 0.74 },
  { enter: { x: 300, y: -72 }, slot: { x: 262, y: 172, r: -4 }, age: { x: -14, y: 22, r: -8 }, dur: { in: 3.4, hold: 2.2, age: 3.8, linger: 1.6, gap: 1.8 }, revisit: true, off: 0.18 },
  { enter: { x: 640, y: 206 }, slot: { x: 286, y: 102, r: 15 }, age: { x: 30, y: -14, r: 13 }, dur: { in: 2.9, hold: 3.0, age: 4.4, linger: 1.0, gap: 1.5 }, dims: true, off: 0.62 },
  { enter: { x: 198, y: 346 }, slot: { x: 244, y: 190, r: -11 }, age: { x: -20, y: 20, r: -10 }, dur: { in: 3.1, hold: 2.6, age: 3.4, linger: 1.4, gap: 2.0 }, off: 0.4 },
];

const V: Array<'media' | 'lines' | 'pin'> = ['media', 'lines', 'pin', 'media', 'lines', 'pin', 'media'];

/**
 * ANIMATION 02 — ACCUMULATION. Cards arrive from every edge and settle into a
 * loose central pile: saved, briefly organised. Then attention moves on — the
 * card body fades back while its orange save-marker stays lit (the intent to
 * return outlives the content), the card drifts and tilts, and eventually
 * recycles in again from a fresh edge. Now and then one card is revisited: it
 * lifts forward, holds, nothing happens, and it sinks back.
 *
 * Seven fully deterministic loops with different periods and phases, so the
 * pile is always part-built and always churning — it rebuilds itself with no
 * single reset frame and nothing to stutter.
 */
export function InsightAccumulate() {
  const rootRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<(SVGGElement | null)[]>([]);
  const bodyRefs = useRef<(SVGGElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const desktop = useMediaQueryLayout('(min-width: 1024px)');
  const tablet = useMediaQueryLayout('(min-width: 640px)');

  const count = desktop ? BEATS.length : tablet ? 5 : 4;

  useGSAP(
    () => {
      const beats = BEATS.slice(0, count);
      const cards = cardRefs.current.slice(0, count);
      const bodies = bodyRefs.current.slice(0, count);
      const dots = dotRefs.current.slice(0, count);
      if (cards.some((c) => !c)) return;

      if (reduced) {
        cards.forEach((el, i) => {
          const b = beats[i];
          gsap.set(el, {
            x: b.slot.x,
            y: b.slot.y,
            rotation: b.slot.r,
            scale: b.revisit ? 1.06 : 1,
            opacity: 1,
            transformOrigin: '50% 50%',
          });
          gsap.set(bodies[i], { opacity: b.dims ? 0.16 : 1 });
          gsap.set(dots[i], { opacity: 0.9 });
        });
        return;
      }

      cards.forEach((el, i) => {
        const b = beats[i];
        const body = bodies[i];
        const dot = dots[i];
        const p = b.dur;

        const tl = gsap.timeline({ repeat: -1 });

        tl.set(el, {
          x: b.enter.x,
          y: b.enter.y,
          rotation: b.slot.r * 0.5,
          scale: 0.92,
          opacity: 0,
          transformOrigin: '50% 50%',
        })
          .set(body, { opacity: 1 })
          .set(dot, { opacity: 0.9 })
          // ARRIVE — one smooth glide in from the edge, settle into the slot
          .to(el, { opacity: 1, duration: Math.min(0.9, p.in * 0.45), ease: 'sine.out' }, 0)
          .to(
            el,
            {
              x: b.slot.x,
              y: b.slot.y,
              rotation: b.slot.r,
              scale: 1,
              duration: p.in,
              ease: 'power2.out',
            },
            0,
          )
          // SAVED — sits in the pile, organised
          .to({}, { duration: p.hold });

        if (b.revisit) {
          tl.to(el, { x: b.slot.x - 5, y: b.slot.y - 13, scale: 1.07, duration: 1.0, ease: 'power2.out' })
            .to({}, { duration: 0.9 })
            // nothing happens — sinks back into the pile
            .to(el, { x: b.slot.x, y: b.slot.y, scale: 1, duration: 1.3, ease: 'power2.inOut' });
        }

        // AGE — one calm move; the body dims, the marker stays lit
        tl.to(
          el,
          {
            x: b.slot.x + b.age.x,
            y: b.slot.y + b.age.y,
            rotation: b.slot.r + b.age.r,
            duration: p.age,
            ease: 'sine.inOut',
          },
          '>0.25',
        )
          .to(body, { opacity: b.dims ? 0.14 : 0.3, duration: p.age * 0.8, ease: 'sine.inOut' }, '<')
          .to({}, { duration: p.linger })
          // RECYCLE — the marker fades last, then the whole card eases away
          .to(dot, { opacity: 0, duration: 1.1, ease: 'sine.inOut' })
          .to(el, { opacity: 0, duration: 1.0, ease: 'sine.inOut' }, '<0.25')
          .to({}, { duration: p.gap });

        // one-time phase offset — a clean seek, no repeatRefresh
        tl.progress(b.off);
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
        {BEATS.slice(0, count).map((_, i) => (
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

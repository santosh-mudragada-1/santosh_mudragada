'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Card } from './Card';
import styles from './InsightAnim.module.scss';

const W = 520;
const H = 300;
const EMPTY = { x: 452, y: 74 }; // the destination that's never reached

// Loosely fanned "neat stack" — small, hand-placed offsets and rotations so
// it reads as a considered pile, not a grid.
const STACK = [
  { x: 132, y: 158, r: -9 },
  { x: 150, y: 168, r: 5 },
  { x: 118, y: 182, r: -15 },
  { x: 166, y: 150, r: 11 },
  { x: 140, y: 194, r: -3 },
  { x: 156, y: 176, r: 17 },
];

// Scattered / disconnected — spread wide, still weighted left-of-centre so
// the empty marker at top-right stays visually reachable-but-untouched.
const SCATTER = [
  { x: 60, y: 84, r: -20 },
  { x: 226, y: 54, r: 24 },
  { x: 44, y: 244, r: -30 },
  { x: 252, y: 224, r: 15 },
  { x: 150, y: 34, r: -12 },
  { x: 296, y: 132, r: 27 },
];

const REVISIT_IDX = 5; // the card that breaks toward EMPTY and turns back

const CARD_IDS = Array.from({ length: STACK.length }, (_, i) => i);

/**
 * ANIMATION 02 — ACCUMULATION. A pile of saved content forms, then slowly
 * comes apart as attention moves on — the orange save-markers stay visible
 * longer than the cards themselves, since the intent to return outlives the
 * content. One card breaks from the pile toward an empty destination
 * marker and turns back before arriving: saved, never acted on.
 *
 * This is one shared timeline (unlike InsightFlow's independent loops)
 * because the "form → scatter → reform" choreography needs every card
 * moving in relation to the others. It stays seamless because the
 * timeline's end state is identical to its start state — SCATTER — so the
 * repeat never visibly jumps.
 */
export function InsightAccumulate() {
  const rootRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<(SVGGElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const cards = cardRefs.current;
      const dots = dotRefs.current;
      if (cards.some((c) => !c)) return;

      if (reduced) {
        cards.forEach((el, i) => {
          gsap.set(el, { x: STACK[i].x, y: STACK[i].y, rotation: STACK[i].r, opacity: 1 });
        });
        dots.forEach((el) => el && gsap.set(el, { opacity: 1 }));
        return;
      }

      gsap.set(cards, {
        x: (i) => SCATTER[i].x,
        y: (i) => SCATTER[i].y,
        rotation: (i) => SCATTER[i].r,
        opacity: 0.55,
        transformOrigin: '50% 50%',
      });
      gsap.set(dots, { opacity: 0.85 });

      const revisitCard = cards[REVISIT_IDX];

      gsap
        .timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } })
        // ACCUMULATE — gather into a neat stack
        .to(cards, {
          x: (i) => STACK[i].x,
          y: (i) => STACK[i].y,
          rotation: (i) => STACK[i].r,
          opacity: 1,
          duration: 1.8,
          stagger: 0.08,
        })
        .to({}, { duration: 1 }) // hold, considered
        // REVISIT — one card breaks toward the empty marker, stops short, returns
        .to(
          revisitCard,
          { x: EMPTY.x - 66, y: EMPTY.y + 34, rotation: 6, duration: 1.1, ease: 'power2.out' },
          '+=0.1',
        )
        .to(revisitCard, {
          x: STACK[REVISIT_IDX].x,
          y: STACK[REVISIT_IDX].y,
          rotation: STACK[REVISIT_IDX].r,
          duration: 1.2,
        })
        // FORGET — the pile comes apart, cards fade more than their markers
        .to(
          cards,
          {
            x: (i) => SCATTER[i].x,
            y: (i) => SCATTER[i].y,
            rotation: (i) => SCATTER[i].r,
            opacity: (i) => (i % 2 ? 0.32 : 0.58),
            duration: 2.2,
            stagger: 0.06,
          },
          '+=0.4',
        )
        .to(dots, { opacity: 0.85, duration: 0.6 }, '<')
        .to({}, { duration: 0.8 });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <svg
      ref={rootRef}
      className={styles.canvas}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      focusable="false"
    >
      <circle cx={EMPTY.x} cy={EMPTY.y} r={10} className={styles.markerRing} />
      {CARD_IDS.map((id, i) => (
        <Card
          key={id}
          withDot
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          dotRef={(el) => {
            dotRefs.current[i] = el;
          }}
        />
      ))}
    </svg>
  );
}

'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Card } from './Card';
import styles from './InsightAnim.module.scss';

const W = 520;
const H = 300;
const DEST = { x: 388, y: 148 };
const CARD_COUNT = 6;

// Scattered spawn points around the edges the cards fly in from — deliberately
// off-centre and uneven, not a tidy ring.
const SPAWNS = [
  { x: 26, y: 46 },
  { x: 118, y: 20 },
  { x: 40, y: 208 },
  { x: 190, y: 268 },
  { x: 330, y: 262 },
  { x: 468, y: 214 },
  { x: 470, y: 58 },
  { x: 22, y: 132 },
];

function randomSpawn() {
  const p = gsap.utils.random(SPAWNS) as { x: number; y: number };
  return { x: p.x + gsap.utils.random(-8, 8), y: p.y + gsap.utils.random(-8, 8) };
}

const CARD_IDS = Array.from({ length: CARD_COUNT }, (_, i) => i);

/**
 * ANIMATION 01 — FLOW. Small content cards drift in from scattered edge
 * points toward a central destination marker, connect with a brief pulse,
 * and dissolve — inspiration continuously arriving from everywhere.
 *
 * Each card runs its OWN independent, endlessly-repeating timeline (its own
 * duration, entry delay, and a freshly randomised spawn point every cycle
 * via repeatRefresh) rather than one shared master timeline. That's what
 * keeps the motion feeling continuous with no visible "reset" — there is
 * never a single moment where every element is simultaneously back at
 * frame one.
 */
export function InsightFlow() {
  const rootRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<(SVGGElement | null)[]>([]);
  const ringRef = useRef<SVGCircleElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const cards = cardRefs.current;

      if (reduced) {
        cards.forEach((el, i) => {
          if (!el) return;
          const spawn = SPAWNS[i % SPAWNS.length];
          const t = (i + 1) / (CARD_COUNT + 1);
          gsap.set(el, {
            x: gsap.utils.interpolate(spawn.x, DEST.x - 17, t),
            y: gsap.utils.interpolate(spawn.y, DEST.y - 12, t),
            opacity: 0.75,
          });
        });
        gsap.set([ringRef.current, pulseRef.current], { opacity: 0 });
        return;
      }

      cards.forEach((el, i) => {
        if (!el) return;
        const dur = gsap.utils.random(2.4, 3.4);
        const spawn = { x: 0, y: 0 };

        gsap
          .timeline({ repeat: -1, delay: i * 0.6, repeatRefresh: true })
          .call(() => Object.assign(spawn, randomSpawn()))
          .set(el, {
            x: () => spawn.x,
            y: () => spawn.y,
            opacity: 0,
            scale: 0.85,
            transformOrigin: '50% 50%',
          })
          .to(el, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' })
          .to(el, { x: DEST.x - 17, y: DEST.y - 12, duration: dur, ease: 'power1.inOut' }, '<')
          .to(el, { opacity: 0, scale: 0.55, duration: 0.4, ease: 'power1.in' }, '-=0.45')
          .call(() =>
            gsap.fromTo(
              pulseRef.current,
              { scale: 1, opacity: 0.9, transformOrigin: '50% 50%' },
              { scale: 2.1, opacity: 0, duration: 0.55, ease: 'power2.out', overwrite: 'auto' },
            ),
          )
          .to({}, { duration: gsap.utils.random(0.6, 1.8) });
      });

      gsap.fromTo(
        ringRef.current,
        { scale: 1, opacity: 0.5, transformOrigin: '50% 50%' },
        { scale: 2.4, opacity: 0, duration: 2.2, repeat: -1, ease: 'power2.out' },
      );
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
      <circle cx={DEST.x} cy={DEST.y} r={16} className={styles.markerRing} />
      <circle ref={ringRef} cx={DEST.x} cy={DEST.y} r={5} className={styles.dotRing} />
      <circle ref={pulseRef} cx={DEST.x} cy={DEST.y} r={5} className={styles.dotRing} />
      <circle cx={DEST.x} cy={DEST.y} r={3.5} className={styles.dot} />
      {CARD_IDS.map((id, i) => (
        <Card
          key={id}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          withDot={i % 2 === 0}
        />
      ))}
    </svg>
  );
}

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
const CW = 58;
const CH = 42;

const START = { x: 366, y: 150 }; // the clean "planning start" — never populated
const INTENT0 = { x: 104, y: 132 }; // where the orange intent marker rests with the pile

// Loose pile of saved inspiration, held left of centre.
const STACK = [
  { x: 40, y: 86, r: -11 },
  { x: 78, y: 104, r: 7 },
  { x: 30, y: 128, r: -16 },
  { x: 82, y: 148, r: 10 },
  { x: 50, y: 168, r: -5 },
];

const V: Array<'media' | 'lines' | 'pin'> = ['media', 'pin', 'lines', 'media', 'pin'];

// Empty planning placeholders that appear on the reset hold and lead nowhere.
const SLOTS = [
  { x: 398, y: 138 },
  { x: 438, y: 138 },
  { x: 478, y: 138 },
];
const SLOT_W = 30;
const SLOT_H = 24;

/**
 * ANIMATION 03 — RESET. The inspiration already exists: a pile of saved
 * places, clips and ideas gathers on the left, carrying the user's orange
 * intent. When it's finally time to plan, the intent moves right toward a
 * clean planning start — but the saved inspiration doesn't come with it. It
 * slips away and fades, never arriving. The planning area stays empty: a bare
 * start point, a few blank slots, a route that leads nowhere. The intent
 * marker travels all the way back to the beginning, another pile builds, and
 * it happens again. You already found everything — and planning still starts
 * from zero.
 *
 * One shared timeline whose end state is identical to its start state, so the
 * loop never visibly jumps.
 */
export function InsightConnect() {
  const rootRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<(SVGGElement | null)[]>([]);
  const bodyRefs = useRef<(SVGGElement | null)[]>([]);
  const intentRef = useRef<SVGCircleElement>(null);
  const startRingRef = useRef<SVGCircleElement>(null);
  const trailRef = useRef<SVGLineElement>(null);
  const slotRefs = useRef<(SVGRectElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const tablet = useMediaQuery('(min-width: 640px)');

  const count = desktop ? STACK.length : tablet ? 4 : 3;
  const stack = STACK.slice(0, count);

  useGSAP(
    () => {
      const cards = cardRefs.current.slice(0, count);
      const bodies = bodyRefs.current.slice(0, count);
      const slots = slotRefs.current.slice(0, SLOTS.length);
      if (cards.some((c) => !c)) return;

      const toStart = { x: START.x - INTENT0.x, y: START.y - INTENT0.y };

      if (reduced) {
        cards.forEach((el, i) => {
          gsap.set(el, {
            x: stack[i].x,
            y: stack[i].y,
            rotation: stack[i].r,
            opacity: 1,
            transformOrigin: '50% 50%',
          });
        });
        gsap.set(intentRef.current, { x: toStart.x * 0.5, y: toStart.y * 0.5, opacity: 1 });
        gsap.set(startRingRef.current, { opacity: 1, scale: 1, transformOrigin: '50% 50%' });
        gsap.set(trailRef.current, { opacity: 0, attr: { x2: START.x } });
        slots.forEach(
          (el) => el && gsap.set(el, { opacity: 1, scale: 1, transformOrigin: '50% 50%' }),
        );
        return;
      }

      const reset = () => {
        gsap.set(cards, {
          x: -CW - 40,
          y: (i) => stack[i].y,
          rotation: (i) => stack[i].r * 0.5,
          opacity: 0,
          transformOrigin: '50% 50%',
        });
        gsap.set(bodies, { opacity: 1 });
        gsap.set(intentRef.current, { x: 0, y: 0, opacity: 0, transformOrigin: '50% 50%' });
        gsap.set(startRingRef.current, { opacity: 1, scale: 1, transformOrigin: '50% 50%' });
        gsap.set(trailRef.current, { opacity: 0, attr: { x2: START.x } });
        gsap.set(slots, { opacity: 0, scale: 0.9, transformOrigin: '50% 50%' });
      };

      reset();

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

      // A — the inspiration is already there: the pile slides in from the left
      tl.to(
        cards,
        {
          x: (i) => stack[i].x,
          y: (i) => stack[i].y,
          rotation: (i) => stack[i].r,
          opacity: 1,
          duration: 1.5,
          stagger: 0.16,
          ease: 'power2.out',
        },
        0,
      )
        .fromTo(intentRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.5)
        // B — it accumulates: a small settle, "I already have all of this"
        .to(
          cards,
          {
            x: (i) => stack[i].x + gsap.utils.random(-4, 4),
            y: (i) => stack[i].y + gsap.utils.random(-3, 5),
            duration: 0.9,
            stagger: 0.05,
          },
          '>-0.1',
        )
        .to({}, { duration: 0.7 })
        .addLabel('plan')
        // C — trying to plan: the intent leaves for the start point, the pile leans after it
        .to(intentRef.current, { x: toStart.x, y: toStart.y, duration: 2.1, ease: 'power1.inOut' }, 'plan')
        .to(cards, { x: '+=32', duration: 1.5, stagger: 0.05, ease: 'power1.in' }, 'plan+=0.35')
        .fromTo(
          trailRef.current,
          { attr: { x2: START.x }, opacity: 0 },
          { attr: { x2: START.x + 46 }, opacity: 1, duration: 1.1, ease: 'power1.out' },
          'plan+=1.05',
        )
        // D — the inspiration is left behind: it drops away and fades, never arriving
        .to(
          cards,
          {
            y: '+=120',
            rotation: (i) => stack[i].r + gsap.utils.random(-18, 18),
            opacity: 0,
            duration: 1.8,
            stagger: 0.09,
            ease: 'power1.in',
          },
          'plan+=1.75',
        )
        .addLabel('empty', 'plan+=2.7')
        // E — the empty reset: the start point pulses, blank slots appear, hold on the emptiness
        .to(startRingRef.current, { scale: 1.45, opacity: 0.95, duration: 0.4, ease: 'sine.out' }, 'empty')
        .to(startRingRef.current, { scale: 1, opacity: 1, duration: 0.7, ease: 'sine.inOut' }, '>')
        .to(slots, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: 'power2.out' }, 'empty+=0.15')
        .to({}, { duration: 1.5 }) // hold — planning is empty; you start from zero
        .addLabel('back')
        // F — the intent goes all the way back; the empty route and slots clear
        .to(trailRef.current, { attr: { x2: START.x }, opacity: 0, duration: 0.6 }, 'back')
        .to(slots, { opacity: 0, scale: 0.9, duration: 0.5, stagger: 0.08 }, 'back')
        .to(intentRef.current, { x: 0, y: 0, duration: 1.9, ease: 'power1.inOut' }, 'back+=0.05')
        .to(intentRef.current, { opacity: 0, duration: 0.4 }, '>-0.05')
        // land exactly on the start state so the repeat is seamless
        .set(cards, {
          x: -CW - 40,
          y: (i) => stack[i].y,
          rotation: (i) => stack[i].r * 0.5,
          opacity: 0,
        })
        .set(bodies, { opacity: 1 })
        .to({}, { duration: 0.6 });
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
        {/* the clean planning start — a faint baseline that never fills */}
        <line x1={340} y1={START.y} x2={528} y2={START.y} className={styles.baseLine} opacity={0.45} />

        {SLOTS.map((s, i) => (
          <rect
            key={`s-${i}`}
            ref={(el) => {
              slotRefs.current[i] = el;
            }}
            x={s.x}
            y={s.y}
            width={SLOT_W}
            height={SLOT_H}
            rx={3}
            className={styles.slotTick}
            opacity={0}
          />
        ))}

        <line
          ref={trailRef}
          x1={START.x}
          y1={START.y}
          x2={START.x}
          y2={START.y}
          className={styles.intentTrail}
          opacity={0}
        />
        <circle ref={startRingRef} cx={START.x} cy={START.y} r={9} className={styles.startRing} />
        <circle cx={START.x} cy={START.y} r={3} className={styles.startDot} />

        {stack.map((_, i) => (
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
          />
        ))}

        <circle ref={intentRef} cx={INTENT0.x} cy={INTENT0.y} r={5} className={styles.intent} />
      </svg>
    </FrameViewport>
  );
}

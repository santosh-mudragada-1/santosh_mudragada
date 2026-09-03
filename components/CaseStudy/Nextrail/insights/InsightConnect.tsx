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
// fixed settle nudge and fall tilt per card — deterministic, nothing to jitter
const JITTER = [
  { x: 3, y: -2 },
  { x: -3, y: 3 },
  { x: 2, y: 4 },
  { x: -2, y: -3 },
  { x: 4, y: 2 },
];
const FALL_ROT = [-15, 13, -21, 11, -7];

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
 * One shared, fully deterministic timeline whose end state is identical to its
 * start state, so the loop never visibly jumps.
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
  const desktop = useMediaQueryLayout('(min-width: 1024px)');
  const tablet = useMediaQueryLayout('(min-width: 640px)');

  const count = desktop ? STACK.length : tablet ? 4 : 3;

  useGSAP(
    () => {
      const stack = STACK.slice(0, count);
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

      const land = () => {
        gsap.set(cards, {
          x: -CW - 44,
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

      land();

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });

      // A — the inspiration is already there: the pile slides in from the left
      tl.to(
        cards,
        {
          x: (i) => stack[i].x,
          y: (i) => stack[i].y,
          rotation: (i) => stack[i].r,
          opacity: 1,
          duration: 1.7,
          stagger: 0.18,
          ease: 'power2.out',
        },
        0,
      )
        .fromTo(intentRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.55)
        // B — it accumulates: a small settle, "I already have all of this"
        .to(
          cards,
          {
            x: (i) => stack[i].x + JITTER[i].x,
            y: (i) => stack[i].y + JITTER[i].y,
            duration: 1.0,
            stagger: 0.06,
          },
          '>-0.15',
        )
        .to({}, { duration: 0.8 })
        .addLabel('plan')
        // C — trying to plan: the intent leaves for the start point, the pile leans after it
        .to(intentRef.current, { x: toStart.x, y: toStart.y, duration: 2.4 }, 'plan')
        .to(cards, { x: '+=30', duration: 1.7, stagger: 0.06, ease: 'power1.inOut' }, 'plan+=0.4')
        .fromTo(
          trailRef.current,
          { attr: { x2: START.x }, opacity: 0 },
          { attr: { x2: START.x + 46 }, opacity: 1, duration: 1.2, ease: 'power1.out' },
          'plan+=1.2',
        )
        // D — the inspiration is left behind: it drops away and fades, never arriving
        .to(
          cards,
          {
            y: '+=120',
            rotation: (i) => stack[i].r + FALL_ROT[i],
            opacity: 0,
            duration: 2.0,
            stagger: 0.1,
            ease: 'power1.in',
          },
          'plan+=1.9',
        )
        .addLabel('empty', 'plan+=3.0')
        // E — the empty reset: the start point pulses, blank slots appear, hold on it
        .to(startRingRef.current, { scale: 1.4, opacity: 0.95, duration: 0.5, ease: 'sine.out' }, 'empty')
        .to(startRingRef.current, { scale: 1, opacity: 1, duration: 0.8 }, '>')
        .to(slots, { opacity: 1, scale: 1, duration: 0.7, stagger: 0.14, ease: 'power2.out' }, 'empty+=0.2')
        .to({}, { duration: 1.9 }) // hold — planning is empty; you start from zero
        .addLabel('back')
        // F — the intent goes all the way back; the empty route and slots clear
        .to(trailRef.current, { attr: { x2: START.x }, opacity: 0, duration: 0.7 }, 'back')
        .to(slots, { opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.09 }, 'back')
        .to(intentRef.current, { x: 0, y: 0, duration: 2.1 }, 'back+=0.1')
        .to(intentRef.current, { opacity: 0, duration: 0.5 }, '>-0.1')
        // land exactly on the start state so the repeat is seamless
        .set(cards, {
          x: -CW - 44,
          y: (i) => stack[i].y,
          rotation: (i) => stack[i].r * 0.5,
          opacity: 0,
        })
        .set(bodies, { opacity: 1 })
        .to({}, { duration: 0.7 });
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

        {STACK.slice(0, count).map((_, i) => (
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

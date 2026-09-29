'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Cursor } from './shared/Cursor';

// 2x2 tile grid; the game flashes a growing pattern, then you tap it back —
// this loop plays one round of "show" followed by one round of "recall".
const ORDER = [0, 2, 3, 1];
const POS = [
  { left: '27%', top: '27%' },
  { left: '73%', top: '27%' },
  { left: '27%', top: '73%' },
  { left: '73%', top: '73%' },
];

export function SequencePreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const tiles = tileRefs.current;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });

      tl.set(tiles, { backgroundColor: 'var(--color-surface-raised)', scale: 1 });

      // Show phase — the pattern flashes.
      ORDER.forEach((idx) => {
        tl.to(tiles[idx], { backgroundColor: 'var(--color-accent-sequence)', scale: 1.08, duration: 0.16 }).to(
          tiles[idx],
          { backgroundColor: 'var(--color-surface-raised)', scale: 1, duration: 0.16 },
          '+=0.1',
        );
      });

      // Recall phase — the cursor taps the same tiles back in order.
      tl.set(cursorRef.current, { ...POS[ORDER[0]], opacity: 0.75 }).to({}, { duration: 0.35 });
      ORDER.forEach((idx, i) => {
        if (i > 0) tl.to(cursorRef.current, { ...POS[idx], duration: 0.22, ease: 'power2.inOut' });
        tl.to(tiles[idx], { backgroundColor: 'var(--color-accent-sequence)', scale: 1.1, duration: 0.12 }).to(
          tiles[idx],
          { scale: 1, duration: 0.12 },
        );
      });

      tl.to(tiles, { backgroundColor: 'var(--color-success)', duration: 0.18, stagger: 0.03 })
        .to(cursorRef.current, { opacity: 0, duration: 0.15 }, '<')
        .to({}, { duration: 0.6 })
        .to(tiles, { backgroundColor: 'var(--color-surface-raised)', duration: 0.25 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative h-full w-full">
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1.5 p-1.5 sm:gap-2 sm:p-2">
        {POS.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
            className="rounded-md bg-white/5"
          />
        ))}
      </div>
      <Cursor ref={cursorRef} />
    </div>
  );
}

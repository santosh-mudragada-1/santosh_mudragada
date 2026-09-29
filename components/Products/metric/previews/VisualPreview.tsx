'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Cursor } from './shared/Cursor';

// 3x3 grid; an "X" pattern lights up, fades, then the cursor taps the same
// cells back from memory.
const PATTERN = [0, 2, 4, 6, 8];
const POS = [
  { left: '16.7%', top: '16.7%' },
  { left: '50%', top: '16.7%' },
  { left: '83.3%', top: '16.7%' },
  { left: '16.7%', top: '50%' },
  { left: '50%', top: '50%' },
  { left: '83.3%', top: '50%' },
  { left: '16.7%', top: '83.3%' },
  { left: '50%', top: '83.3%' },
  { left: '83.3%', top: '83.3%' },
];

export function VisualPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const cells = cellRefs.current;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

      tl.set(cells, { backgroundColor: 'var(--color-surface-raised)' })
        .to(
          PATTERN.map((idx) => cells[idx]),
          { backgroundColor: 'var(--color-accent-visual)', duration: 0.3, stagger: 0.04 },
        )
        .to({}, { duration: 0.6 })
        .to(
          PATTERN.map((idx) => cells[idx]),
          { backgroundColor: 'var(--color-surface-raised)', duration: 0.25, stagger: 0.03 },
        )
        .set(cursorRef.current, { ...POS[PATTERN[0]], opacity: 0.75 })
        .to({}, { duration: 0.3 });

      PATTERN.forEach((idx, i) => {
        if (i > 0) tl.to(cursorRef.current, { ...POS[idx], duration: 0.2, ease: 'power2.inOut' });
        tl.to(cells[idx], { backgroundColor: 'var(--color-success)', scale: 1.06, duration: 0.12 }).to(cells[idx], {
          scale: 1,
          duration: 0.12,
        });
      });

      tl.to(cursorRef.current, { opacity: 0, duration: 0.15 })
        .to({}, { duration: 0.5 })
        .to(
          PATTERN.map((idx) => cells[idx]),
          { backgroundColor: 'var(--color-surface-raised)', duration: 0.25 },
        );
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative h-full w-full">
      <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1 p-1 sm:gap-1.5 sm:p-1.5">
        {POS.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            className="rounded-[3px] bg-white/5"
          />
        ))}
      </div>
      <Cursor ref={cursorRef} />
    </div>
  );
}

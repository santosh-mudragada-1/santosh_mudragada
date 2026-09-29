'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Cursor } from './shared/Cursor';

// Sampled from the game's own crown-color palette (QUEENS_PALETTE[0, 5, 6, 3]).
const CELLS = [
  { color: '#f87171', left: '27%', top: '27%' },
  { color: '#38bdf8', left: '73%', top: '27%' },
  { color: '#a78bfa', left: '27%', top: '73%' },
  { color: '#a3e635', left: '73%', top: '73%' },
];

export function QueensPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const crownRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });

      tl.set(crownRefs.current, { opacity: 0, scale: 0.3 }).set(cursorRef.current, { ...CELLS[0], opacity: 0.75 });

      CELLS.forEach((cell, i) => {
        if (i > 0) tl.to(cursorRef.current, { left: cell.left, top: cell.top, duration: 0.24, ease: 'power2.inOut' });
        tl.to(cellRefs.current[i], { scale: 1.06, duration: 0.1 })
          .to(cellRefs.current[i], { scale: 1, duration: 0.1 })
          .to(crownRefs.current[i], { opacity: 1, scale: 1, duration: 0.18, ease: 'back.out(2.5)' }, '<');
      });

      tl.to(cursorRef.current, { opacity: 0, duration: 0.15 })
        .to({}, { duration: 0.7 })
        .to(crownRefs.current, { opacity: 0, scale: 0.3, duration: 0.2, stagger: 0.03 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative h-full w-full">
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1.5 p-1.5 sm:gap-2 sm:p-2">
        {CELLS.map((cell, i) => (
          <div
            key={i}
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            className="relative flex items-center justify-center rounded-md"
            style={{ backgroundColor: cell.color }}
          >
            <span
              ref={(el) => {
                crownRefs.current[i] = el;
              }}
              className="text-sm leading-none text-ink sm:text-base"
            >
              ♛
            </span>
          </div>
        ))}
      </div>
      <Cursor ref={cursorRef} />
    </div>
  );
}

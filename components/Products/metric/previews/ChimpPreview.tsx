'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Cursor } from './shared/Cursor';

// 3x3 grid; numbers sit at four scattered cells. Tap order is ascending by
// value (the game's actual rule), not grid order — cell 0 holds "1", cell 4
// holds "2", cell 2 holds "3", cell 7 holds "4".
const CELLS = [
  { idx: 0, value: '1', left: '16.7%', top: '16.7%' },
  { idx: 4, value: '2', left: '50%', top: '50%' },
  { idx: 2, value: '3', left: '83.3%', top: '16.7%' },
  { idx: 7, value: '4', left: '50%', top: '83.3%' },
];

export function ChimpPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

      tl.set(cellRefs.current, { backgroundColor: 'var(--color-accent-chimp-dim)' })
        .set(numberRefs.current, { opacity: 1 })
        .set(cursorRef.current, { left: CELLS[0].left, top: CELLS[0].top, opacity: 0.75 })
        .to({}, { duration: 0.9 });

      CELLS.forEach((cell, i) => {
        if (i > 0) tl.to(cursorRef.current, { left: cell.left, top: cell.top, duration: 0.26, ease: 'power2.inOut' });
        tl.to(numberRefs.current[i], { opacity: 0, duration: 0.12 }).to(
          cellRefs.current[i],
          { backgroundColor: 'var(--color-accent-chimp)', duration: 0.12 },
          '<',
        );
      });

      tl.to(cellRefs.current, { backgroundColor: 'var(--color-success)', duration: 0.18, stagger: 0.03 })
        .to(cursorRef.current, { opacity: 0, duration: 0.15 }, '<')
        .to({}, { duration: 0.6 })
        .to(cellRefs.current, { backgroundColor: 'var(--color-accent-chimp-dim)', duration: 0.25 })
        .set(numberRefs.current, { opacity: 1 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative h-full w-full">
      <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1 p-1 sm:gap-1.5 sm:p-1.5">
        {Array.from({ length: 9 }, (_, i) => {
          const cellIndex = CELLS.findIndex((c) => c.idx === i);
          return (
            <div
              key={i}
              ref={cellIndex >= 0 ? (el) => { cellRefs.current[cellIndex] = el; } : undefined}
              className="flex items-center justify-center rounded-[3px]"
              style={cellIndex < 0 ? { background: 'var(--color-surface-raised)', opacity: 0.4 } : undefined}
            >
              {cellIndex >= 0 && (
                <span
                  ref={(el) => {
                    numberRefs.current[cellIndex] = el;
                  }}
                  className="font-mono text-[0.55rem] font-bold text-text sm:text-[0.6rem]"
                >
                  {CELLS[cellIndex].value}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <Cursor ref={cursorRef} />
    </div>
  );
}

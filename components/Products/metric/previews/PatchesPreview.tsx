'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Cursor } from './shared/Cursor';

// Sampled from the game's own region palette (PATCHES_PALETTE[4, 0, 5]).
// A wide block over two smaller ones, each "carved" by a corner-to-corner
// drag — echoes the game's rectangle-carving mechanic.
const BLOCKS = [
  { color: '#34d399', rect: { left: '2%', top: '4%', width: '96%', height: '44%' } },
  { color: '#f87171', rect: { left: '2%', top: '52%', width: '46%', height: '44%' } },
  { color: '#38bdf8', rect: { left: '52%', top: '52%', width: '46%', height: '44%' } },
];

export function PatchesPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });

      tl.set(blockRefs.current, { scaleX: 0, scaleY: 0, opacity: 1 });

      BLOCKS.forEach((block, i) => {
        const { left, top, width, height } = block.rect;
        const startLeft = left;
        const startTop = top;
        const endLeft = `calc(${left} + ${width})`;
        const endTop = `calc(${top} + ${height})`;

        tl.to(cursorRef.current, { left: startLeft, top: startTop, opacity: 0.75, duration: 0.2, ease: 'power2.inOut' })
          .to(cursorRef.current, { left: endLeft, top: endTop, duration: 0.3, ease: 'power2.inOut' })
          .to(
            blockRefs.current[i],
            { scaleX: 1, scaleY: 1, duration: 0.2, ease: 'power2.out', transformOrigin: 'top left' },
            '<',
          );
      });

      tl.to(cursorRef.current, { opacity: 0, duration: 0.15 })
        .to({}, { duration: 0.7 })
        .to(blockRefs.current, { scaleX: 0, scaleY: 0, duration: 0.2, stagger: 0.04, transformOrigin: 'top left' });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative h-full w-full">
      {BLOCKS.map((block, i) => (
        <div
          key={i}
          ref={(el) => {
            blockRefs.current[i] = el;
          }}
          className="absolute rounded-sm"
          style={{ ...block.rect, backgroundColor: block.color }}
        />
      ))}
      <Cursor ref={cursorRef} />
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// The lobby doodle wall — everyone scribbles on their own tile while the room
// fills up. Each tile draws a tiny squiggle in turn, in a different crayon color.
const TILES = [
  { d: 'M4 16 Q 12 4 20 14', color: '#FF5A36' },
  { d: 'M4 8 Q 12 20 20 8', color: '#3EA8FF' },
  { d: 'M4 12 L12 4 L20 12', color: '#FFC928' },
  { d: 'M4 6 Q 14 2 20 16', color: '#2FD4A0' },
  { d: 'M4 16 Q 14 22 20 6', color: '#7B5CFF' },
  { d: 'M4 12 Q 10 4 12 12 T20 12', color: '#FF7EC7' },
];

export function LobbyPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const paths = pathRefs.current;
      const lengths = paths.map((p) => p?.getTotalLength() ?? 0);
      gsap.set(paths, { strokeDasharray: (i: number) => lengths[i], strokeDashoffset: (i: number) => lengths[i] });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      paths.forEach((p, i) => {
        tl.to(p, { strokeDashoffset: 0, duration: 0.45, ease: 'power1.inOut' }, i * 0.22);
      });
      tl.to({}, { duration: 1 })
        .to(paths, { opacity: 0, duration: 0.25, stagger: 0.04 })
        .set(paths, { strokeDashoffset: (i: number) => lengths[i] })
        .set(paths, { opacity: 1 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="grid h-full w-full grid-cols-3 grid-rows-2 gap-1.5 p-2">
      {TILES.map((tile, i) => (
        <div key={i} className="rounded-md border-2 border-ink bg-paper">
          <svg viewBox="0 0 24 24" className="h-full w-full">
            <path
              ref={(el) => {
                pathRefs.current[i] = el;
              }}
              d={tile.d}
              fill="none"
              stroke={tile.color}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

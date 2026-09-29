'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// 2 rows x 3 cols of dots; the path snakes 0-1-2-5-4-3, matching the game's
// "draw one continuous line through every cell" mechanic.
const DOTS = [
  { x: 16, y: 16 },
  { x: 50, y: 16 },
  { x: 84, y: 16 },
  { x: 16, y: 50 },
  { x: 50, y: 50 },
  { x: 84, y: 50 },
];
const ORDER = [0, 1, 2, 5, 4, 3];
const PATH_D = `M ${ORDER.map((i) => `${DOTS[i].x} ${DOTS[i].y}`).join(' L ')}`;

export function ZipPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const path = pathRef.current;
      if (!path) return;
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(dotRefs.current, { fill: 'var(--color-border-strong)' });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 1.7,
        ease: 'none',
        onUpdate: function () {
          if (!headRef.current || !path.isConnected) return;
          const point = path.getPointAtLength(this.progress() * length);
          if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
          // Plain DOM writes, not gsap.set() — a set() here would register a
          // fresh revertible action on this context every single frame, and
          // unwinding hundreds of them on unmount is what was writing a
          // stale/empty cx back onto a circle already being torn down.
          headRef.current.setAttribute('cx', String(point.x));
          headRef.current.setAttribute('cy', String(point.y));
          headRef.current.style.opacity = '1';
        },
      });
      ORDER.forEach((idx, i) => {
        tl.set(dotRefs.current[idx], { fill: 'var(--color-accent-zip)' }, i === 0 ? 0 : `<${1.7 / 6}`);
      });
      tl.to(headRef.current, { opacity: 0, duration: 0.15 })
        .to({}, { duration: 0.5 })
        .to(path, { strokeDashoffset: length, duration: 0.01 })
        .set(dotRefs.current, { fill: 'var(--color-border-strong)' });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 100 66" className="h-full w-full max-w-[7rem]">
        <path ref={pathRef} d={PATH_D} fill="none" stroke="var(--color-accent-zip)" strokeWidth={2.5} strokeLinecap="round" />
        {DOTS.map((d, i) => (
          <circle
            key={i}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            cx={d.x}
            cy={d.y}
            r={3.5}
            fill="var(--color-border-strong)"
          />
        ))}
        <circle ref={headRef} r={4.5} fill="var(--color-chalk)" opacity={0} />
      </svg>
    </div>
  );
}

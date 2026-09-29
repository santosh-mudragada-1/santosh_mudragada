'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// A single smoothed stroke drawing itself on, pen-first — the game's core
// mechanic (canvasEngine.ts smooths every stroke the same way).
const PATH_D = 'M8 62 Q 24 18 42 44 T 78 26 Q 94 18 96 34';

export function DrawPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const blotRef = useRef<SVGCircleElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const path = pathRef.current;
      if (!path) return;
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(blotRef.current, { scale: 0, transformOrigin: '50% 50%' });

      gsap
        .timeline({ repeat: -1, repeatDelay: 0.7 })
        .set(tipRef.current, { opacity: 1 })
        .to(path, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: 'power1.inOut',
          onUpdate: function () {
            const point = path.getPointAtLength(this.progress() * length);
            gsap.set(tipRef.current, { attr: { cx: point.x, cy: point.y } });
          },
        })
        .to(blotRef.current, { scale: 1, duration: 0.25, ease: 'back.out(2.5)' })
        .to(tipRef.current, { opacity: 0, duration: 0.15 }, '<')
        .to({}, { duration: 0.7 })
        .to([path, blotRef.current], { opacity: 0, duration: 0.25 })
        .set(path, { strokeDashoffset: length })
        .set(blotRef.current, { scale: 0 })
        .set([path, blotRef.current], { opacity: 1 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 104 72" className="h-full w-full max-w-[7.5rem]">
        <path ref={pathRef} d={PATH_D} fill="none" stroke="var(--color-ink)" strokeWidth={4} strokeLinecap="round" />
        <circle ref={tipRef} r={3} fill="var(--color-accent-draw)" opacity={0} />
        <circle ref={blotRef} cx={96} cy={34} r={6} fill="var(--color-accent-draw)" />
      </svg>
    </div>
  );
}

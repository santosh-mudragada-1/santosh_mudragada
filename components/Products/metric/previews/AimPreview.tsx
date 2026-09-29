'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Cursor } from './shared/Cursor';

const SPOTS = [
  { left: '22%', top: '24%' },
  { left: '76%', top: '30%' },
  { left: '64%', top: '76%' },
  { left: '18%', top: '70%' },
  { left: '48%', top: '46%' },
];

export function AimPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      let hits = 0;
      gsap.set(targetRef.current, { ...SPOTS[0], scale: 1, opacity: 1 });
      gsap.set(cursorRef.current, { left: '50%', top: '50%', opacity: 0.7 });

      const tl = gsap.timeline({ repeat: -1 });
      SPOTS.forEach((spot, i) => {
        const next = SPOTS[(i + 1) % SPOTS.length];
        tl.to(cursorRef.current, { ...spot, duration: 0.32, ease: 'power2.inOut' })
          .to(targetRef.current, { scale: 0.4, opacity: 0, duration: 0.1 }, '<0.22')
          .call(() => {
            hits = (hits % 30) + 1;
            if (countRef.current) countRef.current.textContent = `${hits}/30`;
          })
          .set(targetRef.current, { ...next, scale: 1, opacity: 1 })
          .to({}, { duration: 0.18 });
      });
      tl.call(() => {
        hits = 0;
        if (countRef.current) countRef.current.textContent = '0/30';
      });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative h-full w-full">
      <div
        ref={targetRef}
        className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-aim shadow-[0_0_14px_-2px_var(--color-accent-aim)] sm:h-4 sm:w-4"
      />
      <Cursor ref={cursorRef} />
      <span
        ref={countRef}
        className="absolute right-1.5 bottom-1 font-mono text-[0.6rem] text-text-dim tabular-nums sm:right-2 sm:bottom-1.5"
      >
        0/30
      </span>
    </div>
  );
}

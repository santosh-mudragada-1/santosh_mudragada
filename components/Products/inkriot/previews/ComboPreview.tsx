'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

export function ComboPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const flameRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const counter = { value: 0 };
      gsap.set(stampRef.current, { scale: 0, rotate: -14, opacity: 0 });
      gsap.set(flameRef.current, { scale: 0, opacity: 0 });

      gsap
        .timeline({ repeat: -1, repeatDelay: 0.9 })
        .to(counter, {
          value: 940,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: () => {
            if (scoreRef.current) scoreRef.current.textContent = `+${Math.round(counter.value)}`;
          },
        })
        .to(stampRef.current, { scale: 1, rotate: -8, opacity: 1, duration: 0.3, ease: 'back.out(3)' }, '-=0.2')
        .to(flameRef.current, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(3)' }, '<0.05')
        .to({}, { duration: 1 })
        .to([stampRef.current, flameRef.current], { scale: 0, opacity: 0, duration: 0.2 })
        .to(scoreRef.current, { opacity: 0, duration: 0.15 }, '<')
        .set(counter, { value: 0 })
        .call(() => {
          if (scoreRef.current) scoreRef.current.textContent = '+0';
        })
        .set(scoreRef.current, { opacity: 1 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative flex h-full w-full flex-col items-center justify-center gap-1.5">
      <span ref={scoreRef} className="font-display text-2xl text-accent-combo tabular-nums">
        +0
      </span>
      <div className="flex items-center gap-1">
        <div
          ref={stampRef}
          className="rounded-md border-2 border-ink bg-accent-combo px-1.5 py-0.5 font-display text-[0.6rem] text-ink"
        >
          x3 combo
        </div>
        <span ref={flameRef} className="text-sm">
          🔥
        </span>
      </div>
    </div>
  );
}

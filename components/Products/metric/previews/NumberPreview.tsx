'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

const DIGITS = ['4', '8', '2', '9', '1', '5'];

export function NumberPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const bigRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<HTMLDivElement>(null);
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

      tl.set(bigRef.current, { opacity: 1 })
        .set(boxesRef.current, { opacity: 0 })
        .set(boxRefs.current, { borderColor: 'var(--color-border-strong)' })
        .set(digitRefs.current, { opacity: 0 })
        .to({}, { duration: 1.1 })
        .to(bigRef.current, { opacity: 0, duration: 0.2 })
        .to(boxesRef.current, { opacity: 1, duration: 0.2 }, '<');

      DIGITS.forEach((_, i) => {
        tl.to(boxRefs.current[i], { borderColor: 'var(--color-accent-number)', duration: 0.1 })
          .to(digitRefs.current[i], { opacity: 1, duration: 0.1 }, '<')
          .to(boxRefs.current[i], { borderColor: 'var(--color-border-strong)', duration: 0.14 }, '+=0.06');
      });

      tl.to(boxRefs.current, { borderColor: 'var(--color-success)', duration: 0.18, stagger: 0.02 })
        .to({}, { duration: 0.7 })
        .to(boxesRef.current, { opacity: 0, duration: 0.2 })
        .set(digitRefs.current, { opacity: 0 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative flex h-full w-full items-center justify-center">
      <div ref={bigRef} className="font-mono text-lg font-bold tracking-widest text-accent-number tabular-nums sm:text-xl">
        {DIGITS.join('')}
      </div>
      <div ref={boxesRef} className="absolute flex gap-1 opacity-0">
        {DIGITS.map((d, i) => (
          <div
            key={i}
            ref={(el) => {
              boxRefs.current[i] = el;
            }}
            className="flex h-6 w-4 items-center justify-center rounded-[3px] border font-mono text-xs font-semibold text-text tabular-nums sm:h-7 sm:w-5"
          >
            <span
              ref={(el) => {
                digitRefs.current[i] = el;
              }}
              className="opacity-0"
            >
              {d}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

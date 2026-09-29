'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

const PASSAGE = 'type fast and clean';

export function TypingPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const wpmRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      let wpm = 0;
      gsap.set(caretRef.current, { opacity: 1 });
      gsap.to(caretRef.current, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' });

      gsap
        .timeline({ repeat: -1, repeatDelay: 0.6 })
        .set(revealRef.current, { clipPath: 'inset(0 100% 0 0)' })
        .set(wpmRef.current, { opacity: 0 })
        .to(revealRef.current, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.6,
          ease: 'steps(19)',
          onUpdate: function () {
            wpm = Math.round(this.progress() * 96);
            if (wpmRef.current) wpmRef.current.textContent = `${wpm} wpm`;
          },
        })
        .to(wpmRef.current, { opacity: 1, duration: 0.15 }, '-=0.3')
        .to({}, { duration: 0.9 })
        .to([revealRef.current, wpmRef.current], { opacity: 0, duration: 0.2 })
        .set(revealRef.current, { opacity: 1, clipPath: 'inset(0 100% 0 0)' });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="flex h-full w-full flex-col items-center justify-center gap-2 px-2">
      <div className="relative font-mono text-[0.7rem] font-medium whitespace-nowrap text-text-dim sm:text-xs">
        {PASSAGE}
        <span ref={revealRef} className="absolute inset-0 text-accent-typing">
          {PASSAGE}
        </span>
        <span ref={caretRef} className="ml-0.5 text-accent-typing">
          |
        </span>
      </div>
      <span ref={wpmRef} className="font-mono text-[0.6rem] text-text-dim tabular-nums opacity-0">
        96 wpm
      </span>
    </div>
  );
}

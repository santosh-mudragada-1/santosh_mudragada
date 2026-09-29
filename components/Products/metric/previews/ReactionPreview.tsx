'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Cursor } from './shared/Cursor';

const READOUTS = ['214ms', '198ms', '227ms'];

export function ReactionPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const waitRef = useRef<HTMLSpanElement>(null);
  const goRef = useRef<HTMLSpanElement>(null);
  const msRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      let i = 0;
      gsap.set(cursorRef.current, { left: '80%', top: '84%', opacity: 0.7 });

      gsap
        .timeline({ repeat: -1, repeatDelay: 0.5 })
        .set(panelRef.current, { backgroundColor: 'var(--color-danger)' })
        .set(waitRef.current, { opacity: 1 })
        .set([goRef.current, msRef.current], { opacity: 0 })
        .to({}, { duration: 1.05 })
        .to(waitRef.current, { opacity: 0, duration: 0.15 })
        .to(panelRef.current, { backgroundColor: 'var(--color-success)', duration: 0.15 }, '<')
        .to(goRef.current, { opacity: 1, duration: 0.15 }, '<')
        .to(cursorRef.current, { left: '50%', top: '50%', duration: 0.35, ease: 'power2.inOut' }, '<0.05')
        .to(cursorRef.current, { scale: 0.55, duration: 0.08, yoyo: true, repeat: 1 })
        .call(() => {
          i = (i + 1) % READOUTS.length;
          if (msRef.current) msRef.current.textContent = READOUTS[i];
        })
        .to(panelRef.current, { backgroundColor: 'var(--color-surface-raised)', duration: 0.2 })
        .to(goRef.current, { opacity: 0, duration: 0.15 }, '<')
        .to(msRef.current, { opacity: 1, duration: 0.2 }, '<')
        .to(cursorRef.current, { left: '80%', top: '84%', scale: 1, duration: 0.4, ease: 'power2.inOut', delay: 0.9 })
        .to(msRef.current, { opacity: 0, duration: 0.15 }, '<0.1');
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative h-full w-full">
      <div ref={panelRef} className="absolute inset-2 flex items-center justify-center rounded-lg sm:inset-3">
        <span
          ref={waitRef}
          className="absolute font-mono text-[0.65rem] font-semibold tracking-wide text-ink/70 uppercase"
        >
          wait
        </span>
        <span
          ref={goRef}
          className="absolute font-mono text-[0.65rem] font-semibold tracking-wide text-ink uppercase opacity-0"
        >
          click
        </span>
        <span ref={msRef} className="absolute font-mono text-sm font-bold tabular-nums text-text opacity-0">
          214ms
        </span>
      </div>
      <Cursor ref={cursorRef} />
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Cursor } from './shared/Cursor';

// `seen: true` means this word already appeared — the correct tap is SEEN,
// otherwise NEW. Mirrors the game's actual rule.
const ROUNDS = [
  { word: 'river', seen: false },
  { word: 'cloud', seen: false },
  { word: 'river', seen: true },
  { word: 'glass', seen: false },
];

export function VerbalPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const newRef = useRef<HTMLSpanElement>(null);
  const seenRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

      ROUNDS.forEach((round) => {
        const btnRef = round.seen ? seenRef : newRef;
        const left = round.seen ? '74%' : '26%';
        tl.call(() => {
          if (wordRef.current) wordRef.current.textContent = round.word;
        })
          .fromTo(wordRef.current, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.2 })
          .to(cursorRef.current, { left, top: '84%', opacity: 0.75, duration: 0.28, ease: 'power2.inOut' }, '+=0.4')
          .to(btnRef.current, { backgroundColor: 'var(--color-accent-verbal)', color: 'var(--color-ink)', duration: 0.12 })
          .to(wordRef.current, { opacity: 0, y: -4, duration: 0.18 }, '+=0.2')
          .to(btnRef.current, { backgroundColor: 'transparent', color: 'var(--color-text-dim)', duration: 0.16 }, '<');
      });

      tl.to(cursorRef.current, { opacity: 0, duration: 0.15 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative flex h-full w-full flex-col items-center justify-center gap-3">
      <span ref={wordRef} className="font-mono text-sm font-semibold lowercase text-accent-verbal opacity-0 sm:text-base">
        river
      </span>
      <div className="flex gap-1.5 font-mono text-[0.55rem] font-semibold tracking-wide uppercase sm:text-[0.6rem]">
        <span ref={newRef} className="rounded-full border border-border-strong px-2 py-0.5 text-text-dim">
          new
        </span>
        <span ref={seenRef} className="rounded-full border border-border-strong px-2 py-0.5 text-text-dim">
          seen
        </span>
      </div>
      <Cursor ref={cursorRef} />
    </div>
  );
}

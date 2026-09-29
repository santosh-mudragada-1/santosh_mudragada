'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import '../lib/animation/gsapConfig';
import { GameCard } from './GameCard';
import type { GameEntry } from '../content/games';

interface ShowreelRowProps {
  eyebrow: string;
  title: string;
  description: string;
  games: GameEntry[];
  /** Scrolls right-to-left instead of left-to-right — the two rows counter-scroll. */
  reverse?: boolean;
}

// Tuned so a row's full loop takes roughly this many seconds per card, regardless
// of how many games are in it — an 8-card row and a 5-card row feel the same speed.
const SECONDS_PER_CARD = 4.2;

export function ShowreelRow({ eyebrow, title, description, games, reverse }: ShowreelRowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      gsap.fromTo(
        sectionRef.current!.querySelectorAll('[data-reveal]'),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
        },
      );

      const track = trackRef.current;
      if (isTouch || reduced || !track) return () => {};

      const distance = track.scrollWidth / 2;
      const duration = games.length * SECONDS_PER_CARD;
      const tween = gsap.fromTo(
        track,
        { x: reverse ? -distance : 0 },
        { x: reverse ? 0 : -distance, duration, ease: 'none', repeat: -1 },
      );

      const pause = () => tween.pause();
      const resume = () => tween.play();
      track.addEventListener('mouseenter', pause);
      track.addEventListener('mouseleave', resume);

      return () => {
        track.removeEventListener('mouseenter', pause);
        track.removeEventListener('mouseleave', resume);
      };
    },
    { scope: sectionRef, dependencies: [isTouch, reduced, games, reverse] },
  );

  const items = isTouch || reduced ? games : [...games, ...games];

  return (
    <section ref={sectionRef} className="flex flex-col gap-6 py-4">
      <div data-reveal className="flex flex-col gap-2 px-[var(--gutter)]">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs tracking-[0.2em] text-text-dim uppercase">{eyebrow}</span>
          <span className="font-mono text-xs text-text-dim tabular-nums">
            {String(games.length).padStart(2, '0')} games
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold lowercase tracking-tight text-text sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-text-muted">{description}</p>
      </div>

      <div
        data-reveal
        className={`py-3 pl-[var(--gutter)] ${isTouch ? 'overflow-x-auto' : 'overflow-x-hidden'}`}
        style={isTouch ? { scrollSnapType: 'x proximity' } : undefined}
      >
        <div ref={trackRef} className="flex w-max gap-4 will-change-transform">
          {items.map((game, i) => (
            <GameCard key={`${game.name}-${i}`} game={game} index={i % games.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

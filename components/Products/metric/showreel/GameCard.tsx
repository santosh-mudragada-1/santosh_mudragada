'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { hoverIn, hoverOut } from '../lib/animation/presets';
import { playCardHover } from '../lib/sound/sfx';
import type { GameEntry } from '../content/games';

interface GameCardProps {
  game: GameEntry;
  index: number;
}

export function GameCard({ game, index }: GameCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: cardRef });
  const Preview = game.Preview;

  const onEnter = contextSafe(() => {
    hoverIn(cardRef.current);
    playCardHover(index);
  });
  const onLeave = contextSafe(() => {
    hoverOut(cardRef.current);
  });

  return (
    <div
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ ['--accent' as string]: `var(--color-accent-${game.accent})` }}
      className="game-card relative flex h-72 w-64 shrink-0 flex-col justify-between rounded-2xl border border-border
        bg-surface p-5 sm:h-80 sm:w-72"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-text-dim tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
      </div>

      <div
        className="flex h-28 items-center justify-center rounded-xl sm:h-32"
        style={{ background: `var(--color-accent-${game.accent}-dim)` }}
      >
        <Preview />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-lg font-semibold lowercase tracking-tight text-text">{game.name}</h3>
        <p className="game-card-blurb text-sm leading-snug text-text-muted">{game.blurb}</p>
      </div>
    </div>
  );
}

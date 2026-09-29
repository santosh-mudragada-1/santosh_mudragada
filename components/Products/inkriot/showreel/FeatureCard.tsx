'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { hoverIn, hoverOut } from '../lib/animation/presets';
import { playCardHover } from '../lib/sound/sfx';
import type { FeatureEntry } from '../content/features';

interface FeatureCardProps {
  feature: FeatureEntry;
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: cardRef });
  const Preview = feature.Preview;

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
      style={{ ['--accent' as string]: `var(--color-accent-${feature.accent})` }}
      className="feature-card relative flex h-72 w-64 shrink-0 flex-col justify-between rounded-[26px] border-[3px]
        border-ink bg-paper p-5 sm:h-80 sm:w-72"
    >
      <div className="flex items-center justify-between">
        <span className="font-sans text-[0.6875rem] font-bold tracking-[0.1em] text-ink-faint tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="h-2.5 w-2.5 rounded-full border-2 border-ink" style={{ background: 'var(--accent)' }} />
      </div>

      <div
        className="flex h-28 items-center justify-center rounded-2xl border-2 border-[var(--color-line)] sm:h-32"
        style={{ background: `var(--color-accent-${feature.accent}-dim)` }}
      >
        <Preview />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-lg text-ink lowercase">{feature.name}</h3>
        <p className="text-sm leading-snug text-ink-soft">{feature.blurb}</p>
      </div>
    </div>
  );
}

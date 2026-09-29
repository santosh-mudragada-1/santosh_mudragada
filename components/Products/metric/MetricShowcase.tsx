'use client';

import { useRef } from 'react';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useNavContrast } from '@/lib/hooks/useNavContrast';
import './lib/animation/gsapConfig';
import { Button } from './ui/Button';
import { ShowreelRow } from './showreel/ShowreelRow';
import { BRAIN_TEST_GAMES } from './content/games';
import { DAILY_GAMES } from './content/dailyGames';

const PRODUCT_URL = 'https://metric-mocha.vercel.app';

export function MetricShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  useNavContrast(rootRef);

  return (
    <div ref={rootRef} data-theme="dark" className="min-h-screen overflow-x-clip bg-canvas font-sans text-text">
      <div className="mx-auto flex max-w-3xl flex-col px-[var(--gutter)]">
        <header
          data-nav-boundary
          className="flex flex-col items-center gap-5 pt-[clamp(8rem,5rem+5vh,9.5rem)] pb-14 text-center"
        >
          <span className="font-mono text-xs tracking-[0.2em] text-text-dim uppercase">Product</span>
          <h1 className="font-display text-5xl font-bold tracking-tight text-text sm:text-6xl">metric</h1>
          <p className="max-w-sm text-sm leading-relaxed text-text-muted">
            Reflex and memory games, built for speed — with sound. Thirteen of them, below.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.open(PRODUCT_URL, '_blank', 'noopener,noreferrer')}
            className="mt-1"
          >
            Play Metric
            <ArrowUpRightIcon className="ml-0.5 h-4 w-4" />
          </Button>
        </header>
      </div>

      <div className="flex flex-col gap-16 pt-4 pb-28">
        <ShowreelRow
          eyebrow="Reflex & memory"
          title="brain test"
          description="Eight quickfire games — speed, precision, recall. Hover one to hear it."
          games={BRAIN_TEST_GAMES}
        />
        <ShowreelRow
          eyebrow="One a day"
          title="daily games"
          description="A new puzzle every day, same time for everyone — logic, words, and shape."
          games={DAILY_GAMES}
          reverse
        />
      </div>
    </div>
  );
}

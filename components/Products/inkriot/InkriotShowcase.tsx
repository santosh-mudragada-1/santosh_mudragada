'use client';

import { useRef } from 'react';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useNavContrast } from '@/lib/hooks/useNavContrast';
import './lib/animation/gsapConfig';
import { Button } from './ui/Button';
import { ShowreelRow } from './showreel/ShowreelRow';
import { FEATURES } from './content/features';

const PRODUCT_URL = 'https://inkriot.vercel.app';

export function InkriotShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  useNavContrast(rootRef);

  return (
    <div ref={rootRef} className="ink-grid min-h-screen overflow-x-clip font-sans text-ink">
      <div className="mx-auto flex max-w-3xl flex-col px-[var(--gutter)]">
        <header
          data-nav-boundary
          className="flex flex-col items-center gap-5 pt-[clamp(8rem,5rem+5vh,9.5rem)] pb-14 text-center"
        >
          <span className="font-sans text-xs font-bold tracking-[0.2em] text-ink-faint uppercase">Product</span>
          <h1 className="font-display text-5xl text-ink sm:text-6xl" style={{ textShadow: '4px 4px 0 var(--color-tomato)' }}>
            inkriot
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
            Draw. Guess. Chaos. A fast, social drawing-and-guessing party game — bring your friends.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.open(PRODUCT_URL, '_blank', 'noopener,noreferrer')}
            className="mt-1"
          >
            Play InkRiot
            <ArrowUpRightIcon className="ml-0.5 h-4 w-4" />
          </Button>
        </header>
      </div>

      <div className="flex flex-col pt-4 pb-28">
        <ShowreelRow
          eyebrow="Party game"
          title="what it feels like"
          description="Six pieces of the game, looping — hover one to hear it."
          features={FEATURES}
        />
      </div>
    </div>
  );
}

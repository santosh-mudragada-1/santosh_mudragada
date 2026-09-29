'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// Wordle-style flip reveal. Only one accent color exists per game (the
// theme's "one identity color per game" rule), so gray/yellow/green map onto
// surface / accent-dim / accent-solid instead of inventing new tokens.
const GRAY = 'var(--color-surface-raised)';
const YELLOW = 'var(--color-accent-hardword-dim)';
const GREEN = 'var(--color-accent-hardword)';

const ROW1 = [
  { letter: 'T', color: GRAY },
  { letter: 'R', color: YELLOW },
  { letter: 'A', color: GRAY },
  { letter: 'I', color: GREEN },
  { letter: 'N', color: GRAY },
];
const ROW2 = ['C', 'R', 'A', 'N', 'E'].map((letter) => ({ letter, color: GREEN }));

function Row({
  row,
  tileRefs,
  letterRefs,
}: {
  row: { letter: string; color: string }[];
  tileRefs: (HTMLDivElement | null)[];
  letterRefs: (HTMLSpanElement | null)[];
}) {
  return (
    <div className="flex gap-1" style={{ perspective: 300 }}>
      {row.map((tile, i) => (
        <div
          key={i}
          ref={(el) => {
            tileRefs[i] = el;
          }}
          className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-border-strong font-mono text-[0.55rem] font-bold text-text sm:h-5 sm:w-5 sm:text-[0.6rem]"
        >
          <span
            ref={(el) => {
              letterRefs[i] = el;
            }}
          >
            {tile.letter}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HardwordPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const row1Tiles = useRef<(HTMLDivElement | null)[]>([]);
  const row1Letters = useRef<(HTMLSpanElement | null)[]>([]);
  const row2Tiles = useRef<(HTMLDivElement | null)[]>([]);
  const row2Letters = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.7 });
      tl.set([...row1Letters.current, ...row2Letters.current], { opacity: 0 });

      const fillRow = (tiles: (HTMLDivElement | null)[], letters: (HTMLSpanElement | null)[]) => {
        tl.to(letters, { opacity: 1, duration: 0.08, stagger: 0.08 }).to(
          tiles,
          { borderColor: 'var(--color-text-dim)', duration: 0.08, stagger: 0.08 },
          '<',
        );
      };

      const flipRow = (row: { letter: string; color: string }[], tiles: (HTMLDivElement | null)[]) => {
        row.forEach((tile, i) => {
          tl.to(tiles[i], { rotationX: 90, duration: 0.12, ease: 'power1.in' }, i === 0 ? '+=0.15' : '+=0.05')
            .call(() => {
              if (tiles[i]) {
                tiles[i]!.style.backgroundColor = tile.color;
                tiles[i]!.style.borderColor = tile.color;
              }
            })
            .to(tiles[i], { rotationX: 0, duration: 0.12, ease: 'power1.out' });
        });
      };

      fillRow(row1Tiles.current, row1Letters.current);
      flipRow(ROW1, row1Tiles.current);
      fillRow(row2Tiles.current, row2Letters.current);
      flipRow(ROW2, row2Tiles.current);
      tl.to(row2Tiles.current, { scale: 1.1, duration: 0.12, stagger: 0.03, yoyo: true, repeat: 1 }, '+=0.1');
      tl.to({}, { duration: 0.8 });
      tl.set([...row1Letters.current, ...row2Letters.current], { opacity: 0 });
      tl.set([...row1Tiles.current, ...row2Tiles.current], {
        backgroundColor: 'transparent',
        borderColor: 'var(--color-border-strong)',
      });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="flex h-full w-full flex-col items-center justify-center gap-1.5">
      <Row row={ROW1} tileRefs={row1Tiles.current} letterRefs={row1Letters.current} />
      <Row row={ROW2} tileRefs={row2Tiles.current} letterRefs={row2Letters.current} />
    </div>
  );
}

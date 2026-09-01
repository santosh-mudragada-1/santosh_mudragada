'use client';

import { useEffect, useState } from 'react';
import { Board } from '@/components/CaseStudy/chess';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './HeroBoard.module.scss';

// The back-rank line the journey section plays out — here it loops in the
// hero's top-right corner, masked so the board dissolves into the paper:
// hold on "M1 available", the rook slides d1→d8#, the mated king pulses,
// reset, repeat.
const FEN_BEFORE = '6k1/5ppp/8/8/8/8/5PPP/3R2K1';
const FEN_AFTER = '3R2k1/5ppp/8/8/8/8/5PPP/6K1';

export function HeroBoard() {
  const reduced = usePrefersReducedMotion();
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (reduced) return;
    let a = 0;
    let b = 0;
    const run = () => {
      a = window.setTimeout(() => {
        setSolved(true);
        b = window.setTimeout(() => {
          setSolved(false);
          run();
        }, 3600);
      }, 3000);
    };
    run();
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [reduced]);

  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.blob}>
        <div className={styles.inner}>
          <Board
            fen={solved ? FEN_AFTER : FEN_BEFORE}
            orientation="white"
            hint={solved ? [] : ['d1']}
            highlight={solved ? ['d1', 'd8'] : []}
            danger={solved ? 'g8' : null}
            mated={solved}
            lastMove={solved ? { from: 'd1', to: 'd8' } : null}
            showCoordinates={false}
          />
        </div>
      </div>
    </div>
  );
}

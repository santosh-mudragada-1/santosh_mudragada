'use client';

import { useEffect, useState } from 'react';
import { Board, EvalBar, Confetti } from '@/components/CaseStudy/chess';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './HeroBoard.module.scss';

// The same back-rank line the journey section plays — here it loops in the
// blob-masked corner: hold on "M1 available", the rook slides d1→d8#, green
// sweeps the eval bar, confetti, reset, repeat.
const FEN_BEFORE = '6k1/5ppp/8/8/8/8/5PPP/3R2K1';
const FEN_AFTER = '3R2k1/5ppp/8/8/8/8/5PPP/6K1';

export function HeroBoard() {
  const reduced = usePrefersReducedMotion();
  const [solved, setSolved] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let a = 0;
    let b = 0;
    const run = () => {
      a = window.setTimeout(() => {
        setSolved(true);
        b = window.setTimeout(() => {
          setSolved(false);
          setCycle((c) => c + 1);
          run();
        }, 3800);
      }, 2800);
    };
    run();
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [reduced]);

  return (
    <div className={styles.wrap} aria-hidden>
      <div className={styles.grid}>
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
            {solved && <Confetti run count={48} />}
          </div>
        </div>

        <div className={styles.eval}>
          {solved ? (
            <EvalBar cp={1200} label="1-0" peakMate={1} peakLabel="M1" decided isUserMove step={`s${cycle}`} />
          ) : (
            <EvalBar cp={-40} label="−0.4" peakMate={1} peakLabel="M1" loop step={`u${cycle}`} />
          )}
        </div>
      </div>
    </div>
  );
}

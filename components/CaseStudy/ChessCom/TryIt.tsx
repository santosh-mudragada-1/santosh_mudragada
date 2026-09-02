'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Board, EvalBar, CoachBubble, Confetti } from '@/components/CaseStudy/chess';
import { legalTargets } from '@/components/CaseStudy/chess/fen';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './TryIt.module.scss';

/* ------------------------------------------------------------------ icons */
// Chess.com's tick, taken verbatim from the prototype (puzzle-solver.tsx).
const Tick = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden focusable="false">
    <path
      d="M14.13 5.31 6.58 12.86c-.49.49-.85.47-1.34 0L1.85 9.44c-.75-.75-.75-1.06 0-1.82l.06-.06c.76-.76 1.07-.76 1.82 0l2.2 2.2 6.31-6.33c.75-.75 1.07-.75 1.82 0l.07.06c.75.76.75 1.07 0 1.82Z"
      fill="currentColor"
    />
  </svg>
);

/* ---------------------------------------------------------------- figurine */
const GLYPH: Record<string, string> = { R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔' };
function San({ san }: { san: string }) {
  const g = GLYPH[san[0]];
  return (
    <span className={styles.san}>
      {g && <span aria-hidden>{g}</span>}
      <span>{g ? san.slice(1) : san}</span>
      <span className={styles.sr}>{san}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ data */
type EvalProps = {
  cp: number;
  label: string;
  peakCp?: number;
  peakMate?: number | null;
  peakLabel?: string;
  decided?: boolean;
  loop?: boolean;
  isUserMove?: boolean;
};

interface Puzzle {
  tag: string;
  opponent: string;
  from: string;
  to: string;
  fen: string;
  solvedFen: string;
  danger?: string | null;
  mated?: boolean;
  win: string;
  wrongMove: { from: string; to: string; san: string };
  pieceHint: string;
  targetHint: string;
  wasLabel: string;
  nowLabel: string;
  finalLabel: string;
  evalStart: EvalProps;
  evalSolved: EvalProps;
  coachStart: string;
  coachSolved: string;
}

const PUZZLES: Puzzle[] = [
  {
    tag: 'Back-rank mate',
    opponent: 'M. Kowalski',
    from: 'd1',
    to: 'd8',
    fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1',
    solvedFen: '3R2k1/5ppp/8/8/8/8/5PPP/6K1',
    danger: 'g8',
    mated: true,
    win: 'Rxd8#',
    wrongMove: { from: 'd1', to: 'd3', san: 'Rd3' },
    pieceHint: 'the rook on d1',
    targetHint: 'd8',
    wasLabel: 'M1',
    nowLabel: '−5.0',
    finalLabel: '1-0',
    evalStart: { cp: -500, label: '−5.0', peakCp: 1200, peakMate: 1, peakLabel: 'M1', loop: true },
    evalSolved: {
      cp: 1200,
      label: '1-0',
      peakCp: 1200,
      peakMate: 1,
      peakLabel: 'M1',
      decided: true,
      isUserMove: true,
    },
    coachStart:
      'On move 14 you played Rd3 and let a forced mate slip. It is still on the board. Play it.',
    coachSolved:
      'Rxd8#. Back-rank mate. Green sweeps the bar back up: you won back exactly what the blunder cost.',
  },
  {
    tag: 'Knight fork',
    opponent: 'T. Berg',
    from: 'b5',
    to: 'c7',
    fen: 'r3k3/5ppp/8/1N6/8/8/5PPP/6K1',
    solvedFen: 'r3k3/2N2ppp/8/8/8/8/5PPP/6K1',
    danger: 'e8',
    mated: false,
    win: 'Nc7+',
    wrongMove: { from: 'b5', to: 'a3', san: 'Na3' },
    pieceHint: 'the knight on b5',
    targetHint: 'c7',
    wasLabel: '+7',
    nowLabel: '−1.8',
    finalLabel: '+5.2',
    evalStart: { cp: -180, label: '−1.8', peakCp: 700, peakLabel: '+7', loop: true },
    evalSolved: { cp: 520, label: '+5.2', isUserMove: true },
    coachStart:
      'You retreated the knight to a3 and walked past the fork. From here it jumps once and the rook is lost.',
    coachSolved:
      'Nc7+. The fork. The king moves, then Nxa8 lifts the rook and you are the exchange up.',
  },
  {
    tag: 'Hanging queen',
    opponent: 'A. Ruiz',
    from: 'g2',
    to: 'b7',
    fen: '6k1/1q3ppp/8/8/8/8/5PBP/6K1',
    solvedFen: '6k1/1B3ppp/8/8/8/8/5P1P/6K1',
    danger: null,
    mated: false,
    win: 'Bxb7',
    wrongMove: { from: 'g2', to: 'f1', san: 'Bf1' },
    pieceHint: 'the bishop on g2',
    targetHint: 'b7',
    wasLabel: '+9',
    nowLabel: '−2.6',
    finalLabel: '+9.0',
    evalStart: { cp: -260, label: '−2.6', peakCp: 1100, peakLabel: '+9', loop: true },
    evalSolved: { cp: 1000, label: '+9.0', isUserMove: true },
    coachStart:
      'You tucked the bishop back to f1 and left the queen alone. On b7 it has no defender.',
    coachSolved: 'Bxb7. The queen was hanging the whole time. Free piece, game over.',
  },
];

type Phase = 'idle' | 'picked' | 'solved';

export function TryIt() {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [hinted, setHinted] = useState(false);
  const [cleared, setCleared] = useState<boolean[]>(() => PUZZLES.map(() => false));
  const [shake, setShake] = useState(0);

  const p = PUZZLES[idx];
  const solved = phase === 'solved';
  const last = idx === PUZZLES.length - 1;
  const allDone = cleared.every(Boolean);

  const markSolved = useCallback(() => {
    setPhase('solved');
    setCleared((c) => (c[idx] ? c : c.map((v, i) => (i === idx ? true : v))));
  }, [idx]);

  const onSquare = useCallback(
    (sq: string) => {
      if (phase === 'solved') return;
      if (phase === 'idle') {
        if (sq === p.from) setPhase('picked');
        else setShake((s) => s + 1);
        return;
      }
      if (sq === p.to) markSolved();
      else if (sq === p.from) setPhase('idle');
      else setShake((s) => s + 1);
    },
    [phase, p.from, p.to, markSolved],
  );

  const next = () => {
    setIdx((i) => i + 1);
    setPhase('idle');
    setHinted(false);
  };
  const restart = () => {
    setIdx(0);
    setPhase('idle');
    setHinted(false);
    setCleared(PUZZLES.map(() => false));
  };

  const evalProps = solved ? p.evalSolved : p.evalStart;

  const whTitle = allDone
    ? 'Set complete'
    : solved
      ? 'Solved'
      : phase === 'picked'
        ? 'Your move'
        : `Puzzle ${idx + 1} of ${PUZZLES.length}`;
  const whBody = allDone
    ? 'Three tactics from one player’s week, all solved: a back-rank mate, a knight fork and a hanging queen.'
    : solved
      ? 'The move lands and the eval bar sweeps back to where it should have been. Green sweep, no popup.'
      : phase === 'picked'
        ? 'Every legal square is marked. The real feature only accepts the tactic, not any legal move.'
        : 'It opens on the position from your game, one move before the mistake. The red squares are the move you actually played.';

  return (
    <div className={styles.wrap}>
      {/* --------------------------------------------------- left: board card */}
      <div className={styles.device}>
        <div className={styles.deviceHead}>
          <span className={styles.deviceTag}>
            <i aria-hidden>??</i> {p.tag}
          </span>
          <span className={styles.devicePuzzle}>
            Puzzle <b>{idx + 1} / {PUZZLES.length}</b>
          </span>
          <span className={styles.dots} aria-hidden>
            {PUZZLES.map((pz, i) => (
              <span key={pz.tag} data-on={cleared[i] || undefined} />
            ))}
          </span>
        </div>

        <BoardShake signal={shake} reduced={reduced}>
          <div className={styles.boardRow}>
            <div className={styles.boardBox}>
              <Board
                fen={solved ? p.solvedFen : p.fen}
                orientation="white"
                onSquareClick={onSquare}
                ariaLabel={
                  solved
                    ? `${p.win} played.`
                    : phase === 'picked'
                      ? `Now the square. Click ${p.targetHint}.`
                      : `White to play. Click ${p.pieceHint}.`
                }
                wrong={phase === 'idle' ? [p.wrongMove.from, p.wrongMove.to] : []}
                hint={!solved && (phase === 'picked' || hinted) ? [p.from] : []}
                dots={phase === 'picked' ? legalTargets(p.fen, p.from) : []}
                highlight={solved ? [p.from, p.to] : []}
                lastMove={solved ? { from: p.from, to: p.to } : null}
                danger={solved ? p.danger ?? null : null}
                mated={solved ? p.mated ?? false : false}
                showCoordinates={false}
              />
              {solved && !reduced && <Confetti run count={allDone ? 64 : 38} />}
            </div>
            <div className={styles.evalCol}>
              <EvalBar {...evalProps} step={`${idx}-${phase}`} />
            </div>
          </div>
        </BoardShake>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.greenBtn}
            onClick={next}
            disabled={!solved || last}
            data-cursor="link"
          >
            Next puzzle
          </button>
          <button
            type="button"
            className={styles.darkBtn}
            onClick={() => setHinted(true)}
            disabled={solved || hinted}
            data-cursor="link"
          >
            Hint
          </button>
          <button
            type="button"
            className={styles.darkBtn}
            onClick={markSolved}
            disabled={solved}
            data-cursor="link"
          >
            Show solution
          </button>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={restart}
            data-cursor="link"
          >
            Restart set
          </button>
        </div>
      </div>

      {/* --------------------------------------------------- right: panel */}
      <div className={styles.panel}>
        <div className={styles.classTag}>
          <span className={styles.classIco} aria-hidden />
          <span className={styles.classText}>
            <b>{p.tag}</b> <span>vs {p.opponent}</span>
          </span>
          <span className={styles.diff}>Medium</span>
        </div>

        <CoachBubble text={solved ? p.coachSolved : p.coachStart} />

        <div className={styles.brief}>
          {allDone ? (
            <div className={styles.doneCard}>
              <p className={styles.solvedText}>
                <Tick className={styles.tick24} /> Set complete
              </p>
              <p className={styles.doneSub}>Three for three. One player, one week of games.</p>
              <ul className={styles.doneList}>
                {PUZZLES.map((pz) => (
                  <li key={pz.tag}>{pz.tag}</li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              {!solved && (
                <>
                  <p className={styles.briefLabel}>What happened in your game</p>
                  <div className={styles.card}>
                    <div className={styles.cardRow}>
                      <div className={styles.playedCol}>
                        <p className={styles.youPlayed}>You played</p>
                        <p className={styles.playedSan}>
                          <San san={p.wrongMove.san} />
                          <span className={styles.strike} aria-hidden />
                        </p>
                      </div>
                      <div className={styles.evLabels}>
                        <p className={styles.evTitle}>Evaluation</p>
                        <p className={styles.evVals}>
                          <span className={styles.was}>{p.wasLabel}</span>
                          <span className={styles.evArrow}>&rarr;</span>
                          <span className={styles.now}>{p.nowLabel}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {solved ? (
                <motion.div
                  className={styles.solvedBar}
                  initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                >
                  {!reduced && (
                    <motion.span
                      aria-hidden
                      className={styles.shine}
                      initial={{ x: '-140%' }}
                      animate={{ x: '420%' }}
                      transition={{ duration: 1.1, delay: 0.2, ease: 'easeInOut' }}
                    />
                  )}
                  <p className={styles.solvedText}>
                    <Tick className={styles.tick24} /> Solved
                  </p>
                  <p className={styles.solvedEval}>
                    <span className={styles.seFrom}>{p.nowLabel}</span>
                    <span className={styles.seArrow}>&rarr;</span>
                    <span className={styles.seTo}>{p.finalLabel}</span>
                  </p>
                </motion.div>
              ) : (
                <div className={styles.panelRow}>
                  <span className={styles.badge}>
                    <span className={styles.sideSwatch} data-side="white" />
                  </span>
                  <p className={styles.rowText}>White to move</p>
                </div>
              )}

              {solved && (
                <motion.div
                  className={styles.panelRow}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 30 }}
                >
                  <span className={styles.badge}>
                    <span className={styles.tickCircle}>
                      <Tick className={styles.tick16} />
                    </span>
                  </span>
                  <p className={`${styles.rowText} ${styles.correct}`}>
                    <San san={p.win} /> is correct!
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>

        <div className={styles.happening}>
          <p className={styles.happeningKick}>
            <i aria-hidden /> What&rsquo;s happening
          </p>
          <h3 className={styles.happeningTitle}>{whTitle}</h3>
          <p className={styles.happeningBody}>{whBody}</p>
        </div>
      </div>
    </div>
  );
}

/* Board wrapper that replays the prototype's exact wrong-move shake. */
function BoardShake({
  signal,
  reduced,
  children,
}: {
  signal: number;
  reduced: boolean;
  children: ReactNode;
}) {
  const controls = useAnimationControls();
  const prev = useRef(signal);
  useEffect(() => {
    const rose = signal > prev.current;
    prev.current = signal;
    if (!rose || reduced) return;
    controls.start({
      x: [0, -9, 9, -7, 7, -3, 0],
      transition: { duration: 0.42, ease: 'easeInOut' },
    });
  }, [signal, reduced, controls]);
  return <motion.div animate={controls}>{children}</motion.div>;
}

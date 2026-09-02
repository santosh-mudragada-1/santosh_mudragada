'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Board, EvalBar, CoachBubble, Confetti } from '@/components/CaseStudy/chess';
import { legalTargets } from '@/components/CaseStudy/chess/fen';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './TryIt.module.scss';

/* ============================================================ puzzle data
   Ported verbatim from framercomponent.tsx (#try). Positions rebuilt as FEN;
   the eval-bar %s are mapped onto <EvalBar>'s centipawn scale. Em dashes
   swapped out of the copy to match the rest of the case study. */

type EvalCfg = {
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
  theme: string;
  themeClass: 'blunder' | 'missed';
  fen: string;
  solvedFen: string;
  piece: string;
  solution: string;
  mate: string | null;
  pill: string;
  endPill: string;
  evalStart: EvalCfg;
  evalEnd: EvalCfg;
  coach: string;
  solved: string;
  hint: string;
}

// fill%/peak% -> centipawns, inverting EvalBar's pct(): 50 + cp/1200 * 44
const cpFor = (pctVal: number) => Math.round(((pctVal - 50) / 44) * 1200);

const PUZZLES: Puzzle[] = [
  {
    theme: 'Missed Tactic',
    themeClass: 'blunder',
    fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1',
    solvedFen: '3R2k1/5ppp/8/8/8/8/5PPP/6K1',
    piece: 'd1',
    solution: 'd8',
    mate: 'g8',
    pill: 'M1 → −5.0',
    endPill: '1-0',
    evalStart: {
      cp: cpFor(32),
      label: '−5.0',
      peakCp: 1200,
      peakMate: 1,
      peakLabel: 'M1',
      loop: true,
    },
    evalEnd: { cp: 1200, label: '1-0', decided: true, isUserMove: true },
    coach: 'On move 14 you played Rd3 and let a forced mate slip. It is still there, so start it.',
    solved:
      '♜xd8#. Checkmate on the weak back rank. Spot a forced mate in one and start it with the right move.',
    hint: 'Start with the rook. Which square ends it?',
  },
  {
    theme: 'Knight Fork',
    themeClass: 'missed',
    fen: 'r2q3k/6pp/8/4N3/8/2Q5/5PPP/6K1',
    solvedFen: 'r2q3k/5Npp/8/8/8/2Q5/5PPP/6K1',
    piece: 'e5',
    solution: 'f7',
    mate: null,
    pill: '+5.2 → +0.2',
    endPill: '+5.2',
    evalStart: { cp: cpFor(51), label: '+0.2', peakCp: cpFor(69), peakLabel: '5.0', loop: true },
    evalEnd: { cp: cpFor(69), label: '+5.2', isUserMove: true },
    coach: 'You traded here and missed a family fork. One knight square wins the queen.',
    solved:
      '♞f7+. King and queen on the same fork. When a king is boxed in by its own pawns, look for the square that touches both.',
    hint: 'The knight, not the rook. Find the square that checks and hits d8.',
  },
  {
    theme: 'Hanging Piece',
    themeClass: 'blunder',
    fen: '6k1/5ppp/8/3q4/8/8/5PPP/3R2K1',
    solvedFen: '6k1/5ppp/8/3R4/8/8/5PPP/6K1',
    piece: 'd1',
    solution: 'd5',
    mate: null,
    pill: '+5.0 → −4.0',
    endPill: '+5.0',
    evalStart: { cp: cpFor(35), label: '−4.0', peakCp: cpFor(68), peakLabel: '9.0', loop: true },
    evalEnd: { cp: cpFor(68), label: '+5.0', isUserMove: true },
    coach: 'You pushed a pawn and left the queen alive. It was hanging the whole time.',
    solved:
      '♜xd5. The queen was undefended for three moves. Before anything clever, check what is simply hanging.',
    hint: 'Look down the d-file. Nothing is defending it.',
  },
];

const START_WHY =
  'Every puzzle opens on the position before the mistake, never a blank board. The red band is the advantage the played move handed over.';

const SPARKS = [
  { left: '16%', top: '22%', width: 16, d: '0s' },
  { left: '74%', top: '16%', width: 22, d: '0.5s' },
  { left: '30%', top: '62%', width: 13, d: '1.1s' },
  { left: '84%', top: '56%', width: 15, d: '1.7s' },
  { left: '56%', top: '8%', width: 11, d: '2.2s' },
];

type Phase = 'start' | 'selected' | 'hinted' | 'wrong' | 'solved';
type LogRow = { tag: string; text: string; bad?: boolean };

export function TryIt() {
  const reduced = usePrefersReducedMotion();

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('start');
  const [solvedAny, setSolvedAny] = useState(false);
  const [hintedThis, setHintedThis] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(() => PUZZLES.map(() => false));
  const [tally, setTally] = useState({ clean: 0, hinted: 0, failed: 0 });
  const [shakeSig, setShakeSig] = useState(0);
  const [popDot, setPopDot] = useState<number | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [annot, setAnnot] = useState({ state: 'Puzzle 1: start', why: START_WHY });
  const [log, setLog] = useState<LogRow[]>([
    { tag: 'Ready', text: 'White to play. Click the rook on d1.' },
  ]);

  const p = PUZZLES[idx];
  const solved = phase === 'solved';
  const isLast = idx === PUZZLES.length - 1;
  const allClean = tally.clean === PUZZLES.length;

  const pushLog = useCallback((tag: string, text: string, bad?: boolean) => {
    setLog((rows) => [{ tag, text, bad }, ...rows].slice(0, 8));
  }, []);

  const loadPuzzle = useCallback(
    (i: number, quiet: boolean) => {
      setIdx(i);
      setPhase('start');
      setWrongCount(0);
      setHintedThis(false);
      setPopDot(null);
      const pz = PUZZLES[i];
      if (!quiet) {
        setAnnot({ state: `Puzzle ${i + 1}: start`, why: START_WHY });
        pushLog(
          'Loaded',
          `${pz.theme}: click the ${pz.piece === 'e5' ? 'knight' : 'rook'} on ${pz.piece}.`,
        );
      }
    },
    [pushLog],
  );

  const select = useCallback(() => {
    setPhase('selected');
    setAnnot({
      state: 'Legal moves',
      why: 'A dot for a quiet square, a ring for a capture. The same affordance the product uses; nothing here is a case-study invention.',
    });
    pushLog('Select', `${legalTargets(p.fen, p.piece).length} legal moves.`);
  }, [p.fen, p.piece, pushLog]);

  const wrong = useCallback(
    (sq: string) => {
      setPhase('wrong');
      setWrongCount((n) => n + 1);
      setShakeSig((s) => s + 1);
      setAnnot({
        state: 'Wrong move',
        why: 'A shake, not a penalty. The position is never taken away and the counter never moves backwards; the only cost is your clean solve.',
      });
      pushLog('Wrong', `${sq}: position held, nothing lost.`, true);
    },
    [pushLog],
  );

  const finish = useCallback(() => {
    setFinishOpen(true);
    setAnnot({
      state: 'Set complete',
      why: 'Three outcomes reported, never just a score. On a real set the actions here are ordered by usefulness: clean up what went badly, then the next theme, then replay.',
    });
    setTally((t) => {
      pushLog('Complete', `${t.clean} clean · ${t.hinted} hinted · ${t.failed} failed.`);
      return t;
    });
  }, [pushLog]);

  const solve = useCallback(
    (reveal: boolean) => {
      setPhase('solved');

      const wasClean = !reveal && wrongCount === 0 && !hintedThis;
      setTally((t) => ({
        clean: t.clean + (wasClean ? 1 : 0),
        hinted: t.hinted + (!reveal && !wasClean ? 1 : 0),
        failed: t.failed + (reveal ? 1 : 0),
      }));
      setCleared((c) => (c[idx] ? c : c.map((v, i) => (i === idx ? true : v))));
      setSolvedAny(true);

      if (reveal) {
        setAnnot({
          state: 'Shown, not solved',
          why: 'Revealing records the puzzle as failed, the honest outcome. It stays in the queue, and a later clean solve upgrades it.',
        });
        pushLog('Reveal', 'Recorded as failed. Stays in the queue.', true);
      } else if (wasClean) {
        setAnnot({
          state: 'Solved clean',
          why: 'The green band sweeps up exactly the ground the blunder gave away, then dissolves into the fill. Clean is the only number the product treats as real.',
        });
        pushLog('Solved', 'Clean, no hint, no wrong move.');
      } else {
        setAnnot({
          state: 'Solved, not clean',
          why: 'Counted as solved with help. Attempts only ever improve your standing, so replaying this clean later upgrades it.',
        });
        pushLog('Solved', 'With help, a replay can upgrade it.');
      }

      if (idx + 1 < PUZZLES.length) {
        window.setTimeout(() => setPopDot(idx), reduced ? 0 : 200);
      } else {
        window.setTimeout(() => finish(), reduced ? 100 : 950);
      }
    },
    [reduced, wrongCount, hintedThis, idx, pushLog, finish],
  );

  const onSquare = useCallback(
    (sq: string) => {
      if (phase === 'solved') return;
      if (phase !== 'selected' && phase !== 'wrong') {
        if (sq === p.piece) select();
        return;
      }
      if (sq === p.piece) {
        setPhase('start');
        return;
      }
      if (!legalTargets(p.fen, p.piece).includes(sq)) return;
      if (sq === p.solution) solve(false);
      else wrong(sq);
    },
    [phase, p.piece, p.fen, p.solution, select, solve, wrong],
  );

  const doHint = () => {
    if (solved) return;
    setPhase('hinted');
    setHintedThis(true);
    setAnnot({
      state: 'Hint: step 1 of 3',
      why: 'Ring the piece, then draw the arrow, then play it out. Each step costs more; only the last one records a failure.',
    });
    pushLog('Hint', 'Piece ringed. Clean solve forfeited.');
  };
  const doShow = () => {
    if (!solved) solve(true);
  };
  const doNext = () => {
    if (idx + 1 < PUZZLES.length) loadPuzzle(idx + 1, false);
  };
  const doReset = () => {
    setFinishOpen(false);
    setTally({ clean: 0, hinted: 0, failed: 0 });
    setCleared(PUZZLES.map(() => false));
    setSolvedAny(false);
    loadPuzzle(0, false);
    pushLog('Restart', 'Set reset. Three puzzles again.');
  };

  // derived board marks
  const selecting = phase === 'selected' || phase === 'wrong';
  const highlight = solved ? [p.piece, p.solution] : selecting ? [p.piece] : [];
  const dots = selecting ? legalTargets(p.fen, p.piece) : [];
  const hintRing = phase === 'hinted' ? [p.piece] : [];
  const invite = phase === 'start' && !solvedAny ? [p.piece] : [];

  const evalCfg = solved ? p.evalEnd : p.evalStart;
  const muteBadge = !solved && (hintedThis || phase === 'wrong');
  const badge: 'best' | 'blunder' | 'missed' | undefined = solved
    ? 'best'
    : muteBadge
      ? undefined
      : p.themeClass;
  const pill = solved ? p.endPill : muteBadge ? undefined : p.pill;
  const coachText = solved
    ? p.solved
    : phase === 'wrong'
      ? "Not quite, that isn't the move. Take another look."
      : hintedThis
        ? p.hint
        : p.coach;

  const accuracy = Math.round((tally.clean / PUZZLES.length) * 100);

  return (
    <div className={styles.proto}>
      {/* ===================================================== left: stage */}
      <div className={styles.stage}>
        <div className={styles.hud}>
          <span className={styles.badgeTag} data-tone={p.themeClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/case-study/move-types/${p.themeClass}.png`} alt="" width={20} height={20} />
            {p.theme}
          </span>
          <span className={styles.counter}>
            Puzzle{' '}
            <span>
              {idx + 1} / {PUZZLES.length}
            </span>
          </span>
          <span className={styles.streak} aria-label="Set progress">
            {PUZZLES.map((pz, i) => (
              <i
                key={pz.theme}
                data-on={cleared[i] || undefined}
                data-pop={popDot === i || undefined}
              />
            ))}
          </span>
        </div>

        <div className={styles.top}>
          <BoardShake className={styles.boardWrap} signal={shakeSig} reduced={reduced}>
              <Board
                fen={solved ? p.solvedFen : p.fen}
                orientation="white"
                onSquareClick={onSquare}
                ariaLabel={
                  solved
                    ? `${p.endPill}.`
                    : selecting
                      ? 'Pick the square that solves it.'
                      : `White to play. Click the piece on ${p.piece}.`
                }
                highlight={highlight}
                dots={dots}
                hint={hintRing}
                invite={invite}
                danger={solved ? p.mate : null}
                mated={solved && !!p.mate}
                lastMove={solved ? { from: p.piece, to: p.solution } : null}
                showCoordinates={false}
              />

              {solved && !reduced && <Confetti run count={finishOpen ? 70 : 40} />}

              <AnimatePresence>
                {finishOpen && (
                  <motion.div
                    className={styles.finish}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={styles.finishCard}
                      initial={reduced ? false : { opacity: 0, y: 14, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    >
                      <button
                        type="button"
                        className={styles.finishClose}
                        onClick={() => setFinishOpen(false)}
                        aria-label="Close"
                      >
                        ✕
                      </button>
                      <div className={styles.finishArt}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/case-study/game-based-puzzles.svg" alt="" />
                        {!reduced && (
                          <div className={styles.sparkles}>
                            {SPARKS.map((s, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={i}
                                src="/case-study/sparkle.svg"
                                alt=""
                                style={{
                                  left: s.left,
                                  top: s.top,
                                  width: s.width,
                                  ['--d' as string]: s.d,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={styles.finishTag}>Queue cleared</span>
                      <h3 className={styles.finishTitle}>
                        {allClean ? 'Perfect set.' : "You're all caught up!"}
                      </h3>
                      <div className={styles.finishStats}>
                        <div>
                          <b>
                            {PUZZLES.length}/{PUZZLES.length}
                          </b>
                          <span>Solved</span>
                        </div>
                        <div>
                          <b>
                            {tally.clean}/{PUZZLES.length}
                          </b>
                          <span>Clean</span>
                        </div>
                        <div>
                          <b>{accuracy}%</b>
                          <span>Accuracy</span>
                        </div>
                      </div>
                      <p className={styles.finishLine}>
                        {allClean
                          ? "Three clean solves, that's the number the product treats as real."
                          : `${PUZZLES.length - tally.clean} ${
                              PUZZLES.length - tally.clean === 1 ? 'puzzle' : 'puzzles'
                            } needed a hint or a reveal, those are the ones worth another look.`}
                      </p>
                      <div className={styles.finishActions}>
                        <button
                          type="button"
                          className={`${styles.finishBtn} ${styles.finishBtnGreen}`}
                          onClick={doReset}
                          data-cursor="link"
                        >
                          Solve again
                        </button>
                        <button
                          type="button"
                          className={`${styles.finishBtn} ${styles.finishBtnGhost}`}
                          onClick={() => setFinishOpen(false)}
                          data-cursor="link"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
          </BoardShake>

          <div className={styles.evalCol}>
            <EvalBar {...evalCfg} step={`${idx}-${phase}`} />
          </div>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.ccBtn} ${styles.ccPrimary}`}
            onClick={doNext}
            disabled={!solved || isLast}
            data-cursor="link"
          >
            Next puzzle
          </button>
          <button
            type="button"
            className={`${styles.ccBtn} ${styles.ccSecondary}`}
            onClick={doHint}
            disabled={solved || hintedThis}
            data-cursor="link"
          >
            Hint
          </button>
          <button
            type="button"
            className={`${styles.ccBtn} ${styles.ccSecondary}`}
            onClick={doShow}
            disabled={solved}
            data-cursor="link"
          >
            Show solution
          </button>
          <button
            type="button"
            className={`${styles.ccBtn} ${styles.ccGhost}`}
            onClick={doReset}
            data-cursor="link"
          >
            Restart set
          </button>
        </div>
      </div>

      {/* ===================================================== right: side */}
      <div className={styles.side}>
        <CoachBubble text={coachText} classification={badge} evalText={pill ?? undefined} />

        <aside className={styles.annot}>
          <div className={styles.annotHead}>
            <i aria-hidden /> What&rsquo;s happening
          </div>
          <AnimatePresence mode="wait">
            <motion.h3
              key={annot.state}
              className={styles.annotState}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {annot.state}
            </motion.h3>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={annot.why}
              className={styles.annotWhy}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {annot.why}
            </motion.p>
          </AnimatePresence>
          <ul className={styles.annotLog}>
            <AnimatePresence initial={false}>
              {log.map((row, i) => (
                <motion.li
                  key={`${row.tag}-${log.length - i}-${row.text}`}
                  data-bad={row.bad || undefined}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 30 }}
                >
                  <b>{row.tag}</b>
                  <span>{row.text}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </aside>
      </div>
    </div>
  );
}

/* Board wrapper — replays the prototype's exact wrong-move shake. */
function BoardShake({
  signal,
  reduced,
  className,
  children,
}: {
  signal: number;
  reduced: boolean;
  className?: string;
  children: ReactNode;
}) {
  const controls = useAnimationControls();
  const prev = useRef(signal);
  useEffect(() => {
    const rose = signal > prev.current;
    prev.current = signal;
    if (!rose || reduced) return;
    controls.start({
      x: [0, -7, 6, -5, 4, -2, 0],
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    });
  }, [signal, reduced, controls]);
  return (
    <motion.div className={className} animate={controls}>
      {children}
    </motion.div>
  );
}

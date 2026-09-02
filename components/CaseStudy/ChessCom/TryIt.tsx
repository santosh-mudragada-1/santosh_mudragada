'use client';

import { useCallback, useRef, useState } from 'react';
import { Board, EvalBar, CoachBubble, Confetti } from '@/components/CaseStudy/chess';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './TryIt.module.scss';

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
  from: string;
  to: string;
  fen: string;
  solvedFen: string;
  danger?: string | null;
  mated?: boolean;
  win: string;
  pieceHint: string; // "the rook on d1"
  targetHint: string; // "d8"
  evalStart: EvalProps;
  evalSolved: EvalProps;
  whStart: { title: string; body: string };
  whSolved: { title: string; body: string };
  coachStart: string;
  coachSolved: string;
}

const PUZZLES: Puzzle[] = [
  {
    tag: 'Back-rank mate',
    from: 'd1',
    to: 'd8',
    fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1',
    solvedFen: '3R2k1/5ppp/8/8/8/8/5PPP/6K1',
    danger: 'g8',
    mated: true,
    win: 'Rxd8#',
    pieceHint: 'the rook on d1',
    targetHint: 'd8',
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
    whStart: {
      title: 'Puzzle 1 — start',
      body: 'Opens on the position before the mistake, never a blank board. The red band is the advantage the played move handed over.',
    },
    whSolved: {
      title: 'Puzzle 1 — solved',
      body: 'The rook drops onto the back rank. The pawns on f7, g7, h7 are the walls — the king never had a square.',
    },
    coachStart: 'On move 14 you played Rd3 and let a forced mate slip. It is still on the board. Play it.',
    coachSolved: 'Rxd8#. Back-rank mate. Green sweeps the bar back up — you won back exactly what the blunder cost.',
  },
  {
    tag: 'Knight fork',
    from: 'b5',
    to: 'c7',
    fen: 'r3k3/5ppp/8/1N6/8/8/5PPP/6K1',
    solvedFen: 'r3k3/2N2ppp/8/8/8/8/5PPP/6K1',
    danger: 'e8',
    mated: false,
    win: 'Nc7+',
    pieceHint: 'the knight on b5',
    targetHint: 'c7',
    evalStart: { cp: -180, label: '−1.8', peakCp: 700, peakLabel: '+7', loop: true },
    evalSolved: { cp: 520, label: '+5.2', isUserMove: true },
    whStart: {
      title: 'Puzzle 2 — start',
      body: 'The king never castled. One square hits the king and the rook on a8 at the same time.',
    },
    whSolved: {
      title: 'Puzzle 2 — solved',
      body: 'Check first. The king has to step off, then the knight takes the rook on a8 for free — a clean exchange up.',
    },
    coachStart: 'You traded into this a move ago and missed the fork. The knight jumps once and the rook is lost.',
    coachSolved: 'Nc7+. The fork. King moves, then Nxa8 — the rook falls and you are the exchange up.',
  },
  {
    tag: 'Hanging queen',
    from: 'g2',
    to: 'b7',
    fen: '6k1/1q3ppp/8/8/8/8/5PBP/6K1',
    solvedFen: '6k1/1B3ppp/8/8/8/8/5P1P/6K1',
    danger: null,
    mated: false,
    win: 'Bxb7',
    pieceHint: 'the bishop on g2',
    targetHint: 'b7',
    evalStart: { cp: -260, label: '−2.6', peakCp: 1100, peakLabel: '+9', loop: true },
    evalSolved: { cp: 1000, label: '+9.0', isUserMove: true },
    whStart: {
      title: 'Puzzle 3 — start',
      body: 'The long diagonal is open all the way to b7. Look at what is sitting on it, and what is defending it.',
    },
    whSolved: {
      title: 'Puzzle 3 — solved',
      body: 'Nothing was defending the queen. The bishop takes it and the game is effectively over.',
    },
    coachStart: 'A move ago you shut the diagonal, then reopened it. The queen on b7 has no defender.',
    coachSolved: 'Bxb7. The queen was hanging the whole time. Free piece, game over.',
  },
];

type Phase = 'idle' | 'picked' | 'solved';

export function TryIt() {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [hinted, setHinted] = useState(false);
  const [wrong, setWrong] = useState(false);
  const wrongT = useRef(0);

  const p = PUZZLES[idx];
  const solved = phase === 'solved';
  const last = idx === PUZZLES.length - 1;

  const flashWrong = useCallback(() => {
    setWrong(true);
    window.clearTimeout(wrongT.current);
    wrongT.current = window.setTimeout(() => setWrong(false), 420);
  }, []);

  const onSquare = useCallback(
    (sq: string) => {
      if (phase === 'solved') return;
      if (phase === 'idle') {
        if (sq === p.from) setPhase('picked');
        else flashWrong();
        return;
      }
      // picked
      if (sq === p.to) setPhase('solved');
      else if (sq === p.from) setPhase('idle');
      else flashWrong();
    },
    [phase, p.from, p.to, flashWrong],
  );

  const goNext = () => {
    setIdx((i) => (last ? 0 : i + 1));
    setPhase('idle');
    setHinted(false);
  };
  const restart = () => {
    setIdx(0);
    setPhase('idle');
    setHinted(false);
  };

  const evalProps = solved ? p.evalSolved : p.evalStart;
  const wh = solved ? p.whSolved : p.whStart;
  const statusLine = solved
    ? `${p.win} played. On to the next.`
    : phase === 'picked'
      ? `Now the square — click ${p.targetHint}.`
      : `White to play. Click ${p.pieceHint}.`;

  return (
    <div className={styles.wrap}>
      {/* -------------------------------------------- device / board */}
      <div className={styles.device}>
        <div className={styles.deviceHead}>
          <span className={styles.deviceTag}>
            <i aria-hidden>??</i> Missed tactic
          </span>
          <span className={styles.devicePuzzle}>
            Puzzle <b>{idx + 1}</b> / {PUZZLES.length}
          </span>
          <span className={styles.deviceDots} aria-hidden>
            •••
          </span>
        </div>

        <div className={`${styles.deviceBoard} ${wrong ? styles.shake : ''}`}>
          <Board
            fen={solved ? p.solvedFen : p.fen}
            orientation="white"
            onSquareClick={onSquare}
            ariaLabel={statusLine}
            hint={!solved && (phase === 'picked' || hinted) ? [p.from] : []}
            dots={phase === 'picked' ? [p.to] : []}
            highlight={solved ? [p.from, p.to] : []}
            lastMove={solved ? { from: p.from, to: p.to } : null}
            danger={solved ? p.danger ?? null : null}
            mated={solved ? p.mated ?? false : false}
            showCoordinates={false}
          />
          <div className={styles.deviceEval}>
            <EvalBar {...evalProps} step={`${idx}-${phase}`} />
          </div>
          {solved && !reduced && <Confetti run count={38} />}
        </div>

        <div className={styles.deviceActions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={goNext}
            disabled={!solved}
            data-cursor="link"
          >
            {last ? 'Restart set' : 'Next puzzle'}
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => setHinted(true)}
            disabled={solved}
            data-cursor="link"
          >
            Hint
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => setPhase('solved')}
            disabled={solved}
            data-cursor="link"
          >
            Show solution
          </button>
          <button type="button" className={styles.btnGhost} onClick={restart} data-cursor="link">
            Restart set
          </button>
        </div>
      </div>

      {/* -------------------------------------------- side rail */}
      <div className={styles.side}>
        <CoachBubble
          classification={solved ? 'brilliant' : 'blunder'}
          evalText={solved ? p.evalSolved.label : p.evalStart.peakLabel}
          text={solved ? p.coachSolved : p.coachStart}
        />

        <div className={styles.happening}>
          <p className={styles.happeningKick}>
            <i aria-hidden /> What&rsquo;s happening
          </p>
          <h3 className={styles.happeningTitle}>{wh.title}</h3>
          <p className={styles.happeningBody}>{wh.body}</p>
          <hr className={styles.happeningRule} />
          <p className={styles.happeningStatus}>
            <span data-state={solved ? 'solved' : 'ready'}>{solved ? 'Solved' : 'Ready'}</span>
            {statusLine}
          </p>
        </div>

        <p className={styles.tally} aria-live="polite">
          {PUZZLES.map((pz, i) => (
            <span key={pz.tag} data-on={i < idx || (i === idx && solved) || undefined}>
              {pz.tag}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

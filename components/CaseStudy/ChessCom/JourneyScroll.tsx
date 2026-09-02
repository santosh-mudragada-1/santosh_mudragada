'use client';

import { useEffect, useRef, useState } from 'react';
import { Board, EvalBar, CoachBubble, Confetti } from '@/components/CaseStudy/chess';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './JourneyScroll.module.scss';

// One blunder, end to end. The frame on the left is sticky; scrolling the beats
// on the right sets `active`, and the board / eval bar / coach update to match.
const FEN_START = '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1'; // black Rd8, white Rd1
const FEN_BLUNDER = '3r2k1/5ppp/8/8/8/3R4/5PPP/6K1'; // white rook wandered to d3
const FEN_MATE = '3R2k1/5ppp/8/8/8/8/5PPP/6K1'; // white Rxd8#

type MoveClass = 'book' | 'blunder' | 'best' | 'brilliant';

interface Beat {
  tag: string;
  title: string;
  body: string;
  fen: string;
  lastMove?: { from: string; to: string } | null;
  highlight?: string[];
  hint?: string[];
  dots?: string[];
  danger?: string | null;
  mated?: boolean;
  coach: { text: string; evalText?: string; classification?: MoveClass };
  eval?: {
    cp: number;
    label: string;
    peakCp?: number;
    mate?: number | null;
    peakMate?: number | null;
    peakLabel?: string;
    decided?: boolean;
    loop?: boolean;
    isUserMove?: boolean;
  } | null;
  status?: { pre: string; strike?: string; badge?: string; tone: 'loss' | 'gain' } | null;
  confetti?: boolean;
}

const BEATS: Beat[] = [
  {
    tag: 'Play',
    title: 'A real game, from your archive.',
    body: 'Not a curated library position. Yours.',
    fen: FEN_START,
    coach: {
      classification: 'book',
      text: "A rapid game, move 14. Stockfish hasn't looked at it yet.",
    },
    eval: { cp: 0, label: '0.0' },
  },
  {
    tag: 'Detect',
    title: 'Move 14: Rd3',
    body: 'A forced mate was on the board. After Rd3, Black plays Rxd3 and takes the rook instead.',
    fen: FEN_BLUNDER,
    lastMove: { from: 'd1', to: 'd3' },
    highlight: ['d1', 'd3'],
    coach: {
      classification: 'blunder',
      evalText: 'M1 → −5.0',
      text: 'You played Rd3. Black answers Rxd3 and the mate is gone with the rook.',
    },
    eval: {
      cp: -500,
      label: '−5.0',
      peakCp: 1200,
      peakMate: 1,
      peakLabel: 'M1',
      isUserMove: true,
      loop: true,
    },
    status: { pre: 'You played', strike: 'Rd3', badge: 'M1 → −5.0', tone: 'loss' },
  },
  {
    tag: 'Rewind',
    title: 'The board rewinds.',
    body: 'Back to the instant before the decision. Red on the bar is what you gave away.',
    fen: FEN_START,
    coach: {
      text: 'Back to the position before your move. The mate is still here.',
      evalText: 'M1 available',
    },
    eval: { cp: -40, label: 'M1', mate: 1, peakMate: 1, peakLabel: 'M1', loop: true },
  },
  {
    tag: 'Decide',
    title: 'Find it again.',
    body: 'Legal dots, a ring for the capture. Hints cost your clean solve, never your progress.',
    fen: FEN_START,
    hint: ['d1', 'd8'],
    dots: ['d2', 'd3', 'd4', 'd5', 'd6', 'd7'],
    coach: { text: 'White to play. Find the move that was there.' },
    eval: { cp: -40, label: 'M1', mate: 1, peakMate: 1, peakLabel: 'M1', loop: true },
  },
  {
    tag: 'Feedback',
    title: 'Checkmate on the back rank.',
    body: 'Green sweeps up the bar. You won back exactly what the blunder cost.',
    fen: FEN_MATE,
    lastMove: { from: 'd1', to: 'd8' },
    highlight: ['d1', 'd8'],
    danger: 'g8',
    mated: true,
    coach: {
      classification: 'best',
      evalText: '1-0',
      text: 'Rxd8#. Checkmate on the weak back rank; spot a forced mate in one and start it with the right move.',
    },
    eval: { cp: 1200, label: '1-0', decided: true, isUserMove: true, peakMate: 1, peakLabel: 'M1' },
    status: { pre: 'Rxd8#', badge: 'is correct!', tone: 'gain' },
  },
  {
    tag: 'Return',
    title: 'Home updates instantly.',
    body: "One shared progress state. The two screens can't drift.",
    fen: FEN_MATE,
    highlight: ['d8'],
    danger: 'g8',
    mated: true,
    coach: {
      classification: 'brilliant',
      evalText: '3 / 12',
      text: 'Solved clean. Puzzle 3 of 12, the home card already knows.',
    },
    eval: { cp: 1200, label: '1-0', decided: true },
    status: { pre: 'Solved clean · progress synced', tone: 'gain' },
    confetti: true,
  },
];

export function JourneyScroll() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const beatRefs = useRef<Array<HTMLLIElement | null>>([]);

  // whichever beat's centre is nearest the viewport centre is active — a
  // deterministic single winner (no observer double-fires, no skipped beats)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < beatRefs.current.length; i++) {
        const el = beatRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      setActive((prev) => (prev === best ? prev : best));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const b = BEATS[active];

  return (
    <div className={styles.scrolly}>
      <div className={styles.stage}>
        <div className={styles.frame}>
          <div className={styles.frameHead}>
            <span className={styles.frameTag}>
              <i aria-hidden>??</i>
              Blunder
            </span>
            <span className={styles.frameMeta}>vs. M. Kowalski · Rapid</span>
            <span className={styles.frameChip}>Medium</span>
          </div>

          <div className={styles.frameBoard} data-noeval={!b.eval || undefined}>
            <Board
              fen={b.fen}
              orientation="white"
              lastMove={b.lastMove ?? null}
              highlight={b.highlight ?? []}
              hint={b.hint ?? []}
              dots={b.dots ?? []}
              danger={b.danger ?? null}
              mated={b.mated ?? false}
              showCoordinates={false}
            />
            {b.eval && (
              <div className={styles.frameEval}>
                <EvalBar {...b.eval} step={`beat-${active}`} />
              </div>
            )}
            {b.confetti && !reduced && <Confetti run count={40} />}
          </div>

          <CoachBubble
            classification={b.coach.classification}
            evalText={b.coach.evalText}
            text={b.coach.text}
          />

          {b.status && (
            <div className={styles.frameStatus} data-tone={b.status.tone}>
              <span>
                {b.status.pre}
                {b.status.strike && <s> {b.status.strike}</s>}
              </span>
              {b.status.badge && <span className={styles.frameStatusBadge}>{b.status.badge}</span>}
            </div>
          )}
        </div>
      </div>

      <ol className={styles.beats}>
        {BEATS.map((beat, i) => (
          <li
            key={beat.tag}
            data-i={i}
            data-on={active === i || undefined}
            ref={(el) => {
              beatRefs.current[i] = el;
            }}
          >
            <div className={styles.beatCard}>
              <p className={styles.beatKick}>
                {String(i + 1).padStart(2, '0')} — {beat.tag}
              </p>
              <h3 className={styles.beatTitle}>{beat.title}</h3>
              <p className={styles.beatBody}>{beat.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

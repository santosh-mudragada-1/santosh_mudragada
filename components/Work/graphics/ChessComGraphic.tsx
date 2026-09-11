'use client';

import { useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { Board, EvalBar } from '@/components/CaseStudy/chess';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import type { WorkGraphicProps } from './types';
import styles from './ChessComGraphic.module.scss';

// Chess.com card art, assembled only from the case-study's own pieces:
// the real <Board> + <EvalBar> from components/CaseStudy/chess, the official
// move-classification art from /public/case-study, and the same chess-piece
// PNGs the board itself paints.
//
// The position is the case study's spine — the back-rank M1 from JourneyScroll:
//   rest  = the "Decide" beat (rook ringed, d-file dots, "M1" on the bar)
//   hover = the "Feedback" beat (Rxd8#, king toppled, the bar swings to 1-0)
const FEN_REST = '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1'; // black Rd8, white Rd1
const FEN_MATE = '3R2k1/5ppp/8/8/8/8/5PPP/6K1'; // white Rxd8#

const DOTS = ['d2', 'd3', 'd4', 'd5', 'd6', 'd7'];

// The bar states from the "Try it" solver, verbatim: the M1 that was on the
// board vs. the fill the played move left — the gap sweeps red and carries the
// "M1" tag; a correct move replays it green up to 1-0.
const EVAL_REST = {
  cp: -491,
  label: '−5.0',
  peakCp: 1200,
  peakMate: 1 as number | null,
  peakLabel: 'M1',
  loop: true,
};
const EVAL_MATE = {
  cp: 1200,
  label: '1-0',
  decided: true,
  isUserMove: true,
  peakMate: 1 as number | null,
  peakLabel: 'M1',
};

// Scattered pieces — same art the <Board> uses, drifting on the dark ground.
// `w` is a share of the card's shorter side; `par` is the scroll-parallax
// multiplier (bigger = travels more = reads nearer).
const FLOATERS = [
  { src: 'knight-black', left: '2%', top: '9%', w: 15, rot: -10, op: 0.5, par: 1.5 },
  { src: 'king-white', left: '4%', top: '44%', w: 17, rot: 8, op: 0.4, par: 0.8 },
  { src: 'rook-white', left: '10%', bottom: '16%', w: 14, rot: -6, op: 0.44, par: 1.7 },
  { src: 'bishop-black', right: '6%', top: '7%', w: 13, rot: 12, op: 0.34, par: 1.3 },
  { src: 'queen-white', right: '3%', top: '37%', w: 16, rot: -9, op: 0.4, par: 0.7 },
  { src: 'bishop-white', right: '9%', bottom: '13%', w: 13, rot: 7, op: 0.42, par: 1.6 },
  { src: 'pawn-black', right: '20%', bottom: '6%', w: 10, rot: 10, op: 0.32, par: 1.9 },
] as const;

export function ChessComGraphic({ className }: WorkGraphicProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const interactive = !isTouch && !reduced;

  const [solved, setSolved] = useState(false);

  useGSAP(
    () => {
      if (reduced) return;
      const root = rootRef.current;
      if (!root) return;

      // idle drift on the scattered pieces — transform only, one tween each
      const floats = Array.from(
        root.querySelectorAll<HTMLElement>(`.${styles.floater}`),
      );
      floats.forEach((el, i) => {
        gsap.to(el, {
          xPercent: i % 2 ? 7 : -7,
          duration: 4 + (i % 3),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.25,
        });
      });

      // scroll parallax — every layer rides the same scrub but travels a
      // different distance, so the card gains depth as it passes the viewport.
      const layers = Array.from(
        root.querySelectorAll<HTMLElement>('[data-par]'),
      );
      layers.forEach((el) => {
        const par = parseFloat(el.dataset.par || '1');
        gsap.fromTo(
          el,
          { y: () => 22 * par },
          {
            y: () => -22 * par,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  const play = () => interactive && setSolved(true);
  const reverse = () => interactive && setSolved(false);

  return (
    <div
      ref={rootRef}
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      onMouseEnter={play}
      onMouseLeave={reverse}
    >
      <span className={styles.emblem} data-par="0.35" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.logo} src="/case-study/chesscom-logo.webp" alt="" />
      </span>

      <div className={styles.floats} aria-hidden>
        {FLOATERS.map((f) => (
          <span
            key={f.src}
            className={styles.floater}
            data-par={f.par}
            style={{
              left: 'left' in f ? f.left : undefined,
              right: 'right' in f ? f.right : undefined,
              top: 'top' in f ? f.top : undefined,
              bottom: 'bottom' in f ? f.bottom : undefined,
              width: `${f.w}cqmin`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.floaterImg}
              src={`/case-study/chess-pieces/${f.src}.webp`}
              alt=""
              style={{ ['--rot' as string]: `${f.rot}deg`, ['--op' as string]: f.op }}
            />
          </span>
        ))}
      </div>

      <div className={styles.stage} data-par="0.7">
        <div className={styles.stageInner}>
          <div className={styles.evalCol}>
            <EvalBar {...(solved ? EVAL_MATE : EVAL_REST)} step={solved ? 'mate' : 'rest'} />
          </div>
          <div className={styles.boardWrap}>
            <Board
              fen={solved ? FEN_MATE : FEN_REST}
              orientation="white"
              hint={solved ? [] : ['d1', 'd8']}
              dots={solved ? [] : DOTS}
              highlight={solved ? ['d1', 'd8'] : []}
              danger={solved ? 'g8' : null}
              mated={solved}
              lastMove={solved ? { from: 'd1', to: 'd8' } : null}
              showCoordinates={false}
            />
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`${styles.badge} ${styles.badgeGood}`}
        data-par="1.5"
        src="/case-study/move-types/brilliant.webp"
        alt=""
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`${styles.badge} ${styles.badgeBad}`}
        data-par="1.7"
        src="/case-study/move-types/blunder.webp"
        alt=""
        aria-hidden
      />
    </div>
  );
}

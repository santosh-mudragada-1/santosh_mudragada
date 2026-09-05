'use client';

import { useMemo, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import type { WorkGraphicProps } from './types';
import styles from './ChessComGraphic.module.scss';

// Real Chess.com-style board + eval tones, ported from Board.module.scss /
// EvalBar.tsx so this card reads as the same puzzle, not a generic board.
const LIGHT_SQ = '#eeeed2';
const DARK_SQ = '#769656';
const HIGHLIGHT = 'rgba(246, 246, 105, 0.55)';
const WRONG = 'rgba(225, 83, 83, 0.55)';
const EVAL_DARK = '#403d39';
const EVAL_LIGHT = '#f1f0e8';
const CONFETTI = ['#81b64c', '#e6912c', '#4a90d9', '#f0c15c'];

const BX = 24;
const BY = 30;
const SQ = 15;
const EVAL_X = 162;
const EVAL_Y = 30;
const EVAL_H = 120;

// The blunder: a knight hanging on d3 (grid coords), corrected onto b6.
const FROM = { col: 4, row: 3 };
const TO = { col: 2, row: 2 };
const cx = (col: number) => BX + col * SQ + SQ / 2;
const cy = (row: number) => BY + row * SQ + SQ / 2;

export function ChessComGraphic({ className }: WorkGraphicProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrongRef = useRef<SVGRectElement>(null);
  const targetRef = useRef<SVGRectElement>(null);
  const knightRef = useRef<SVGTextElement>(null);
  const fillRef = useRef<SVGRectElement>(null);
  const bubbleRef = useRef<SVGGElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const confettiRefs = useRef<SVGCircleElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  confettiRefs.current = [];

  const squares = useMemo(() => {
    const out: { x: number; y: number; dark: boolean }[] = [];
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        out.push({ x: BX + col * SQ, y: BY + row * SQ, dark: (row + col) % 2 === 1 });
      }
    }
    return out;
  }, []);

  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const interactive = !isTouch && !reduced;

  useGSAP(
    () => {
      if (!interactive) return;
      const check = checkRef.current;
      if (
        !wrongRef.current ||
        !targetRef.current ||
        !knightRef.current ||
        !fillRef.current ||
        !bubbleRef.current ||
        !check ||
        confettiRefs.current.length < CONFETTI.length
      )
        return;

      const checkLen = check.getTotalLength();
      gsap.set(check, { strokeDasharray: checkLen, strokeDashoffset: checkLen });

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });

      tl.to(wrongRef.current, { autoAlpha: 0.9, duration: 0.18, yoyo: true, repeat: 1 }, 0)
        .to(knightRef.current, { x: cx(TO.col) - cx(FROM.col), y: cy(TO.row) - cy(FROM.row), duration: 0.4, ease: 'power2.inOut' }, 0.3)
        .to(wrongRef.current, { autoAlpha: 0, duration: 0.2 }, 0.32)
        .to(targetRef.current, { autoAlpha: 1, duration: 0.25 }, 0.55)
        .to(fillRef.current, { attr: { y: EVAL_Y + EVAL_H * 0.35, height: EVAL_H * 0.65 }, duration: 0.6, ease: 'power2.inOut' }, 0.3)
        .fromTo(
          bubbleRef.current,
          { scale: 0, autoAlpha: 0, transformOrigin: '0% 100%' },
          { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.8)' },
          0.55,
        )
        .to(check, { strokeDashoffset: 0, duration: 0.3, ease: 'power1.out' }, 0.72)
        .to(
          confettiRefs.current,
          {
            x: (i: number) => Math.cos((i / CONFETTI.length) * Math.PI * 2) * 22,
            y: (i: number) => Math.sin((i / CONFETTI.length) * Math.PI * 2) * 22 - 6,
            autoAlpha: 0,
            duration: 0.55,
            stagger: 0.02,
            ease: 'power2.out',
          },
          0.78,
        );

      tlRef.current = tl;
    },
    { scope: rootRef, dependencies: [interactive] },
  );

  const play = () => tlRef.current?.play();
  const reverse = () => tlRef.current?.reverse();

  return (
    <div
      ref={rootRef}
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      onMouseEnter={play}
      onMouseLeave={reverse}
    >
      <svg className={styles.svg} viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <rect width="300" height="200" fill="var(--carbon-2)" />

        {/* board */}
        <g>
          {squares.map((s, i) => (
            <rect key={i} x={s.x} y={s.y} width={SQ} height={SQ} fill={s.dark ? DARK_SQ : LIGHT_SQ} />
          ))}
          <rect
            ref={targetRef}
            x={BX + TO.col * SQ}
            y={BY + TO.row * SQ}
            width={SQ}
            height={SQ}
            fill={HIGHLIGHT}
            opacity={0}
          />
          <rect
            ref={wrongRef}
            x={BX + FROM.col * SQ}
            y={BY + FROM.row * SQ}
            width={SQ}
            height={SQ}
            fill={WRONG}
            opacity={0}
          />
          <rect x={BX} y={BY} width={SQ * 8} height={SQ * 8} fill="none" stroke="rgba(244, 240, 233, 0.32)" />

          {/* pieces */}
          <text x={cx(6)} y={cy(1)} textAnchor="middle" dominantBaseline="central" fontSize="15" fill="var(--carbon)" stroke="var(--paper)" strokeWidth="0.3" fontFamily="system-ui, 'Segoe UI Symbol', sans-serif">
            ♛
          </text>
          <text x={cx(1)} y={cy(6)} textAnchor="middle" dominantBaseline="central" fontSize="14" fill="var(--paper)" stroke="var(--carbon)" strokeWidth="0.5" fontFamily="system-ui, 'Segoe UI Symbol', sans-serif">
            ♔
          </text>
          <text
            ref={knightRef}
            x={cx(FROM.col)}
            y={cy(FROM.row)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fill="var(--paper)"
            stroke="var(--carbon)"
            strokeWidth="0.5"
            fontFamily="system-ui, 'Segoe UI Symbol', sans-serif"
          >
            ♘
          </text>
        </g>

        {/* eval bar */}
        <g>
          <rect x={EVAL_X} y={EVAL_Y} width="16" height={EVAL_H} fill={EVAL_DARK} />
          <rect ref={fillRef} x={EVAL_X} y={EVAL_Y + EVAL_H * 0.7} width="16" height={EVAL_H * 0.3} fill={EVAL_LIGHT} />
          <rect x={EVAL_X} y={EVAL_Y} width="16" height={EVAL_H} fill="none" stroke="rgba(244, 240, 233, 0.32)" />
        </g>

        {/* coach callout, appears once the move lands */}
        <g ref={bubbleRef} opacity={0}>
          <path d="M190,58 l10,14 l10,-14 Z" fill="var(--carbon)" />
          <rect x="188" y="16" width="94" height="42" rx="9" fill="var(--carbon)" stroke="rgba(244, 240, 233, 0.32)" />
          <path
            ref={checkRef}
            d="M208,37 l9,9 l19,-19"
            fill="none"
            stroke="#81b64c"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {CONFETTI.map((c, i) => (
            <circle
              key={i}
              ref={(el) => {
                if (el) confettiRefs.current[i] = el;
              }}
              cx="270"
              cy="24"
              r="2.4"
              fill={c}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

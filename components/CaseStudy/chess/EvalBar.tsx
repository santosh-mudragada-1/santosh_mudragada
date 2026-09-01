'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './EvalBar.module.scss';

// Ported from the Chess.com prototype (src/components/puzzles/puzzle-eval-bar.tsx).
// Same behaviour: the bar is anchored to what *was* available (peak) and filled
// to what the played move left; the gap is red and sweeps down while unsolved;
// a correct move replays the band green, sweeping up, then it dissolves.

const LIGHT = '#f1f0e8';
const DARK = '#403d39';
const LOSS = '#e3a0a0';
const LOSS_HOT = '#d24b4b';
const GAIN = '#a9d183';
const GAIN_HOT = '#81b64c';
const INK_DARK = '#22201d';
const INK_LIGHT = '#ece9e1';

const MAX_UNDECIDED = 94;
const FULL_AT = 1200;

function pct(cp: number, mate?: number | null, decided?: boolean) {
  if (decided) return cp >= 0 ? 100 : 0;
  if (mate != null) return mate >= 0 ? 100 : 0;
  const capped = Math.max(-FULL_AT, Math.min(FULL_AT, cp));
  return 50 + (capped / FULL_AT) * (MAX_UNDECIDED - 50);
}

function SweepBand({
  lo,
  hi,
  tone,
  hot,
  direction,
  loop,
  reduced,
  fade,
}: {
  lo: number;
  hi: number;
  tone: string;
  hot: string;
  direction: 'up' | 'down';
  loop: boolean;
  reduced: boolean;
  fade?: number;
}) {
  const height = hi - lo;
  if (height <= 0.4) return null;
  const travel = direction === 'down' ? ['-100%', '200%'] : ['200%', '-100%'];

  return (
    <motion.div
      className={styles.band}
      style={{ bottom: `${lo}%`, height: `${height}%` }}
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: fade ?? 0, ease: 'easeOut' }}
    >
      <div className={styles.bandFill} style={{ backgroundColor: tone }} />
      {!reduced && (
        <motion.div
          className={styles.bandHot}
          style={{
            background: `linear-gradient(to bottom, transparent, ${hot}, transparent)`,
          }}
          initial={{ y: travel[0] }}
          animate={{ y: travel }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
            repeat: loop ? Infinity : 0,
            repeatDelay: loop ? 0.2 : 0,
          }}
        />
      )}
    </motion.div>
  );
}

interface EvalBarProps {
  cp: number;
  label: string;
  peakCp?: number;
  peakLabel?: string;
  mate?: number | null;
  peakMate?: number | null;
  decided?: boolean;
  loop?: boolean;
  step?: string | number;
  isUserMove?: boolean;
  ready?: boolean;
  className?: string;
}

const GAIN_THRESHOLD = 40;
const GAIN_FADE_MS = 550;
const GAIN_HOLD_MS = 1800;
const FILL_MS = 450;
const FILL_EASE = { duration: FILL_MS / 1000, ease: [0.22, 1, 0.36, 1] as const };

export function EvalBar({
  cp,
  label,
  peakCp,
  peakLabel,
  mate = null,
  peakMate = null,
  decided = false,
  loop = false,
  step,
  isUserMove = false,
  ready = true,
  className,
}: EvalBarProps) {
  const reduced = usePrefersReducedMotion();
  const peak = pct(peakCp ?? cp, peakCp == null ? mate : peakMate, decided);
  const fill = ready ? pct(cp, mate, decided) : peak;

  const stepRef = React.useRef(step);
  const lastCpRef = React.useRef(cp);
  const baselineRef = React.useRef(cp);
  const firedRef = React.useRef(false);
  const [gain, setGain] = React.useState<{ lo: number; hi: number } | null>(null);

  React.useEffect(() => {
    if (stepRef.current !== step) {
      baselineRef.current = lastCpRef.current;
      stepRef.current = step;
      firedRef.current = false;
    }
    lastCpRef.current = cp;
    if (firedRef.current || !isUserMove || cp - baselineRef.current < GAIN_THRESHOLD) return;
    firedRef.current = true;
    setGain({ lo: pct(baselineRef.current), hi: pct(cp, mate, decided) });
  }, [cp, step, isUserMove, mate, decided]);

  React.useEffect(() => {
    if (!gain) return;
    const t = setTimeout(() => setGain(null), GAIN_HOLD_MS);
    return () => clearTimeout(t);
  }, [gain]);

  const gap = peak > fill + 0.4;
  const showPeak = Boolean(peakLabel) && gap;
  const primary = ready ? label : peakLabel ?? label;

  const mateInvolved = mate != null || peakMate != null;
  const dropLabel = !mateInvolved
    ? peakCp == null
      ? ''
      : ((peakCp - cp) / 100).toFixed(1)
    : mate != null
      ? label
      : peakLabel ?? '';

  const theirs = fill < 50 - 0.5;
  const labelAt = showPeak
    ? Math.min(90, Math.max(13, (fill + peak) / 2))
    : theirs
      ? 100
      : 0;
  const onLight = showPeak ? true : theirs ? false : fill >= 6;

  return (
    <div
      role="img"
      aria-label={
        showPeak
          ? mateInvolved
            ? `Evaluation ${label}, ${peakLabel} was available`
            : `Evaluation ${label}, ${dropLabel} given up`
          : `Evaluation ${label}`
      }
      className={`${styles.bar}${className ? ` ${className}` : ''}`}
      style={{ backgroundColor: DARK }}
    >
      <motion.div
        className={styles.fill}
        style={{ backgroundColor: LIGHT }}
        initial={{ height: `${peak}%` }}
        animate={{ height: `${fill}%` }}
        transition={FILL_EASE}
      />

      <SweepBand lo={fill} hi={peak} tone={LOSS} hot={LOSS_HOT} direction="down" loop={loop} reduced={reduced} />

      <AnimatePresence>
        {gain && (
          <SweepBand
            key="gain"
            lo={gain.lo}
            hi={gain.hi}
            tone={GAIN}
            hot={GAIN_HOT}
            direction="up"
            loop={false}
            reduced={reduced}
            fade={reduced ? 0.2 : GAIN_FADE_MS / 1000}
          />
        )}
      </AnimatePresence>

      <span aria-hidden className={styles.zero} />

      {!(showPeak && dropLabel === primary) && (
        <span
          className={styles.num}
          style={{
            bottom: showPeak ? '3px' : theirs ? undefined : '3px',
            top: !showPeak && theirs ? '3px' : undefined,
            color: onLight ? INK_DARK : INK_LIGHT,
            transition: `bottom ${FILL_MS}ms cubic-bezier(0.22,1,0.36,1)`,
          }}
        >
          {primary}
        </span>
      )}

      {showPeak && (
        <span
          className={styles.num}
          style={{ bottom: `calc(${labelAt}% - 5px)`, color: INK_DARK, transition: `bottom ${FILL_MS}ms cubic-bezier(0.22,1,0.36,1)` }}
        >
          {dropLabel}
          {!mateInvolved && (
            <span aria-hidden className={styles.arrow}>
              ↓
            </span>
          )}
        </span>
      )}
    </div>
  );
}

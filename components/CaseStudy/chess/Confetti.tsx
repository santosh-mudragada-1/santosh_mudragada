'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import styles from './Confetti.module.scss';

// Ported from the Chess.com prototype (src/components/shared/confetti.tsx),
// contained mode only — the celebration inside the completion card.

const COLORS = ['#81b64c', '#e6912c', '#ffffff', '#4a90d9', '#26c2a3', '#c4453f', '#f0c15c'];

interface Piece {
  id: number;
  left: number;
  xEnd: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
  round: boolean;
}

function makePieces(n: number): Piece[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    xEnd: (Math.random() - 0.5) * 36,
    delay: Math.random() * 0.35,
    duration: 1.5 + Math.random() * 1.1,
    rotate: (Math.random() - 0.5) * 720,
    color: COLORS[i % COLORS.length],
    size: 4 + Math.random() * 5,
    round: Math.random() > 0.5,
  }));
}

export function Confetti({ run, count = 70 }: { run: boolean; count?: number }) {
  const [pieces, setPieces] = React.useState<Piece[]>([]);

  React.useEffect(() => {
    if (!run) {
      setPieces([]);
      return;
    }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setPieces(reduce ? [] : makePieces(count));
  }, [run, count]);

  if (!run || pieces.length === 0) return null;

  return (
    <div aria-hidden className={styles.root}>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className={styles.piece}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.62,
            backgroundColor: p.color,
            borderRadius: p.round ? '9999px' : '1px',
          }}
          initial={{ top: '-12%', x: 0, rotate: 0, opacity: 1 }}
          animate={{ top: '112%', x: p.xEnd * 2, rotate: p.rotate, opacity: [1, 1, 0.9, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
            times: [0, 0.62, 0.86, 1],
          }}
        />
      ))}
    </div>
  );
}

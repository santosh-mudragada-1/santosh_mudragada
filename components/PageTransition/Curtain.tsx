'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useWindowSize } from '@/lib/hooks/useWindowSize';
import { curtainMorphPath, MORPH_OVERSCAN } from '@/lib/motion/curtain';
import { EASE } from '@/lib/motion/config';
import styles from './PageTransition.module.scss';

export type CurtainPhase = 'idle' | 'cover' | 'hold' | 'reveal';

type CurtainProps = {
  phase: CurtainPhase;
  label: string;
  onCovered: () => void;
  onRevealed: () => void;
};

/**
 * Curved SVG wipe, matched to references/page-transitions (Layout/Curve):
 *
 *   cover  0.75s  — sheet sweeps up from below to cover, bottom edge bellying
 *   hold   ~0.4s  — sheet sits fully covering; the route swaps underneath
 *   reveal 0.75s  — sheet sweeps up and away, belly relaxing to flat
 *
 * easing cubic-bezier(0.76, 0, 0.24, 1). The morph path is the reference's
 * initialPath <-> targetPath exactly (MORPH_OVERSCAN = 300).
 */
const T_COVER = { duration: 0.75, ease: EASE.quartInOut };
const T_REVEAL = { duration: 0.75, ease: EASE.quartInOut };

export function Curtain({ phase, label, onCovered, onRevealed }: CurtainProps) {
  const { w, h } = useWindowSize();
  const width = w || 1280;
  const height = h || 800;
  const o = MORPH_OVERSCAN;

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const covering = phase === 'cover' || phase === 'hold';

  // translate (px): parked below -> covering / held -> lifted past the top
  const y = covering ? -o : phase === 'reveal' ? -(height + 2 * o) : height;

  // bottom edge: deep downward belly while covering / held, flat while lifting
  const d = curtainMorphPath(width, height, covering ? 1 : 0);
  const flat = curtainMorphPath(width, height, 0);

  const transition =
    phase === 'idle' || phase === 'hold'
      ? { duration: 0 }
      : phase === 'cover'
        ? T_COVER
        : T_REVEAL;

  return (
    <div className={styles.root} aria-hidden={phase === 'idle'}>
      <motion.svg
        className={styles.sheet}
        viewBox={`0 0 ${width} ${height + 2 * o}`}
        preserveAspectRatio="none"
        initial={{ y: height }}
        animate={{ y }}
        transition={transition}
        onAnimationComplete={() => {
          if (phaseRef.current === 'cover') onCovered();
          else if (phaseRef.current === 'reveal') onRevealed();
        }}
      >
        <motion.path
          initial={{ d: flat }}
          animate={{ d }}
          transition={transition}
          fill="var(--carbon)"
        />
      </motion.svg>

      <motion.p
        className={styles.label}
        initial={false}
        animate={{
          opacity: covering ? 1 : 0,
          // rises up into place as it fades in; rides up off the top on reveal
          y: covering ? 0 : phase === 'reveal' ? -Math.round(height * 0.72) : 44,
        }}
        transition={
          phase === 'idle'
            ? { duration: 0 }
            : phase === 'reveal'
              ? { duration: 0.75, ease: EASE.quartInOut }
              : { duration: 0.55, delay: 0.35, ease: EASE.quintOut }
        }
      >
        <span className={styles.dot} />
        {label}
      </motion.p>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useWindowSize } from '@/lib/hooks/useWindowSize';
import { EASE } from '@/lib/motion/config';
import styles from './Menu.module.scss';

/**
 * Liquid left edge of the menu panel. Adapted from references/dennis
 * (Header/nav/Curve): a quadratic control point bulges left on enter/exit and
 * settles flush while the panel is open.
 */
export function MenuCurve() {
  const { h } = useWindowSize();
  const height = h || 900;

  const bulged = `M100 0 L100 ${height} Q-45 ${height / 2} 100 0`;
  const flat = `M100 0 L100 ${height} Q100 ${height / 2} 100 0`;

  return (
    <svg
      className={styles.curve}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        variants={{
          initial: { d: bulged },
          enter: { d: flat, transition: { duration: 0.9, ease: EASE.quartInOut } },
          exit: { d: bulged, transition: { duration: 0.7, ease: EASE.quartInOut } },
        }}
        initial="initial"
        animate="enter"
        exit="exit"
      />
    </svg>
  );
}

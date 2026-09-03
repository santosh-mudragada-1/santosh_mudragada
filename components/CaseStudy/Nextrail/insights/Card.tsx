'use client';

import { forwardRef } from 'react';
import styles from './InsightAnim.module.scss';

type Props = {
  /** small orange "indicator" dot at the top-right corner */
  withDot?: boolean;
  w?: number;
  h?: number;
  dotRef?: React.Ref<SVGCircleElement>;
};

/**
 * A single minimal "content card" — a plain rounded frame with two thin
 * lines standing in for text, optionally an orange dot. Deliberately not a
 * detailed fake UI: this is the one shape all three insight animations
 * reuse as their content unit.
 */
export const Card = forwardRef<SVGGElement, Props>(function Card(
  { withDot, w = 34, h = 24, dotRef },
  ref,
) {
  return (
    <g ref={ref} className={styles.card}>
      <rect width={w} height={h} rx={3} className={styles.cardRect} />
      <line x1={6} y1={h * 0.4} x2={w - 8} y2={h * 0.4} className={styles.cardLine} />
      <line x1={6} y1={h * 0.65} x2={w - 14} y2={h * 0.65} className={styles.cardLine} />
      {withDot && <circle ref={dotRef} cx={w - 4} cy={4} r={2.5} className={styles.dot} />}
    </g>
  );
});

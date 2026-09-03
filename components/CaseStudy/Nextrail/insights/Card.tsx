'use client';

import { forwardRef } from 'react';
import styles from './InsightAnim.module.scss';

type Variant = 'lines' | 'media' | 'pin';

type Props = {
  /** orange "indicator" — a saved / located marker at the top-right */
  withDot?: boolean;
  /** faint orange halo behind the dot so the marker reads from a distance */
  halo?: boolean;
  /** which simplified content the card stands for */
  variant?: Variant;
  w?: number;
  h?: number;
  dotRef?: React.Ref<SVGCircleElement>;
  /**
   * ref to the inner body group (frame + detail only). Animating this group's
   * opacity lets a timeline fade the card away while the orange marker stays
   * legible on its own — saved intent outliving the content.
   */
  bodyRef?: React.Ref<SVGGElement>;
};

/**
 * One minimal "content card" — a bold rounded frame standing in for a piece
 * of saved inspiration: a reel, a post, a place. Larger and heavier than a
 * UI decoration but still abstract — never a screenshot of a real app. This
 * is the single content unit all three insight animations reuse.
 */
export const Card = forwardRef<SVGGElement, Props>(function Card(
  { withDot, halo, variant = 'lines', w = 60, h = 44, dotRef, bodyRef },
  ref,
) {
  const p = 9;
  return (
    <g ref={ref} className={styles.card}>
      <g ref={bodyRef}>
        <rect width={w} height={h} rx={5} className={styles.cardRect} />

        {variant === 'media' && (
          <>
            <rect
              x={p}
              y={p}
              width={w - p * 2}
              height={h * 0.4}
              rx={3}
              className={styles.cardBlock}
            />
            <line x1={p} y1={h - 13} x2={w - p} y2={h - 13} className={styles.cardLine} />
            <line x1={p} y1={h - 7} x2={w - p - 12} y2={h - 7} className={styles.cardLine} />
          </>
        )}

        {variant === 'lines' && (
          <>
            <line x1={p} y1={h * 0.34} x2={w - p} y2={h * 0.34} className={styles.cardLine} />
            <line x1={p} y1={h * 0.54} x2={w - p - 8} y2={h * 0.54} className={styles.cardLine} />
            <line x1={p} y1={h * 0.74} x2={w - p - 20} y2={h * 0.74} className={styles.cardLine} />
          </>
        )}

        {variant === 'pin' && (
          <path
            d={`M ${p} ${h - 11} C ${w * 0.3} ${h * 0.16}, ${w * 0.5} ${h * 0.96}, ${w * 0.72} ${h * 0.36} S ${w - p} ${h * 0.24}, ${w - p} ${h * 0.44}`}
            className={styles.cardStroke}
          />
        )}
      </g>

      {withDot && (
        <>
          {halo && <circle cx={w - 10} cy={10} r={8} className={styles.dotHalo} />}
          <circle ref={dotRef} cx={w - 10} cy={10} r={4} className={styles.dot} />
        </>
      )}
    </g>
  );
});

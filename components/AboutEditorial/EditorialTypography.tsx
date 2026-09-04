'use client';

import { forwardRef, type CSSProperties } from 'react';
import { GAP_FACTOR, STOP_SY, type Stop } from './data';
import styles from './AboutEditorial.module.scss';

type Props = { stops: Stop[] };

/**
 * The deepest layer: one oversized word per stop, strung along the canvas and
 * intentionally wider than the window so letters are always clipped by its
 * edges. GSAP pans the layer; the words themselves are static within it.
 */
export const EditorialTypography = forwardRef<HTMLDivElement, Props>(
  function EditorialTypography({ stops }, ref) {
    return (
      <div ref={ref} className={styles.wordLayer} aria-hidden>
        {stops.map((s, i) => (
          <span
            key={s.id}
            className={styles.word}
            style={
              {
                // centre of stop 0 sits at the clip centre; each next stop is
                // one GAP further right along the canvas
                left: `${50 + i * GAP_FACTOR * 100}%`,
                top: `${50 + STOP_SY[i] * 100}%`,
                '--word-size': s.size ?? 1,
              } as CSSProperties
            }
          >
            {s.word}
          </span>
        ))}
      </div>
    );
  },
);

'use client';

import { forwardRef, type CSSProperties } from 'react';
import { GAP_FACTOR, LAYER_RATE, STOP_SY, type Stop } from './data';
import styles from './AboutEditorial.module.scss';

type Props = { stops: Stop[] };

/**
 * The middle layer: per-stop supporting text. A small label sits top-left of
 * the first stop; every stop carries a short paragraph lower-left. GSAP pans
 * the layer at 0.86x and cross-fades each block as its stop passes centre.
 */
export const EditorialCopy = forwardRef<HTMLDivElement, Props>(function EditorialCopy(
  { stops },
  ref,
) {
  return (
    <div ref={ref} className={styles.copyLayer} aria-hidden>
      {stops.map((s, i) => (
        <div
          key={s.id}
          className={styles.copyStop}
          data-copy-stop={s.id}
          data-active={i === 0 ? '' : undefined}
          style={
            {
              left: `${i * GAP_FACTOR * 100 * LAYER_RATE.copy}%`,
              top: `${STOP_SY[i] * 100}%`,
            } as CSSProperties
          }
        >
          {s.label && (
            <p className={styles.copyLabel}>
              {s.label.map((line, k) => (
                <span key={k}>{line}</span>
              ))}
            </p>
          )}
          <p
            className={styles.copyPara}
            data-tone={s.paraTone ?? 'muted'}
          >
            <span className={styles.copyRule} aria-hidden />
            {s.paragraph.map((line, k) => (
              <span key={k} className={styles.copyLine}>
                {line}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
});

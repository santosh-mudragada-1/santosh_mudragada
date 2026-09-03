'use client';

import type { ReactNode } from 'react';
import styles from './InsightAnim.module.scss';

/**
 * The invisible horizontal "viewport" every insight animation lives inside.
 * Cards travel in from beyond one edge and out past the other; the top and
 * bottom gradient bands blend the motion back into the page so it reads as a
 * window onto a larger continuous system rather than objects in a box. There
 * is no visible border — the fades alone imply the frame, and cards are free
 * to pass underneath them.
 */
export function FrameViewport({ children }: { children: ReactNode }) {
  return (
    <div className={styles.viewport}>
      {children}
      <div className={styles.edgeFade} data-edge="top" aria-hidden />
      <div className={styles.edgeFade} data-edge="bottom" aria-hidden />
    </div>
  );
}

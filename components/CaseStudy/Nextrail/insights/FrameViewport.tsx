'use client';

import type { ReactNode } from 'react';
import styles from './InsightAnim.module.scss';

/**
 * The invisible "viewport" every insight animation lives inside. Content
 * travels / drifts within it and the gradient bands blend it back into the
 * page so it reads as a window onto something larger rather than objects in a
 * box. No visible border — the fades alone imply the frame.
 *
 * `variant="media"` deepens the fades so real footage / photos dissolve into
 * the page instead of ending on a hard edge. `sides` adds the left + right
 * fades too, so the block feathers away on all four edges.
 */
export function FrameViewport({
  children,
  variant,
  sides,
}: {
  children: ReactNode;
  variant?: 'media' | 'collage';
  sides?: boolean;
}) {
  return (
    <div className={styles.viewport} data-variant={variant}>
      {children}
      <div className={styles.edgeFade} data-edge="top" aria-hidden />
      <div className={styles.edgeFade} data-edge="bottom" aria-hidden />
      {sides && (
        <>
          <div className={styles.edgeFade} data-edge="left" aria-hidden />
          <div className={styles.edgeFade} data-edge="right" aria-hidden />
        </>
      )}
    </div>
  );
}

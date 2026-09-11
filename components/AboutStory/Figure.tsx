'use client';

import type { CSSProperties, ReactNode } from 'react';
import { ALT, DIMS, src, srcSm } from './story';
import styles from './Figure.module.scss';

type FigureProps = {
  slug: string;
  /** override the generated alt (rarely needed) */
  alt?: string;
  caption?: ReactNode;
  /** eager-load + high priority — the opening frame only */
  priority?: boolean;
  /** responsive sizes hint; default assumes a near-full-width column */
  sizes?: string;
  /** parallax drift in % of the image height across its scroll span (0 = off) */
  parallax?: number;
  /** printed-photo white border */
  framed?: boolean;
  /** skip the reveal clip (for images that are revealed by a parent rig) */
  bare?: boolean;
  /** the figure fills an absolutely-positioned parent (opening / ending / bleed) —
   *  opt out of the phone "don't run past the viewport" crop cap */
  cover?: boolean;
  /** a scribbled margin note that only shows on hover — an easter egg */
  secret?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * One photograph in the essay. Reserves its exact box from DIMS so nothing
 * shifts as it streams in, then — when motion is allowed — the parent section's
 * GSAP finds it by `[data-reveal]` / `[data-parallax]` and animates the crop
 * open and the image drifting. With reduced motion (or no JS) it just renders.
 */
export function Figure({
  slug,
  alt,
  caption,
  priority = false,
  sizes = '(max-width: 768px) 92vw, 70vw',
  parallax = 0,
  framed = false,
  bare = false,
  cover = false,
  secret,
  className,
  style,
}: FigureProps) {
  const d = DIMS[slug];
  const ar = d ? d.ar : 1;

  return (
    <figure
      className={[styles.figure, framed && styles.framed, cover && styles.cover, className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div
        className={styles.crop}
        data-reveal={bare ? undefined : ''}
        style={{ aspectRatio: String(ar) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={[styles.img, parallax ? styles.parallaxImg : null]
            .filter(Boolean)
            .join(' ')}
          src={src(slug)}
          srcSet={`${srcSm(slug)} 900w, ${src(slug)} 1800w`}
          sizes={sizes}
          width={d?.w}
          height={d?.h}
          alt={alt ?? ALT[slug] ?? ''}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          draggable={false}
          data-parallax={parallax ? '' : undefined}
          style={parallax ? ({ '--px': String(parallax) } as CSSProperties) : undefined}
        />
      </div>
      {caption != null && <figcaption className={styles.caption}>{caption}</figcaption>}
      {secret && (
        <span className={styles.secret} aria-hidden>
          {secret}
        </span>
      )}
    </figure>
  );
}

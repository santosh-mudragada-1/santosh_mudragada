'use client';

import { forwardRef, type CSSProperties } from 'react';
import styles from './AboutEditorial.module.scss';

export type ImageCardProps = {
  src: string;
  alt?: string;
  /** CSS length — the card box, independent of the image's real pixels */
  width: string;
  height: string;
  /** 0..1 — shadow depth (higher = nearer the viewer) */
  depth?: number;
  /** draw a printed-photo white border */
  framed?: boolean;
  /** paint stacking order inside the collage layer */
  z?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * One printed photograph in the collage. Positioning, rotation and drift are
 * driven by GSAP from AboutEditorial (transform only) — this component owns the
 * box, the crop and the physical shadow / border.
 */
export const ImageCard = forwardRef<HTMLElement, ImageCardProps>(function ImageCard(
  { src, alt = '', width, height, depth = 0.5, framed = false, z, className, style },
  ref,
) {
  return (
    <figure
      ref={ref}
      className={`${styles.card} ${framed ? styles.cardFramed : ''} ${className ?? ''}`}
      style={
        {
          '--card-w': width,
          '--card-h': height,
          '--card-depth': depth,
          zIndex: z,
          ...style,
        } as CSSProperties
      }
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false} />
    </figure>
  );
});

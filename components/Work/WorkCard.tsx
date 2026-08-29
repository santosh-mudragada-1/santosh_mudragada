'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './WorkCard.module.scss';

type WorkCardProps = {
  index: string;
  title: string;
  discipline: string;
  year: string;
  src: string;
  ratio: string;
  href: string;
  /** Parallax depth, small. */
  depth?: number;
};

/**
 * Card shell.
 *   .outer  — transparent, overflow visible, sets the card's aspect-ratio box.
 *   .inner  — same size, overflow hidden: the real <img> + text. This is the
 *             at-rest card and the fallback when the shared WebGL layer
 *             (WorkGLLayer, one context for all three cards) isn't running.
 *             When it is, its canvas covers .inner and does the bow.
 */
export function WorkCard({
  index,
  title,
  discipline,
  year,
  src,
  ratio,
  href,
  depth = 0.5,
}: WorkCardProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = parallaxRef.current;
      if (!el || reduced || depth === 0) return;
      const st = gsap.fromTo(
        el,
        { yPercent: 6 * depth },
        {
          yPercent: -6 * depth,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
      return () => {
        st.scrollTrigger?.kill();
        st.kill();
      };
    },
    { scope: parallaxRef, dependencies: [reduced, depth] },
  );

  return (
    <Link
      href={href}
      className={styles.card}
      data-cursor="view"
      aria-label={`${title} — ${discipline}, ${year}`}
    >
      <div ref={parallaxRef} className={styles.parallax}>
        <div className={styles.outer} style={{ aspectRatio: ratio }}>
          <div className={styles.inner}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${title} — project visual (placeholder)`}
              className={styles.img}
              // same CORS mode as WorkGLLayer's loader so the two share one
              // cache entry — otherwise the GL canvas gets tainted in prod
              crossOrigin="anonymous"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            <div className={styles.scrim} aria-hidden />
            <div className={styles.overlay}>
              <span className={styles.index}>{index}</span>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.line}>
                {discipline}
                <span aria-hidden> · </span>
                {year}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { useIsWebKit } from '@/lib/hooks/useIsWebKit';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { WorkCardGL } from './WorkCardGL';
import { addCardSkew } from './cardSkew';
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
 *   .inner  — same size, overflow hidden: the real <img> + text (clipped). This
 *             is the at-rest card, the WebGL-fail fallback, and the dark ground
 *             a bowed edge lifts off.
 *   <WorkCardGL> — a canvas sibling of .inner that overscans the box; its bow
 *             spills past the card because .outer doesn't clip.
 *
 * Every browser now tries the WebGL bow. If it can't run (WebKit trouble,
 * context fail), the card falls back to a cheap scroll-velocity `skewY` on
 * .outer (see cardSkew) — one shared ticker callback, GPU transform only.
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
  const outerRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const isWebKit = useIsWebKit();
  const reduced = usePrefersReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [glFailed, setGlFailed] = useState(false);
  useEffect(() => setMounted(true), []);
  const onGlFail = useCallback(() => setGlFailed(true), []);

  // every browser tries the WebGL bow now
  const useGL = mounted && !isTouch && !reduced && !glFailed;
  // WebKit fallback if the GL bow can't run there
  const useSkew = mounted && isWebKit && !isTouch && !reduced && !useGL;

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

  // Safari deformation stand-in: wire the card box into the shared skew ticker
  // while it's near the viewport, unwire it when it leaves. No per-frame work
  // here — cardSkew owns the one loop.
  useEffect(() => {
    if (!useSkew || depth === 0) return;
    const el = outerRef.current;
    if (!el) return;

    let detach: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !detach) {
          detach = addCardSkew(el, 7 * depth);
        } else if (!entry.isIntersecting && detach) {
          detach();
          detach = null;
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      detach?.();
    };
  }, [useSkew, depth]);

  return (
    <Link
      href={href}
      className={styles.card}
      data-cursor="view"
      aria-label={`${title} — ${discipline}, ${year}`}
    >
      <div ref={parallaxRef} className={styles.parallax}>
        <div ref={outerRef} className={styles.outer} style={{ aspectRatio: ratio }}>
          <div className={styles.inner}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${title} — project visual (placeholder)`}
              className={styles.img}
              // same CORS mode as WorkCardGL's loader so the two requests share
              // one cache entry — otherwise the GL canvas gets tainted in prod
              // (works on localhost with "disable cache" on) and falls back flat
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

          {useGL && (
            <WorkCardGL
              index={index}
              title={title}
              discipline={discipline}
              year={year}
              src={src}
              onFail={onGlFail}
            />
          )}
        </div>
      </div>
    </Link>
  );
}

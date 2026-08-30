'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { useIsWebKit } from '@/lib/hooks/useIsWebKit';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { WorkCardGL } from './WorkCardGL';
import { addCardJelly, type CardJelly } from './cardJelly';
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
 *             spills past the card because .outer doesn't clip. Chromium only.
 *
 * Jelly (see cardJelly, one shared ticker spring on .outer):
 *   - pointer entering/leaving an edge -> a directional translate+scale bulge
 *     that wobbles back. Both browsers.
 *   - scroll velocity -> skewY + faint squash. WebKit only (Chromium's scroll
 *     deformation is WorkCardGL).
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

  // WebKit freezes with multiple concurrent WebGL card contexts — it falls
  // back to the static .inner card there (same as touch / reduced-motion)
  const useGL = mounted && !isTouch && !isWebKit && !reduced && !glFailed;
  // both browsers: the pointer-poke jelly (+ scroll skew on WebKit)
  const useJelly = mounted && !isTouch && !reduced;

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

  // Jelly: wire the card box into the shared spring while it's near the
  // viewport; feed it the pointer's entry / exit edge. cardJelly owns the loop.
  useEffect(() => {
    if (!useJelly || depth === 0) return;
    const el = outerRef.current;
    if (!el) return;

    let jelly: CardJelly | null = null;
    let rect: DOMRect | null = null;

    // which edge the pointer crossed -> a unit direction (dominant axis)
    const edgeDir = (e: PointerEvent): [number, number] => {
      const r = rect ?? el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      return Math.abs(x) >= Math.abs(y)
        ? [x >= 0 ? 1 : -1, 0]
        : [0, y >= 0 ? 1 : -1];
    };
    const onEnter = (e: PointerEvent) => {
      rect = el.getBoundingClientRect();
      const [dx, dy] = edgeDir(e);
      jelly?.poke(dx, dy);
    };
    const onLeave = (e: PointerEvent) => {
      const [dx, dy] = edgeDir(e);
      jelly?.poke(dx * 0.8, dy * 0.8);
      rect = null;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !jelly) {
          jelly = addCardJelly(el, { maxSkew: isWebKit ? 7 * depth : 0 });
          el.addEventListener('pointerenter', onEnter);
          el.addEventListener('pointerleave', onLeave);
        } else if (!entry.isIntersecting && jelly) {
          el.removeEventListener('pointerenter', onEnter);
          el.removeEventListener('pointerleave', onLeave);
          jelly.detach();
          jelly = null;
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      jelly?.detach();
    };
  }, [useJelly, isWebKit, depth]);

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

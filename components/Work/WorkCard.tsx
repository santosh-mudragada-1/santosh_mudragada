'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { useIsWebKit } from '@/lib/hooks/useIsWebKit';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { WorkCardGL, type WorkCardGLHandle } from './WorkCardGL';
import { addCardSkew } from './cardSkew';
import type { SceneConfig, WorkGraphic } from './graphics';
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
  /** Bespoke per-project card art — the DOM/SVG fallback used wherever GL
   *  can't run (touch, reduced motion, WebGL failure). */
  graphic?: WorkGraphic;
  /** The same art as a canvas-2D scene, baked onto the WebGL plane so the
   *  scroll bow still applies; hover redraws it in place of animating DOM. */
  scene?: SceneConfig;
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
 * Desktop tries the WebGL bow. If it can't run (WebKit trouble, context fail)
 * — and on every touch device, where the bow is too heavy — the card falls
 * back to a cheap scroll-velocity `skewY` on .outer (see cardSkew): one shared
 * ticker callback, GPU transform only.
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
  graphic: Graphic,
  scene: Scene,
}: WorkCardProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const glHandleRef = useRef<WorkCardGLHandle>(null);
  const hoverTweenRef = useRef<gsap.core.Tween | null>(null);
  const isTouch = useIsTouch();
  const isWebKit = useIsWebKit();
  const reduced = usePrefersReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [glFailed, setGlFailed] = useState(false);
  useEffect(() => setMounted(true), []);
  const onGlFail = useCallback(() => setGlFailed(true), []);

  // WebGL bow: desktop only (never on touch — too heavy for 3 live contexts).
  // A bespoke graphic without a matching GL scene disables it (no photo to
  // bake); one with a scene keeps the bow, baking that instead of a photo.
  const useGL = mounted && !isTouch && !reduced && !glFailed && (!Graphic || !!Scene);
  // scroll-velocity skew: the touch animation, and the desktop WebKit fallback
  const useSkew = mounted && !reduced && !useGL && (isTouch || isWebKit);

  // hover -> GL scene progress: a plain 0..1 driver, eased inside the scene's
  // own draw function (position-parameter style), not here.
  useGSAP(
    () => {
      if (!Scene || !useGL) return;
      const proxy = { p: 0 };
      const tween = gsap.to(proxy, {
        p: 1,
        duration: 1.1,
        ease: 'none',
        paused: true,
        onUpdate: () => glHandleRef.current?.setProgress(proxy.p),
      });
      hoverTweenRef.current = tween;
      return () => {
        tween.kill();
        hoverTweenRef.current = null;
      };
    },
    { dependencies: [Scene, useGL] },
  );
  const onHoverStart = () => hoverTweenRef.current?.play();
  const onHoverEnd = () => hoverTweenRef.current?.reverse();

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

  // scroll-skew: wire the card box into the shared skew ticker while it's near
  // the viewport, unwire it when it leaves. No per-frame work here — cardSkew
  // owns the one loop. (Touch + the Safari GL fallback.)
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
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div ref={parallaxRef} className={styles.parallax}>
        <div ref={outerRef} className={styles.outer} style={{ aspectRatio: ratio }}>
          <div className={styles.inner}>
            {Graphic ? (
              // The GL scene (below) already bakes + bows this art — mounting
              // the DOM version too would just run its hover timeline, unseen,
              // behind the opaque canvas.
              !(Scene && useGL) && <Graphic />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
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
            )}
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
              ref={glHandleRef}
              index={index}
              title={title}
              discipline={discipline}
              year={year}
              src={Scene ? undefined : src}
              scene={Scene}
              onFail={onGlFail}
              webkit={isWebKit}
            />
          )}
        </div>
      </div>
    </Link>
  );
}

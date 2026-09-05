'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cx } from './cx';
import styles from './HeroReveal.module.scss';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* -------------------------------------------------------------------------- */
/*  A hand-authored, irregular closed blob — a Catmull-Rom spline through      */
/*  jittered points (not a symmetric "blob generator" wobble), so the         */
/*  silhouette reads as a specific shape rather than a generic rounded        */
/*  circle. Authored once in its own 400x400 box; see scripts/notes below.    */
/* -------------------------------------------------------------------------- */
const BLOB_D =
  'M 350 208 C 350 231.13 360.72 268.85 348.34 286.87 C 335.95 304.89 297.12 297.78 275.71 316.13 ' +
  'C 254.3 334.48 240.93 399.09 219.86 396.96 C 198.79 394.83 178.01 320.18 149.3 303.36 ' +
  'C 120.58 286.53 55.09 310.78 47.58 296 C 40.07 281.22 102.7 240.49 104.23 214.7 ' +
  'C 105.77 188.9 59.93 166.77 56.8 141.23 C 53.68 115.68 66.88 69.94 85.49 61.43 ' +
  'C 104.09 52.92 142.4 93.54 168.42 90.16 C 194.44 86.77 220.73 38.81 241.61 41.11 ' +
  'C 262.49 43.41 275.89 86.13 293.68 103.96 C 311.47 121.79 338.96 130.72 348.35 148.06 ' +
  'C 357.74 165.4 350 184.87 350 208 Z';
const BLOB_BOX = 400;

interface HeroRevealProps {
  /** Video src (webm/mp4), muted + looping, decorative only. */
  src: string;
  className?: string;
  /** Blob size as a fraction of the container's shorter side. */
  scale?: number;
  /** Blob center offset, as a fraction of container width/height. */
  offsetX?: number;
  offsetY?: number;
  rotate?: number;
  /** Mask-edge feather (px) — this is the only thing blurred, never the video.
   *  Defaults to a fraction of the container's own size, so it stays
   *  proportionate whether this renders small or (as in the hero) large. */
  feather?: number;
}

/**
 * Reveals a background video through a blurred, irregular blob-shaped hole
 * punched into a `var(--bg)`-colored overlay — same silhouette-mask + gaussian
 * blur technique as a Figma "layer blur" mask, ported from a Framer reference.
 * The overlay (not the video) carries the blur, so its edge fades into the
 * page background instead of a hard clip; the video itself stays crisp.
 */
export function HeroReveal({
  src,
  className,
  scale = 0.62,
  offsetX = 0.06,
  offsetY = -0.06,
  rotate = -9,
  feather,
}: HeroRevealProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const maskId = `${rawId}-mask`;
  const filterId = `${rawId}-blur`;

  const rootRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Measure in a layout effect — runs before paint, so the first client frame
  // already knows the box and can size the mask instead of popping in late.
  useIsoLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      setBox((p) => (p.w === w && p.h === h ? p : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [videoReady, setVideoReady] = useState(false);
  const reduced = usePrefersReducedMotion();
  const videoElRef = useRef<HTMLVideoElement>(null);

  // Not just an onCanPlay JSX prop: this is SSR'd with `autoplay` already in
  // the markup, so on a fast connection the native parser can load and start
  // playing the video before React finishes hydrating and attaches its
  // synthetic listener — the event fires, but into a void. Checking
  // readyState directly on mount catches that already-ready case; the
  // listener covers the normal (still-loading) case.
  useEffect(() => {
    const v = videoElRef.current;
    if (!v) return;
    if (v.readyState >= 2) {
      setVideoReady(true);
      return;
    }
    const onReady = () => setVideoReady(true);
    v.addEventListener('loadeddata', onReady);
    v.addEventListener('canplay', onReady);
    return () => {
      v.removeEventListener('loadeddata', onReady);
      v.removeEventListener('canplay', onReady);
    };
  }, [src]);

  const W = box.w;
  const H = box.h;
  const measured = W > 2 && H > 2;
  const revealed = measured && videoReady;

  const base = Math.min(W, H) || 1;
  const featherPx = feather ?? base * 0.16;
  const artSize = base * scale;
  const s = artSize / BLOB_BOX;
  const centerX = W / 2 + offsetX * W;
  const centerY = H / 2 + offsetY * H;
  const shapeTransform = [
    `translate(${centerX} ${centerY})`,
    `rotate(${rotate})`,
    `scale(${s})`,
    `translate(${-BLOB_BOX / 2} ${-BLOB_BOX / 2})`,
  ].join(' ');

  return (
    <div ref={rootRef} className={cx(styles.wrap, className)} role="presentation" aria-hidden="true">
      <div className={styles.frame}>
        <video
          ref={videoElRef}
          className={styles.video}
          src={src}
          autoPlay={!reduced}
          loop={!reduced}
          muted
          playsInline
          preload="auto"
        />

        {measured && (
          <svg
            className={styles.maskSvg}
            width="100%"
            height="100%"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              {/* Blur the silhouette only — the same edge feather Figma's Layer
                  Blur produces on a mask. */}
              <filter
                id={filterId}
                x="-60%"
                y="-60%"
                width="220%"
                height="220%"
                filterUnits="objectBoundingBox"
              >
                <feGaussianBlur stdDeviation={featherPx / 2} />
              </filter>

              {/* white = keep the overlay · black = punch through to the video */}
              <mask id={maskId} maskUnits="userSpaceOnUse" x={-W} y={-H} width={W * 3} height={H * 3}>
                <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="#fff" />
                <path d={BLOB_D} transform={shapeTransform} fill="#000" filter={`url(#${filterId})`} />
              </mask>
            </defs>

            <rect x={0} y={0} width={W} height={H} className={styles.overlayRect} mask={`url(#${maskId})`} />
          </svg>
        )}

        {/* Covers frame 1 so the video is never seen unmasked; fades away once
            the box is measured and the video has an actual frame to show. */}
        <div aria-hidden="true" className={cx(styles.cover, revealed && styles.coverHidden)} />
      </div>
    </div>
  );
}

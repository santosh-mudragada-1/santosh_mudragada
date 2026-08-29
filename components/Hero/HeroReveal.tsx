'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { useIsWebKit } from '@/lib/hooks/useIsWebKit';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './HeroReveal.module.scss';

type Props = {
  cleanSrc: string;
  pixelSrc: string;
  alt: string;
};

/**
 * Portrait composition with a cursor-driven reveal.
 *
 * The clean cutout is the stable base `<img>` (never transformed). The
 * pixelated portrait sits above it in an `<svg>`, shown only through a gooey
 * liquid mask:
 *
 *   - four white circles, each in a `<g>` wrapper that chases the pointer on
 *     its own `gsap.quickTo` duration. The lead is near-instant and large; the
 *     trail lags progressively and shrinks, so a fast move stretches the mask
 *     into a tapered liquid streak with a droplet tail, and a pause pools it
 *     back into one rounded blob;
 *   - a strong blur + steep alpha-ramp filter fuses the circles into a single
 *     smooth shape with liquid necking between them;
 *   - the circles keep a slow idle drift so the blob is never quite frozen;
 *   - radius grows in on enter, collapses on leave.
 *
 * Pointer coords never touch React state; GSAP owns every animated property.
 * Touch: no pointer reveal — the static pixel layer fades in on a scrubbed
 * ScrollTrigger. Reduced-motion / SSR: the clean portrait alone.
 */

const VBW = 1000;
const VBH = 1118; // ≈ 1187 : 1326 (the portrait assets)

// r = rest radius (viewBox units) · d = follow duration (s); bigger d = more lag
const BLOBS = [
  { r: 205, d: 0.05 },
  { r: 168, d: 0.16 },
  { r: 120, d: 0.31 },
  { r: 74, d: 0.52 },
];

export function HeroReveal({ cleanSrc, pixelSrc, alt }: Props) {
  const isTouch = useIsTouch();
  const isWebKit = useIsWebKit();
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const pixelRef = useRef<HTMLImageElement>(null);
  const groupRefs = useRef<Array<SVGGElement | null>>([]);
  const dotRefs = useRef<Array<SVGCircleElement | null>>([]);

  useEffect(() => setMounted(true), []);

  const useReveal = mounted && !isTouch && !reduced;
  const useTouchFade = mounted && isTouch && !reduced;

  // --- desktop: liquid mask reveal -------------------------------------
  useEffect(() => {
    if (!useReveal) return;
    const stage = stageRef.current;
    const groups = groupRefs.current.filter(Boolean) as SVGGElement[];
    const dots = dotRefs.current.filter(Boolean) as SVGCircleElement[];
    if (
      !stage ||
      groups.length !== BLOBS.length ||
      dots.length !== BLOBS.length
    )
      return;

    // each blob wrapper follows the pointer on its own duration -> liquid lag
    const follow = groups.map((g, i) => ({
      x: gsap.quickTo(g, 'x', { duration: BLOBS[i].d, ease: 'power3' }),
      y: gsap.quickTo(g, 'y', { duration: BLOBS[i].d, ease: 'power3' }),
    }));

    // slow infinite drift on the satellites -> the blob is never quite frozen
    const drifts = dots.map((c, i) => {
      if (i === 0) return null;
      const a = 9 + i * 4;
      return gsap.to(c, {
        x: i % 2 ? a : -a,
        y: i % 2 ? -a * 0.8 : a * 0.9,
        duration: 1.9 + i * 0.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    });

    let inside = false;

    const frac = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      return [
        ((e.clientX - r.left) / r.width) * VBW,
        ((e.clientY - r.top) / r.height) * VBH,
      ] as const;
    };
    const place = (x: number, y: number, snap: boolean) => {
      groups.forEach((g, i) => {
        if (snap) gsap.set(g, { x, y });
        else {
          follow[i].x(x);
          follow[i].y(y);
        }
      });
    };
    const grow = () =>
      gsap.to(dots, {
        attr: { r: (i: number) => BLOBS[i].r },
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.04,
        overwrite: 'auto',
      });
    const collapse = () =>
      gsap.to(dots, {
        attr: { r: 0 },
        duration: 0.4,
        ease: 'power2.in',
        stagger: { each: 0.04, from: 'end' },
        overwrite: 'auto',
      });

    const onEnter = (e: PointerEvent) => {
      const [x, y] = frac(e);
      place(x, y, true); // jump to the pointer, then grow in place
      inside = true;
      grow();
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = frac(e);
      if (!inside) {
        place(x, y, true);
        inside = true;
        grow();
      } else {
        place(x, y, false);
      }
    };
    const onLeave = () => {
      inside = false;
      collapse();
    };

    stage.addEventListener('pointerenter', onEnter);
    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerleave', onLeave);

    // Safari: the idle drift tweens loop forever from mount. Pause them while
    // the Hero is scrolled out of view (the satellites are r=0 then anyway),
    // resume on the way back — the drift phase is preserved.
    let driftIO: IntersectionObserver | null = null;
    if (isWebKit) {
      driftIO = new IntersectionObserver(
        ([entry]) => {
          drifts.forEach((t) => {
            if (!t) return;
            if (entry.isIntersecting) t.resume();
            else t.pause();
          });
        },
        { rootMargin: '200px 0px' },
      );
      driftIO.observe(stage);
    }

    return () => {
      stage.removeEventListener('pointerenter', onEnter);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      driftIO?.disconnect();
      gsap.killTweensOf(dots);
      gsap.killTweensOf(groups);
      drifts.forEach((t) => t?.kill());
    };
  }, [useReveal, isWebKit]);

  // --- touch: pixel layer fades in on scroll -----------------------------
  useEffect(() => {
    if (!useTouchFade) return;
    const stage = stageRef.current;
    const pixel = pixelRef.current;
    if (!stage || !pixel) return;

    const tween = gsap.fromTo(
      pixel,
      { opacity: 0 },
      {
        opacity: 0.9,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'center 80%',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [useTouchFade]);

  return (
    <div ref={stageRef} className={styles.stage} data-cursor="view">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cleanSrc}
        alt={alt}
        className={`${styles.layer} ${styles.clean}`}
        draggable={false}
        decoding="async"
        fetchPriority="high"
      />

      {useReveal && (
        <svg
          className={`${styles.layer} ${styles.reveal}`}
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <filter
              id="heroGoo"
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"
              />
            </filter>
            <mask id="heroRevealMask">
              <g filter="url(#heroGoo)">
                {BLOBS.map((_, i) => (
                  <g
                    key={i}
                    ref={(el) => {
                      groupRefs.current[i] = el;
                    }}
                  >
                    <circle
                      ref={(el) => {
                        dotRefs.current[i] = el;
                      }}
                      cx="0"
                      cy="0"
                      r="0"
                      fill="#fff"
                    />
                  </g>
                ))}
              </g>
            </mask>
          </defs>
          <image
            href={pixelSrc}
            width={VBW}
            height={VBH}
            preserveAspectRatio="xMidYMid slice"
            mask="url(#heroRevealMask)"
          />
        </svg>
      )}

      {useTouchFade && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={pixelRef}
          src={pixelSrc}
          alt=""
          aria-hidden
          className={`${styles.layer} ${styles.pixel}`}
          draggable={false}
          decoding="async"
        />
      )}
    </div>
  );
}

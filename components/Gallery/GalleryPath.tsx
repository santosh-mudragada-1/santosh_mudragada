'use client';

import { Fragment, useRef, type RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsWebKit } from '@/lib/hooks/useIsWebKit';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './GalleryPath.module.scss';

// wide squiggle: drops in from the top-left, exits off the right edge
const D =
  'M83.0078 83.0078C83.0078 83.0078 528.214 137.576 656.008 348.508C790.322 570.201 409.011 836.418 601.508 1010.01C813.654 1201.32 1053.71 613.22 1292.51 770.008C1475.23 889.978 1287.63 1190.89 1478.14 1298.05C1703.64 1424.89 2092.51 1050.11 2092.51 1050.11';

// #FF6520 as a colour-matrix row (r 1, g 0.396078, b 0.12549)
const ORANGE = '0 0 0 0 1 0 0 0 0 0.396078 0 0 0 0 0.12549';
const ALPHA = '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0';

// two SMALL orange inner-shadow passes (was the Figma export's 5)
// — dy, stdDeviation (blur/2), alpha
const SHADOWS: Array<[number, number, number]> = [
  [-30, 16, 0.5],
  [-84, 30, 0.3],
];

// measured length of D (~3450) — the fallback when getTotalLength() reads 0
const D_LENGTH = 3550;

// Safari: the single Figma inner shadow — X 0, Y -111, Blur 50, #FF6520 @ 50%.
// SVG stdDeviation = Figma blur / 2. One pass vs the Chromium two.
// — dy, stdDeviation, alpha
const WEBKIT_SHADOWS: Array<[number, number, number]> = [[-111, 25, 0.5]];

/**
 * Soft orange line behind the archive rows — drops in from the top-left and
 * draws out toward the right edge of the screen.
 *
 * Chromium / Blink: a paper-colour stroke that reads only through two stacked
 * orange inner shadows (feGaussianBlur), revealed by a scroll-scrubbed
 * stroke-dashoffset mask wipe.
 *
 * Safari / WebKit: the same technique, trimmed — ONE inner-shadow pass and a
 * tighter filter region, to cut the per-frame filter re-raster that the
 * scrubbed mask forces. Everything else (mask wipe, scrub range) matches Blink.
 */
export function GalleryPath({ scope }: { scope: RefObject<HTMLElement> }) {
  const maskRef = useRef<SVGPathElement>(null);
  const webkitMaskRef = useRef<SVGPathElement>(null);
  const reduced = usePrefersReducedMotion();
  const isWebKit = useIsWebKit();

  // --- Chromium / Blink: UNCHANGED -------------------------------------------
  useGSAP(
    () => {
      // Safari uses the branch below — no filter/mask, no scrub here.
      if (isWebKit) return;

      const path = maskRef.current;
      if (!path) return;
      // derive the trigger from the live DOM so parent-ref timing can't skip us
      const trigger =
        scope.current ?? path.closest('section') ?? undefined;
      if (!trigger) return;

      // real length if the browser gives one, hardcoded fallback if it reads 0
      let len = D_LENGTH;
      try {
        const m = path.getTotalLength();
        if (m && Number.isFinite(m)) len = m;
      } catch {
        /* keep the fallback */
      }

      // NOTE: no pathLength attr — Blink doesn't scale style-set (GSAP) dash
      // values by it, so `1` would read as 1px and the path would look solid.
      gsap.set(path, {
        strokeDasharray: len,
        strokeDashoffset: reduced ? 0 : len,
      });
      if (reduced) return;

      const tween = gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger,
          // draw across almost the whole time the section is on screen, so it
          // finishes as you're leaving rather than early
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [reduced, isWebKit], scope },
  );

  // --- Safari / WebKit: scrub the mask stroke that wipes the glow line in --
  useGSAP(
    () => {
      if (!isWebKit) return;

      const path = webkitMaskRef.current;
      if (!path) return;

      let len = D_LENGTH;
      try {
        const m = path.getTotalLength();
        if (m && Number.isFinite(m)) len = m;
      } catch {
        /* keep the fallback */
      }

      gsap.set(path, {
        strokeDasharray: len,
        strokeDashoffset: reduced ? 0 : len,
      });
      if (reduced) return;

      const trigger = scope.current ?? path.closest('section') ?? undefined;
      if (!trigger) return;

      // same range/feel as Chromium; the mask reveals a filtered stroke with
      // a single inner shadow. Inert while the section is off-screen.
      const tween = gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [reduced, isWebKit], scope },
  );

  // --- Safari / WebKit render -------------------------------------------
  // Same shape as the Blink branch below: a paper-colour stroke read through
  // ONE orange inner shadow, wiped in by the dash-animated mask. One blur
  // pass, tighter filter region.
  if (isWebKit) {
    return (
      <svg
        className={styles.svg}
        viewBox="0 0 2176 1408"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden
      >
        <defs>
          <filter
            id="gpWebkitShadow"
            x="-20"
            y="-20"
            width="2220"
            height="1450"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            {WEBKIT_SHADOWS.map(([dy, sd, a], i) => (
              <Fragment key={i}>
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values={ALPHA}
                  result="hardAlpha"
                />
                <feOffset dy={dy} />
                <feGaussianBlur stdDeviation={sd} />
                <feComposite
                  in2="hardAlpha"
                  operator="arithmetic"
                  k2="-1"
                  k3="1"
                />
                <feColorMatrix type="matrix" values={`${ORANGE} 0 0 0 ${a} 0`} />
                <feBlend
                  mode="normal"
                  in2={i === 0 ? 'shape' : `effect${i}`}
                  result={`effect${i + 1}`}
                />
              </Fragment>
            ))}
          </filter>

          <mask
            id="gpWebkitReveal"
            maskUnits="userSpaceOnUse"
            x="-60"
            y="-200"
            width="2300"
            height="1720"
          >
            <path
              ref={webkitMaskRef}
              d={D}
              stroke="#fff"
              strokeWidth="176"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </mask>
        </defs>

        <g filter="url(#gpWebkitShadow)" mask="url(#gpWebkitReveal)">
          <path d={D} stroke="#F2E9DB" strokeWidth="166" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // --- Chromium / Blink render: UNCHANGED --------------------------------
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 2176 1408"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden
    >
      <defs>
        <filter
          id="gpInnerShadows"
          x="-20"
          y="-40"
          width="2216"
          height="1500"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          {SHADOWS.map(([dy, sd, a], i) => (
            <Fragment key={i}>
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values={ALPHA}
                result="hardAlpha"
              />
              <feOffset dy={dy} />
              <feGaussianBlur stdDeviation={sd} />
              <feComposite
                in2="hardAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
              />
              <feColorMatrix type="matrix" values={`${ORANGE} 0 0 0 ${a} 0`} />
              <feBlend
                mode="normal"
                in2={i === 0 ? 'shape' : `effect${i}`}
                result={`effect${i + 1}`}
              />
            </Fragment>
          ))}
        </filter>

        {/* reveal wipe — just wider than the 166px visible stroke (which is
            the same colour as the background, so its own edge is invisible;
            only the inset shadows read, well clear of the mask edge). Round
            cap so the growing leading edge draws in as a rounded nib. */}
        <mask
          id="gpReveal"
          maskUnits="userSpaceOnUse"
          x="-60"
          y="-200"
          width="2300"
          height="1720"
        >
          <path
            ref={maskRef}
            d={D}
            stroke="#fff"
            strokeWidth="176"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>

      <g filter="url(#gpInnerShadows)" mask="url(#gpReveal)">
        <path d={D} stroke="#F2E9DB" strokeWidth="166" strokeLinecap="round" />
      </g>
    </svg>
  );
}

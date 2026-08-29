'use client';

import { Fragment, useRef, type RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './GalleryPath.module.scss';

// wide, mostly-horizontal squiggle: enters top-left, exits off the right edge
const D =
  'M83.0234 219.681C83.0234 219.681 1022.18 -122.695 1193.79 276.309C1309.72 545.843 734.957 932.739 1011.52 1005.18C1378.02 1101.18 1558.2 365.184 1744.52 589.183C1860.62 728.755 1600.63 879.228 1800.16 1050.72C1996.37 1219.37 2272.02 890.182 2272.02 890.182';

// #FF6520 as a colour-matrix row (r 1, g 0.396078, b 0.12549)
const ORANGE = '0 0 0 0 1 0 0 0 0 0.396078 0 0 0 0 0.12549';
const ALPHA = '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0';

// 3 of the Figma export's 5 stacked orange inner shadows (the faintest two,
// α 0.05 / 0.01, don't read) — dy, stdDeviation (blur/2), alpha
const SHADOWS: Array<[number, number, number]> = [
  [-23, 25, 0.33],
  [-91, 45.5, 0.29],
  [-204, 61, 0.17],
];

// measured length of D (~4029) — the fallback when getTotalLength() reads 0
// (it does, in production, when this layout effect runs before SVG layout)
const D_LENGTH = 4100;

/**
 * Soft orange line sweeping behind the archive rows — enters from the
 * top-left and draws out through the right edge of the screen. The stroke is
 * the section's own paper colour, so only the stacked orange inner shadows
 * read.
 *
 * The draw-in is done with a MASK wipe, not by animating the filtered stroke:
 * the `<g filter>` (blurred inner-shadow passes) stays static, so the browser
 * rasterises that multi-pass filter once and just composites it each frame.
 * Only the mask — a plain thick stroke with a scrubbed `stroke-dashoffset` —
 * updates per frame, a cheap single-fill re-raster. Animating the filtered
 * path directly re-ran the whole blur chain on every scroll tick.
 */
export function GalleryPath({ scope }: { scope: RefObject<HTMLElement> }) {
  const maskRef = useRef<SVGPathElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
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
          start: 'top 80%',
          // finish the sweep around mid-section, then hold — no per-frame mask
          // work while you scroll the rest of the section
          end: 'center 40%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { dependencies: [reduced], scope },
  );

  return (
    <svg
      className={styles.svg}
      viewBox="0 0 2356 1182"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden
    >
      <defs>
        <filter
          id="gpInnerShadows"
          x="0"
          y="-159"
          width="2355.02"
          height="1340.79"
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

        {/* reveal wipe — plain wide stroke, well clear of the 166px visible
            stroke so its edges never fringe it; only its dashoffset animates */}
        <mask
          id="gpReveal"
          maskUnits="userSpaceOnUse"
          x="0"
          y="-159"
          width="2355.02"
          height="1340.79"
        >
          <path
            ref={maskRef}
            d={D}
            stroke="#fff"
            strokeWidth="260"
            strokeLinecap="round"
          />
        </mask>
      </defs>

      <g filter="url(#gpInnerShadows)" mask="url(#gpReveal)">
        <path d={D} stroke="#F2E9DB" strokeWidth="166" strokeLinecap="round" />
      </g>
    </svg>
  );
}

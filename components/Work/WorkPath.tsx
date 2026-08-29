'use client';

import { Fragment, useRef, type RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './WorkPath.module.scss';

const D =
  'M-284 121.074C-284 121.074 142.824 38.4108 313.5 200.519C505.41 382.796 87.7441 647.042 275.5 759.02C470 875.02 538.896 330.449 790.5 363.02C997 389.751 404.783 1156.94 740 1258.52C1070 1358.52 1053.5 329.02 1574.5 538.019C2095.5 747.019 1066 1362.52 1397 1451.52C1997.18 1612.9 2011.5 1103.02 2011.5 1103.02';

// #FF6520 as a colour-matrix row (r 1, g 0.396078, b 0.12549)
const ORANGE = '0 0 0 0 1 0 0 0 0 0.396078 0 0 0 0 0.12549';
const ALPHA = '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0';

// 2 stacked orange inner shadows (Figma values x0.6, matching the 60% weight)
// — dy, stdDeviation (blur/2), alpha
const SHADOWS: Array<[number, number, number]> = [
  [-13.8, 15, 0.33],
  [-54.6, 27.3, 0.29],
];

/**
 * Background line threading the work composition. The stroke is the section's
 * own cream, so only the stacked orange inner shadows read — a soft orange
 * gradient in the shape of the path. `stroke-dashoffset` is scrubbed
 * length -> 0 across the section, so it draws in as you scroll.
 */
export function WorkPath({ scope }: { scope: RefObject<HTMLElement> }) {
  const pathRef = useRef<SVGPathElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const path = pathRef.current;
      const trigger = scope.current;
      if (!path || !trigger) return;

      // `pathLength="1"` normalises the geometry, so the dash values are just
      // 0..1 — no getTotalLength() call, which reads 0 in production when this
      // layout effect fires before the SVG subtree has been laid out.
      gsap.set(path, {
        strokeDasharray: 1,
        strokeDashoffset: reduced ? 0 : 1,
      });
      if (reduced) return;

      const tween = gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top 75%',
          end: 'bottom 25%',
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
      viewBox="0 0 1728 1584"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden
    >
      <g filter="url(#wpInnerShadows)">
        <path
          ref={pathRef}
          d={D}
          pathLength={1}
          stroke="#F2E9DB"
          strokeWidth="120"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <filter
          id="wpInnerShadows"
          x="-384.016"
          y="-163"
          width="2495.52"
          height="1746.09"
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
      </defs>
    </svg>
  );
}

'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import type { WorkGraphicProps } from './types';
import styles from './NextrailGraphic.module.scss';

const LINE = 'rgba(244, 240, 233, 0.16)';
const LINE_STRONG = 'rgba(244, 240, 233, 0.32)';
const PATH_D = 'M78,146 Q150,182 222,286';

/**
 * Nextrail card art: a saved reel, a route across the map, a boarding pass —
 * the Feed2Fly arc the case study is built around. At rest it's just the
 * reel card over a faint worldmap. Hover draws the route, flies a marker
 * along it, and the reel resolves into the trip on the other end.
 */
export function NextrailGraphic({ className }: WorkGraphicProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const reelRef = useRef<SVGGElement>(null);
  const passRef = useRef<SVGGElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const interactive = !isTouch && !reduced;

  useGSAP(
    () => {
      if (!interactive) return;
      const path = pathRef.current;
      const plane = planeRef.current;
      if (!path || !plane || !reelRef.current || !passRef.current) return;

      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(plane, { autoAlpha: 0 });

      const fly = { p: 0 };
      const tl = gsap.timeline({ paused: true });

      tl.to(reelRef.current, { scale: 0.88, y: -8, autoAlpha: 0.45, duration: 0.4, ease: 'power2.out' }, 0)
        .to(path, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, 0.05)
        .to(plane, { autoAlpha: 1, duration: 0.12 }, 0.05)
        .to(
          fly,
          {
            p: 1,
            duration: 0.68,
            ease: 'power1.inOut',
            onUpdate: () => {
              const pt = path.getPointAtLength(fly.p * len);
              const ahead = path.getPointAtLength(Math.min(len, fly.p * len + 2));
              const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
              plane.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${angle})`);
            },
          },
          0.05,
        )
        .to(plane, { autoAlpha: 0, duration: 0.18 }, 0.64)
        .fromTo(
          passRef.current,
          { scale: 0, autoAlpha: 0, transformOrigin: '50% 100%' },
          { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.6)' },
          0.6,
        );

      tlRef.current = tl;
    },
    { scope: rootRef, dependencies: [interactive] },
  );

  const play = () => tlRef.current?.play();
  const reverse = () => tlRef.current?.reverse();

  return (
    <div
      ref={rootRef}
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      onMouseEnter={play}
      onMouseLeave={reverse}
    >
      <svg className={styles.svg} viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <rect width="300" height="400" fill="var(--carbon-2)" />
        <image
          href="/nextrail_casestudy/worldmap.png"
          x="-70"
          y="130"
          width="440"
          height="344"
          opacity="0.16"
          preserveAspectRatio="xMidYMid slice"
        />

        {/* route */}
        <path ref={pathRef} d={PATH_D} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="78" cy="146" r="3.5" fill="var(--accent)" />
        <circle cx="222" cy="286" r="3.5" fill="var(--accent)" />
        <g ref={planeRef} opacity={0}>
          <path d="M0,-5 L5,4 L0,1.5 L-5,4 Z" fill="var(--paper)" />
        </g>

        {/* saved reel, top-left */}
        <g ref={reelRef}>
          <rect x="34" y="34" width="76" height="122" rx="10" fill="var(--carbon)" stroke={LINE_STRONG} />
          <circle cx="52" cy="52" r="6" fill="var(--accent)" />
          <rect x="64" y="48" width="34" height="4" rx="2" fill={LINE_STRONG} />
          <rect x="64" y="57" width="24" height="4" rx="2" fill={LINE} />
          <rect x="44" y="74" width="52" height="60" rx="6" fill="var(--carbon-2)" stroke={LINE} />
          <path
            d="M52,104 c0,-5 7,-5 8,-1 c1,-4 8,-4 8,1 c0,5 -8,10 -8,10 c0,0 -8,-5 -8,-10 Z"
            fill="none"
            stroke="var(--paper)"
            strokeWidth="1.4"
            opacity="0.75"
          />
        </g>

        {/* boarding pass, bottom-right — hidden until the reel becomes a trip */}
        <g ref={passRef}>
          <rect x="188" y="252" width="92" height="60" rx="8" fill="var(--carbon)" stroke="var(--accent)" />
          <rect x="188" y="252" width="8" height="60" rx="8" fill="var(--accent)" />
          <line x1="234" y1="260" x2="234" y2="304" stroke={LINE_STRONG} strokeDasharray="2 3" />
          <path
            d="M212,270 h14 M212,278 h20 M212,286 h12"
            stroke={LINE_STRONG}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M251,272 l14,6 l-14,6 l3,-6 Z"
            fill="var(--accent)"
          />
        </g>
      </svg>
    </div>
  );
}

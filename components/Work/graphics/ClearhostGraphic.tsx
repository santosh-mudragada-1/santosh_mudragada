'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Compass, PieChart, Users } from '@/components/CaseStudy/Clearhost/icons';
import type { WorkGraphicProps } from './types';
import styles from './ClearhostGraphic.module.scss';

const BAR_HEIGHTS = [22, 40, 31, 52]; // px, within the 56px chart well
const BAR_X = [280, 300, 320, 340];

// Raw (theme-independent) tokens only — this card is always a dark surface
// regardless of the site's light/dark mode, same as WorkCard's own
// hardcoded --carbon/--paper. --line/--fg flip with `.theme-dark`, so a
// literal dark-section value is used here instead of that semantic token.
const LINE = 'rgba(244, 240, 233, 0.16)';
const LINE_STRONG = 'rgba(244, 240, 233, 0.32)';
// ClearHost's sticky-note / pop / ok tones — fixed, theme-independent by
// design in the source case study (see Clearhost.module.scss), and scoped
// to that page's own CSS custom properties, so reproduced literally here.
const MARKER = '#ffd84d';
const MARKER_INK = '#2a2410';
const POP = '#3f6fd8';
const OK = '#3fa06b';

/**
 * ClearHost card art: the ops dashboard, still half-buried under a field
 * sticky note. Hover peels the note off and the dashboard boots up — bars
 * grow, occupancy/rooms counters roll — the "field research to live
 * product" arc the case study is actually about.
 */
export function ClearhostGraphic({ className }: WorkGraphicProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<SVGGElement>(null);
  const occValueRef = useRef<SVGTextElement>(null);
  const roomsValueRef = useRef<SVGTextElement>(null);
  const barRefs = useRef<SVGRectElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  barRefs.current = [];

  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const interactive = !isTouch && !reduced;

  useGSAP(
    () => {
      if (!interactive) return;
      if (!noteRef.current || barRefs.current.length < 4) return;

      const occ = { val: 0 };
      const rooms = { val: 0 };

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

      tl.fromTo(
        barRefs.current,
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: '50% 100%', duration: 0.55, stagger: 0.06 },
        0.08,
      )
        .fromTo(
          occ,
          { val: 0 },
          {
            val: 82,
            duration: 0.6,
            ease: 'power2.out',
            onUpdate: () => {
              if (occValueRef.current) occValueRef.current.textContent = `${Math.round(occ.val)}%`;
            },
          },
          0.1,
        )
        .fromTo(
          rooms,
          { val: 0 },
          {
            val: 128,
            duration: 0.6,
            ease: 'power2.out',
            onUpdate: () => {
              if (roomsValueRef.current) roomsValueRef.current.textContent = `${Math.round(rooms.val)}`;
            },
          },
          0.14,
        )
        .to(
          noteRef.current,
          { x: 168, y: -196, rotation: 24, scale: 0.86, autoAlpha: 0, duration: 0.6, ease: 'power3.in' },
          0,
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
      <svg className={styles.svg} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <rect width="400" height="300" fill="var(--carbon-2)" />

        {/* dashboard shell */}
        <rect x="28" y="26" width="344" height="210" rx="10" fill="var(--carbon)" stroke={LINE_STRONG} />
        <circle cx="44" cy="42" r="2.5" fill={LINE_STRONG} />
        <circle cx="54" cy="42" r="2.5" fill={LINE_STRONG} />
        <circle cx="64" cy="42" r="2.5" fill={LINE_STRONG} />
        <text x="80" y="46" fontSize="9" fill="var(--smoke-500)" fontFamily="var(--font-sans)">
          clearhost.in/ops
        </text>
        <line x1="28" y1="58" x2="372" y2="58" stroke={LINE} />

        {/* occupancy tile */}
        <g>
          <rect x="44" y="68" width="104" height="78" rx="8" fill="var(--carbon-2)" stroke={LINE} />
          <PieChart x={56} y={80} size={16} style={{ color: 'var(--accent)' }} />
          <text
            ref={occValueRef}
            x="56"
            y="122"
            fontSize="22"
            fontWeight={700}
            fill="var(--paper)"
            fontFamily="var(--font-heading)"
          >
            {interactive ? '0%' : '82%'}
          </text>
          <text x="56" y="136" fontSize="8" fill="var(--smoke-500)" fontFamily="var(--font-sans)">
            Occupancy
          </text>
        </g>

        {/* rooms-synced tile */}
        <g>
          <rect x="156" y="68" width="104" height="78" rx="8" fill="var(--carbon-2)" stroke={LINE} />
          <Users x={168} y={80} size={16} style={{ color: POP }} />
          <text
            ref={roomsValueRef}
            x="168"
            y="122"
            fontSize="22"
            fontWeight={700}
            fill="var(--paper)"
            fontFamily="var(--font-heading)"
          >
            {interactive ? '0' : '128'}
          </text>
          <text x="168" y="136" fontSize="8" fill="var(--smoke-500)" fontFamily="var(--font-sans)">
            Rooms synced
          </text>
        </g>

        {/* mini bar chart */}
        <g>
          <rect x="268" y="68" width="104" height="78" rx="8" fill="var(--carbon-2)" stroke={LINE} />
          {BAR_HEIGHTS.map((h, i) => (
            <rect
              key={i}
              ref={(el) => {
                if (el) barRefs.current[i] = el;
              }}
              x={BAR_X[i]}
              y={136 - h}
              width="12"
              height={h}
              rx="2"
              fill={i === BAR_HEIGHTS.length - 1 ? 'var(--accent)' : OK}
            />
          ))}
        </g>

        {/* field-research sticky note, peeled off on hover */}
        <g ref={noteRef} style={{ transform: 'rotate(-7deg)', transformOrigin: '305px 213px' }}>
          <rect x="252" y="172" width="106" height="82" rx="3" fill={MARKER} />
          <circle cx="305" cy="180" r="3" fill={MARKER_INK} opacity="0.35" />
          <text x="264" y="204" fontSize="11" fill={MARKER_INK} fontFamily="var(--font-accent)">
            &quot;guests want
          </text>
          <text x="264" y="220" fontSize="11" fill={MARKER_INK} fontFamily="var(--font-accent)">
            faster check-in&quot;
          </text>
          <Compass x={324} y={228} size={14} style={{ color: MARKER_INK, opacity: 0.55 }} />
        </g>
      </svg>
    </div>
  );
}

'use client';

import { Fragment, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useMediaQueryLayout } from '@/lib/hooks/useMediaQueryLayout';
import { FrameViewport } from './FrameViewport';
import styles from './InsightAnim.module.scss';

const B = '/nextrail_casestudy/insights';

// Three free travel clips (Pexels, free licence): a city street, a coastline,
// a waterfall — the kind of thing you scroll past every day before any trip
// is planned.
const CLIPS = [
  { src: `${B}/city.mp4`, poster: `${B}/city.jpg` },
  { src: `${B}/coast.mp4`, poster: `${B}/coast.jpg` },
  { src: `${B}/falls.mp4`, poster: `${B}/falls.jpg` },
];

// Overlay space. preserveAspectRatio="none" — it stretches to the grid, so a
// viewBox coord and the matching CSS % land in the same place.
const VB = { w: 600, h: 280 };

// A point on each panel; the last is the orange "destination".
const NODES = [
  { left: 17, top: 56 },
  { left: 50, top: 40 },
  { left: 83, top: 60, dest: true },
];

// A faint hand-drawn path threading through the points and off both edges —
// no bright trail on top of it, just the line itself.
const ROUTE =
  'M -60 178 C 20 152 66 150 102 157 C 176 164 206 102 300 112 C 372 120 424 178 498 168 C 558 161 624 150 680 158';

/**
 * ANIMATION 01 — FLOW. A small grid of looping travel clips with a faint path
 * threading through them and a marker on each — one a warm orange
 * "destination". The markers breathe, the clips drift almost imperceptibly,
 * and the top and bottom of the block dissolve into the page. Inspiration is
 * already everywhere — an endless feed of places — long before any planning
 * starts.
 */
export function InsightFlow() {
  const rootRef = useRef<SVGSVGElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pulseRefs = useRef<(HTMLElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const mobile = useMediaQueryLayout('(max-width: 640px)');

  const clips = mobile ? CLIPS.slice(0, 2) : CLIPS;

  useGSAP(
    () => {
      const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
      videos.forEach((v) => {
        v.muted = true;
        if (reduced) v.pause();
        else void v.play().catch(() => {});
      });

      const pulses = pulseRefs.current.filter(Boolean) as HTMLElement[];
      const panels = panelRefs.current.filter(Boolean) as HTMLDivElement[];

      if (reduced) {
        gsap.set(pulses, { scale: 1, opacity: 0.9 });
        gsap.set(panels, { scale: 1 });
        return;
      }

      // markers breathe, gently staggered
      gsap.fromTo(
        pulses,
        { scale: 1, opacity: 0.85 },
        {
          scale: 2.6,
          opacity: 0,
          duration: 3.2,
          ease: 'sine.out',
          repeat: -1,
          stagger: 1.1,
        },
      );

      // each clip drifts almost imperceptibly, so nothing sits dead still
      panels.forEach((p, i) => {
        gsap.to(p, {
          scale: 1.06,
          duration: 14 + i * 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 2.5,
        });
      });
    },
    { scope: rootRef, dependencies: [reduced, mobile] },
  );

  return (
    <FrameViewport variant="media" sides>
      <div className={styles.mediaGrid}>
        {clips.map((c, i) => (
          <div
            key={c.src}
            className={styles.panel}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={c.src}
              poster={c.poster}
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
        ))}
      </div>

      <svg
        ref={rootRef}
        className={styles.routeOverlay}
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        preserveAspectRatio="none"
        aria-hidden
        focusable="false"
      >
        <path d={ROUTE} className={styles.routeBase} pathLength={1} />
      </svg>

      {NODES.map((n, i) => (
        <Fragment key={`n-${i}`}>
          <i
            className={styles.nodePulse}
            data-dest={n.dest || undefined}
            style={{ left: `${n.left}%`, top: `${n.top}%` }}
            ref={(el) => {
              pulseRefs.current[i] = el;
            }}
            aria-hidden
          />
          <i
            className={styles.node}
            data-dest={n.dest || undefined}
            style={{ left: `${n.left}%`, top: `${n.top}%` }}
            aria-hidden
          />
        </Fragment>
      ))}
    </FrameViewport>
  );
}

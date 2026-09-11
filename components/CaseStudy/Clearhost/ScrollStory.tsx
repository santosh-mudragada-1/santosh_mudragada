'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap/gsap';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './ScrollStory.module.scss';

/* -------------------------------------------------------------------------- */
/*  ScrollStory — a scroll-told "problem -> solution" for one design call.     */
/*                                                                            */
/*  Pinning is CSS `position: sticky`, NOT a ScrollTrigger pin: a tall spacer  */
/*  reserves the scroll height, an inner sticky stage holds in view, and       */
/*  ScrollTrigger only reads progress to drive a paused timeline. Native       */
/*  sticky has no pin-spacer to collapse, so it stays robust next to the       */
/*  page's other pinned section (ProductWorkflow).                             */
/*                                                                            */
/*  Three shapes decorate a frame: draw-on annotation paths (`paths`),         */
/*  scribbled strike-offs over invalid rows (`strikes`), and `overlays` —      */
/*  small screenshots (an opened dropdown, say) that animate in over the base  */
/*  image at a point in the scroll, rather than being baked into it.           */
/*  Both stories fall back to a themed SVG mock until real screenshots exist.  */
/* -------------------------------------------------------------------------- */

const ART_W = 1600;
const ART_H = 1000;

type Placement = 'right' | 'left' | 'top' | 'bottom';

interface Ann {
  title?: string;
  text: string;
  x: number;
  y: number;
  width: number;
  placement: Placement;
}
interface PathSpec {
  d: string;
  strokeWidth?: number;
}
interface StrikeSpec {
  x: number;
  y: number;
  width: number;
  height: number;
  delay?: number;
}
interface OverlaySpec {
  src: string;
  /** Which frame it sits on. */
  phase: 'problem' | 'solution';
  /** Top-left anchor + width, as % of the frame. */
  x: number;
  y: number;
  width: number;
}

export interface StoryConfig {
  id: string;
  problemImage?: string;
  solutionImage?: string;
  problemPlaceholder: string;
  solutionPlaceholder: string;
  problemLabel: string;
  solutionLabel: string;
  zoom: { x: number; y: number; scale: number };
  solutionZoom: { x: number; y: number; scale: number };
  paths?: readonly PathSpec[];
  strikes?: readonly StrikeSpec[];
  overlays?: readonly OverlaySpec[];
  problemAnnotations: readonly Ann[];
  solutionAnnotations: readonly Ann[];
  scrollLength?: number;
}

const STRIKE_PATH =
  'M 4 62 C 22 50 40 66 58 54 C 74 44 88 60 97 50 ' +
  'M 96 52 C 80 60 62 46 44 58 C 28 68 14 54 5 64';

const cam = (zx: number, zy: number, s: number) => ({
  scale: s,
  xPercent: (0.5 - (zx / 100) * s) * 100,
  yPercent: (0.5 - (zy / 100) * s) * 100,
});

const placementTransform = (p: Placement) => {
  switch (p) {
    case 'left':
      return 'translate(-100%, -50%)';
    case 'top':
      return 'translate(-50%, -100%)';
    case 'bottom':
      return 'translate(-50%, 0)';
    default:
      return 'translate(0, -50%)';
  }
};

const placementBorder = (p: Placement): React.CSSProperties => {
  const rule = '3px solid var(--accent)';
  if (p === 'left') return { borderRight: rule };
  if (p === 'top') return { borderBottom: rule };
  if (p === 'bottom') return { borderTop: rule };
  return { borderLeft: rule };
};

export function ScrollStory({ story }: { story: StoryConfig }) {
  const reduced = usePrefersReducedMotion();
  // phones: the sticky-scrub scene shrinks the frame to ~230px tall and
  // throws the floating annotation cards off-screen — fall back to the same
  // clean stacked before → after the reduced-motion path already renders.
  const isPhone = useMediaQuery('(max-width: 767px)');
  const asStatic = reduced || isPhone;

  const problemSrc = story.problemImage || story.problemPlaceholder;
  const solutionSrc = story.solutionImage || story.solutionPlaceholder;
  const scrollLength = story.scrollLength ?? 3000;

  const paths = story.paths ?? [];
  const strikes = story.strikes ?? [];
  const overlays = story.overlays ?? [];
  const pOverlays = overlays.filter((o) => o.phase === 'problem');
  const sOverlays = overlays.filter((o) => o.phase === 'solution');
  const pAnn = story.problemAnnotations;
  const sAnn = story.solutionAnnotations;

  const spacerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pZoomRef = useRef<HTMLDivElement>(null);
  const sZoomRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const strikeRefs = useRef<(SVGPathElement | null)[]>([]);
  const pOverlayRefs = useRef<(HTMLImageElement | null)[]>([]);
  const sOverlayRefs = useRef<(HTMLImageElement | null)[]>([]);
  const pAnnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sAnnRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (asStatic || !spacerRef.current || !stageRef.current) return;

      const pEls = pathRefs.current.filter(Boolean) as SVGPathElement[];
      const skEls = strikeRefs.current.filter(Boolean) as SVGPathElement[];
      const poEls = pOverlayRefs.current.filter(Boolean) as HTMLImageElement[];
      const soEls = sOverlayRefs.current.filter(Boolean) as HTMLImageElement[];
      const paEls = pAnnRefs.current.filter(Boolean) as HTMLDivElement[];
      const saEls = sAnnRefs.current.filter(Boolean) as HTMLDivElement[];

      gsap.set(pZoomRef.current, { opacity: 0, yPercent: 4, scale: 1, xPercent: 0 });
      gsap.set(sZoomRef.current, { opacity: 0, scale: 1, xPercent: 0, yPercent: 0 });

      const drawEls = [...pEls, ...skEls];
      drawEls.forEach((el) => {
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      });
      [...poEls, ...soEls].forEach((el) => gsap.set(el, { opacity: 0, y: -6, scale: 0.96 }));
      [...paEls, ...saEls].forEach((el) => gsap.set(el, { opacity: 0, y: 16, scale: 0.96 }));

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });

      // problem screenshot in, then camera push
      tl.fromTo(
        pZoomRef.current,
        { opacity: 0, yPercent: 4 },
        { opacity: 1, yPercent: 0, duration: 1, ease: 'sine.out' },
      ).to(pZoomRef.current, {
        ...cam(story.zoom.x, story.zoom.y, story.zoom.scale),
        duration: 3,
        ease: 'power2.inOut',
      });

      // overlays animate in over the problem frame (e.g. an opened dropdown)
      poEls.forEach((el, i) => {
        tl.to(
          el,
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
          i === 0 ? '>' : '>+=0.12',
        );
      });

      // draw-on paths
      pEls.forEach((el, i) => {
        tl.set(el, { opacity: 1 }, i === 0 ? '>' : '>-=0.4');
        tl.to(el, { strokeDashoffset: 0, duration: 1.2, ease: 'power1.inOut' }, '>');
      });
      // scribbled strike-offs
      skEls.forEach((el, i) => {
        const d = strikes[i]?.delay ?? 0;
        tl.set(el, { opacity: 1 }, i === 0 ? '>' : `>+=${d}`);
        tl.to(el, { strokeDashoffset: 0, duration: 0.7, ease: 'power1.inOut' }, '>');
      });

      // problem annotations
      paEls.forEach((el, i) => {
        tl.to(
          el,
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' },
          i === 0 ? '>' : '>+=0.15',
        );
      });

      tl.to({}, { duration: 1 });

      // crossfade problem -> solution
      tl.addLabel('cross');
      tl.to(pZoomRef.current, { opacity: 0, duration: 1.2, ease: 'sine.inOut' }, 'cross');
      if (paEls.length) tl.to(paEls, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 'cross');
      tl.fromTo(
        sZoomRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: 'sine.inOut' },
        'cross',
      );
      tl.to(
        sZoomRef.current,
        {
          ...cam(story.solutionZoom.x, story.solutionZoom.y, story.solutionZoom.scale),
          duration: 3,
          ease: 'power2.inOut',
        },
        'cross+=1.2',
      );

      // overlays animate in over the solution frame
      soEls.forEach((el, i) => {
        tl.to(
          el,
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
          i === 0 ? '>' : '>+=0.12',
        );
      });

      // solution annotations
      saEls.forEach((el, i) => {
        tl.to(
          el,
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' },
          i === 0 ? '>' : '>+=0.15',
        );
      });

      tl.to({}, { duration: 1.2 });

      const st = ScrollTrigger.create({
        trigger: spacerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => tl.progress(self.progress),
      });

      return () => {
        st.kill();
        tl.kill();
      };
    },
    { scope: spacerRef, dependencies: [asStatic, story], revertOnUpdate: true },
  );

  const renderOverlays = (
    list: OverlaySpec[],
    store: React.MutableRefObject<(HTMLImageElement | null)[]>,
    key: string,
  ) =>
    list.map((o, i) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={key + i}
        ref={(el) => {
          store.current[i] = el;
        }}
        src={o.src}
        alt=""
        className={styles.overlay}
        style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.width}%` }}
      />
    ));

  /* ---- reduced motion / phones: a plain stacked before -> after --------- */
  if (asStatic) {
    return (
      <div className={styles.staticStack}>
        {(
          [
            { src: problemSrc, label: story.problemLabel, anns: pAnn, tone: 'problem' as const },
            { src: solutionSrc, label: story.solutionLabel, anns: sAnn, tone: 'solution' as const },
          ]
        ).map((phase) => (
          <figure key={phase.tone} className={styles.staticPhase}>
            <div className={styles.staticShot}>
              <span className={styles.badge}>{phase.label}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={phase.src} alt="" className={styles.img} />
              {renderOverlays(
                phase.tone === 'problem' ? pOverlays : sOverlays,
                phase.tone === 'problem' ? pOverlayRefs : sOverlayRefs,
                phase.tone,
              )}
            </div>
            <figcaption>
              <ul className={styles.staticNotes}>
                {phase.anns.map((a) => (
                  <li key={a.text} data-tone={phase.tone}>
                    {a.title ? <span className={styles.staticNoteTitle}>{a.title}</span> : null}
                    <span>{a.text}</span>
                  </li>
                ))}
              </ul>
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  const renderAnn = (
    list: readonly Ann[],
    store: React.MutableRefObject<(HTMLDivElement | null)[]>,
    key: string,
  ) =>
    list.map((a, i) => (
      <div
        key={key + i}
        className={styles.annOuter}
        style={{
          left: `${a.x}%`,
          top: `${a.y}%`,
          width: `min(${a.width}px, calc(100vw - 2.5rem))`,
          transform: placementTransform(a.placement),
        }}
      >
        <div
          ref={(el) => {
            store.current[i] = el;
          }}
          className={styles.annCard}
          style={placementBorder(a.placement)}
        >
          {a.title ? <span className={styles.annTitle}>{a.title}</span> : null}
          <span className={styles.annText}>{a.text}</span>
        </div>
      </div>
    ));

  return (
    <div
      ref={spacerRef}
      className={styles.spacer}
      style={{ '--scroll-length': `${scrollLength}px` } as React.CSSProperties}
    >
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.frame}>
          <div className={styles.imageBox}>
            <div ref={pZoomRef} className={styles.zoomLayer}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={problemSrc} alt="" className={styles.img} />

              {renderOverlays(pOverlays, pOverlayRefs, 'po')}

              {strikes.map((s, i) => (
                <span
                  key={'sk' + i}
                  className={styles.strikeWrap}
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: `${s.width}%`,
                    height: `${s.height}%`,
                  }}
                >
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.strikeSvg}>
                    <path
                      ref={(el) => {
                        strikeRefs.current[i] = el;
                      }}
                      d={STRIKE_PATH}
                      fill="none"
                      stroke="var(--cs-err)"
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </span>
              ))}

              {paths.length > 0 && (
                <svg
                  className={styles.pathSvg}
                  viewBox={`0 0 ${ART_W} ${ART_H}`}
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden
                >
                  {paths.map((p, i) => (
                    <path
                      key={'p' + i}
                      ref={(el) => {
                        pathRefs.current[i] = el;
                      }}
                      d={p.d}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={p.strokeWidth ?? 6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </svg>
              )}
            </div>

            <div ref={sZoomRef} className={styles.zoomLayer}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={solutionSrc} alt="" className={styles.img} />

              {renderOverlays(sOverlays, sOverlayRefs, 'so')}
            </div>
          </div>

          <div className={styles.annLayer} aria-hidden>
            {renderAnn(pAnn, pAnnRefs, 'pa')}
            {renderAnn(sAnn, sAnnRefs, 'sa')}
          </div>
        </div>
      </div>
    </div>
  );
}

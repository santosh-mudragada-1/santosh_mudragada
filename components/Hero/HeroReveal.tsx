'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { useIsWebKit } from '@/lib/hooks/useIsWebKit';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './HeroReveal.module.scss';

type Props = {
  /** true once the preloader has handed off (or immediately under reduced motion) */
  play: boolean;
};

// the composition is authored at 16" — everything below is in these units
const VBW = 1728;
const VBH = 1052;

const CUTOUT = '/images/hero-cutout.png';
const BG = '/images/hero-bg.png';
const DEPTH = '/images/hero-depth.png';

// curved marquee — repeated so there's always text across the visible arc.
// Trailing NBSPs give the loop a clean gap and never collapse.
const MARQUEE =
  'Santosh Mudragada — Product Designer + Builder — UI/UX Designer —' +
  '    ';
const MARQUEE_REPEAT = 5;
const MARQUEE_PXPS = 88; // scroll speed, viewBox units / second

// the arc the marquee rides — a gentle upward bow across the crossed hands
// (the depth crop occludes it there), sitting fully inside the canvas.
// Runs well past both edges so it never runs dry.
const CURVE = `M -520 ${Math.round(VBH * 0.97)} Q ${VBW / 2} ${Math.round(
  VBH * 0.83,
)} ${VBW + 520} ${Math.round(VBH * 0.97)}`;

// the provided ↘ arrow (public/arrow.svg), inlined so it can be recoloured and
// masked for the negative copy. Source is 34x34, weight-5 baked into the fill.
const ARROW_D =
  'M4.26777 0.732233C3.29146 -0.244078 1.70854 -0.244078 0.732233 0.732233C-0.244078 1.70854 -0.244078 3.29146 0.732233 4.26777L2.5 2.5L4.26777 0.732233ZM31.5 34C32.8807 34 34 32.8807 34 31.5L34 9C34 7.61929 32.8807 6.5 31.5 6.5C30.1193 6.5 29 7.61929 29 9V29H9C7.61929 29 6.5 30.1193 6.5 31.5C6.5 32.8807 7.61929 34 9 34L31.5 34ZM2.5 2.5L0.732233 4.26777L29.7322 33.2678L31.5 31.5L33.2678 29.7322L4.26777 0.732233L2.5 2.5Z';
const ARROW_SCALE = 1.9;

// gooey blobs — lead is large & near-instant, trail lags and shrinks
const BLOBS = [
  { r: 262, d: 0.05 },
  { r: 214, d: 0.16 },
  { r: 150, d: 0.31 },
  { r: 94, d: 0.52 },
];

// scattered copy positions (viewBox units, matched to the 1728x1052 spec)
const SCATTER = {
  fromX: 140,
  fromY1: 300,
  fromY2: 392,
  toX: 1218,
  toY1: 506,
  toY2: 604,
};

export function HeroReveal({ play }: Props) {
  const isTouch = useIsTouch();
  const isWebKit = useIsWebKit();
  const reduced = usePrefersReducedMotion();
  const wide = useMediaQuery('(min-width: 1024px)');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // WebKit chokes on the per-frame feGaussianBlur + mask of the liquid reveal
  // — it just gets the static cutout there (no reveal, no negative text).
  const useReveal = mounted && !isTouch && !reduced && !isWebKit;
  const useTouchFade = mounted && isTouch && !reduced;

  const svgRef = useRef<SVGSVGElement>(null);
  const groupRefs = useRef<Array<SVGGElement | null>>([]);
  const dotRefs = useRef<Array<SVGCircleElement | null>>([]);
  const tp1Ref = useRef<SVGTextPathElement>(null);
  const tp2Ref = useRef<SVGTextPathElement>(null);
  const bgRef = useRef<SVGImageElement>(null);
  const inGroupRef = useRef<SVGGElement>(null); // everything that eases in

  const marqueeText = MARQUEE.repeat(MARQUEE_REPEAT);

  // --- cursor liquid-mask reveal ------------------------------------------
  useEffect(() => {
    if (!useReveal) return;
    const svg = svgRef.current;
    const groups = groupRefs.current.filter(Boolean) as SVGGElement[];
    const dots = dotRefs.current.filter(Boolean) as SVGCircleElement[];
    if (!svg || groups.length !== BLOBS.length || dots.length !== BLOBS.length)
      return;

    const follow = groups.map((g, i) => ({
      x: gsap.quickTo(g, 'x', { duration: BLOBS[i].d, ease: 'power3' }),
      y: gsap.quickTo(g, 'y', { duration: BLOBS[i].d, ease: 'power3' }),
    }));

    const drifts = dots.map((c, i) => {
      if (i === 0) return null;
      const a = 10 + i * 5;
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

    // screen px -> viewBox units, honouring viewBox + preserveAspectRatio
    const toVB = (e: PointerEvent): [number, number] => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return [VBW / 2, VBH / 2];
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
      return [p.x, p.y];
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
      const [x, y] = toVB(e);
      place(x, y, true);
      inside = true;
      grow();
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = toVB(e);
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

    svg.addEventListener('pointerenter', onEnter);
    svg.addEventListener('pointermove', onMove, { passive: true });
    svg.addEventListener('pointerleave', onLeave);

    // Safari: pause the idle drift while the hero is off-screen
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
      driftIO.observe(svg);
    }

    return () => {
      svg.removeEventListener('pointerenter', onEnter);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerleave', onLeave);
      driftIO?.disconnect();
      gsap.killTweensOf(dots);
      gsap.killTweensOf(groups);
      drifts.forEach((t) => t?.kill());
    };
  }, [useReveal, isWebKit]);

  // --- curved marquee (dark + negative copies move together) -------------
  useEffect(() => {
    if (reduced || !mounted) return;
    const a = tp1Ref.current;
    const b = tp2Ref.current;
    if (!a) return;

    let cancelled = false;
    let tw: gsap.core.Tween | null = null;
    let io: IntersectionObserver | null = null;

    const start = () => {
      if (cancelled || !a) return;
      // one repeat's advance along the path — the exact seamless loop distance
      let one = 0;
      try {
        one = a.getComputedTextLength() / MARQUEE_REPEAT;
      } catch {
        /* ignore */
      }
      if (!one) return;

      const targets = b ? [a, b] : [a];
      gsap.set(targets, { attr: { startOffset: 0 } });
      // right -> left: startOffset drops by one repeat, then loops
      tw = gsap.to(targets, {
        attr: { startOffset: -one },
        duration: one / MARQUEE_PXPS,
        ease: 'none',
        repeat: -1,
      });

      if (isWebKit && svgRef.current) {
        io = new IntersectionObserver(
          ([e]) => (e.isIntersecting ? tw?.resume() : tw?.pause()),
          { rootMargin: '200px 0px' },
        );
        io.observe(svgRef.current);
      }
    };

    // measure only after the display font is ready — the fallback font has a
    // different advance width, which is what made the loop jitter
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(start).catch(start);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      tw?.kill();
    };
  }, [reduced, isWebKit, mounted]);

  // --- entrance (once the preloader hands off) --------------------------
  useEffect(() => {
    const grp = inGroupRef.current;
    if (!grp) return;
    const pieces = grp.querySelectorAll(`.${styles.inItem}`);

    if (reduced || !play) {
      gsap.set(grp, { autoAlpha: reduced ? 1 : play ? 1 : 0 });
      gsap.set(pieces, { autoAlpha: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline();
    tl.fromTo(
      grp,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.5, ease: 'power2.out' },
    ).fromTo(
      pieces,
      { autoAlpha: 0, y: 26 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        ease: 'expo.out',
        stagger: 0.08,
      },
      0.08,
    );
    return () => {
      tl.kill();
    };
  }, [play, reduced]);

  // --- touch: bg fades in on scroll ------------------------------------
  useEffect(() => {
    if (!useTouchFade) return;
    const el = bgRef.current;
    const svg = svgRef.current;
    if (!el || !svg) return;
    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0 },
      {
        autoAlpha: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: svg,
          start: 'center 85%',
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
    <svg
      ref={svgRef}
      className={styles.canvas}
      viewBox={`0 0 ${VBW} ${VBH}`}
      preserveAspectRatio={wide ? 'xMidYMid slice' : 'xMidYMid meet'}
      data-cursor={useReveal ? 'view' : undefined}
      role="img"
      aria-label="Santosh Mudragada — Product Designer + Builder, UI/UX Designer"
    >
      <defs>
        {useReveal && (
          <>
            <filter
              id="heroGoo"
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="34"
                result="b"
              />
              <feColorMatrix
                in="b"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"
              />
            </filter>
            <mask id="heroBlob">
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
          </>
        )}
        <path id="heroCurve" d={CURVE} fill="none" />
      </defs>

      {/* layer 4 — base cutout (always visible) */}
      <image
        href={CUTOUT}
        x="0"
        y="0"
        width={VBW}
        height={VBH}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* layer 3 — with-background, revealed through the blob (or scroll-faded
          on touch). Not rendered at all on WebKit — no reveal there. */}
      {(useReveal || useTouchFade) && (
        <image
          ref={bgRef}
          className={styles.bg}
          href={BG}
          x="0"
          y="0"
          width={VBW}
          height={VBH}
          preserveAspectRatio="xMidYMid slice"
          mask={useReveal ? 'url(#heroBlob)' : undefined}
          data-scrub={useTouchFade || undefined}
        />
      )}

      {/* layers 2 + 1 ease in together */}
      <g ref={inGroupRef}>
        {/* layer 2 — text, dark (rest state, over the cream) */}
        <g className={styles.textDark}>
          <text className={`${styles.marquee} ${styles.inItem}`} fill="#141210">
            <textPath ref={tp1Ref} href="#heroCurve" startOffset="0">
              {marqueeText}
            </textPath>
          </text>
          <g fill="#3a1b0e">
            <text
              className={`${styles.scatter} ${styles.inItem}`}
              x={SCATTER.fromX}
              y={SCATTER.fromY1}
            >
              from
            </text>
            <text
              className={`${styles.scatter} ${styles.inItem}`}
              x={SCATTER.fromX}
              y={SCATTER.fromY2}
            >
              problems
              <tspan fill="#ff4d1a">!</tspan>
            </text>
            <text
              className={`${styles.scatter} ${styles.inItem}`}
              x={SCATTER.toX}
              y={SCATTER.toY1}
            >
              to
            </text>
            {/* outer <g> keeps the position; GSAP animates the inner .inItem
                (an untransformed <g>) so it can't clobber the translate */}
            <g
              transform={`translate(${SCATTER.toX + 96} ${SCATTER.toY1 - 58})`}
            >
              <g className={styles.inItem}>
                <path
                  d={ARROW_D}
                  transform={`scale(${ARROW_SCALE})`}
                  fill="#ff4d1a"
                />
              </g>
            </g>
            <text
              className={`${styles.scatter} ${styles.inItem}`}
              x={SCATTER.toX}
              y={SCATTER.toY2}
            >
              possibilities
              <tspan fill="#ff4d1a">.</tspan>
            </text>
          </g>
        </g>

        {/* layer 2b — same text, light, shown ONLY through the blob (negative) */}
        {useReveal && (
          <g
            className={styles.textLight}
            mask="url(#heroBlob)"
            fill="#f4f0e9"
            aria-hidden
          >
            <text className={styles.marquee}>
              <textPath ref={tp2Ref} href="#heroCurve" startOffset="0">
                {marqueeText}
              </textPath>
            </text>
            <text className={styles.scatter} x={SCATTER.fromX} y={SCATTER.fromY1}>
              from
            </text>
            <text className={styles.scatter} x={SCATTER.fromX} y={SCATTER.fromY2}>
              problems!
            </text>
            <text className={styles.scatter} x={SCATTER.toX} y={SCATTER.toY1}>
              to
            </text>
            <g
              transform={`translate(${SCATTER.toX + 96} ${SCATTER.toY1 - 58})`}
            >
              <path d={ARROW_D} transform={`scale(${ARROW_SCALE})`} />
            </g>
            <text className={styles.scatter} x={SCATTER.toX} y={SCATTER.toY2}>
              possibilities.
            </text>
          </g>
        )}
      </g>

      {/* layer 1 — foreground depth crop, over the curved text */}
      <image
        href={DEPTH}
        x="0"
        y="0"
        width={VBW}
        height={VBH}
        preserveAspectRatio="xMidYMid slice"
      />
    </svg>
  );
}

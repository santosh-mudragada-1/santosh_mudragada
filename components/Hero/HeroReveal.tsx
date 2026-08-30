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

// curved marquee — repeated so there's always text across the visible arc
const MARQUEE =
  'Santosh Mudragada — Product Designer + Builder — UI/UX Designer — ';
const MARQUEE_REPEAT = 5;
const MARQUEE_PXPS = 90; // scroll speed, viewBox units / second

// the arc the marquee rides — runs well past both edges so it never runs dry
const CURVE = `M -520 ${Math.round(VBH * 0.82)} Q ${VBW / 2} ${Math.round(
  VBH * 1.04,
)} ${VBW + 520} ${Math.round(VBH * 0.82)}`;

// gooey blobs — lead is large & near-instant, trail lags and shrinks
const BLOBS = [
  { r: 262, d: 0.05 },
  { r: 214, d: 0.16 },
  { r: 150, d: 0.31 },
  { r: 94, d: 0.52 },
];

// scattered copy positions (viewBox units)
const SCATTER = {
  fromX: 150,
  fromY1: 322,
  fromY2: 430,
  toX: 1232,
  toY1: 566,
  toY2: 690,
};

export function HeroReveal({ play }: Props) {
  const isTouch = useIsTouch();
  const isWebKit = useIsWebKit();
  const reduced = usePrefersReducedMotion();
  const wide = useMediaQuery('(min-width: 1024px)');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const useReveal = mounted && !isTouch && !reduced;
  const useTouchFade = mounted && isTouch && !reduced;

  const svgRef = useRef<SVGSVGElement>(null);
  const groupRefs = useRef<Array<SVGGElement | null>>([]);
  const dotRefs = useRef<Array<SVGCircleElement | null>>([]);
  const measureRef = useRef<SVGTextElement>(null);
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
    if (reduced) return;
    const a = tp1Ref.current;
    const b = tp2Ref.current;
    const m = measureRef.current;
    if (!a || !m) return;

    let one = 0;
    try {
      one = m.getComputedTextLength() / MARQUEE_REPEAT;
    } catch {
      /* keep 0 -> effect bails */
    }
    if (!one) return;

    const targets = b ? [a, b] : [a];
    gsap.set(targets, { attr: { startOffset: 0 } });
    // right -> left: startOffset decreases by exactly one repeat, then loops
    const tw = gsap.to(targets, {
      attr: { startOffset: -one },
      duration: one / MARQUEE_PXPS,
      ease: 'none',
      repeat: -1,
    });

    let io: IntersectionObserver | null = null;
    if (isWebKit && svgRef.current) {
      io = new IntersectionObserver(
        ([e]) => (e.isIntersecting ? tw.resume() : tw.pause()),
        { rootMargin: '200px 0px' },
      );
      io.observe(svgRef.current);
    }
    return () => {
      io?.disconnect();
      tw.kill();
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
      data-cursor="view"
      role="img"
      aria-label="Santosh Mudragada — Product Designer + Builder, UI/UX Designer"
    >
      <defs>
        <filter
          id="heroGoo"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="34" result="b" />
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
        <path id="heroCurve" d={CURVE} fill="none" />
        <marker
          id="heroArrow"
          viewBox="0 0 12 12"
          refX="9"
          refY="6"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M1.5 1.5 L 10 6 L 1.5 10.5"
            fill="none"
            stroke="#ff4d1a"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      {/* hidden — one marquee repeat, measured for a seamless loop */}
      <text
        ref={measureRef}
        className={styles.marquee}
        x="-99999"
        y="-99999"
        aria-hidden
      >
        {MARQUEE}
      </text>

      {/* layer 4 — base cutout (always visible) */}
      <image
        href={CUTOUT}
        x="0"
        y="0"
        width={VBW}
        height={VBH}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* layer 3 — with-background, revealed through the blob (or scroll-faded on touch) */}
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
            <path
              className={styles.inItem}
              d={`M ${SCATTER.toX + 72} ${SCATTER.toY1 - 34} l 46 46`}
              fill="none"
              stroke="#ff4d1a"
              strokeWidth="5"
              strokeLinecap="round"
              markerEnd="url(#heroArrow)"
            />
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

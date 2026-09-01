'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { useIsWebKit } from '@/lib/hooks/useIsWebKit';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './BlobReveal.module.scss';

// Same cursor-driven liquid reveal as the home hero, trimmed to one job here:
// wipe a green/cream chess board into view under the cursor. Chromium uses the
// gooey feGaussianBlur + SVG <mask>; Safari can't run that per frame, so it
// gets the JS-painted CSS radial-gradient mask instead; touch / reduced-motion
// get nothing.

const VBW = 1600;
const VBH = 900;

// lead is large & near-instant; the trail lags wider for a longer liquid streak
const BLOBS = [
  { r: 210, d: 0.05 },
  { r: 188, d: 0.14 },
  { r: 166, d: 0.26 },
  { r: 144, d: 0.41 },
  { r: 122, d: 0.6 },
  { r: 100, d: 0.82 },
  { r: 80, d: 1.06 },
  { r: 60, d: 1.34 },
  { r: 42, d: 1.66 },
  { r: 26, d: 2 },
];

export function BlobReveal() {
  const isTouch = useIsTouch();
  const isWebKit = useIsWebKit();
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const on = mounted && !isTouch && !reduced;
  const useGoo = on && !isWebKit;
  const useWk = on && isWebKit;

  const svgRef = useRef<SVGSVGElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const wkRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<Array<SVGGElement | null>>([]);
  const dotRefs = useRef<Array<SVGCircleElement | null>>([]);

  // --- Chromium: gooey SVG mask -----------------------------------------
  useEffect(() => {
    if (!useGoo) return;
    const svg = svgRef.current;
    const groups = groupRefs.current.filter(Boolean) as SVGGElement[];
    const dots = dotRefs.current.filter(Boolean) as SVGCircleElement[];
    if (!svg || groups.length !== BLOBS.length) return;

    const follow = groups.map((g, i) => ({
      x: gsap.quickTo(g, 'x', { duration: BLOBS[i].d, ease: 'power3' }),
      y: gsap.quickTo(g, 'y', { duration: BLOBS[i].d, ease: 'power3' }),
    }));

    let inside = false;
    const toVB = (e: PointerEvent): [number, number] => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return [VBW / 2, VBH / 2];
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
      return [p.x, p.y];
    };
    const place = (x: number, y: number, snap: boolean) =>
      groups.forEach((g, i) => {
        if (snap) gsap.set(g, { x, y });
        else {
          follow[i].x(x);
          follow[i].y(y);
        }
      });
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

    const onMove = (e: PointerEvent) => {
      const [x, y] = toVB(e);
      if (!inside) {
        place(x, y, true);
        inside = true;
        grow();
      } else place(x, y, false);
    };
    const onLeave = () => {
      inside = false;
      collapse();
    };

    svg.addEventListener('pointermove', onMove, { passive: true });
    svg.addEventListener('pointerleave', onLeave);
    svg.addEventListener('pointercancel', onLeave);
    return () => {
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerleave', onLeave);
      svg.removeEventListener('pointercancel', onLeave);
      gsap.killTweensOf(dots);
      gsap.killTweensOf(groups);
    };
  }, [useGoo]);

  // --- Safari: JS-painted CSS radial-gradient mask --------------------
  useEffect(() => {
    if (!useWk) return;
    const host = hostRef.current;
    const el = wkRef.current;
    if (!host || !el) return;

    const st = { x: 0, y: 0, r: 0, o: 0 };
    const maxR = () => Math.max(200, Math.min(window.innerWidth * 0.22, 360));
    const paint = () => {
      const r = st.r < 1 ? 1 : st.r;
      const m = `radial-gradient(circle ${r}px at ${st.x}px ${st.y}px, #000 ${
        r * 0.52
      }px, rgba(0,0,0,0) ${r}px)`;
      el.style.webkitMaskImage = m;
      el.style.maskImage = m;
      el.style.opacity = `${st.o}`;
    };
    paint();

    const xTo = gsap.quickTo(st, 'x', { duration: 0.3, ease: 'power3', onUpdate: paint });
    const yTo = gsap.quickTo(st, 'y', { duration: 0.3, ease: 'power3', onUpdate: paint });
    let inside = false;
    const reveal = () =>
      gsap.to(st, { r: maxR(), o: 1, duration: 0.5, ease: 'power2.out', overwrite: 'auto', onUpdate: paint });
    const conceal = () => {
      inside = false;
      gsap.to(st, { r: 0, o: 0, duration: 0.4, ease: 'power2.in', overwrite: 'auto', onUpdate: paint });
    };
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!inside) {
        inside = true;
        st.x = x;
        st.y = y;
        paint();
        reveal();
      } else {
        xTo(x);
        yTo(y);
      }
    };
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', conceal);
    host.addEventListener('pointercancel', conceal);
    return () => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', conceal);
      host.removeEventListener('pointercancel', conceal);
      gsap.killTweensOf(st);
    };
  }, [useWk]);

  return (
    <div ref={hostRef} className={styles.host} aria-hidden data-idle={!on || undefined}>
      {useGoo && (
        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="chkr"
              width="2"
              height="2"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(58)"
            >
              <rect width="2" height="2" fill="#eeeed2" />
              <rect width="1" height="1" fill="#769656" />
              <rect x="1" y="1" width="1" height="1" fill="#769656" />
            </pattern>
            <filter
              id="chGoo"
              x="-70%"
              y="-70%"
              width="240%"
              height="240%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="46" result="b" />
              <feColorMatrix
                in="b"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 34 -14"
              />
            </filter>
            <mask id="chBlob">
              <g filter="url(#chGoo)">
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
          <rect
            x="0"
            y="0"
            width={VBW}
            height={VBH}
            fill="url(#chkr)"
            mask="url(#chBlob)"
          />
        </svg>
      )}

      {useWk && <div ref={wkRef} className={styles.wk} />}
    </div>
  );
}

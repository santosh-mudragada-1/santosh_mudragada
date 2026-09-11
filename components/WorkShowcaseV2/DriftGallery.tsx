'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap/gsap';
import { useIsomorphicLayoutEffect } from '@/lib/hooks/useIsomorphicLayoutEffect';
import { RawVisual } from '@/components/WorkShowcase/ProjectVisual';
import type { ShowcaseProject } from '@/components/WorkShowcase/showcase.content';
import styles from './WorkShowcaseV2.module.scss';

/* ==========================================================================
 *  v2 — DRIFT. A pinned stage; scrolling DOWN drives a band of oversized
 *  project frames sideways, so you move past framed works like a gallery
 *  wall. The big name layer drifts at a slightly different rate; the paper
 *  temperature shifts warm → cool → deep across the pass. Transform + colour
 *  only, one scrubbed proxy.
 * ========================================================================== */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Props = { projects: ShowcaseProject[] };

export function DriftGallery({ projects }: Props) {
  const count = projects.length;

  const spacerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const nameRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const proxy = useRef({ p: 0 });
  const applyRef = useRef<(p: number) => void>(() => {});
  const [active, setActive] = useState(0);

  const rgb = projects.map((p) => {
    const n = parseInt(p.tone.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
  });
  const toneAt = (f: number) => {
    const x = clamp01(f) * (count - 1);
    const i = Math.min(Math.floor(x), count - 2);
    const t = x - i;
    const a = rgb[i];
    const b = rgb[i + 1];
    return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(
      lerp(a[1], b[1], t),
    )},${Math.round(lerp(a[2], b[2], t))})`;
  };

  const maxX = () => {
    const st = stageRef.current;
    const tr = trackRef.current;
    if (!st || !tr) return 0;
    return Math.max(0, tr.scrollWidth - st.clientWidth);
  };

  const apply = (p: number) => {
    const x = -clamp01(p) * maxX();
    if (trackRef.current) gsap.set(trackRef.current, { x, force3D: true });
    nameRefs.current.forEach(
      (el) => el && gsap.set(el, { x: x * -0.03, force3D: true }),
    );
    if (bgRef.current) bgRef.current.style.backgroundColor = toneAt(p);
    if (railRef.current)
      gsap.set(railRef.current, { scaleX: clamp01(p), transformOrigin: 'left center' });
    if (hintRef.current) gsap.set(hintRef.current, { opacity: 1 - clamp01(p / 0.04) });
    const ai = Math.round(clamp01(p) * (count - 1));
    setActive((a) => (a === ai ? a : ai));
  };
  applyRef.current = apply;

  useGSAP(
    () => {
      const spacer = spacerRef.current;
      if (!spacer) return;

      const setLen = () => spacer.style.setProperty('--drift', `${maxX()}px`);
      setLen();

      const pr = proxy.current;
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      tl.to(pr, { p: 1, duration: 1, onUpdate: () => applyRef.current(pr.p) });

      const st = ScrollTrigger.create({
        trigger: spacer,
        start: 'top top',
        end: () => `+=${maxX()}`,
        scrub: 0.5,
        animation: tl,
        invalidateOnRefresh: true,
      });

      const onRefresh = () => setLen();
      ScrollTrigger.addEventListener('refreshInit', onRefresh);

      applyRef.current(pr.p);
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        cancelAnimationFrame(raf);
        ScrollTrigger.removeEventListener('refreshInit', onRefresh);
        st.kill();
        tl.kill();
        [
          trackRef.current,
          bgRef.current,
          railRef.current,
          hintRef.current,
          ...nameRefs.current,
        ].forEach((el) => el && gsap.set(el, { clearProps: 'all' }));
      };
    },
    { scope: spacerRef, dependencies: [count], revertOnUpdate: true },
  );

  useIsomorphicLayoutEffect(() => {
    applyRef.current(proxy.current.p);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div ref={spacerRef} className={styles.spacer}>
      <div ref={stageRef} className={styles.stage}>
        <div
          ref={bgRef}
          className={styles.bg}
          style={{ backgroundColor: projects[0].tone }}
          aria-hidden
        />

        <div ref={trackRef} className={styles.track}>
          {projects.map((p, i) => (
            <article key={p.slug} className={styles.panel}>
              <span
                ref={(el) => {
                  nameRefs.current[i] = el;
                }}
                className={styles.name}
              >
                {p.title}
              </span>

              <div className={styles.art}>
                <RawVisual project={p} />
                <Link
                  href={p.href}
                  className={styles.artLink}
                  data-cursor="view"
                  tabIndex={-1}
                  aria-hidden
                />
              </div>

              <div className={styles.panelCaption}>
                <span className={styles.capIndex} style={{ color: p.accent }}>
                  {p.index}
                </span>
                <span className={styles.capTitle}>{p.title}</span>
                <span className={styles.capMeta}>
                  {p.discipline} · {p.year}
                </span>
                <Link href={p.href} className={styles.capLink} data-cursor="link">
                  View case study
                  <span aria-hidden> →</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.hud} aria-hidden>
          <span className={styles.hudNow}>{pad(active + 1)}</span>
          <span className={styles.rail}>
            <span ref={railRef} className={styles.railFill} />
          </span>
          <span className={styles.hudTotal}>{pad(count)}</span>
        </div>

        <div ref={hintRef} className={styles.hint} aria-hidden>
          scroll to explore
          <span aria-hidden> →</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap/gsap';
import { ALT, DIMS, PHOTOGRAPHY, src, srcSm } from './story';
import styles from './PhotoRoll.module.scss';

// deterministic scatter for print i — a spot on the "table", in px / deg,
// balanced around centre so the pile reads as hand-laid, not lop-sided
const SPOTS = [
  { x: -14, y: -8, r: -3 },
  { x: 108, y: -44, r: 6 },
  { x: -120, y: 30, r: -7 },
  { x: 128, y: 54, r: 8 },
  { x: -96, y: -58, r: -9 },
  { x: 40, y: 22, r: 3 },
  { x: -140, y: -10, r: -5 },
  { x: 150, y: -6, r: 10 },
  { x: -30, y: 74, r: 2 },
  { x: 88, y: -84, r: -8 },
  { x: -70, y: 62, r: 5 },
];

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * "And started keeping pieces of them." A pinned table onto which the
 * photographs are dealt, one per scroll beat — the newest lands on top with
 * the line about why it got taken, the earlier ones fan out underneath.
 *
 * Runs on every viewport that allows motion — phones and tablets get the
 * identical choreography, only the lateral scatter tightens with the viewport.
 * `prefers-reduced-motion` (any width) is the sole switch to the plain framed
 * column, and it lives in the stylesheet, not a React breakpoint flag, so GSAP
 * never inherits a half-applied transform from a layout about to change.
 *
 * Touch smoothness needs Lenis `syncTouch: true` (see SmoothScrollProvider) so
 * `onUpdate` fires every frame instead of in fling-batched bursts. On coarse
 * pointers each card also gets more scroll distance, and the deal finishes at
 * 90% progress so the last card is fully placed before the pin releases (that
 * was the "jumps back from below" at the end).
 */
export function PhotoRoll() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const printsRef = useRef<Array<HTMLElement | null>>([]);
  const capRef = useRef<HTMLParagraphElement>(null);

  const prints = PHOTOGRAPHY.prints;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      const cap = capRef.current;
      if (!section || !stage) return;

      const mm = gsap.matchMedia();

      // Pinned "dealing pile" on every viewport that allows motion. Reduced
      // motion (any width) falls through to the plain CSS column.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const els = printsRef.current.filter(Boolean) as HTMLElement[];
        if (!els.length) return;
        const N = els.length;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        // a thumb-flick travels much further than a wheel notch, so a coarse
        // pointer needs more scroll per card or the deal races past
        const perCard = coarse ? 0.66 : 0.46;
        // deal all N cards over the first 90% of the pin; the last 10% is pure
        // settle, so the final card is fully placed before the pin releases
        const DEAL_END = 0.9;
        const parkY = () => window.innerHeight * 0.66;
        // 1 on a desktop, ~0.4 on a phone — keeps SPOTS (authored in px for a
        // ~1200px stage) inside a small viewport. Read every apply() so an
        // orientation change / ScrollTrigger refresh re-fits it.
        const spread = () => gsap.utils.clamp(0.4, 1, window.innerWidth / 1180);
        let topIdx = -1;

        const apply = (p: number) => {
          const f = Math.min(1, p / DEAL_END) * N;
          const k = spread();
          for (let i = 0; i < N; i += 1) {
            const el = els[i];
            const local = clamp01(f - i); // park -> placed
            const age = clamp01(f - i - 1); // 0 while it's the top card
            const e = easeOut(local);
            const ea = easeOut(age);
            const s = SPOTS[i % SPOTS.length];
            const settle = 0.28 + 0.72 * ea;
            const x = lerp(0, s.x * settle * k, e);
            const y = lerp(parkY(), s.y * settle * k, e);
            const r = lerp(10, s.r * (0.3 + 0.7 * ea), e);
            const sc = lerp(0.92, lerp(1.05, 0.97, ea), e);
            el.style.transform = `translate(-50%,-50%) translate(${x}px, ${y}px) rotate(${r}deg) scale(${sc})`;
            el.style.opacity = String(clamp01(local * 3));
            el.style.zIndex = String(10 + i);
          }
          const nextTop = Math.min(N - 1, Math.max(0, Math.round(f) - 1));
          if (nextTop !== topIdx && f > 0.05) {
            topIdx = nextTop;
            els.forEach((el, i) => el.toggleAttribute('data-top', i === topIdx));
            if (cap) {
              gsap.fromTo(
                cap,
                { autoAlpha: 0, y: 8 },
                { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', overwrite: true },
              );
              cap.textContent = prints[topIdx].cap;
            }
          }
        };

        apply(0);
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * (N * perCard + 0.25)}`,
          pin: stage,
          scrub: 0.5,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => apply(self.progress),
        });

        return () => {
          els.forEach((el) => {
            el.style.transform = '';
            el.style.opacity = '';
            el.style.zIndex = '';
            el.removeAttribute('data-top');
          });
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Photography">
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.pile}>
          {prints.map((pr, i) => {
            const d = DIMS[pr.slug];
            return (
              <figure
                key={pr.slug}
                ref={(el) => {
                  printsRef.current[i] = el;
                }}
                className={styles.print}
              >
                <div className={styles.printMedia} style={{ aspectRatio: String(d?.ar ?? 1) }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src(pr.slug)}
                    srcSet={`${srcSm(pr.slug)} 900w, ${src(pr.slug)} 1800w`}
                    sizes="(max-width: 900px) 86vw, 340px"
                    width={d?.w}
                    height={d?.h}
                    alt={ALT[pr.slug] ?? ''}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                  />
                </div>
                <figcaption className={styles.printCap}>{pr.cap}</figcaption>
              </figure>
            );
          })}
        </div>

        <p ref={capRef} className={styles.liveCap} aria-hidden />
      </div>
    </section>
  );
}

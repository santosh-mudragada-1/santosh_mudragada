'use client';

import { useRef, type CSSProperties } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useMediaQueryLayout } from '@/lib/hooks/useMediaQueryLayout';
import { AboutWindow } from './AboutWindow';
import { EditorialTypography } from './EditorialTypography';
import { EditorialCopy } from './EditorialCopy';
import { Collage } from './Collage';
import {
  CARDS,
  CARD_DRIFT,
  GAP_FACTOR,
  LAYER_RATE,
  SCROLL_SCREENS,
  SR_PARAGRAPHS,
  STOP_SY,
  STOP_TIME,
  STOPS,
  TIMING,
  type Card,
} from './data';
import styles from './AboutEditorial.module.scss';

/**
 * /about — a scroll-driven editorial collage.
 *
 * A pinned cream window holds a wide canvas of four STOPS. Scrolling pans a
 * camera across it: an oversized red word travels fastest and is clipped by the
 * window edges, a scattered set of printed-photo cards trails behind it at 0.6x
 * with independent per-card drift, and a short paragraph fades in beneath each
 * stop. The camera dips and climbs between stops so it reads like panning over
 * a map. One master timeline, scrubbed to scroll — tune it from data.ts.
 */
export function AboutEditorial() {
  const sectionRef = useRef<HTMLElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const wordLayerRef = useRef<HTMLDivElement>(null);
  const copyLayerRef = useRef<HTMLDivElement>(null);
  const cardLayerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Record<string, HTMLElement | null>>({});

  const reduced = usePrefersReducedMotion();
  const compact = useMediaQueryLayout('(max-width: 768px)');

  const cards: Card[] = compact ? CARDS.filter((c) => c.sm) : CARDS;
  const screens = reduced
    ? 0
    : compact
      ? SCROLL_SCREENS.compact
      : SCROLL_SCREENS.base;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const clip = clipRef.current;
      const wordL = wordLayerRef.current;
      const copyL = copyLayerRef.current;
      const cardL = cardLayerRef.current;
      if (!section || !clip || !wordL || !copyL || !cardL) return;

      const active = cards
        .map((c) => ({ c, el: cardsRef.current[c.id] }))
        .filter((x): x is { c: Card; el: HTMLElement } => Boolean(x.el));

      const CW = () => clip.clientWidth;
      const CH = () => clip.clientHeight;
      const GAP = () => GAP_FACTOR * CW();

      // resting pose per card (transform only — GSAP owns the transform)
      active.forEach(({ c, el }) => {
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          rotation: c.rot,
          scale: c.scale,
        });
      });

      const stopBlocks = copyL.querySelectorAll<HTMLElement>('[data-copy-stop]');
      const wordEls = Array.from(wordL.children) as HTMLElement[];
      const WORD_DIM = 0.14; // opacity of a word that isn't the current stop

      // --- reduced motion: hold the first stop, no scroll rig -----------
      if (reduced) {
        gsap.set([wordL, copyL, cardL], { x: 0, y: 0 });
        wordEls.forEach((w, i) => gsap.set(w, { opacity: i === 0 ? 1 : 0 }));
        stopBlocks.forEach((b, i) =>
          gsap.set(b, { autoAlpha: i === 0 ? 1 : 0, y: 0 }),
        );
        return;
      }

      gsap.set([wordL, copyL, cardL], { x: 0, y: 0 });
      gsap.set(wordEls, { opacity: WORD_DIM });
      gsap.set(wordEls[0], { opacity: 1 });
      gsap.set(stopBlocks, { autoAlpha: 0, y: 12 });
      gsap.set(stopBlocks[0], { autoAlpha: 1, y: 0 });

      const { times, end } = STOP_TIME;
      const { move } = TIMING;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // hold the full length so scrub maths stays stable even if tweens change
      tl.to({}, { duration: end }, 0);

      for (let k = 1; k < STOPS.length; k += 1) {
        const at = times[k] - move;

        // linear pan — a steady "conveyor", so a letterform is always crossing
        // the centre rather than the words dwelling at their endpoints
        tl.to(
          wordL,
          {
            x: () => -k * GAP(),
            y: () => -STOP_SY[k] * CH(),
            duration: move,
            ease: 'none',
          },
          at,
        );
        tl.to(
          copyL,
          {
            x: () => -k * GAP() * LAYER_RATE.copy,
            y: () => -STOP_SY[k] * CH() * LAYER_RATE.copy,
            duration: move,
            ease: 'none',
          },
          at,
        );
        tl.to(
          cardL,
          {
            x: () => -k * GAP() * LAYER_RATE.card,
            // deeper, slightly laggier vertical swing than the word
            y: () => -STOP_SY[k] * CH() * LAYER_RATE.card * 1.35,
            duration: move,
            ease: 'power2.inOut',
          },
          at,
        );

        // word opacity — the incoming word brightens BEFORE the midpoint and
        // the outgoing one only dims AFTER it, so both read full-strength as
        // they cross the window centre (no seam); away from its stop a word
        // sits at WORD_DIM so it never distracts if it clips into view.
        tl.to(
          wordEls[k],
          { opacity: 1, duration: move * 0.42, ease: 'power1.out' },
          at + move * 0.08,
        );
        tl.to(
          wordEls[k - 1],
          { opacity: WORD_DIM, duration: move * 0.42, ease: 'power1.in' },
          at + move * 0.55,
        );

        // supporting text — cross-fade as the stop passes centre
        tl.to(
          stopBlocks[k - 1],
          { autoAlpha: 0, y: -12, duration: move * 0.45, ease: 'power1.in' },
          at + move * 0.05,
        );
        tl.to(
          stopBlocks[k],
          { autoAlpha: 1, y: 0, duration: move * 0.5, ease: 'power1.out' },
          at + move * 0.45,
        );
      }

      // per-card independent drift, composited over the layer parallax so no
      // two cards move alike (runs the whole scroll, always gently alive)
      active.forEach(({ c, el }) => {
        const d = CARD_DRIFT[c.id] ?? { rot: 3, x: 10, y: -10, ease: 'sine.inOut' };
        tl.to(
          el,
          { rotation: c.rot + d.rot, x: d.x, y: d.y, duration: end, ease: d.ease },
          0,
        );
      });

      ScrollTrigger.refresh();

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [reduced, compact] },
  );

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-reduced={reduced || undefined}
      style={{ '--screens': screens } as CSSProperties}
      aria-labelledby="about-editorial-heading"
    >
      <div className={styles.sr}>
        <h1 id="about-editorial-heading">About Santosh Mudragada</h1>
        {SR_PARAGRAPHS.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className={styles.sticky}>
        <div className={styles.stage}>
          <AboutWindow clipRef={clipRef}>
            <EditorialTypography ref={wordLayerRef} stops={STOPS} />
            <EditorialCopy ref={copyLayerRef} stops={STOPS} />
            <Collage
              cards={cards}
              layerRef={cardLayerRef}
              registerCard={(id, el) => {
                cardsRef.current[id] = el;
              }}
            />
          </AboutWindow>
        </div>
      </div>
    </section>
  );
}

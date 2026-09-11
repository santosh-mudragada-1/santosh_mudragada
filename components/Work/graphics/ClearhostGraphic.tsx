'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { productTour } from '@/components/CaseStudy/Clearhost/content';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import type { WorkGraphicProps } from './types';
import styles from './ClearhostGraphic.module.scss';

/**
 * ClearHost card art — the case study's Product Tour, on a loop.
 *
 * The flip card is a real 3D object: a front face and a back face. Every 6s it
 * flips 180° on the X axis, and whichever face is hidden has its `<video>`
 * src swapped to the next module, so the visible sequence is
 * PMS → Channel Manager → Booking Engine → PMS → … forever. Behind it a giant
 * heading is a vertical ticker that advances one module per flip, each row
 * also drifting sideways (CSS marquee) — same treatment as the case study.
 */
const SLIDES = productTour;
const VIDS = SLIDES.map((s) => s.video);
const FLIP = 1.35; // seconds
const HOLD = 6; // seconds between flips
// 4-row marquee stack ([h0,h1,h2,h0]) so the vertical ticker can wrap forward
const MARQUEE_ROWS = [...SLIDES, SLIDES[0]];

export function ClearhostGraphic({ className }: WorkGraphicProps) {
  const reduced = usePrefersReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const frontVidRef = useRef<HTMLVideoElement>(null);
  const backVidRef = useRef<HTMLVideoElement>(null);

  const stepRef = useRef(0);
  const yRef = useRef(0);
  const callRef = useRef<gsap.core.Tween | null>(null);

  const [frontSrc, setFrontSrc] = useState(VIDS[0]);
  const [backSrc, setBackSrc] = useState(VIDS[1]);
  const [frontMod, setFrontMod] = useState(0);
  const [backMod, setBackMod] = useState(1);
  const [visibleFace, setVisibleFace] = useState<0 | 1>(0);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);

  // ---- the flip tick ---------------------------------------------------
  const tick = () => {
    const card = cardRef.current;
    const stack = stackRef.current;
    if (!card) return;

    const next = stepRef.current + 1;
    stepRef.current = next;
    const incomingFront = next % 2 === 0;
    const idx = next % 3;

    // the incoming face is currently hidden — swap its video + chips now,
    // silently, so it has the whole flip to buffer
    if (incomingFront) {
      setFrontSrc(VIDS[idx]);
      setFrontMod(idx);
    } else {
      setBackSrc(VIDS[idx]);
      setBackMod(idx);
    }

    gsap.to(card, { rotateX: -180 * next, duration: FLIP, ease: 'power2.inOut' });
    // hand over play + the dot at the midpoint, while the card is edge-on
    gsap.delayedCall(FLIP * 0.5, () => {
      setVisibleFace(incomingFront ? 0 : 1);
      setActive(idx);
    });

    if (stack) {
      yRef.current -= 100 / MARQUEE_ROWS.length; // one row
      gsap.to(stack, {
        yPercent: yRef.current,
        duration: FLIP,
        ease: 'power2.inOut',
        onComplete: () => {
          // landed on the duplicated first row — snap back to the real one
          if (yRef.current <= -100 + 100 / MARQUEE_ROWS.length + 0.1) {
            yRef.current = 0;
            gsap.set(stack, { yPercent: 0 });
          }
        },
      });
    }

    callRef.current = gsap.delayedCall(HOLD, tick);
  };

  // ---- run the loop only while the card is near the viewport ----------
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: '250px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !inView) return;
    const card = cardRef.current;
    const stack = stackRef.current;
    callRef.current = gsap.delayedCall(HOLD, tick);
    return () => {
      callRef.current?.kill();
      callRef.current = null;
      if (card) gsap.killTweensOf(card);
      if (stack) gsap.killTweensOf(stack);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced]);

  // ---- (re)load a face's video when its src changes ------------------
  useEffect(() => {
    frontVidRef.current?.load();
  }, [frontSrc]);
  useEffect(() => {
    backVidRef.current?.load();
  }, [backSrc]);

  // ---- play the visible face, pause the rest ------------------------
  useEffect(() => {
    const f = frontVidRef.current;
    const b = backVidRef.current;
    if (!f || !b) return;
    const vis = visibleFace === 0 ? f : b;
    const hid = visibleFace === 0 ? b : f;
    hid.pause();
    if (inView && !reduced) {
      vis.preload = 'auto';
      const p = vis.play();
      if (p) p.catch(() => {});
    } else {
      vis.pause();
    }
  }, [visibleFace, inView, reduced, frontSrc, backSrc]);

  const marquee = (
    <div className={styles.marqueeViewport} aria-hidden>
      <div ref={stackRef} className={styles.marqueeStack}>
        {MARQUEE_ROWS.map((s, i) => (
          <div key={`${s.id}-${i}`} className={styles.marqueeRow}>
            <div className={styles.marqueeTrack}>
              {[0, 1].map((dup) => (
                <span key={dup} className={styles.marqueeGroup}>
                  {Array.from({ length: 6 }).map((_, k) => (
                    <span key={k} className={styles.marqueeUnit}>
                      {s.heading}
                      <i className={styles.marqueeSep}>◆</i>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (reduced) {
    return (
      <div ref={rootRef} className={`${styles.root}${className ? ` ${className}` : ''}`}>
        {marquee}
        <div className={styles.perspective}>
          <div className={styles.card}>
            <div className={styles.face}>
              <div className={styles.screen}>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  className={styles.video}
                  src={VIDS[0]}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden
                />
                <span className={styles.faceScrim} aria-hidden />
                <span className={styles.pills}>
                  {SLIDES[0].pills.map((p) => (
                    <span key={p} className={styles.pill}>
                      {p}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`${styles.root}${className ? ` ${className}` : ''}`}>
      {marquee}

      <div className={styles.perspective}>
        <div ref={cardRef} className={styles.card}>
          <div className={styles.face}>
            <div className={styles.screen}>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={frontVidRef}
                className={styles.video}
                src={frontSrc}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden
              />
              <span className={styles.faceScrim} aria-hidden />
              <span className={styles.pills}>
                {SLIDES[frontMod].pills.map((p) => (
                  <span key={p} className={styles.pill}>
                    {p}
                  </span>
                ))}
              </span>
            </div>
          </div>

          <div className={`${styles.face} ${styles.faceBack}`}>
            <div className={styles.screen}>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={backVidRef}
                className={styles.video}
                src={backSrc}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden
              />
              <span className={styles.faceScrim} aria-hidden />
              <span className={styles.pills}>
                {SLIDES[backMod].pills.map((p) => (
                  <span key={p} className={styles.pill}>
                    {p}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dots} aria-hidden>
        {SLIDES.map((s, i) => (
          <span key={s.id} className={`${styles.dot}${i === active ? ` ${styles.dotOn}` : ''}`} />
        ))}
      </div>
    </div>
  );
}

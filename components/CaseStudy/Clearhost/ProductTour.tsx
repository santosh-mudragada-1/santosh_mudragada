'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Reveal, SectionMark } from './shared';
import { productTour, productTourCopy } from './content';
import { cx } from './cx';
import styles from './ProductTour.module.scss';

/* -------------------------------------------------------------------------- */
/*  Product tour — three module walkthrough videos on one flipping card.      */
/*                                                                            */
/*  The card is a real 3D object: video 1 is the front, video 2 the back.     */
/*  Scroll flips it on the X axis (0 -> -180) and video 2 comes into view;    */
/*  scroll more and it flips again (-180 -> -360) — while it is edge-on the    */
/*  front face silently swaps to video 3, which the second flip reveals.      */
/*                                                                            */
/*  Behind it a giant heading is a vertical ticker: each flip pushes the      */
/*  current module name up and brings the next one to centre. Each row also   */
/*  drifts sideways (CSS marquee).                                            */
/*                                                                            */
/*  Pinned via CSS `position: sticky` (not a ScrollTrigger pin) — same        */
/*  approach as ScrollStory, to stay robust beside ProductWorkflow's pin.     */
/* -------------------------------------------------------------------------- */

const SCROLL_LENGTH = 3200;
const [S0, S1, S2] = productTour;

export function ProductTour() {
  const reduced = usePrefersReducedMotion();

  const spacerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const marqueeStackRef = useRef<HTMLDivElement>(null);
  const v0Ref = useRef<HTMLVideoElement>(null);
  const v1Ref = useRef<HTMLVideoElement>(null);
  const v2Ref = useRef<HTMLVideoElement>(null);

  const [active, setActive] = useState(0);
  const [frontV2, setFrontV2] = useState(false);
  const [inView, setInView] = useState(false);
  const activeRef = useRef(0);
  const frontV2Ref = useRef(false);

  useGSAP(
    () => {
      if (reduced || !spacerRef.current || !cardRef.current || !marqueeStackRef.current) return;

      gsap.set(cardRef.current, { rotateX: 0 });
      gsap.set(marqueeStackRef.current, { yPercent: 0 });

      const H = 1;
      const F = 1.6;
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

      tl.to({}, { duration: H });
      tl.addLabel('f1')
        .to(cardRef.current, { rotateX: -180, duration: F, ease: 'power1.inOut' }, 'f1')
        .to(marqueeStackRef.current, { yPercent: -100 / 3, duration: F, ease: 'power1.inOut' }, 'f1');
      tl.to({}, { duration: H });
      tl.addLabel('f2')
        .to(cardRef.current, { rotateX: -360, duration: F, ease: 'power1.inOut' }, 'f2')
        .to(marqueeStackRef.current, { yPercent: -200 / 3, duration: F, ease: 'power1.inOut' }, 'f2');
      tl.to({}, { duration: H });

      const st = ScrollTrigger.create({
        trigger: spacerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          tl.progress(p);

          const idx = p < 0.3 ? 0 : p < 0.7 ? 1 : 2;
          if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActive(idx);
          }
          // swap the front face while the card is edge-on / facing away
          const wantV2 = p > 0.5;
          if (wantV2 !== frontV2Ref.current) {
            frontV2Ref.current = wantV2;
            setFrontV2(wantV2);
          }
        },
      });

      return () => {
        st.kill();
        tl.kill();
      };
    },
    { scope: spacerRef, dependencies: [reduced], revertOnUpdate: true },
  );

  // Only buffer / play when the scene is near the viewport.
  useEffect(() => {
    const el = spacerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: '200px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    [v0Ref, v1Ref, v2Ref].forEach((r) => {
      if (r.current) r.current.preload = 'auto';
    });
  }, [inView]);

  useEffect(() => {
    [v0Ref.current, v1Ref.current, v2Ref.current].forEach((v, i) => {
      if (!v) return;
      if (inView && i === active && !reduced) {
        const p = v.play();
        if (p) p.catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active, inView, reduced]);

  const header = (
    <div className={styles.container}>
      <Reveal>
        <SectionMark n="06" title={productTourCopy.eyebrow} />
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
          {productTourCopy.titleA} <span className={styles.accent}>{productTourCopy.titleB}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className={styles.lede}>{productTourCopy.sub}</p>
      </Reveal>
    </div>
  );

  if (reduced) {
    return (
      <section id="ui-demo" className={styles.section}>
        {header}
        <div className={styles.container}>
          <ul className={styles.staticList}>
            {productTour.map((s) => (
              <li key={s.id} className={styles.staticItem}>
                <p className={styles.staticHeading}>{s.heading}</p>
                <div className={styles.staticScreen}>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    src={s.video}
                    controls
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={s.label}
                    className={styles.video}
                  />
                </div>
                <p className={styles.staticMeta}>
                  <span className={styles.staticLabel}>{s.label}</span>
                  {s.pills.map((p) => (
                    <span key={p} className={styles.pill}>
                      {p}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const front = frontV2 ? S2 : S0;

  return (
    <section id="ui-demo" className={styles.section}>
      {header}

      <div
        ref={spacerRef}
        className={styles.spacer}
        data-theme="dark"
        style={{ '--scroll-length': `${SCROLL_LENGTH}px` } as React.CSSProperties}
      >
        <div className={styles.stage}>
          <div className={styles.marqueeViewport} aria-hidden>
            <div ref={marqueeStackRef} className={styles.marqueeStack}>
              {productTour.map((s) => (
                <div key={s.id} className={styles.marqueeRow}>
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

          <div className={styles.deckLayer}>
            <div ref={cardRef} className={styles.card}>
              {/* front face — video 1, swapped to video 3 while edge-on */}
              <div className={styles.face}>
                <div className={styles.screen}>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    ref={v0Ref}
                    src={S0.video}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-label={`${S0.label} walkthrough`}
                    className={cx(styles.video, frontV2 && styles.videoHidden)}
                  />
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    ref={v2Ref}
                    src={S2.video}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`${S2.label} walkthrough`}
                    className={cx(styles.video, !frontV2 && styles.videoHidden)}
                  />
                  <span className={styles.scrim} aria-hidden />
                  <span className={styles.deviceLabel}>{front.label}</span>
                  <span className={styles.devicePills}>
                    {front.pills.map((p) => (
                      <span key={p} className={styles.pill}>
                        {p}
                      </span>
                    ))}
                  </span>
                </div>
              </div>

              {/* back face — video 2 */}
              <div className={cx(styles.face, styles.faceBack)}>
                <div className={styles.screen}>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    ref={v1Ref}
                    src={S1.video}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-label={`${S1.label} walkthrough`}
                    className={styles.video}
                  />
                  <span className={styles.scrim} aria-hidden />
                  <span className={styles.deviceLabel}>{S1.label}</span>
                  <span className={styles.devicePills}>
                    {S1.pills.map((p) => (
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
            {productTour.map((s, i) => (
              <span key={s.id} className={cx(styles.dot, i === active && styles.dotOn)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

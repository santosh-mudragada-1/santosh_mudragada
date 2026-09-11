'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { ALT, DIMS, src, srcSm, TRAVEL } from './story';
import styles from './TravelReel.module.scss';

const MOTION = '(prefers-reduced-motion: no-preference)';

/**
 * The travel chapter's centrepiece: a horizontal reel of memories.
 *
 * Every viewport that allows motion — phones and tablets included — pins the
 * section and scrubs the track sideways as you scroll; frames are uneven on
 * purpose so it reads as a strip of pictures, not a carousel. Only
 * `prefers-reduced-motion` drops to a plain horizontal swipe strip.
 *
 * Touch smoothness depends on Lenis running with `syncTouch: true` (see
 * SmoothScrollProvider) so the scrub tracks the finger frame by frame. The pin
 * rig is built inside `gsap.matchMedia()` so it reverts cleanly.
 */
export function TravelReel() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            // the track's travel plus a short breath so the last frame's lift
            // resolves. The old +25vh tail was long enough to read as an empty
            // black band under the reel on phones.
            end: () => `+=${distance() + window.innerHeight * 0.08}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        });

        // each frame lifts and brightens as it crosses the viewport centre
        const frames = gsap.utils.toArray<HTMLElement>('[data-frame]', track);
        frames.forEach((f) => {
          gsap.fromTo(
            f,
            { yPercent: 6, filter: 'brightness(0.82)' },
            {
              yPercent: -6,
              filter: 'brightness(1)',
              ease: 'none',
              scrollTrigger: {
                trigger: f,
                containerAnimation: tween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-theme="dark"
      aria-label="Travel — a reel of photographs"
    >
      <div ref={trackRef} className={styles.track}>
        {TRAVEL.reel.map(({ slug, note }, i) => {
          const d = DIMS[slug];
          return (
            <figure
              key={slug}
              data-frame
              className={styles.frame}
              style={{ '--ar': String(d?.ar ?? 1) } as React.CSSProperties}
            >
              <div className={styles.frameMedia} style={{ aspectRatio: String(d?.ar ?? 1) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src(slug)}
                  srcSet={`${srcSm(slug)} 900w, ${src(slug)} 1800w`}
                  sizes="(max-width: 900px) 80vw, 46vw"
                  width={d?.w}
                  height={d?.h}
                  alt={ALT[slug] ?? ''}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              </div>
              <figcaption className={styles.note}>
                <span className={styles.noteIndex}>{String(i + 1).padStart(2, '0')}</span>
                {note}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

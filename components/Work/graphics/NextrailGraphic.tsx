'use client';

import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import type { WorkGraphicProps } from './types';
import styles from './NextrailGraphic.module.scss';

/**
 * Nextrail card art — the Feed2Fly reveal, distilled: the intro feed on the
 * case study's violet gradient, over a faint worldmap.
 *
 * `feed-home.webm` is already an iPhone mockup — the device chrome (bezel,
 * Dynamic Island, buttons) is composited into the 528×1080 footage edge to
 * edge — so it's shown as-is, no <DeviceMockup> wrapper (that would draw a
 * second frame around the first).
 *
 * The phone starts below the card and rides up as the card crosses the
 * viewport, travelling further than the scroll (≈2× the card height over the
 * pass), so it reads as pulling up past the page.
 */
export function NextrailGraphic({ className }: WorkGraphicProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const riserRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      const riser = riserRef.current;
      if (reduced || !root || !riser) return;

      const st = gsap.fromTo(
        riser,
        { yPercent: 66 },
        {
          yPercent: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
      return () => {
        st.scrollTrigger?.kill();
        st.kill();
      };
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  // only buffer + play the feed while the card is near the viewport
  useEffect(() => {
    const v = videoRef.current;
    const root = rootRef.current;
    if (!v || !root) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          v.preload = 'auto';
          const p = v.play();
          if (p) p.catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={`${styles.root}${className ? ` ${className}` : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.map} src="/nextrail_casestudy/worldmap.webp" alt="" aria-hidden />

      <div ref={riserRef} className={styles.riser}>
        <div className={styles.device}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            className={styles.video}
            src="/nextrail_casestudy/video/feed-home.webm"
            poster="/nextrail_casestudy/video/feed-home-poster.webp"
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

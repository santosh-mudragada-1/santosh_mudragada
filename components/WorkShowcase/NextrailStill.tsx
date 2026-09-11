'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './NextrailStill.module.scss';

/**
 * Nextrail visual for the showcase — the SAME assets as <NextrailGraphic>
 * (the `feed-home.webm` device mockup, the worldmap, the violet gradient),
 * but statically composed: the phone sits centred, and all parallax comes
 * from the stage's own `.visualWrap` transform.
 *
 * <NextrailGraphic> itself is left untouched (the classic <SelectedWork>
 * still uses it). It is skipped only here because its internal "phone rides
 * up past the page" ScrollTrigger has no scroll delta inside a pinned stage,
 * so the phone freezes half-off-frame.
 */
export function NextrailStill() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    const root = rootRef.current;
    if (!v || !root || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          v.preload = 'auto';
          void v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div ref={rootRef} className={styles.root}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.map} src="/nextrail_casestudy/worldmap.webp" alt="" aria-hidden />
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
  );
}

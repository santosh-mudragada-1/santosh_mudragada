'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { GALLERY } from '@/lib/content/gallery';
import styles from './Gallery.module.scss';

const ROWS = [0, 1] as const;
// Each row rides in a band shifted left of centre (SHIFT) so both ends always
// overhang the viewport; DRIFT is the signed travel within that band, as a %
// of the row width, scrubbed to scroll.
const SHIFT = -8;
const DRIFT = [6, -6];

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      const tweens = rowRefs.current.map((row, i) => {
        if (!row) return null;
        return gsap.fromTo(
          row,
          { xPercent: SHIFT - DRIFT[i] },
          {
            xPercent: SHIFT + DRIFT[i],
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      });

      return () => {
        tweens.forEach((t) => {
          t?.scrollTrigger?.kill();
          t?.kill();
        });
      };
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Archive">
      <div className={styles.rows}>
        {ROWS.map((r) => (
          <div
            key={r}
            ref={(el) => {
              rowRefs.current[r] = el;
            }}
            className={styles.row}
          >
            {GALLERY.filter((item) => item.row === r).map((item, i) => (
              <figure key={`${r}-${i}`} className={styles.item}>
                {item.type === 'video' ? (
                  <video
                    className={styles.media}
                    poster={item.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                  >
                    <source src={item.src} type="video/mp4" />
                  </video>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className={styles.media}
                    src={item.src}
                    alt=""
                    loading="lazy"
                    draggable={false}
                  />
                )}
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

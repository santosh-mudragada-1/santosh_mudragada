'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { revealUp } from '@/lib/motion/reveal';
import { PRODUCTS } from '@/lib/content/products';
import styles from './Products.module.scss';

/**
 * Deliberately calm counterpoint to Selected Work: a horizontal strip of cards
 * you drag through. GSAP Draggable + inertia on desktop; native horizontal
 * scroll on touch. No scroll-linked animation.
 */
export function Products() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const revealCleanup = revealUp(
        sectionRef.current!.querySelectorAll(`.${styles.head} > *`),
        { stagger: 0.06 },
      );

      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (isTouch || !viewport || !track) return () => revealCleanup();

      let disposed = false;
      let teardown = () => {};

      // Draggable + InertiaPlugin are lazy-loaded so they stay out of the
      // shared bundle — this is the only place they're used.
      Promise.all([
        import('gsap/Draggable'),
        import('gsap/InertiaPlugin'),
      ]).then(([{ Draggable }, { InertiaPlugin }]) => {
        if (disposed) return;
        gsap.registerPlugin(Draggable, InertiaPlugin);

        const getBounds = () => ({
          minX: Math.min(0, viewport.clientWidth - track.scrollWidth),
          maxX: 0,
        });

        const [drag] = Draggable.create(track, {
          type: 'x',
          inertia: !reduced,
          edgeResistance: 0.88,
          dragResistance: 0.05,
          bounds: getBounds(),
          cursor: 'inherit',
          allowNativeTouchScrolling: false,
        });

        const onResize = () => drag.applyBounds(getBounds());
        window.addEventListener('resize', onResize);

        teardown = () => {
          window.removeEventListener('resize', onResize);
          drag.kill();
        };
      });

      return () => {
        disposed = true;
        revealCleanup();
        teardown();
      };
    },
    { scope: sectionRef, dependencies: [isTouch, reduced] },
  );

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Products">
      <div className={styles.head}>
        <span className={styles.eyebrow}>Products</span>
        <p className={styles.lead}>
          Things I build to keep my hands in the material. Drag to explore.
        </p>
      </div>

      <div
        ref={viewportRef}
        className={styles.viewport}
        data-touch={isTouch || undefined}
      >
        <div ref={trackRef} className={styles.track} data-cursor="drag">
          {PRODUCTS.map((p) => (
            <a
              key={p.name}
              href={p.href}
              className={styles.card}
              data-cursor="view"
            >
              <div className={styles.media}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={`${p.name} (placeholder)`} draggable={false} />
                <span className={styles.status} data-status={p.status}>
                  {p.status}
                </span>
                <div className={styles.scrim} aria-hidden />
                <div className={styles.body}>
                  <h3 className={styles.name}>
                    {p.name}
                    <span className={styles.arrow} aria-hidden>
                      ↗
                    </span>
                  </h3>
                  <p className={styles.blurb}>{p.blurb}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

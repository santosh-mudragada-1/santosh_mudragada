'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@/lib/gsap/gsap';
import { revealUp } from '@/lib/motion/reveal';
import { PRODUCTS } from '@/lib/content/products';
import styles from './Products.module.scss';

/**
 * One generously-sized, video-forward feature card per product — this is
 * meant to be a scroll-stopping "I want to try that" moment, not a browsable
 * catalog, so it reads as a feature block rather than the Selected-Work
 * drift gallery it sits near.
 */
export function Products() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cleanup = revealUp(sectionRef.current!.querySelectorAll(`.${styles.head} > *, .${styles.card}`), {
        stagger: 0.07,
      });
      return cleanup;
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="products" className={styles.section} aria-label="Products">
      <div className={styles.head}>
        <span className={styles.eyebrow}>Products</span>
        <h2 className={styles.title}>Things I build to keep my hands in the material.</h2>
      </div>

      <div className={styles.wrap}>
        {PRODUCTS.map((p) => (
          <ProductCard key={p.name} product={p} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product: p }: { product: (typeof PRODUCTS)[number] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Only buffer + play the reel while the card is near the viewport.
  useEffect(() => {
    const v = videoRef.current;
    const card = cardRef.current;
    if (!v || !card) return;
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
    io.observe(card);
    return () => io.disconnect();
  }, []);

  return (
    <Link ref={cardRef} href={p.href} className={styles.card} data-cursor="view">
      <div className={styles.media}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          className={styles.video}
          src={p.video}
          poster={p.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
        />
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
          <span className={styles.cta}>
            Try it
            <span aria-hidden> →</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

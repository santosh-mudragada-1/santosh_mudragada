'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { EASE } from '@/lib/motion/config';
import { HeroReveal } from './HeroReveal';
import styles from './Hero.module.scss';

// --- editable copy --------------------------------------------------------
const EYEBROW = 'Santosh Mudragada · Product Designer + Builder';
// last line gets an orange full stop appended (styles.period)
const HEADLINE = ['I design', 'and build', 'digital things'];
const SUPPORT = [
  'Design, motion & interaction',
  'Shipping products, not just screens',
];
// ----------------------------------------------------------------------

// Framer owns the entrance only. GSAP (inside HeroReveal) owns the per-frame
// reveal. No element is animated by both.
const parent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const lineItem: Variants = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 0.9, ease: EASE.quartInOut } },
};
const fadeItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE.expoOut } },
};
const figureItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: EASE.expoOut, delay: 0.12 },
  },
};

export function Hero() {
  const reduced = usePrefersReducedMotion();
  const [play, setPlay] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Start once the preloader hands off (or immediately if it's already gone).
  useEffect(() => {
    if (!document.documentElement.classList.contains('is-loading')) {
      setPlay(true);
      return;
    }
    const on = () => setPlay(true);
    window.addEventListener('preloader:done', on, { once: true });
    return () => window.removeEventListener('preloader:done', on);
  }, []);

  const initial = reduced ? 'show' : 'hidden';
  const animate = reduced || play ? 'show' : 'hidden';

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      data-nav-boundary
      aria-label="Introduction"
    >
      <div className={styles.grid}>
        <motion.div
          className={styles.copy}
          variants={parent}
          initial={initial}
          animate={animate}
        >
          <motion.p className={styles.eyebrow} variants={fadeItem}>
            {EYEBROW}
          </motion.p>

          <h1 className={styles.headline}>
            <motion.span className={styles.lines} variants={stagger}>
              {HEADLINE.map((text, i) => (
                <span key={i} className={styles.lineMask}>
                  <motion.span className={styles.line} variants={lineItem}>
                    {text}
                    {i === HEADLINE.length - 1 && (
                      <span className={styles.period}>.</span>
                    )}
                  </motion.span>
                </span>
              ))}
            </motion.span>
          </h1>

          <motion.div className={styles.support} variants={stagger}>
            {SUPPORT.map((text, i) => (
              <span key={i} className={styles.supportItem}>
                <motion.span variants={fadeItem} style={{ display: 'block' }}>
                  {text}
                </motion.span>
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.figure}
          variants={figureItem}
          initial={initial}
          animate={animate}
        >
          <span className={styles.halo} aria-hidden />
          <HeroReveal
            cleanSrc="/images/image_without_bg.png"
            pixelSrc="/images/image_with_bg.png"
            alt="Santosh Mudragada"
          />
        </motion.div>
      </div>

      <div className={styles.cue} aria-hidden>
        <span className={styles.cueLine} />
        Scroll
      </div>
    </section>
  );
}

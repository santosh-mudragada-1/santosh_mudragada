'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { useSmoothScroll } from '@/lib/smooth-scroll';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { GREETINGS } from './greetings';
import styles from './Preloader.module.scss';

type Phase = 'greet' | 'wipe' | 'done';

type PreloaderProps = {
  /** next/font family names, index-aligned with GREETINGS. */
  fontFamilies: string[];
};

// Animation values are 1:1 with references/dennis (components/Preloader):
//   words        first 1000ms, then 150ms each, stops on the last
//   word opacity 0 -> 0.75 over 1s, delay 0.2 (once — plain text swap after)
//   slide up     top/y 0 -> -100vh, 0.8s, cubic-bezier(0.76,0,0.24,1), delay 0.2
//   curve morph  bottom edge (h+300 bulge) -> flat, 0.7s, same ease, delay 0.3
const EASE = [0.76, 0, 0.24, 1] as const;
const WORD_FIRST_MS = 1000;
const WORD_STEP_MS = 150;
const HOLD_MS = 220; // brief beat on the last word before the reveal
const SLIDE = { duration: 0.8, ease: EASE, delay: 0.2 };
const CURVE = { duration: 0.7, ease: EASE, delay: 0.3 };
const WORD_IN = { duration: 1, delay: 0.2 };
const FONT_TIMEOUT_MS = 900;
const FAILSAFE_MS = 5500;

export function Preloader({ fontFamilies }: PreloaderProps) {
  const prefersReduced = usePrefersReducedMotion();
  const { stop, start } = useSmoothScroll();

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('greet');
  const [index, setIndex] = useState(0);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const finishedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const measure = () =>
      setDims({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (phase === 'done') return;
    const html = document.documentElement;
    html.classList.add('is-loading');
    stop();
    return () => {
      html.classList.remove('is-loading');
      start();
    };
  }, [phase, stop, start]);

  useEffect(() => {
    if (!mounted || phase !== 'greet') return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number, fn: () => void) => {
      timers.push(setTimeout(fn, ms));
    };
    const toWipe = () => {
      if (!cancelled) setPhase('wipe');
    };

    const run = async () => {
      try {
        const fontLoads =
          typeof document !== 'undefined' && 'fonts' in document
            ? Promise.all(
                fontFamilies.map((family) =>
                  (document as Document & { fonts: FontFaceSet }).fonts
                    .load(`500 32px ${family}`)
                    .catch(() => undefined),
                ),
              )
            : Promise.resolve();
        await Promise.race([
          fontLoads,
          new Promise((resolve) => wait(FONT_TIMEOUT_MS, () => resolve(null))),
        ]);
      } catch {
        /* fall through */
      }
      if (cancelled) return;

      const order = prefersReduced
        ? [0, GREETINGS.length - 1]
        : GREETINGS.map((_, i) => i);

      let step = 0;
      const advance = () => {
        if (cancelled) return;
        step += 1;
        if (step < order.length) {
          setIndex(order[step]);
          wait(prefersReduced ? 420 : WORD_STEP_MS, advance);
        } else {
          wait(prefersReduced ? 240 : HOLD_MS, toWipe);
        }
      };

      setIndex(order[0]);
      wait(prefersReduced ? 420 : WORD_FIRST_MS, advance);
    };

    void run();

    const onSkip = () => toWipe();
    window.addEventListener('pointerdown', onSkip, { once: true });
    window.addEventListener('keydown', onSkip, { once: true });
    wait(FAILSAFE_MS, toWipe);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      window.removeEventListener('pointerdown', onSkip);
      window.removeEventListener('keydown', onSkip);
    };
  }, [mounted, phase, prefersReduced, fontFamilies]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase('done');
    window.scrollTo(0, 0);
    window.dispatchEvent(new CustomEvent('preloader:done'));
  };

  if (phase === 'done') return null;

  if (!mounted) {
    return (
      <div className={`js-preloader ${styles.root}`} aria-hidden>
        <span />
      </div>
    );
  }

  const current = GREETINGS[index];
  const family = fontFamilies[index];
  const wordStyle = {
    fontFamily: family,
    '--size-scale': current.sizeScale,
  } as CSSProperties;

  if (prefersReduced) {
    return (
      <motion.div
        className={`js-preloader ${styles.root} ${styles.rootReduced}`}
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'wipe' ? 0 : 1 }}
        transition={{ duration: 0.4, ease: 'linear' }}
        onAnimationComplete={() => {
          if (phase === 'wipe') finish();
        }}
      >
        <span className={styles.word} lang={current.lang} style={wordStyle}>
          {current.text}
        </span>
      </motion.div>
    );
  }

  const { w, h } = dims;
  // belly depth follows the viewport — the ~16" look, scaled down on small screens
  const belly = Math.min(300, Math.max(140, h * 0.27));
  const bulged = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h + belly} 0 ${h} L0 0`;
  const flat = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h} 0 ${h} L0 0`;

  return (
    <motion.div
      className={`js-preloader ${styles.root}`}
      aria-hidden
      initial={{ y: 0 }}
      animate={{ y: phase === 'wipe' ? '-100vh' : 0 }}
      transition={SLIDE}
      onAnimationComplete={() => {
        if (phase === 'wipe') finish();
      }}
    >
      <motion.p
        className={styles.word}
        lang={current.lang}
        style={wordStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={WORD_IN}
      >
        <span className={styles.dot} aria-hidden />
        {current.text}
      </motion.p>

      {w > 0 && (
        <svg className={styles.curve} preserveAspectRatio="none" aria-hidden>
          <motion.path
            initial={{ d: bulged }}
            animate={{ d: phase === 'wipe' ? flat : bulged }}
            transition={CURVE}
          />
        </svg>
      )}
    </motion.div>
  );
}

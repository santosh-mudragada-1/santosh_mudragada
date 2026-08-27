'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSmoothScroll } from '@/lib/smooth-scroll';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { EASE } from '@/lib/motion/config';
import { GREETINGS } from './greetings';
import { curtainPath, curtainTravel, OVERSCAN } from './curve';
import styles from './Preloader.module.scss';

type Phase = 'greet' | 'wipe' | 'done';

type PreloaderProps = {
  /** next/font family names, index-aligned with GREETINGS. */
  fontFamilies: string[];
};

// Timing — the greeting run is the load screen. Keep it short and confident.
const FIRST_MS = 560; // first word lingers a beat longer
const STEP_MS = 420; // each subsequent word
const HOLD_MS = 520; // hold on the final word before the wipe
const WIPE_S = 1.15; // orange curved wipe
const FONT_TIMEOUT_MS = 1400; // don't wait on fonts forever
const FAILSAFE_MS = 6500; // hard stop if anything stalls

export function Preloader({ fontFamilies }: PreloaderProps) {
  const prefersReduced = usePrefersReducedMotion();
  const { stop, start } = useSmoothScroll();

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('greet');
  const [index, setIndex] = useState(0);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const finishedRef = useRef(false);

  // ---- mount + viewport size ---------------------------------------------
  useEffect(() => {
    setMounted(true);
    const measure = () =>
      setDims({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // ---- lock the document while the preloader owns the screen ------------
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

  // ---- greeting sequence ----------------------------------------------
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
      // Force-load every script's face before we render its glyphs, so a word
      // never flashes in a fallback and then reflows. Capped so a slow/blocked
      // font network can't hold the screen.
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
        /* fall through to the sequence regardless */
      }
      if (cancelled) return;

      const order = prefersReduced
        ? [0, GREETINGS.length - 1]
        : GREETINGS.map((_, i) => i);
      const stepMs = prefersReduced ? 460 : STEP_MS;

      let step = 0;
      const advance = () => {
        if (cancelled) return;
        step += 1;
        if (step < order.length) {
          setIndex(order[step]);
          wait(stepMs, advance);
        } else {
          wait(prefersReduced ? 260 : HOLD_MS, toWipe);
        }
      };

      setIndex(order[0]);
      wait(prefersReduced ? 460 : FIRST_MS, advance);
    };

    void run();

    // Skip ahead on the first deliberate interaction.
    const onSkip = () => toWipe();
    window.addEventListener('pointerdown', onSkip, { once: true });
    window.addEventListener('keydown', onSkip, { once: true });

    // Absolute backstop.
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

  // Pre-hydration / pre-mount: a plain dark cover matching the server markup
  // exactly (no words, no SVG) — no hydration mismatch, no unstyled flash.
  if (!mounted) {
    return (
      <div className={`js-preloader ${styles.root}`} aria-hidden>
        <div className={styles.panel} />
      </div>
    );
  }

  const current = GREETINGS[index];
  const family = fontFamilies[index];
  const wordStyle = {
    fontFamily: family,
    '--size-scale': current.sizeScale,
  } as CSSProperties;

  // Reduced motion: opacity only. No movement, no curved wipe.
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
  const travel = curtainTravel(h);

  return (
    <div className={`js-preloader ${styles.root}`} aria-hidden>
      <motion.div
        className={styles.panel}
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'wipe' ? 0 : 1 }}
        transition={{
          duration: 0.34,
          ease: 'linear',
          delay: phase === 'wipe' ? WIPE_S * 0.32 : 0,
        }}
      >
        <div className={styles.mask}>
          <AnimatePresence initial={false}>
            <motion.span
              key={index}
              className={styles.word}
              lang={current.lang}
              style={wordStyle}
              initial={{ y: '108%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-108%', opacity: 0 }}
              transition={{ duration: 0.52, ease: EASE.quartInOut }}
            >
              <span className={styles.dot} aria-hidden />
              {current.text}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {w > 0 && (
        <motion.svg
          className={styles.curtain}
          viewBox={`0 0 ${w} ${h + OVERSCAN}`}
          preserveAspectRatio="none"
          initial={{ y: travel.below }}
          animate={{ y: phase === 'wipe' ? travel.gone : travel.below }}
          transition={{ duration: WIPE_S, ease: EASE.quartInOut }}
          onAnimationComplete={() => {
            if (phase === 'wipe') finish();
          }}
        >
          <path d={curtainPath(w, h)} fill="var(--accent)" />
        </motion.svg>
      )}
    </div>
  );
}

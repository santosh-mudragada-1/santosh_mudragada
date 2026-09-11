'use client';

import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion/config';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { fragmentation } from './content';
import { cx } from './cx';
import styles from './FragmentsToOne.module.scss';

const { problems, leak } = fragmentation;

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ConvergeLine {
  key: string;
  d: string;
}

/**
 * Converging "five systems → one" lines, drawn from each problem card's real
 * bottom-center down to a shared point — measured off the DOM (like
 * ProductWorkflow's connectors) instead of a fixed 5-across SVG, so the fan
 * stays correctly aligned under the cards whatever the grid's current column
 * count is (1/2/3/5, depending on breakpoint) rather than only matching the
 * one breakpoint where there happen to be exactly 5 cards in a row.
 */
function useConvergeLines(wrapRef: React.RefObject<HTMLDivElement>) {
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [lines, setLines] = useState<ConvergeLine[]>([]);

  const register = (i: number) => (el: HTMLLIElement | null) => {
    cardRefs.current[i] = el;
  };

  useIsoLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const wr = wrap.getBoundingClientRect();
      if (wr.width === 0) return;

      const target = { x: wr.width / 2, y: wr.height - 6 };
      const next: ConvergeLine[] = [];
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x0 = r.left - wr.left + r.width / 2;
        const y0 = r.bottom - wr.top;
        const k = Math.max(20, (target.y - y0) * 0.55);
        next.push({
          key: `line-${i}`,
          d: `M ${x0} ${y0} C ${x0} ${y0 + k} ${target.x} ${target.y - k} ${target.x} ${target.y}`,
        });
      });

      setBox({ w: wr.width, h: wr.height });
      setLines(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { register, box, lines };
}

/** Shared scroll-in settle, gated for reduced motion. */
const settle = (reduced: boolean, i: number, tilt = 0) => ({
  initial: { opacity: 0, y: 22, rotate: tilt * 2 },
  whileInView: { opacity: 1, y: 0, rotate: tilt },
  viewport: { once: true, amount: 0.3 } as const,
  transition: reduced ? { duration: 0 } : { duration: 0.6, delay: i * 0.07, ease: EASE.expoOut },
});

function ProblemsGrid({
  reduced,
  register,
}: {
  reduced: boolean;
  register: (i: number) => (el: HTMLLIElement | null) => void;
}) {
  const tilts = [-1.5, 1.2, -1.2, 1.5];
  return (
    <ul className={styles.problems}>
      {problems.map((p, i) => (
        <li key={p.n} ref={register(i)} className={styles.problemCell}>
          <motion.div
            {...settle(reduced, i, tilts[i % tilts.length])}
            whileHover={reduced ? undefined : { rotate: 0, y: -4 }}
            className={styles.problemCard}
          >
            <span className={styles.problemN}>{p.n}</span>
            <span className={styles.problemTitle}>{p.title}</span>
            <span className={styles.problemNote}>{p.note}</span>
          </motion.div>
        </li>
      ))}
      <li ref={register(problems.length)} className={cx(styles.problemCell, styles.leakCell)}>
        <motion.div
          {...settle(reduced, 4, -1)}
          whileHover={reduced ? undefined : { rotate: 0, y: -4 }}
          className={cx(styles.problemCard, styles.leakCard)}
        >
          <span className={styles.problemN}>{leak.n}</span>
          <span className={styles.leakValue}>{leak.value}</span>
          <span className={styles.leakLabel}>{leak.short}</span>
        </motion.div>
      </li>
    </ul>
  );
}

/**
 * Hero anchor: hotel ops aren't broken, they're fragmented — resolving into
 * ClearHost as the one system.
 */
export function FragmentsToOne() {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { register, box, lines } = useConvergeLines(wrapRef);

  return (
    <div>
      <div className={styles.claim}>
        <p className={styles.eyebrow}>The problem</p>
        <h2 className={styles.title}>
          {fragmentation.titleA} <span className={styles.accent}>{fragmentation.titleB}</span>
        </h2>
        <p className={styles.sub}>{fragmentation.sub}</p>
      </div>

      <div ref={wrapRef} className={styles.grid}>
        <ProblemsGrid reduced={reduced} register={register} />

        {box.w > 0 && (
          <svg
            viewBox={`0 0 ${box.w} ${box.h}`}
            aria-hidden
            className={styles.converge}
            fill="none"
          >
            {lines.map((l, i) => (
              <motion.path
                key={l.key}
                d={l.d}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="4 5"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.6 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={
                  reduced ? { duration: 0 } : { duration: 0.7, delay: i * 0.08, ease: EASE.expoOut }
                }
              />
            ))}
            <circle cx={box.w / 2} cy={box.h - 6} r={4} className={styles.convergeDot} />
          </svg>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.25, ease: EASE.expoOut }}
        className={styles.solution}
      >
        <div className={styles.solutionMedia}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            className={styles.solutionVideo}
            src="/clearhost/Organization Dashboard.webm"
            autoPlay={!reduced}
            loop={!reduced}
            muted
            playsInline
            controls={reduced}
            preload="metadata"
            aria-label={fragmentation.solution.media.title}
          />
        </div>
      </motion.div>
    </div>
  );
}

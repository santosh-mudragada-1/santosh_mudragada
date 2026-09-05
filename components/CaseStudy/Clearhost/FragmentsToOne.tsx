'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/lib/motion/config';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { clearhost, fragmentation } from './content';
import { Camera } from './icons';
import { cx } from './cx';
import styles from './FragmentsToOne.module.scss';

const { problems, leak } = fragmentation;

/**
 * Converging "five systems → one" lines. Decorative. Dashed strokes fade in
 * (a pathLength draw rewrites stroke-dasharray, so opacity it is).
 */
function ConvergeLines({ reduced }: { reduced: boolean }) {
  const paths = [
    'M 30 0 C 30 70, 200 40, 200 108',
    'M 115 0 C 115 60, 200 44, 200 108',
    'M 200 0 L 200 108',
    'M 285 0 C 285 60, 200 44, 200 108',
    'M 370 0 C 370 70, 200 40, 200 108',
  ];
  return (
    <svg viewBox="0 0 400 118" aria-hidden className={styles.converge} fill="none">
      {paths.map((d, i) => (
        <motion.path
          key={d}
          d={d}
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
      <circle cx={200} cy={112} r={4} className={styles.convergeDot} />
    </svg>
  );
}

/** Shared scroll-in settle, gated for reduced motion. */
const settle = (reduced: boolean, i: number, tilt = 0) => ({
  initial: { opacity: 0, y: 22, rotate: tilt * 2 },
  whileInView: { opacity: 1, y: 0, rotate: tilt },
  viewport: { once: true, amount: 0.3 } as const,
  transition: reduced ? { duration: 0 } : { duration: 0.6, delay: i * 0.07, ease: EASE.expoOut },
});

function ProblemsGrid({ reduced }: { reduced: boolean }) {
  const tilts = [-1.5, 1.2, -1.2, 1.5];
  return (
    <ul className={styles.problems}>
      {problems.map((p, i) => (
        <li key={p.n} className={styles.problemCell}>
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
      <li className={cx(styles.problemCell, styles.leakCell)}>
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

  return (
    <div>
      <div className={styles.claim}>
        <p className={styles.eyebrow}>The problem</p>
        <h2 className={styles.title}>
          {fragmentation.titleA} <span className={styles.marker}>{fragmentation.titleB}</span>
        </h2>
        <p className={styles.sub}>{fragmentation.sub}</p>
      </div>

      <div className={styles.grid}>
        <ProblemsGrid reduced={reduced} />
      </div>

      <div className={styles.convergeWrap}>
        <ConvergeLines reduced={reduced} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.25, ease: EASE.expoOut }}
        className={styles.solution}
      >
        <div className={styles.solutionBar}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={clearhost.logo}
            alt=""
            width={36}
            height={36}
            className={styles.solutionLogo}
            draggable={false}
          />
          <p className={styles.solutionWordmark}>clearhost</p>
        </div>
        <div className={styles.solutionMeta}>
          <p className={styles.solutionLine}>{fragmentation.solution.line}</p>
          <ul className={styles.solutionPills}>
            {fragmentation.solution.pills.map((pill) => (
              <li key={pill}>{pill}</li>
            ))}
          </ul>
        </div>
        <div className={styles.solutionMedia}>
          <div className={styles.solutionMediaInner}>
            <Camera size={22} />
            <span className={styles.solutionMediaTitle}>
              {fragmentation.solution.media.title}
            </span>
            <span className={styles.solutionMediaNote}>
              {fragmentation.solution.media.note}
            </span>
          </div>
          <span className={styles.solutionMediaTag}>placeholder</span>
        </div>
      </motion.div>
    </div>
  );
}

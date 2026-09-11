'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './QuantResearch.module.scss';

type Stat = { value: number; suffix: string; label: string };

const STATS: Stat[] = [
  { value: 81, suffix: '%', label: 'are looking for a travel plan personalised to them' },
  { value: 77, suffix: '%', label: 'want help finding hidden gems, not the usual list' },
  { value: 62, suffix: '%', label: 'want suggestions drawn from videos they saved or liked' },
  { value: 91, suffix: '%', label: 'compare hotel prices and amenities before they book' },
  { value: 56, suffix: '%', label: 'like to keep a running track of their travel budget' },
];

/** Counts from 0 to `target` once `run` flips true; snaps for reduced motion. */
function useCountUp(target: number, run: boolean, reduced: boolean) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (reduced) {
      setN(target);
      return;
    }

    let raf = 0;
    const dur = 1500;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, reduced]);

  return n;
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const reduced = usePrefersReducedMotion();
  const n = useCountUp(stat.value, run, reduced);

  return (
    <div className={styles.stat}>
      <p className={styles.num}>
        {n}
        <span className={styles.suffix}>{stat.suffix}</span>
      </p>
      <p className={styles.label}>{stat.label}</p>
    </div>
  );
}

/**
 * Survey numbers on the portfolio's paper theme — big orange numerals that
 * count up the first time the block scrolls into view.
 */
export function QuantResearch() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setRun(true);
        io.disconnect();
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.grid}>
      {STATS.map((s) => (
        <StatItem key={s.label} stat={s} run={run} />
      ))}
    </div>
  );
}

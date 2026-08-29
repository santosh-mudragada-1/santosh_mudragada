'use client';

import { useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useIsomorphicLayoutEffect } from '@/lib/hooks/useIsomorphicLayoutEffect';
import styles from './Wordmark.module.scss';

/**
 * "Design with Santosh" at rest. On hover the single physical line
 * "Design with Santosh Mudragada" slides left inside a clipped viewport so
 * "Santosh Mudragada" is revealed. The viewport width is fixed by a hidden
 * sizer ("Design with Santosh"), so the nav never reflows.
 */
export function Wordmark() {
  const prefixRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const el = prefixRef.current;
    if (!el) return;

    const measure = () => setShift(el.getBoundingClientRect().width);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => ro.disconnect();
  }, []);

  return (
    <Link
      href="/"
      className={styles.wordmark}
      data-cursor-sticky
      data-cursor-reveal
      data-cursor-reveal-text="Santosh Mudragada"
      aria-label="Santosh Mudragada — home"
      style={{ '--shift': `${shift}px` } as CSSProperties}
    >
      <span className={styles.viewport}>
        <span className={styles.sizer} aria-hidden>
          Design with Santosh
        </span>
        <span className={styles.track} aria-hidden>
          <span ref={prefixRef} className={styles.prefix}>
            Design with&nbsp;
          </span>
          Santosh Mudragada
        </span>
      </span>
    </Link>
  );
}

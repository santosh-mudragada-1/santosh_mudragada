'use client';

import { type ReactNode, type RefObject } from 'react';
import styles from './AboutEditorial.module.scss';

type Props = {
  children: ReactNode;
  /** the clipping container — measured by GSAP for the parallax geometry */
  clipRef: RefObject<HTMLDivElement>;
};

/**
 * The centred cream "website window" — a designed mockup, not a real browser.
 * It never moves. Chrome (HOME / nav / scroll hint) floats above the clipped
 * canvas and stays put while everything inside pans.
 */
export function AboutWindow({ children, clipRef }: Props) {
  return (
    <div className={styles.window}>
      <div ref={clipRef} className={styles.clip}>
        {children}
      </div>

      <div className={styles.chrome} aria-hidden>
        <span className={styles.brand}>Home</span>
        <nav className={styles.chromeNav}>
          <span>About</span>
          <span>Project</span>
          <span>Contact</span>
        </nav>
        <span className={styles.scrollHint}>
          <i />
          Scroll to continue
        </span>
      </div>
    </div>
  );
}

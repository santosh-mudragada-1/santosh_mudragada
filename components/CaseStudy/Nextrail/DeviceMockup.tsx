import type { ReactNode } from 'react';
import styles from './DeviceMockup.module.scss';

/**
 * A phone frame ported from devices.css's "iPhone 14 Pro" skin — real
 * device-mockup chrome (bezel, Dynamic Island, side buttons), not a
 * hand-guessed CSS box. Scales responsively to whatever width its parent
 * gives it; fill the `.screen` slot with `children`.
 */
export function DeviceMockup({ children }: { children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <div className={styles.body}>
        <div className={styles.screen}>{children}</div>
        <span className={styles.island} aria-hidden="true" />
        <span className={styles.islandHousing} aria-hidden="true" />
        <span className={styles.islandCamera} aria-hidden="true" />
        <span className={styles.btns} aria-hidden="true" />
        <span className={styles.power} aria-hidden="true" />
      </div>
    </div>
  );
}

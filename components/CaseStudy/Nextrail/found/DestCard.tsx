'use client';

import type { DestCard as DestCardData } from './cards';
import styles from './FoundReveal.module.scss';

/**
 * One destination card — the single unit all three what-we-found scenes
 * animate. `data-card` is the hook the scroll scenes query by; it's static so
 * no ref plumbing is needed.
 */
export function DestCard({ card }: { card: DestCardData }) {
  return (
    <div data-card className={styles.card}>
      <div className={styles.cardPhoto}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.src} alt="" loading="lazy" decoding="async" draggable={false} />
      </div>
      <div className={styles.cardLabel}>
        <span className={styles.cardCity}>{card.city}</span>
        <span className={styles.cardCountry}>{card.country}</span>
      </div>
    </div>
  );
}

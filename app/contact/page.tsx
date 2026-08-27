import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../scaffold.module.scss';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <p className={styles.label}>Route scaffold</p>
      <h1 className={styles.heading}>
        Let&rsquo;s make <em>something</em>
      </h1>
      <p className={styles.copy}>
        Placeholder route. The full contact payoff is built in Stage 3.
      </p>
      <Link href="/" className={styles.back}>
        ← Home
      </Link>
    </main>
  );
}

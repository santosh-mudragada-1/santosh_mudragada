import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../scaffold.module.scss';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <p className={styles.label}>Route scaffold</p>
      <h1 className={styles.heading}>
        About <em>Santosh</em>
      </h1>
      <p className={styles.copy}>
        Placeholder route. The paint-reveal about interaction is built in
        Stage 3.
      </p>
      <Link href="/" className={styles.back}>
        ← Home
      </Link>
    </main>
  );
}

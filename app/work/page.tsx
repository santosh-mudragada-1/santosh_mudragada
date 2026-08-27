import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../scaffold.module.scss';

export const metadata: Metadata = { title: 'Work' };

export default function WorkPage() {
  return (
    <main className={styles.page}>
      <p className={styles.label}>Route scaffold</p>
      <h1 className={styles.heading}>
        Selected <em>Work</em>
      </h1>
      <p className={styles.copy}>
        Placeholder route. The asymmetric project canvas, image distortion and
        scroll-drawn SVG path land in Stage 2 and Stage 3.
      </p>
      <Link href="/" className={styles.back}>
        ← Home
      </Link>
    </main>
  );
}

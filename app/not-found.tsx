import Link from 'next/link';
import styles from './scaffold.module.scss';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <p className={styles.label}>404</p>
      <h1 className={styles.heading}>
        Nothing <em>here</em>
      </h1>
      <p className={styles.copy}>That page doesn&rsquo;t exist.</p>
      <Link href="/" className={styles.back}>
        ← Home
      </Link>
    </main>
  );
}

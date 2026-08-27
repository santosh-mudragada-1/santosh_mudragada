import Link from 'next/link';
import { SITE } from '@/lib/constants/site';
import styles from './page.module.scss';

// Stage 1 scaffold only. The real Hero / sections arrive in Stage 3 — this page
// exists to exercise smooth scroll, the Lenis <-> ScrollTrigger bridge and the
// preloader hand-off.
export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <p className={styles.kicker}>{SITE.role}</p>
        <h1 className={styles.title}>
          {SITE.name}
          <span className={styles.accent}>.</span>
        </h1>
        <p className={styles.note}>
          Foundation build — Stage 1. Smooth scroll, motion architecture,
          typography system and the greeting preloader are wired. Scroll to
          check that the progress bar tracks Lenis with no lag.
        </p>
        <nav className={styles.routes} aria-label="Route scaffold">
          <Link href="/work">Work</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </section>

      <section className={styles.probe}>
        <span>01 — Lenis driving the scroll</span>
      </section>
      <section className={styles.probe}>
        <span>02 — ScrollTrigger scrubbing in sync</span>
      </section>
      <section className={styles.probe}>
        <span>03 — Foundation ready for Stage 2</span>
      </section>
    </main>
  );
}

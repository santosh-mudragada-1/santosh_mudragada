'use client';

import { useRef } from 'react';
import { useGSAP } from '@/lib/gsap/gsap';
import { revealUp } from '@/lib/motion/reveal';
import { EXPERIENCE } from '@/lib/content/experience';
import styles from './Experience.module.scss';

export function Experience() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cleanups = [
        revealUp(rootRef.current!.querySelectorAll(`.${styles.head} > *`), {
          stagger: 0.06,
        }),
        revealUp(rootRef.current!.querySelectorAll(`.${styles.row}`), {
          y: 36,
          stagger: 0.1,
          start: 'top 85%',
        }),
      ];
      return () => cleanups.forEach((c) => c());
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className={styles.section} aria-label="Experience">
      <div className={styles.head}>
        <span className={styles.eyebrow}>Experience</span>
        <p className={styles.lead}>
          A few places I&rsquo;ve owned product design end to end.
        </p>
      </div>

      <ol className={styles.list}>
        {EXPERIENCE.map((role, i) => (
          <li key={role.company} className={styles.row}>
            <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>

            <div className={styles.identity}>
              <h3 className={styles.company}>{role.company}</h3>
              <p className={styles.role}>{role.role}</p>
            </div>

            <div className={styles.when}>
              <span>{role.period}</span>
              <span>{role.location}</span>
            </div>

            <ul className={styles.owned}>
              {role.owned.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

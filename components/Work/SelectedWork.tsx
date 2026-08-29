'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { revealUp } from '@/lib/motion/reveal';
import { WORK } from '@/lib/content/work';
import { WorkPath } from './WorkPath';
import { WorkCard } from './WorkCard';
import { WorkGLLayer } from './WorkGLLayer';
import styles from './SelectedWork.module.scss';

const DEPTH: Record<'a' | 'b' | 'c', number> = { a: 0.45, b: 0.55, c: 0.5 };

/**
 * Three projects placed like objects in a large field (not a grid), a
 * scroll-drawn SVG path threading the composition, whole-card scroll-pull
 * deformation, hover + custom-cursor states.
 */
export function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  // headings sweep + the shared WebGL layer only on the wide desktop composition
  const wide = useMediaQuery('(min-width: 1024px)');

  const [mounted, setMounted] = useState(false);
  const [glFailed, setGlFailed] = useState(false);
  useEffect(() => setMounted(true), []);
  const onGlFail = useCallback(() => setGlFailed(true), []);
  const useGL = mounted && wide && !isTouch && !reduced && !glFailed;

  // one-shot heading entrance — never re-run by the media query below
  useGSAP(
    () => {
      const root = sectionRef.current!;
      return revealUp(root.querySelectorAll(`.${styles.head} > *`), {
        stagger: 0.06,
      });
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  // heading sideways sweep — only on the wide desktop composition
  useGSAP(
    () => {
      if (reduced || !wide) return;
      const root = sectionRef.current!;
      const kicker = root.querySelector<HTMLElement>(`.${styles.kicker}`);
      const title = root.querySelector<HTMLElement>(`.${styles.title}`);
      const st = {
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      } as const;
      const tweens: gsap.core.Tween[] = [];
      if (kicker) {
        tweens.push(
          gsap.fromTo(
            kicker,
            { x: '8vw' },
            { x: '-28vw', ease: 'none', scrollTrigger: st },
          ),
        );
      }
      if (title) {
        tweens.push(
          gsap.fromTo(
            title,
            { x: '-18vw' },
            { x: '12vw', ease: 'none', scrollTrigger: st },
          ),
        );
      }
      return () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
        if (kicker) gsap.set(kicker, { clearProps: 'transform' });
        if (title) gsap.set(title, { clearProps: 'transform' });
      };
    },
    { scope: sectionRef, dependencies: [reduced, wide] },
  );

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Selected work"
    >
      <div className={styles.head}>
        <span className={styles.kicker}>
          <span className={styles.kickerArrow} aria-hidden>
            ↓
          </span>{' '}
          2023 - 26
        </span>
        <h2 className={styles.title}>Featured work</h2>
      </div>

      <WorkPath scope={sectionRef} />

      <div ref={canvasRef} className={styles.canvas}>
        {WORK.map((project) => (
          <div key={project.slug} className={styles.slot} data-slot={project.slot}>
            <WorkCard
              index={project.index}
              title={project.title}
              discipline={project.discipline}
              year={project.year}
              ratio={project.ratio}
              src={project.src}
              href={`/work`}
              depth={DEPTH[project.slot]}
            />
          </div>
        ))}
        {useGL && <WorkGLLayer boxRef={canvasRef} onFail={onGlFail} />}
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import type { ShowcaseProject } from './showcase.content';
import { ProjectVisual } from './ProjectVisual';
import styles from './ShowcaseFlow.module.scss';

/* -------------------------------------------------------------------------- */
/*  Scroll showcase — mobile + reduced-motion, and the SSR / no-JS baseline.  */
/*                                                                            */
/*  Not the desktop stage scaled down: a plain vertical read, one project per */
/*  block, each on its own tone so the atmosphere still shifts as you scroll. */
/*  Motion is a single one-shot fade-up per block (IntersectionObserver, CSS  */
/*  transition — no scrubbing, no parallax). Under reduced motion nothing     */
/*  animates and every block is visible from the start.                       */
/* -------------------------------------------------------------------------- */

type Props = { projects: ShowcaseProject[] };

export function ShowcaseFlow({ projects }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    root.dataset.js = '';
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-block]'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-seen', '');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );
    blocks.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [reduced]);

  const count = projects.length;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div ref={rootRef} className={styles.root}>
      {projects.map((p, i) => (
        <article
          key={p.slug}
          data-block
          className={styles.block}
          style={{ background: p.tone }}
        >
          <p className={styles.count}>
            <span style={{ color: p.accent }}>{pad(i + 1)}</span>
            <i aria-hidden> / </i>
            {pad(count)}
          </p>

          <p className={styles.category} style={{ color: p.accent }}>
            {p.category}
          </p>
          <h3 className={styles.title}>{p.title}</h3>
          <p className={styles.descriptor}>{p.descriptor}</p>

          <Link
            href={p.href}
            className={styles.visualLink}
            data-cursor="view"
            aria-label={`${p.title} — ${p.category}`}
          >
            <ProjectVisual project={p} />
          </Link>

          <p className={styles.supporting}>{p.supporting}</p>

          <Link href={p.href} className={styles.cta} data-cursor="link">
            View case study
            <span aria-hidden> →</span>
          </Link>
        </article>
      ))}
    </div>
  );
}

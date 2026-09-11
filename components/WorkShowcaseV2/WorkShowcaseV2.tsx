'use client';

import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import {
  SHOWCASE_PROJECTS,
  SHOWCASE_COUNT,
} from '@/components/WorkShowcase/showcase.content';
import { ShowcaseFlow } from '@/components/WorkShowcase/ShowcaseFlow';
import { DriftGallery } from './DriftGallery';
import styles from './WorkShowcaseV2.module.scss';

/* -------------------------------------------------------------------------- *
 *  DRIFT · horizontal editorial gallery — the live "Selected work" section   *
 *  on / and /work. (v3 — INDEX — is kept as a draft at /work-showcase-v3.)    *
 *  The classic <SelectedWork> component is retained but no longer rendered.   *
 *                                                                            *
 *    ≥ 700px + motion OK ....... <DriftGallery>  (pinned, scroll → sideways) *
 *    else ...................... <ShowcaseFlow>  (shared vertical read)      *
 * -------------------------------------------------------------------------- */

export function WorkShowcaseV2() {
  const reduced = usePrefersReducedMotion();
  const wide = useMediaQuery('(min-width: 700px)');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const staged = mounted && wide && !reduced;

  return (
    <section
      id="work"
      className={styles.section}
      aria-label="Selected work"
      style={{ background: SHOWCASE_PROJECTS[0].tone }}
    >
      <div className={styles.head}>
        <span className={styles.kicker}>
          <span className={styles.arrow} aria-hidden>
            ↓
          </span>{' '}
          Selected work — 2023–26
        </span>
        <h2 className={styles.title}>Featured work</h2>
        <p className={styles.intro}>
          {SHOWCASE_COUNT} projects, side by side — scroll to move along the wall.
        </p>
      </div>

      {staged ? (
        <DriftGallery projects={SHOWCASE_PROJECTS} />
      ) : (
        <ShowcaseFlow projects={SHOWCASE_PROJECTS} />
      )}
    </section>
  );
}

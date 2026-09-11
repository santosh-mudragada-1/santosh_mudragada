'use client';

import { WORK_GRAPHICS } from '@/components/Work/graphics';
import type { ShowcaseProject } from './showcase.content';
import { NextrailStill } from './NextrailStill';
import styles from './ProjectVisual.module.scss';

type Props = {
  project: ShowcaseProject;
  className?: string;
};

/**
 * A floating plate that hosts a project's REAL card art — the same
 * `WORK_GRAPHICS[slug]` component the classic <WorkCard> uses
 * (ClearhostGraphic / ChessComGraphic). Nothing about the artwork is
 * recreated; this only gives it a sized, rounded, softly shadowed box so it
 * reads as floating on the page rather than sitting inside a boxed card.
 *
 * `nextrail` is the one exception — see <NextrailStill>: its graphic's
 * scroll-driven "phone rides up" effect can't work inside a pinned stage, so
 * the showcase uses the same assets, statically composed.
 */
export function ProjectVisual({ project, className }: Props) {
  const Graphic = WORK_GRAPHICS[project.slug];

  let art: React.ReactNode;
  if (project.slug === 'nextrail') {
    art = <NextrailStill />;
  } else if (Graphic) {
    art = <Graphic />;
  } else {
    art = (
      // Fallback only — every current project has a graphic.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={styles.fallback}
        src={project.src}
        alt={`${project.title} — project visual`}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    );
  }

  return (
    <div className={`${styles.frame}${className ? ` ${className}` : ''}`}>
      <div className={styles.plate}>{art}</div>
    </div>
  );
}

/**
 * The project's REAL card art with no frame at all — the caller supplies the
 * box, clip and shadow, so DRIFT and the INDEX draft can stage the same
 * graphics differently. `nextrail` still swaps to <NextrailStill> (its
 * graphic's internal ScrollTrigger can't run inside a pinned/transformed
 * stage).
 */
export function RawVisual({ project }: { project: ShowcaseProject }) {
  const Graphic = WORK_GRAPHICS[project.slug];
  if (project.slug === 'nextrail') return <NextrailStill />;
  if (Graphic) return <Graphic />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={project.src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

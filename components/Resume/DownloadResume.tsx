'use client';

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { RESUME_PDF } from './content';
import styles from './DownloadResume.module.scss';

/**
 * The résumé download. A real same-origin `<a download>` so the browser saves
 * the actual PDF (public/Santosh-Mudragada-Resume.pdf) — the site page-
 * transition curtain explicitly ignores `[download]`, so no navigation.
 *
 * Positioning is handled by the sticky `.downloadDock` wrapper in Resume.tsx:
 * it pins bottom-right while the résumé is on screen and settles above the
 * footer, so it never rides over the footer.
 */
export function DownloadResume() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  // gentle entrance once, after paint
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), reduced ? 0 : 260);
    return () => window.clearTimeout(t);
  }, [reduced]);

  return (
    <a
      href={RESUME_PDF}
      download="Santosh-Mudragada-Resume.pdf"
      type="application/pdf"
      className={styles.button}
      data-in={mounted || undefined}
      data-cursor="link"
      data-cursor-sticky
      aria-label="Download résumé as PDF"
    >
      <span className={styles.icon} aria-hidden>
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none">
          <path
            d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 17.5V19a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1.5"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.text}>Download Resume</span>
    </a>
  );
}

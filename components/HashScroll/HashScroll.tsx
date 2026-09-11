'use client';

import { useEffect } from 'react';
import { useSmoothScroll } from '@/lib/smooth-scroll';

const HEADER_OFFSET = -96;

/**
 * Consumes a `#section` hash on the page it's mounted on (the home page): on
 * first load, and on browser hash changes — using the Lenis scroll so it
 * doesn't fight smooth scroll the way a native anchor jump would. The hash is
 * cleared once consumed so later page transitions don't re-trigger it.
 * Renders nothing.
 */
export function HashScroll() {
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    let cancelled = false;

    const jump = () => {
      if (cancelled) return;
      const id = window.location.hash.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      scrollTo(el, { offset: HEADER_OFFSET });
      // drop the hash so it isn't re-consumed on the next navigation back here
      history.replaceState(null, '', window.location.pathname + window.location.search);
    };

    let cleanupInitial: (() => void) | undefined;
    if (window.location.hash) {
      if (document.documentElement.classList.contains('is-loading')) {
        const onDone = () => {
          window.removeEventListener('preloader:done', onDone);
          requestAnimationFrame(jump);
        };
        window.addEventListener('preloader:done', onDone);
        cleanupInitial = () => window.removeEventListener('preloader:done', onDone);
      } else {
        // let layout + ScrollTrigger settle after the route commit
        const t = window.setTimeout(jump, 120);
        cleanupInitial = () => window.clearTimeout(t);
      }
    }

    window.addEventListener('hashchange', jump);
    return () => {
      cancelled = true;
      cleanupInitial?.();
      window.removeEventListener('hashchange', jump);
    };
  }, [scrollTo]);

  return null;
}

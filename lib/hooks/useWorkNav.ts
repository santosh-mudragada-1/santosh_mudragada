'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useSmoothScroll } from '@/lib/smooth-scroll';

// Clears the fixed header (~84px) plus a little breathing room above the section.
const HEADER_OFFSET = -96;

/**
 * Click handler for "Work" nav links (href `/#work`). On the home page it
 * smooth-scrolls to the #work section instead of routing away; on any other
 * page it does nothing and lets <Link href="/#work"> navigate home, where
 * <HashScroll> finishes the jump. Modifier-clicks always fall through so
 * "open in new tab" still works.
 */
export function useWorkNav() {
  const pathname = usePathname();
  const { scrollTo, start } = useSmoothScroll();

  return useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      if (pathname !== '/') return; // other routes: let the <Link> go to /#work
      const target = document.getElementById('work');
      if (!target) return;

      e.preventDefault();
      // A beat after any overlay (the menu) starts closing and releases its
      // `overflow: clip` scroll-lock, so the glide isn't swallowed.
      window.setTimeout(() => {
        start();
        scrollTo(target, { offset: HEADER_OFFSET });
        history.replaceState(null, '', '/#work');
      }, 60);
    },
    [pathname, scrollTo, start],
  );
}

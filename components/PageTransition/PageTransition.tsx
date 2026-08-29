'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ScrollTrigger } from '@/lib/gsap/gsap';
import { useSmoothScroll } from '@/lib/smooth-scroll';
import { Curtain, type CurtainPhase } from './Curtain';
import { routeLabel } from './labels';

const HOLD_MS = 400; // sheet sits fully covering while the route swaps (ref: delay .35)

/**
 * App Router page transition — a curved SVG curtain, matched to
 * references/page-transitions:
 *
 *   cover (0.75s) -> hold (~0.4s, route swaps) -> reveal (0.75s)
 *
 * Internal link clicks are intercepted so the curtain covers the *current*
 * page first; the route is pushed once fully covered, during the hold, so the
 * next page never flashes in early. The label is fixed for the whole
 * transition (set once, at cover) so the name never flickers mid-animation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollTo } = useSmoothScroll();

  const [phase, setPhase] = useState<CurtainPhase>('idle');
  const [label, setLabel] = useState('');
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const actedPathRef = useRef(pathname);
  const pendingHref = useRef<string | null>(null);
  const holdTimer = useRef<number | undefined>(undefined);

  const start = useCallback((destPath: string) => {
    setLabel(routeLabel(destPath));
    setPhase('cover');
  }, []);

  // Intercept same-origin link clicks: cover first, navigate on `onCovered`.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('/')) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.pathname === window.location.pathname) return; // same page / hash

      // Next's <Link> checks `defaultPrevented` before it routes, so preventing
      // here (capture phase) is enough to hold the navigation back.
      e.preventDefault();
      if (phaseRef.current !== 'idle') return;
      pendingHref.current = href;
      start(url.pathname);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [start]);

  // Uncaught route changes (back / forward).
  useEffect(() => {
    if (pathname === actedPathRef.current) return;
    actedPathRef.current = pathname;
    if (phaseRef.current === 'idle') start(pathname);
  }, [pathname, start]);

  const handleCovered = useCallback(() => {
    window.scrollTo(0, 0);
    scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    const href = pendingHref.current;
    if (href) {
      pendingHref.current = null;
      try {
        actedPathRef.current = new URL(href, window.location.href).pathname;
      } catch {
        actedPathRef.current = href;
      }
      router.push(href);
    }

    setPhase('hold'); // sit covering while the (static) route commits
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setPhase('reveal'), HOLD_MS);
  }, [router, scrollTo]);

  const handleRevealed = useCallback(() => {
    setPhase('idle');
    ScrollTrigger.refresh();
    window.dispatchEvent(new CustomEvent('transition:complete'));
  }, []);

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  return (
    <>
      {children}
      <Curtain
        phase={phase}
        label={label}
        onCovered={handleCovered}
        onRevealed={handleRevealed}
      />
    </>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ScrollTrigger } from '@/lib/gsap/gsap';
import { useSmoothScroll } from '@/lib/smooth-scroll';
import { useIsomorphicLayoutEffect } from '@/lib/hooks/useIsomorphicLayoutEffect';
import { Curtain, type CurtainPhase } from './Curtain';
import { routeLabel } from './labels';

// While covered: never lift before this (so the curtain can't just flash), and
// never stay past this even if the route never reports committed (failsafe).
// HOLD_MAX_MS used to be 3000 — on a slow first-time load (cold cache, no
// prefetch yet) a heavier route's JS chunk can genuinely take longer than
// that to arrive. When it did, the failsafe forced a reveal of the STILL-OLD
// page (pathname hadn't committed yet), which then visibly swapped to the
// new one a moment later once the slow fetch finally landed — the "shows the
// same page, then changes again" report. Raised well past any realistic
// route-chunk fetch time; it's a last-resort safety net, not a target.
const HOLD_MIN_MS = 350;
const HOLD_MAX_MS = 8000;

/**
 * App Router page transition — a curved SVG curtain, matched to
 * references/page-transitions:
 *
 *   cover (0.75s) -> hold (route swaps) -> reveal (0.75s)
 *
 * Internal link clicks are intercepted so the curtain covers the *current*
 * page first; the route is pushed once fully covered and the reveal waits for
 * the new route to actually commit (not a fixed timer — an un-prefetched or
 * still-compiling route used to reveal the *old* page for a beat). The label is
 * fixed for the whole transition so the name never flickers mid-animation.
 *
 * Browser back / forward can't be intercepted — Next commits the route before
 * we hear about it, so the destination is already live. The animation is the
 * same cover -> hold -> reveal; we just raise an opaque backdrop behind the
 * sheet during the cover so that already-live page can't be seen (or seen
 * animating) through the not-yet-covered part of the viewport.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollTo } = useSmoothScroll();

  const [phase, setPhase] = useState<CurtainPhase>('idle');
  const [label, setLabel] = useState('');
  // true when this transition was triggered by back/forward (see Curtain.backdrop)
  const [backdrop, setBackdrop] = useState(false);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const actedPathRef = useRef(pathname);
  const pendingHref = useRef<string | null>(null);
  const targetPathRef = useRef(pathname); // where this transition is headed
  const coveredAtRef = useRef(0);

  const start = useCallback((destPath: string, viaBackForward = false) => {
    setLabel(routeLabel(destPath));
    setBackdrop(viaBackForward);
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

  // Uncaught route changes (browser back / forward). Layout effect so the
  // curtain + backdrop are committed before the new route paints uncovered.
  useIsomorphicLayoutEffect(() => {
    if (pathname === actedPathRef.current) return;
    actedPathRef.current = pathname;
    if (phaseRef.current === 'idle') start(pathname, true);
  }, [pathname, start]);

  const handleCovered = useCallback(() => {
    window.scrollTo(0, 0);
    scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();

    const href = pendingHref.current;
    if (href) {
      pendingHref.current = null;
      let dest = href;
      try {
        dest = new URL(href, window.location.href).pathname;
      } catch {
        /* keep href as-is */
      }
      actedPathRef.current = dest;
      targetPathRef.current = dest;
      router.push(href);
    } else {
      // back / forward — the route is already here
      targetPathRef.current = pathname;
    }

    coveredAtRef.current = performance.now();
    setPhase('hold'); // sit covering until the new route has actually committed
  }, [router, scrollTo, pathname]);

  // hold -> reveal: only once the destination route is really on screen (and
  // we've covered for at least HOLD_MIN_MS), with a hard failsafe so a route
  // that never commits can't trap the viewer behind the curtain.
  useEffect(() => {
    if (phase !== 'hold') return;

    let raf = 0;
    const tick = () => {
      const committed = pathname === targetPathRef.current;
      const held = performance.now() - coveredAtRef.current >= HOLD_MIN_MS;
      if (committed && held) setPhase('reveal');
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const failsafe = window.setTimeout(() => setPhase('reveal'), HOLD_MAX_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
    };
  }, [phase, pathname]);

  const handleRevealed = useCallback(() => {
    setPhase('idle');
    setBackdrop(false);
    // The `transition:complete` listeners (SmoothScrollProvider, Navigation)
    // each re-measure — don't also refresh here, that was a second full layout
    // pass in the same tick, right as the incoming page's entrance plays.
    window.dispatchEvent(new CustomEvent('transition:complete'));
  }, []);

  return (
    <>
      {children}
      <Curtain
        phase={phase}
        label={label}
        backdrop={backdrop}
        onCovered={handleCovered}
        onRevealed={handleRevealed}
      />
    </>
  );
}

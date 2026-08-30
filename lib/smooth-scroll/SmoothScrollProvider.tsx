'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { setLenisInstance } from './lenis-instance';

type ScrollToTarget = number | string | HTMLElement;
type ScrollToOptions = {
  offset?: number;
  duration?: number;
  immediate?: boolean;
};

type SmoothScrollApi = {
  /** Lenis instance, or `null` when reduced-motion / not yet mounted. */
  lenis: Lenis | null;
  /** Scroll helper that works with or without Lenis. */
  scrollTo: (target: ScrollToTarget, options?: ScrollToOptions) => void;
  /** Pause/resume Lenis (e.g. while a menu or the preloader is open). */
  stop: () => void;
  start: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

export function useSmoothScroll(): SmoothScrollApi {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) {
    throw new Error('useSmoothScroll must be used inside <SmoothScrollProvider>');
  }
  return ctx;
}

/** Convenience accessor when you only need the raw instance. */
export function useLenis(): Lenis | null {
  return useContext(SmoothScrollContext)?.lenis ?? null;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    // Reduced motion: no smoothing at all — native scroll, ScrollTrigger reads
    // window scroll directly. Still refresh so any triggers measure correctly,
    // including after the preloader releases the scroll-lock.
    if (prefersReduced) {
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      window.addEventListener('preloader:done', refresh);
      ScrollTrigger.refresh();
      return () => {
        window.removeEventListener('load', refresh);
        window.removeEventListener('preloader:done', refresh);
      };
    }

    const lenisInstance = new Lenis({
      duration: 1.1,
      // expo-out — quick to respond, long gentle tail. No aggressive easing that
      // would let scrubbed animations lag behind the pointer.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      // Let touch devices scroll natively; smoothing touch tends to feel worse.
      syncTouch: false,
    });

    lenisRef.current = lenisInstance;
    setLenis(lenisInstance);
    setLenisInstance(lenisInstance);

    // If the preloader is still holding the screen, start paused — it calls
    // start() when it lifts. Closes the gap between this effect and the
    // preloader's lock effect.
    if (document.documentElement.classList.contains('is-loading')) {
      lenisInstance.stop();
    }

    // --- The Lenis <-> ScrollTrigger bridge -----------------------------
    // 1. Every Lenis scroll frame pushes an update into ScrollTrigger.
    lenisInstance.on('scroll', ScrollTrigger.update);

    // 2. One rAF loop for everything: GSAP's ticker drives Lenis.
    //    ticker time is in seconds; Lenis.raf expects milliseconds.
    const onTick = (time: number) => {
      lenisInstance.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    // Don't let GSAP fabricate catch-up frames after a stall.
    gsap.ticker.lagSmoothing(0);

    // 3. Recalculate trigger positions once layout / fonts have settled, when
    //    the preloader lifts (document height changes as the scroll-lock is
    //    released), and after every page transition (the new route almost
    //    always has a different height — Lenis's scroll limit must re-measure
    //    or scrolling on the new page snaps).
    const refresh = () => {
      lenisInstance.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', refresh);
    window.addEventListener('preloader:done', refresh);
    window.addEventListener('transition:complete', refresh);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener('load', refresh);
      window.removeEventListener('preloader:done', refresh);
      window.removeEventListener('transition:complete', refresh);
      gsap.ticker.remove(onTick);
      lenisInstance.off('scroll', ScrollTrigger.update);
      lenisInstance.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      setLenis(null);
    };
  }, [prefersReduced]);

  const api = useMemo<SmoothScrollApi>(() => {
    return {
      lenis,
      scrollTo: (target, options = {}) => {
        const { offset = 0, duration, immediate } = options;
        const current = lenisRef.current;
        if (current) {
          current.scrollTo(target, { offset, duration, immediate });
          return;
        }
        // Fallback: native scroll.
        let top = 0;
        if (typeof target === 'number') {
          top = target;
        } else {
          const el =
            typeof target === 'string'
              ? document.querySelector<HTMLElement>(target)
              : target;
          if (el) top = el.getBoundingClientRect().top + window.scrollY;
        }
        window.scrollTo({
          top: top + offset,
          behavior: immediate ? 'auto' : 'smooth',
        });
      },
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    };
  }, [lenis]);

  return (
    <SmoothScrollContext.Provider value={api}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

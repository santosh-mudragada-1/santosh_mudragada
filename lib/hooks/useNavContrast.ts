'use client';

import { useEffect, type RefObject } from 'react';
import { getLenisInstance } from '@/lib/smooth-scroll';

/**
 * Flips the fixed nav (wordmark + inline links) to its light variant while a
 * `[data-theme="dark"]` section inside `rootRef` sits under the header band.
 * Hit-tests the point under the nav every scroll frame — pin-proof, works on
 * every viewport, motion or not.
 *
 * Mirrors the effect `components/AboutStory/AboutStory.tsx` keeps inline for
 * the same purpose — pulled out here for pages that need it too (Contact,
 * NotFound) rather than duplicated by hand; AboutStory's own copy is left
 * untouched.
 */
export function useNavContrast(rootRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const html = document.documentElement;
    let raf = 0;

    const update = () => {
      raf = 0;
      const el = document.elementFromPoint(48, 44); // header band, left of the wordmark
      const onDark = !!(el && root.contains(el) && el.closest('[data-theme="dark"]'));
      if (onDark) html.dataset.navContrast = 'light';
      else delete html.dataset.navContrast;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const lenis = getLenisInstance();
    lenis?.on('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('transition:complete', update);
    const t = window.setTimeout(update, 80);

    return () => {
      lenis?.off('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('transition:complete', update);
      window.clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
      delete html.dataset.navContrast;
    };
  }, [rootRef]);
}

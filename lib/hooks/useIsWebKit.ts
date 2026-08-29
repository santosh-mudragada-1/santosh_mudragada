import { useEffect, useState } from 'react';

/**
 * `true` on Safari / any WebKit browser (all iOS browsers included). Safe to
 * call outside React; returns `false` where there is no `navigator` (SSR).
 */
export function detectWebKit(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /AppleWebKit/.test(ua) && !/Chrome|Chromium|Android/.test(ua);
}

/**
 * `true` on Safari / any WebKit browser (all iOS browsers included). Returns
 * `false` on the server and first client render, then updates after mount —
 * gate rendered output on a mounted flag if it changes markup.
 *
 * Use it to drop effects WebKit handles badly: several concurrent WebGL
 * contexts, scroll-scrubbed SVG filters, large promoted gradient layers.
 */
export function useIsWebKit(): boolean {
  const [webkit, setWebkit] = useState(false);

  useEffect(() => {
    setWebkit(detectWebKit());
  }, []);

  return webkit;
}

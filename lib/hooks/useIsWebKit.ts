import { useEffect, useState } from 'react';

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
    const ua = navigator.userAgent;
    setWebkit(/AppleWebKit/.test(ua) && !/Chrome|Chromium|Android/.test(ua));
  }, []);

  return webkit;
}

import { useState } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * Like `useMediaQuery`, but resolves in the layout phase — before the first
 * paint — so a component that renders a different amount of content per
 * breakpoint doesn't visibly flash the wrong variant (and rebuild its
 * animations) on mount. Still returns `false` for the server and the very
 * first client render so it matches the SSR markup.
 */
export function useMediaQueryLayout(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

import { useMediaQuery } from './useMediaQuery';

/**
 * `true` when the user has asked for reduced motion. Always `false` on the
 * server / first paint, so gate any motion-vs-static branching on a mounted
 * flag if it changes rendered output.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

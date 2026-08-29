import { useMediaQuery } from './useMediaQuery';

/**
 * `true` on coarse-pointer / no-hover devices. Use it to disable the custom
 * cursor, magnetic effects and pointer-driven distortion. Returns `false` on
 * the server / first paint — gate rendered output on a mounted flag.
 */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none), (pointer: coarse)');
}

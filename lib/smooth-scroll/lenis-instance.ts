import type Lenis from 'lenis';

// Module-level handle to the single Lenis instance, for non-React consumers
// that run inside an rAF loop (e.g. the WebGL distortion ticker) and must read
// live scroll velocity without subscribing to React state or re-initialising.
let instance: Lenis | null = null;

export function setLenisInstance(next: Lenis | null) {
  instance = next;
}

export function getLenisInstance(): Lenis | null {
  return instance;
}

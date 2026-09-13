import type Lenis from 'lenis';

// Module-level handle to the single Lenis instance, for non-React consumers
// that run inside an rAF loop (e.g. the WebGL distortion ticker) and must read
// live scroll velocity without subscribing to React state or re-initialising.
let instance: Lenis | null = null;

// `syncTouch` is only ON while at least one pinned/scrubbed section that
// needs it (About's TravelReel, PhotoRoll) is actually active — see
// requestSyncTouch below for why.
let syncTouchRefs = 0;

export function setLenisInstance(next: Lenis | null) {
  instance = next;
  syncTouchRefs = 0;
  applySyncTouch();
}

export function getLenisInstance(): Lenis | null {
  return instance;
}

function applySyncTouch() {
  if (!instance) return;
  // `options` is a plain mutable object Lenis re-reads on every touch event
  // (not captured once at construction), so flipping this live takes effect
  // on the very next touchmove — no re-instantiation needed.
  instance.options.syncTouch = syncTouchRefs > 0;
}

/**
 * Turns Lenis's `syncTouch` on for as long as the caller holds it, off again
 * once every holder has released it (ref-counted so two sections can't stomp
 * on each other). `syncTouch` routes touch scroll through Lenis's JS loop
 * instead of the browser's native compositor scroll — needed so ScrollTrigger
 * pins/scrubs (which read scroll position every frame) don't stutter/freeze
 * during a native momentum fling, but it makes ordinary page scrolling feel
 * heavier (especially on Android) everywhere it's on. Scoping it to only the
 * sections that actually need it keeps the rest of the site on native touch
 * scroll. Returns a release function; safe to call more than once.
 */
export function requestSyncTouch(): () => void {
  syncTouchRefs += 1;
  applySyncTouch();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    syncTouchRefs = Math.max(0, syncTouchRefs - 1);
    applySyncTouch();
  };
}

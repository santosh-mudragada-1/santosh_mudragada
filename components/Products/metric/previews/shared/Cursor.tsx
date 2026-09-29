import { forwardRef } from 'react';

/**
 * The simulated pointer reused across most previews — GSAP drives its
 * `left`/`top` (percentages of the stage) and a scale-pulse on "click".
 * Kept as one component so every gameplay demo reads as the same hand
 * playing, not a different cursor style per game.
 */
export const Cursor = forwardRef<HTMLDivElement, { className?: string }>(function Cursor(
  { className = '' },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-[0_0_0_3px_rgba(255,255,255,0.16)] ${className}`}
    />
  );
});

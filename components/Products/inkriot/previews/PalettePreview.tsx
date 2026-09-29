'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// A condensed slice of the game's real 20-color palette.
const SWATCHES = ['#1B1340', '#FF5A36', '#FFC928', '#FF7EC7', '#2FD4A0', '#7B5CFF', '#3EA8FF', '#FFFDF7'];
const BRUSH_SIZES = [3, 5, 7, 9];

export function PalettePreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const swatchRefs = useRef<(HTMLDivElement | null)[]>([]);
  const brushRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const SWATCH_STEP = 22;
      gsap.set(ringRef.current, { left: 0, opacity: 1 });
      gsap.set(brushRefs.current, { scale: 1 });

      const tl = gsap.timeline({ repeat: -1 });
      SWATCHES.forEach((_, i) => {
        tl.to(ringRef.current, { left: i * SWATCH_STEP, duration: 0.28, ease: 'power2.inOut' }).to(
          {},
          { duration: 0.22 },
        );
      });

      // then step through the brush sizes, growing the active dot
      BRUSH_SIZES.forEach((_, i) => {
        tl.to(brushRefs.current, { scale: 1, duration: 0.15 }).to(
          brushRefs.current[i],
          { scale: 1.35, duration: 0.2, ease: 'back.out(2.5)' },
          '<',
        );
      });
      tl.to({}, { duration: 0.6 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="flex h-full w-full flex-col items-center justify-center gap-3.5">
      <div className="relative flex gap-1">
        {SWATCHES.map((c, i) => (
          <div
            key={i}
            ref={(el) => {
              swatchRefs.current[i] = el;
            }}
            className="h-4 w-4 rounded-full border-2 border-ink"
            style={{ background: c }}
          />
        ))}
        <div
          ref={ringRef}
          className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1 -translate-y-1/2 rounded-full border-2 border-accent-palette"
        />
      </div>
      <div className="flex items-center gap-2">
        {BRUSH_SIZES.map((s, i) => (
          <div
            key={i}
            ref={(el) => {
              brushRefs.current[i] = el;
            }}
            className="rounded-full bg-ink"
            style={{ width: s, height: s }}
          />
        ))}
      </div>
    </div>
  );
}

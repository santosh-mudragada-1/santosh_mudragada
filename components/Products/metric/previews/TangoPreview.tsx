'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Cursor } from './shared/Cursor';

// 2x3 board, filled alternating sun/moon so no three sit in a row — the
// puzzle's actual balance rule.
const CELLS = [
  { icon: 'sun', left: '16.7%', top: '25%' },
  { icon: 'moon', left: '50%', top: '25%' },
  { icon: 'sun', left: '83.3%', top: '25%' },
  { icon: 'moon', left: '16.7%', top: '75%' },
  { icon: 'sun', left: '50%', top: '75%' },
  { icon: 'moon', left: '83.3%', top: '75%' },
] as const;

export function TangoPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });

      tl.set(iconRefs.current, { opacity: 0, scale: 0.5 }).set(cursorRef.current, {
        ...CELLS[0],
        opacity: 0.75,
      });

      CELLS.forEach((cell, i) => {
        if (i > 0) tl.to(cursorRef.current, { left: cell.left, top: cell.top, duration: 0.22, ease: 'power2.inOut' });
        tl.to(iconRefs.current[i], { opacity: 1, scale: 1, duration: 0.16, ease: 'back.out(2)' });
      });

      tl.to(cursorRef.current, { opacity: 0, duration: 0.15 })
        .to(iconRefs.current, { scale: 1.1, duration: 0.15, stagger: 0.02, yoyo: true, repeat: 1 })
        .to({}, { duration: 0.6 })
        .to(iconRefs.current, { opacity: 0, scale: 0.5, duration: 0.2 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative h-full w-full">
      {CELLS.map((cell, i) => {
        const Icon = cell.icon === 'sun' ? SunIcon : MoonIcon;
        return (
          <div
            key={i}
            ref={(el) => {
              iconRefs.current[i] = el;
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: cell.left, top: cell.top }}
          >
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${cell.icon === 'sun' ? 'text-accent-tango' : 'text-text'}`} />
          </div>
        );
      })}
      <Cursor ref={cursorRef} />
    </div>
  );
}

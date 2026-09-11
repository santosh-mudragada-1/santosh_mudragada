'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';

type MagneticProps = {
  children: ReactNode;
  /** Fraction of the pointer offset the element follows. Kept small (~0.1). */
  strength?: number;
  /** Max px the element is allowed to travel, so the pointer never falls off. */
  max?: number;
  className?: string;
};

/**
 * Subtle Dennis-style magnetic pull. The element's rest rect is captured once on
 * pointer-enter and reused for every move, so the pull can't feed back on
 * itself (which was making links drift / "repel"). Travel is clamped so the
 * pointer always stays over the real element and clicks land. No-op on touch.
 */
export function Magnetic({
  children,
  strength = 0.1,
  max = 8,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isTouch = useIsTouch();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || isTouch) return;

      const xTo = gsap.quickTo(el, 'x', {
        duration: 0.6,
        ease: 'power3.out',
      });
      const yTo = gsap.quickTo(el, 'y', {
        duration: 0.6,
        ease: 'power3.out',
      });

      let cx = 0;
      let cy = 0;

      const onEnter = () => {
        const r = el.getBoundingClientRect();
        cx = r.left + r.width / 2;
        cy = r.top + r.height / 2;
      };
      const onMove = (e: PointerEvent) => {
        const dx = (e.clientX - cx) * strength;
        const dy = (e.clientY - cy) * strength;
        xTo(Math.max(-max, Math.min(max, dx)));
        yTo(Math.max(-max, Math.min(max, dy)));
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    { dependencies: [isTouch, strength, max] },
  );

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', willChange: 'transform' }}
    >
      {children}
    </span>
  );
}

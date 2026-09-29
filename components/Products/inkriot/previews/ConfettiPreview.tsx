'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// Preset burst vectors — mirrors ConfettiEngine.burst()'s upward cone spread,
// pre-computed so nothing here calls Math.random() during render.
const PARTICLES = [
  { angle: -100, dist: 34, size: 6, color: '#FF5A36', shape: 'rect' as const },
  { angle: -70, dist: 40, size: 5, color: '#FFC928', shape: 'circle' as const },
  { angle: -125, dist: 30, size: 5, color: '#FF7EC7', shape: 'rect' as const },
  { angle: -55, dist: 32, size: 6, color: '#2FD4A0', shape: 'circle' as const },
  { angle: -145, dist: 38, size: 5, color: '#7B5CFF', shape: 'rect' as const },
  { angle: -40, dist: 28, size: 5, color: '#3EA8FF', shape: 'circle' as const },
  { angle: -90, dist: 44, size: 6, color: '#FF5A36', shape: 'circle' as const },
  { angle: -20, dist: 34, size: 5, color: '#2FD4A0', shape: 'rect' as const },
];

export function ConfettiPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const burstRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const parts = particleRefs.current;
      gsap.set(parts, { x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 });
      gsap.set(burstRef.current, { scale: 0, opacity: 0 });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9 });
      tl.to(burstRef.current, { scale: 1, opacity: 1, duration: 0.15, ease: 'power2.out' })
        .to(burstRef.current, { opacity: 0, duration: 0.25 }, '+=0.05');

      PARTICLES.forEach((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.dist;
        const y = Math.sin(rad) * p.dist;
        tl.to(
          parts[i],
          { x, y, opacity: 1, scale: 1, rotate: p.angle * 2, duration: 0.55, ease: 'power2.out' },
          '<0.02',
        ).to(parts[i], { opacity: 0, duration: 0.3 }, '>0.15');
      });

      tl.to({}, { duration: 0.8 }).set(parts, { x: 0, y: 0, opacity: 0, scale: 0 });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative flex h-full w-full items-center justify-center">
      <div ref={burstRef} className="absolute h-6 w-6 rounded-full bg-accent-confetti" />
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          ref={(el) => {
            particleRefs.current[i] = el;
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

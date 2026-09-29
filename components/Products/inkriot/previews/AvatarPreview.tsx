'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

// Ported from the game's own DoodleAvatar (lib/avatar.ts / components/common/
// DoodleAvatar.tsx) — three real body/eyes/mouth/color combinations, trimmed
// down to what this loop needs.
const INK = '#1B1340';
const PAPER = '#FFFDF7';

const BODIES = [
  'M50 18C78 18 88 42 88 66V106H12V66C12 42 22 18 50 18Z',
  'M20 22Q50 14 80 22Q88 24 88 34V106H12V34Q12 24 20 22Z',
  'M12 106V48L20 24L30 38L40 18L50 34L60 16L70 36L80 22L88 46V106Z',
];

const VARIANTS = [
  { body: 0, fill: '#FF5A36' },
  { body: 1, fill: '#2FD4A0' },
  { body: 2, fill: '#3EA8FF' },
] as const;

function Eyes({ kind }: { kind: 0 | 1 | 2 }) {
  if (kind === 1) {
    return (
      <g>
        <circle cx="37" cy="50" r="8.5" fill={PAPER} stroke={INK} strokeWidth="3" />
        <circle cx="63" cy="50" r="8.5" fill={PAPER} stroke={INK} strokeWidth="3" />
        <circle cx="39.5" cy="52" r="3.6" fill={INK} />
        <circle cx="60.5" cy="48" r="3.6" fill={INK} />
      </g>
    );
  }
  if (kind === 2) {
    return (
      <g stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none">
        <path d="M31 50Q37 56 43 50" />
        <path d="M57 50Q63 56 69 50" />
      </g>
    );
  }
  return (
    <g fill={INK}>
      <circle cx="37" cy="50" r="4.4" />
      <circle cx="63" cy="50" r="4.4" />
      <circle cx="38.5" cy="48.5" r="1.4" fill={PAPER} />
      <circle cx="64.5" cy="48.5" r="1.4" fill={PAPER} />
    </g>
  );
}

function Mouth({ kind }: { kind: 0 | 1 | 2 }) {
  const s = { stroke: INK, strokeWidth: 3.2, strokeLinecap: 'round' as const, fill: 'none' };
  if (kind === 1) return <path d="M41 69H59" {...s} />;
  if (kind === 2) return <path d="M37 70Q40.5 65 44 70T51 70T58 70T65 70" {...s} />;
  return <path d="M39 66Q50 77 61 66" {...s} />;
}

export function AvatarPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const layers = layerRefs.current;
      gsap.set(layers, { opacity: 0, scale: 0.9 });
      gsap.set(layers[0], { opacity: 1, scale: 1 });

      const tl = gsap.timeline({ repeat: -1 });
      VARIANTS.forEach((_, i) => {
        const next = (i + 1) % VARIANTS.length;
        tl.to({}, { duration: 1.1 })
          .to(layers[i], { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power2.in' })
          .to(layers[next], { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, '<0.05');
      });
    },
    { scope: stageRef, dependencies: [reduced] },
  );

  return (
    <div ref={stageRef} className="relative h-full w-full">
      {VARIANTS.map((v, i) => (
        <div
          key={i}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <svg width={56} height={56} viewBox="-4 -22 108 128">
            <path d={BODIES[v.body]} fill={v.fill} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M26 36Q30 28 38 25" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" fill="none" />
            <Eyes kind={(i % 3) as 0 | 1 | 2} />
            <Mouth kind={((i + 1) % 3) as 0 | 1 | 2} />
          </svg>
        </div>
      ))}
    </div>
  );
}

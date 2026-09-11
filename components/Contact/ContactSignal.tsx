'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './ContactSignal.module.scss';

/**
 * Replaces the old hero photo: an abstract "signal" in the brand's orange —
 * concentric rings orbiting at different speeds (a satellite dot riding
 * each one), a breathing glow at the centre, and a radar-style ping expanding
 * outward on a loop. Reads as "sending something out" without a stock photo.
 */

const CX = 350;
const CY = 350;
const RINGS = [
  { r: 88, dur: 46, dash: undefined, dotR: 5, opacity: 0.6, reverse: false },
  { r: 152, dur: 66, dash: '1 11', dotR: 4, opacity: 0.4, reverse: true },
  { r: 218, dur: 86, dash: '1 16', dotR: 3, opacity: 0.26, reverse: false },
] as const;

export function ContactSignal() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<SVGSVGElement>(null);
  const ringRefs = useRef<Array<SVGGElement | null>>([]);
  const glowRef = useRef<SVGCircleElement>(null);
  const pingRef = useRef<SVGCircleElement>(null);

  useGSAP(
    () => {
      if (reduced) return;

      ringRefs.current.forEach((g, i) => {
        if (!g) return;
        gsap.to(g, {
          rotation: RINGS[i].reverse ? -360 : 360,
          transformOrigin: `${CX}px ${CY}px`,
          duration: RINGS[i].dur,
          repeat: -1,
          ease: 'none',
        });
      });

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          scale: 1.15,
          transformOrigin: `${CX}px ${CY}px`,
          duration: 3.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      }

      if (pingRef.current) {
        gsap.fromTo(
          pingRef.current,
          { scale: 0.55, autoAlpha: 0.5, transformOrigin: `${CX}px ${CY}px` },
          {
            scale: 2.3,
            autoAlpha: 0,
            duration: 2.8,
            ease: 'power2.out',
            repeat: -1,
            repeatDelay: 1.7,
          },
        );
      }
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <svg
      ref={rootRef}
      className={styles.signal}
      viewBox="0 0 700 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="signalGlow" cx="50%" cy="50%" r="50%">
          <stop className={styles.stopCore} offset="0%" />
          <stop className={styles.stopEdge} offset="100%" />
        </radialGradient>
      </defs>

      <circle ref={glowRef} className={styles.glow} cx={CX} cy={CY} r="150" />
      <circle ref={pingRef} className={styles.ping} cx={CX} cy={CY} r="70" />

      {RINGS.map((ring, i) => (
        <g
          key={i}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
        >
          <circle
            className={styles.ring}
            style={{ opacity: ring.opacity }}
            cx={CX}
            cy={CY}
            r={ring.r}
            strokeDasharray={ring.dash}
          />
          <circle className={styles.dot} cx={CX + ring.r} cy={CY} r={ring.dotR} />
        </g>
      ))}

      <circle className={styles.core} cx={CX} cy={CY} r="9" />
    </svg>
  );
}

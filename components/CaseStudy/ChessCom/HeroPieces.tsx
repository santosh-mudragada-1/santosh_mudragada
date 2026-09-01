'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { pieceImage } from '@/components/CaseStudy/chess/fen';
import styles from './HeroPieces.module.scss';

// Scattered around the layout (never over the headline), each drifting toward
// the cursor with its own weight, on top of a slow idle bob.
// four corners — well clear of the centred-left copy at every width
const PIECES = [
  { p: 'n', x: '2%', y: '9%', s: 1, str: 0.06, rot: -11, dur: 7 },
  { p: 'r', x: '92%', y: '4%', s: 0.66, str: 0.04, rot: 13, dur: 7.8 },
  { p: 'b', x: '3%', y: '89%', s: 0.8, str: 0.05, rot: 15, dur: 6.4 },
  { p: 'q', x: '91%', y: '87%', s: 0.72, str: 0.07, rot: -7, dur: 9 },
];

export function HeroPieces({ hostRef }: { hostRef: RefObject<HTMLElement> }) {
  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const refs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (isTouch || reduced) return;
    const host = hostRef.current;
    const els = refs.current.filter(Boolean) as HTMLSpanElement[];
    if (!host || !els.length) return;

    const q = els.map((el) => ({
      x: gsap.quickTo(el, '--mx', { duration: 0.75, ease: 'power3' }),
      y: gsap.quickTo(el, '--my', { duration: 0.75, ease: 'power3' }),
    }));

    const MAX = 42;
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      els.forEach((el, i) => {
        const b = el.getBoundingClientRect();
        const px = b.left - r.left + b.width / 2;
        const py = b.top - r.top + b.height / 2;
        const str = PIECES[i].str;
        const dx = Math.max(-MAX, Math.min(MAX, (cx - px) * str));
        const dy = Math.max(-MAX, Math.min(MAX, (cy - py) * str));
        q[i].x(dx);
        q[i].y(dy);
      });
    };
    const home = () =>
      q.forEach((t) => {
        t.x(0);
        t.y(0);
      });

    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', home);
    return () => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', home);
      gsap.killTweensOf(els);
    };
  }, [isTouch, reduced, hostRef]);

  return (
    <div className={styles.field} aria-hidden>
      {PIECES.map((f, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={styles.piece}
          style={{ left: f.x, top: f.y }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pieceImage(f.p)}
            alt=""
            draggable={false}
            style={
              {
                width: `calc(${f.s} * clamp(44px, 5.5vw, 100px))`,
                '--rot': `${f.rot}deg`,
                '--dur': `${f.dur}s`,
                '--delay': `${0.4 + i * 0.15}s`,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}

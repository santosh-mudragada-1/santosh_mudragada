'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useWorkNav } from '@/lib/hooks/useWorkNav';
import { useNavContrast } from '@/lib/hooks/useNavContrast';
import { ALT, src as photoSrc } from '@/components/AboutStory/story';
import styles from './NotFound.module.scss';

const DIGITS = ['4', '0', '4'];
const LOST_PHOTO = 'qui-mist-house'; // "half lost in mist" — does the job literally

// GSAP's color tween needs a real value, not a var() reference.
const FG_DARK = '#f4f0e9'; // --paper, i.e. --fg inside .theme-dark
const ACCENT = '#ff4d1a'; // --orange-500 / --accent

export function NotFound() {
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouch();

  const rootRef = useRef<HTMLDivElement>(null);
  const digitRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const lostRef = useRef<HTMLElement>(null);

  // --- entrance ------------------------------------------------------------
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const digits = q<HTMLElement>(`.${styles.digit}`);
      const rest = q<HTMLElement>(`.${styles.eyebrow}, .${styles.heading}, .${styles.copy}, .${styles.actions}`);
      const lost = lostRef.current;

      if (reduced) {
        gsap.set([...digits, ...rest], { clearProps: 'all' });
        if (lost) gsap.set(lost, { clearProps: 'all' });
        return;
      }

      gsap.set(digits, { autoAlpha: 0, y: 40 });
      gsap.set(rest, { autoAlpha: 0, y: 18 });
      if (lost) gsap.set(lost, { autoAlpha: 0, y: 20, rotate: 16 });

      const tl = gsap.timeline({ delay: 0.1 });
      tl.to(digits, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.07,
      })
        .to(rest, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 }, 0.35)
        .to(
          lost ? [lost] : [],
          { autoAlpha: 1, y: 0, rotate: 7, duration: 0.9, ease: 'power3.out' },
          0.5,
        );

      return () => {
        tl.progress(1).kill();
      };
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  // --- digits push away from the cursor within a radius, tinting orange ---
  useEffect(() => {
    if (isTouch || reduced) return;
    const root = rootRef.current;
    const els = digitRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!root || els.length !== DIGITS.length) return;

    const RADIUS = 220;
    const MAX_PUSH = 30;
    const MAX_SKEW = 7;

    const movers = els.map((el) => ({
      el,
      rect: el.getBoundingClientRect(),
      near: false,
      xTo: gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }),
      yTo: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' }),
      skewTo: gsap.quickTo(el, 'skewX', { duration: 0.5, ease: 'power3' }),
    }));

    // rects are captured at rest (pre-transform); refresh on layout changes
    const remeasure = () => movers.forEach((m) => (m.rect = m.el.getBoundingClientRect()));
    window.addEventListener('resize', remeasure);
    window.addEventListener('scroll', remeasure, { passive: true });

    const release = (m: (typeof movers)[number]) => {
      m.xTo(0);
      m.yTo(0);
      m.skewTo(0);
      if (m.near) {
        m.near = false;
        gsap.to(m.el, { color: FG_DARK, duration: 0.5, overwrite: 'auto' });
      }
    };

    const onMove = (e: PointerEvent) => {
      movers.forEach((m) => {
        const cx = m.rect.left + m.rect.width / 2;
        const cy = m.rect.top + m.rect.height / 2;
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const dist = Math.hypot(dx, dy);
        if (dist < RADIUS) {
          const f = 1 - dist / RADIUS;
          const ang = Math.atan2(dy, dx);
          m.xTo(Math.cos(ang) * MAX_PUSH * f);
          m.yTo(Math.sin(ang) * MAX_PUSH * f);
          m.skewTo(Math.cos(ang) * MAX_SKEW * f);
          if (!m.near) {
            m.near = true;
            gsap.to(m.el, { color: ACCENT, duration: 0.3, overwrite: 'auto' });
          }
        } else if (m.near) {
          release(m);
        }
      });
    };
    const onLeave = () => movers.forEach(release);

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('scroll', remeasure);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      movers.forEach((m) => gsap.killTweensOf(m.el));
    };
  }, [isTouch, reduced]);

  // --- the lost photo drifts slowly, on its own, always -------------------
  useGSAP(
    () => {
      if (reduced) return;
      const lost = lostRef.current;
      if (!lost) return;
      const tw = gsap.to(lost, {
        y: '+=10',
        rotate: '+=1.6',
        duration: 3.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
      return () => {
        tw.kill();
      };
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  const onWorkNav = useWorkNav();
  useNavContrast(rootRef);

  return (
    <div ref={rootRef} className={`${styles.root} theme-dark`} data-theme="dark">
      <p className={styles.eyebrow}>— Error</p>

      <h1 className={styles.digits} aria-label="404">
        {DIGITS.map((ch, i) => (
          <span
            key={i}
            ref={(el) => {
              digitRefs.current[i] = el;
            }}
            className={styles.digit}
            aria-hidden
          >
            {ch}
          </span>
        ))}
      </h1>

      <p className={styles.heading}>This isn&rsquo;t a case study.</p>
      <p className={styles.copy}>
        You somehow ended up somewhere I haven&rsquo;t designed yet.
      </p>

      <div className={styles.actions}>
        <Link href="/" className={styles.action} data-dir="back" data-cursor="link">
          <span aria-hidden>←</span> Take me home
        </Link>
        <Link
          href="/#work"
          className={styles.action}
          data-dir="forward"
          data-cursor="link"
          onClick={onWorkNav}
        >
          Back to work <span aria-hidden>→</span>
        </Link>
      </div>

      <div className={styles.lostWrap}>
        <figure ref={lostRef} className={styles.lost} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc(LOST_PHOTO)}
            alt={ALT[LOST_PHOTO] ?? ''}
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </figure>
      </div>
    </div>
  );
}

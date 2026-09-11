'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useNavContrast } from '@/lib/hooks/useNavContrast';
import { Magnetic } from '@/components/Magnetic';
import { SITE, SOCIALS } from '@/lib/constants/site';
import { ALT, src as photoSrc } from '@/components/AboutStory/story';
import styles from './Contact.module.scss';

// Reuses two frames from the /about manifest (public/about/*.webp) — real
// photographs, not stock. Side-on and looking out for the hero (the "what's
// next" beat); the two social rows that get a swatch get something that
// actually reads as "the work" / "the rest of it".
const HERO_PHOTO = 'open-clouds';
const SWATCH: Partial<Record<string, string>> = {
  LinkedIn: 'eng-team',
  Instagram: 'trv-halong',
};

const COPY_RESET_MS = 1800;

export function Contact() {
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouch();
  const [copied, setCopied] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);

  // the hero + elsewhere sections are full-bleed dark — flip the fixed nav
  // to light while either sits under the header band
  useNavContrast(rootRef);

  // --- entrance: headline lines + sub-copy + photo wipe -------------------
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const lines = q<HTMLElement>(`.${styles.line} > span`);
      const sub = q<HTMLElement>(`.${styles.heroSub}`);
      const wrap = q<HTMLElement>(`.${styles.heroPhotoWrap}`);
      const cue = q<HTMLElement>(`.${styles.scrollCue}`);

      if (reduced) {
        gsap.set([...lines, ...sub, ...cue], { clearProps: 'all' });
        gsap.set(wrap, { clipPath: 'inset(0 0 0 0)' });
        return;
      }

      gsap.set(lines, { yPercent: 115 });
      gsap.set(sub, { autoAlpha: 0, y: 18 });
      gsap.set(cue, { autoAlpha: 0 });

      const tl = gsap.timeline({ delay: 0.1 });
      tl.to(lines, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.09 })
        .to(
          wrap,
          { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.out' },
          0.1,
        )
        .to(sub, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.45)
        .to(cue, { autoAlpha: 1, duration: 0.6 }, 0.9);

      return () => {
        tl.progress(1).kill();
      };
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  // --- hero photo drifts a few px against the cursor ----------------------
  useEffect(() => {
    if (isTouch || reduced) return;
    const hero = heroRef.current;
    const photo = photoRef.current;
    if (!hero || !photo) return;

    const MAX = 16;
    const xTo = gsap.quickTo(photo, 'x', { duration: 0.8, ease: 'power3' });
    const yTo = gsap.quickTo(photo, 'y', { duration: 0.8, ease: 'power3' });

    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      xTo(nx * MAX * -1);
      yTo(ny * MAX * -1);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    hero.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', onLeave);
    return () => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(photo);
    };
  }, [isTouch, reduced]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      /* clipboard unavailable — the address is still selectable as plain text */
    }
  };

  return (
    <div ref={rootRef} className={styles.root}>
      {/* ------------------------------------------------------------- hero */}
      <section ref={heroRef} className={`${styles.hero} theme-dark`} data-theme="dark">
        <p className={styles.eyebrow}>— Contact</p>
        <h1 className={styles.headline}>
          <span className={styles.line}>
            <span>Let&rsquo;s make</span>
          </span>
          <span className={styles.line}>
            <span>
              something<span className={styles.dot}>.</span>
            </span>
          </span>
        </h1>
        <p className={styles.heroSub}>
          A new product, a redesign, or a hard interaction problem worth
          talking through. I read everything myself.
        </p>
        <span className={styles.scrollCue} aria-hidden>
          Scroll
        </span>

        <div className={styles.heroPhotoWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={photoRef}
            className={styles.heroPhoto}
            src={photoSrc(HERO_PHOTO)}
            alt={ALT[HERO_PHOTO] ?? ''}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
            data-cursor="view"
          />
        </div>
      </section>

      {/* --------------------------------------------------------- direct line */}
      <section className={styles.cta}>
        <p className={styles.eyebrow}>Direct line</p>
        <h2 className={styles.ctaHeadline}>
          Got something
          <br />
          in mind?
        </h2>

        <Magnetic strength={0.06} max={14}>
          <button
            type="button"
            className={styles.email}
            onClick={copyEmail}
            data-cursor="hi"
            data-cursor-sticky
            aria-label={`Copy email address ${SITE.email}`}
          >
            <span className={styles.emailText}>
              {SITE.email.split('@')[0]}@<wbr />
              {SITE.email.split('@')[1]}
            </span>
            <span className={styles.arrow} aria-hidden>
              →
            </span>
          </button>
        </Magnetic>

        <p className={styles.ctaSub} data-copied={copied || undefined} aria-live="polite">
          {copied ? 'Copied ✓' : 'Typically replies in a day or two.'}
        </p>
      </section>

      {/* ------------------------------------------------------------ elsewhere */}
      <section className={`${styles.socials} theme-dark`} data-theme="dark">
        <p className={styles.eyebrow}>Elsewhere</p>

        <div className={styles.rows}>
          {SOCIALS.map((s, i) => {
            const swatch = SWATCH[s.label];
            const external = !s.href.startsWith('/');
            const content = (
              <>
                <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.label}>{s.label}</span>
                {swatch && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className={styles.swatch}
                    src={photoSrc(swatch)}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                )}
                <span className={styles.rowArrow} aria-hidden>
                  →
                </span>
              </>
            );
            return external ? (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className={styles.row}
                data-cursor={swatch ? 'view' : 'link'}
              >
                {content}
              </a>
            ) : (
              <Link
                key={s.label}
                href={s.href}
                className={styles.row}
                data-cursor={swatch ? 'view' : 'link'}
              >
                {content}
              </Link>
            );
          })}
        </div>

        <p className={styles.closing}>
          Everywhere else I show up<span className={styles.dot}>.</span>
        </p>
      </section>
    </div>
  );
}

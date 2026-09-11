'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useNavContrast } from '@/lib/hooks/useNavContrast';
import { Magnetic } from '@/components/Magnetic';
import { SITE, SOCIALS } from '@/lib/constants/site';
import { src as photoSrc } from '@/components/AboutStory/story';
import styles from './Contact.module.scss';

// Reuses a frame from the /about manifest (public/about/*.webp) — real
// photographs, not stock — for the two social rows that get a swatch, so
// they read as "the work" / "the rest of it".
const SWATCH: Partial<Record<string, string>> = {
  LinkedIn: 'eng-team',
  Instagram: 'trv-halong',
};

const COPY_RESET_MS = 1800;

// Soft-break hints for the giant email so a long address wraps at a sensible
// point — after "@", and after the first "." (the local part, if it has
// one) — instead of `overflow-wrap: anywhere` picking an arbitrary mid-word
// spot on narrow screens. A zero-width space is an invisible break
// opportunity; written as an escape (not pasted in literally) so it stays
// visible/greppable in source instead of silently vanishing in an editor.
const ZWSP = '\u200B';
const EMAIL_DISPLAY = SITE.email.replace('.', `.${ZWSP}`).replace('@', `@${ZWSP}`);

export function Contact() {
  const [copied, setCopied] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);

  // the hero + elsewhere sections are full-bleed dark — flip the fixed nav
  // to light while either sits under the header band
  useNavContrast(rootRef);

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
      <section className={`${styles.hero} theme-dark`} data-theme="dark">
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
            <span className={styles.emailText}>{EMAIL_DISPLAY}</span>
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

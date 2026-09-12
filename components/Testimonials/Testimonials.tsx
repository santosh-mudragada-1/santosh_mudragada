'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { TESTIMONIALS, type Testimonial } from '@/lib/content/testimonials';
import styles from './Testimonials.module.scss';

/**
 * Profile card + testimonial card, repeated, riding one infinite marquee:
 * the sequence is duplicated exactly once and the track is translated by
 * the exact measured pixel distance from the start of copy A to the start
 * of copy B, repeating — see the long comment on the marquee effect below
 * for why that's measured rather than assumed as 50% of the track (Footer's
 * "Start a project" strip trick), which doesn't hold once `gap` is involved.
 *
 * Hovering the strip smoothly ramps the marquee's timeScale to 0 instead of
 * hard-pausing it — same technique as Footer's `rampMarquee` — so nothing
 * ever jumps. The marquee keeps running even while a note is expanded, so
 * reading one never feels like it stalled the section.
 *
 * Touch devices and reduced-motion get the same cards in a plain,
 * horizontally-scrollable (not looping) row instead — no GSAP at all.
 */
export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const marqueeTween = useRef<gsap.core.Tween | null>(null);

  const reduced = usePrefersReducedMotion();
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const richMode = mounted && canHover && !reduced;

  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const bodyRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const thumbRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggle = useCallback((key: string) => {
    setExpandedKey((k) => (k === key ? null : key));
  }, []);

  // A fully custom scroll thumb for the open note — not the native/OS
  // scrollbar, which kept fading when idle even after styling it (some
  // browser/OS combinations auto-hide it regardless of CSS). This is drawn
  // once immediately on open (so it's visible even before any scrolling)
  // and just repositioned on scroll/resize; it never fades on its own.
  useEffect(() => {
    if (!expandedKey) return;
    const body = bodyRefs.current[expandedKey];
    const thumb = thumbRefs.current[expandedKey];
    if (!body || !thumb) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = body;
      if (scrollHeight <= clientHeight + 1) {
        thumb.style.opacity = '0';
        return;
      }
      const thumbHeight = Math.max(24, (clientHeight / scrollHeight) * clientHeight);
      const maxTop = clientHeight - thumbHeight;
      const top = (scrollTop / (scrollHeight - clientHeight)) * maxTop;
      thumb.style.opacity = '1';
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${top}px)`;
    };

    update();
    body.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      body.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [expandedKey]);

  const applyPause = useCallback((paused: boolean) => {
    const tween = marqueeTween.current;
    if (!tween) return;
    gsap.to(tween, {
      timeScale: paused ? 0 : 1,
      duration: paused ? 0.5 : 0.7,
      ease: 'power2.out',
    });
  }, []);

  // The infinite marquee. NOT `xPercent: -50` (Footer's trick for its
  // marquee) — that assumes the two duplicated copies sit at an exact
  // half-and-half split of the track's total width, which is only true
  // if there's zero `gap` between items. With `gap` between all 10 pairs
  // (9 gaps — an odd number) plus the track's own edge padding, the real
  // midpoint of the track lands a bit off from the actual seam between
  // copy A and copy B, by a consistent, non-trivial number of pixels. On
  // Footer's identically-repeating text that's invisible; on 5 distinct,
  // recognisable people it read as the whole strip visibly snapping once
  // a loop ("Vanshika glitching"/"looks like it's resetting"). Fixed by
  // measuring the real DOM distance from the start of copy A to the start
  // of copy B and animating exactly that many pixels, instead of assuming
  // it's half the track.
  useGSAP(
    () => {
      if (!richMode) return;
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;

      let tween: gsap.core.Tween | null = null;

      const build = () => {
        tween?.kill();
        // Measured from the FIRST PAIR (copy A), not `track` itself — `track`
        // has its own `padding-inline`, and measuring from its edge silently
        // added that padding on top of the real distance, overshooting the
        // seam by a constant amount every cycle (a bigger, more obvious
        // version of the exact bug this replaced).
        const firstOfCopyA = track.children[0] as HTMLElement | undefined;
        const firstOfCopyB = track.children[TESTIMONIALS.length] as
          | HTMLElement
          | undefined;
        const shift =
          firstOfCopyA && firstOfCopyB
            ? firstOfCopyB.getBoundingClientRect().left -
              firstOfCopyA.getBoundingClientRect().left
            : track.scrollWidth / 2;

        tween = gsap.to(track, {
          x: -shift,
          duration: 55,
          ease: 'none',
          repeat: -1,
        });
        marqueeTween.current = tween;
      };

      build();
      // card widths are viewport-relative (clamp/vw), so the exact seam
      // distance shifts on resize — rebuild rather than let it drift stale.
      window.addEventListener('resize', build);

      const onEnter = () => applyPause(true);
      const onLeave = () => applyPause(false);
      viewport.addEventListener('pointerenter', onEnter);
      viewport.addEventListener('pointerleave', onLeave);

      return () => {
        window.removeEventListener('resize', build);
        viewport.removeEventListener('pointerenter', onEnter);
        viewport.removeEventListener('pointerleave', onLeave);
        tween?.kill();
        marqueeTween.current = null;
      };
    },
    { scope: sectionRef, dependencies: [richMode, applyPause] },
  );

  // No scroll-triggered entrance animation here on purpose: an earlier
  // opacity fade-in (CSS keyframe kicked off by an IntersectionObserver)
  // caused a visible flash — the leading card (Vanshika) was often already
  // on screen at the moment the observer fired, so it snapped from fully
  // visible to opacity:0 and back. Cards are just always opacity: 1; the
  // marquee's own motion plus the hover-lift is enough life for this strip.

  const sequence: Testimonial[] = TESTIMONIALS;
  const rendered = richMode ? [...sequence, ...sequence] : sequence;

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Testimonials">
      <div className={styles.head}>
        <span className={styles.kicker}>
          <span className={styles.arrow} aria-hidden>
            ↓
          </span>{' '}
          Testimonials — five voices
        </span>
        <h2 className={styles.title}>In their words, not mine.</h2>
        <p className={styles.intro}>
          A short list of people I&rsquo;ve shipped things with. Hover to pause on
          anyone — tap a note to read the rest.
        </p>
      </div>

      <div
        ref={viewportRef}
        className={styles.viewport}
        data-mode={richMode ? 'marquee' : 'scroll'}
      >
        <div ref={trackRef} className={styles.track}>
          {rendered.map((t, i) => {
            const copy = i < sequence.length ? 'a' : 'b';
            const key = `${t.id}-${copy}`;
            const panelId = `testimonial-panel-${key}`;
            const isOpen = expandedKey === key;

            return (
              <div
                className={styles.pair}
                key={key}
                aria-hidden={copy === 'b' || undefined}
              >
                <div className={styles.profile}>
                  <div className={styles.profileImg}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.illustration} alt="" draggable={false} />
                  </div>
                  <span className={styles.profileScrim} data-tone={t.tone} />
                  <div className={styles.profileFoot}>
                    <span className={styles.profileName}>{t.name.split(' ')[0]}</span>
                    <p className={styles.profileQuote}>&ldquo;{t.summary}&rdquo;</p>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <span className={styles.cardThumb} data-tone={t.tone}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.illustration} alt="" draggable={false} />
                    </span>
                    <div className={styles.cardWho}>
                      <span className={styles.cardName}>{t.name}</span>
                      <span className={styles.cardRole}>
                        {t.role}, {t.company}
                      </span>
                    </div>
                    <span className={styles.cardNum}>{t.number}</span>
                  </div>

                  <div className={styles.cardBodyWrap} data-open={isOpen || undefined}>
                    <div
                      id={panelId}
                      ref={(el) => {
                        bodyRefs.current[key] = el;
                      }}
                      className={styles.cardBody}
                      data-open={isOpen || undefined}
                      // Only while THIS card is open — applied unconditionally
                      // it made Lenis bypass its smooth scroll for a wheel
                      // event over ANY card (even closed ones, with nothing
                      // to scroll), which felt like scrolling the page itself
                      // had gone janky/inconsistent near this section.
                      data-lenis-prevent={isOpen || undefined}
                    >
                      <div className={styles.cardText}>
                        {t.full.map((p, k) => (
                          <p key={k}>{p}</p>
                        ))}
                      </div>
                    </div>
                    {isOpen && (
                      <div className={styles.scrollTrack} aria-hidden>
                        <div
                          className={styles.scrollThumb}
                          ref={(el) => {
                            thumbRefs.current[key] = el;
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFoot}>
                    <button
                      type="button"
                      className={styles.more}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      tabIndex={copy === 'b' ? -1 : undefined}
                      onClick={() => toggle(key)}
                    >
                      {isOpen ? 'Show less' : 'Read the full note'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

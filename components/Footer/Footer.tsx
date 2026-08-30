'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { useIsWebKit } from '@/lib/hooks/useIsWebKit';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useSmoothScroll } from '@/lib/smooth-scroll';
import { Magnetic } from '@/components/Magnetic';
import { NAV_LINKS, SITE, SOCIALS } from '@/lib/constants/site';
import styles from './Footer.module.scss';

const CW = 1000;
const CTRL = 320; // control-point depth at full bulge — a gentle cap, not a balloon
const curvePath = (d: number) =>
  `M0 -80 L ${CW} -80 L ${CW} 0 Q ${CW / 2} ${d * CTRL} 0 0 Z`;

// three spans always. Desktop sets the first two side-by-side ("Let's make" /
// "something"); tablet + mobile stack all three, filling the pinned 90svh box.
const LINES = ["Let's", 'make', 'something'];
const MARQUEE = 'Start a project';

/**
 * Contact + footer merged (Dennis-style): the big headline and the marquee
 * strip sit at the top, everything else (direct address, nav links, legal) at
 * the bottom. A curved light cap sits over the seam and casts a soft shadow
 * down onto the footer.
 */
export function Footer() {
  const { scrollTo } = useSmoothScroll();
  const reduced = usePrefersReducedMotion();
  const isWebKit = useIsWebKit();
  const rootRef = useRef<HTMLElement>(null);
  const curveRef = useRef<SVGPathElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeTween = useRef<gsap.core.Tween | null>(null);
  const [copied, setCopied] = useState(false);
  const year = new Date().getFullYear();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  useGSAP(
    () => {
      const path = curveRef.current;
      if (path) {
        if (reduced) {
          path.setAttribute('d', curvePath(0));
        } else {
          const proxy = { d: 1 };
          path.setAttribute('d', curvePath(1));
          gsap.to(proxy, {
            d: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: true,
            },
            onUpdate: () => path.setAttribute('d', curvePath(proxy.d)),
          });
        }
      }

      if (!reduced) {
        gsap.fromTo(
          innerRef.current,
          { y: -70 },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top bottom',
              end: 'top 45%',
              scrub: true,
            },
          },
        );
        gsap.from(rootRef.current!.querySelectorAll(`.${styles.line}`), {
          yPercent: 115,
          duration: 1,
          ease: 'power4.out',
          stagger: 0.08,
          scrollTrigger: { trigger: rootRef.current, start: 'top 72%' },
        });
      }

      const marquee = gsap.to(marqueeRef.current, {
        xPercent: -50,
        duration: reduced ? 90 : 24,
        ease: 'none',
        repeat: -1,
      });
      marqueeTween.current = marquee;

      return () => {
        marquee.kill();
        marqueeTween.current = null;
      };
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  // Safari only: an infinite tween running from mount keeps the compositor busy
  // for the whole session. Pause it while the footer is off-screen — identical
  // once it resumes. Kept OUT of the useGSAP above so it can't force that block
  // (and the one-shot headline reveal's ScrollTrigger) to revert + recreate.
  useEffect(() => {
    if (!isWebKit) return;
    const root = rootRef.current;
    const tween = marqueeTween.current;
    if (!root || !tween) return;

    tween.pause();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tween.play();
        else tween.pause();
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      // un-park it if this effect (not the component) is tearing down; skip if
      // useGSAP already replaced/killed the tween
      if (marqueeTween.current === tween) tween.play();
    };
  }, [isWebKit, reduced]);

  const rampMarquee = (to: number) => {
    if (marqueeTween.current) {
      gsap.to(marqueeTween.current, {
        timeScale: to,
        duration: to > 1 ? 0.4 : 0.7,
        ease: 'power2.out',
      });
    }
  };

  return (
    <footer ref={rootRef} className={`${styles.footer} theme-dark`}>
      <svg
        className={styles.curve}
        viewBox={`0 -80 ${CW} 460`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path ref={curveRef} d={curvePath(0)} />
      </svg>

      <div ref={innerRef} className={styles.inner}>
        <h2 className={styles.headline}>
          {LINES.map((text, i) => (
            <span key={i} className={styles.lineMask}>
              <span className={styles.line}>
                {text}
                {i === LINES.length - 1 && (
                  <span className={styles.square} aria-hidden />
                )}
              </span>
            </span>
          ))}
        </h2>

        <a
          href={`mailto:${SITE.email}`}
          className={styles.band}
          data-cursor="hi"
          data-cursor-sticky
          aria-label="Start a project"
          onPointerEnter={() => rampMarquee(reduced ? 1.6 : 3)}
          onPointerLeave={() => rampMarquee(1)}
        >
          <span className={styles.bandMeta} data-pos="tl">
            Reply within two working days
          </span>
          <div ref={marqueeRef} className={styles.marquee} aria-hidden>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i}>
                {MARQUEE}
                <span className={styles.star}>✳</span>
              </span>
            ))}
          </div>
          <span className={styles.bandMeta} data-pos="br">
            {SITE.email}
          </span>
        </a>

        <div className={styles.direct}>
          <span className={styles.label}>Direct</span>
          <Magnetic strength={0.15}>
            <a
              href={`mailto:${SITE.email}`}
              className={styles.email}
              data-cursor-reveal
              data-cursor-sticky
            >
              {SITE.email}
            </a>
          </Magnetic>
          <Magnetic strength={0.15}>
            <button
              type="button"
              className={styles.copy}
              data-cursor-reveal
              data-cursor-sticky
              onClick={copy}
            >
              {copied ? 'Copied' : 'Copy address'}
            </button>
          </Magnetic>
          <div className={styles.socials}>
            {SOCIALS.map((s) => (
              <Magnetic key={s.label} strength={0.15}>
                <a
                  href={s.href}
                  className={styles.social}
                  data-cursor-reveal
                  data-cursor-sticky
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.label}
                </a>
              </Magnetic>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <nav className={styles.bottomNav} aria-label="Footer">
            <Magnetic strength={0.15} className={styles.navPage}>
              <Link href="/" data-cursor-reveal data-cursor-sticky>
                Home
              </Link>
            </Magnetic>
            {NAV_LINKS.map((l) => (
              <Magnetic key={l.href} strength={0.15} className={styles.navPage}>
                <Link href={l.href} data-cursor-reveal data-cursor-sticky>
                  {l.label}
                </Link>
              </Magnetic>
            ))}
            <Magnetic strength={0.15}>
              <button
                type="button"
                className={styles.toTop}
                data-cursor-reveal
                data-cursor-sticky
                onClick={() => scrollTo(0)}
              >
                Back to top ↑
              </button>
            </Magnetic>
          </nav>
          <p className={styles.legal}>
            <span>
              © {year} {SITE.fullName}
            </span>
            <span>{SITE.role}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { Fragment, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap/gsap';
import { getLenisInstance } from '@/lib/smooth-scroll';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Figure } from './Figure';
import { TravelReel } from './TravelReel';
import { PhotoRoll } from './PhotoRoll';
import {
  ADVENTURE,
  CARE,
  COFFEE,
  ENDING,
  ENGINEERING,
  OPENING,
  ORIGIN,
  PEOPLE,
  PHOTOGRAPHY,
  PRESENT,
  QUIET,
  SR_PARAGRAPHS,
  TRAVEL,
} from './story';
import styles from './AboutStory.module.scss';

/* --------------------------------------------------------------------------
 * Small shared bits
 * ------------------------------------------------------------------------ */

/** render `*word*` in the accent face, matching the rest of the site */
function Accent({ children }: { children: string }) {
  return (
    <>
      {children.split('*').map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} className={styles.accent}>
            {part}
          </em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** a stack of narration lines that each rise in on scroll */
function Narration({
  lines,
  className,
  as: Tag = 'p',
}: {
  lines: string[];
  className?: string;
  as?: 'p' | 'h2' | 'h3';
}) {
  return (
    <div className={[styles.narration, className].filter(Boolean).join(' ')}>
      {lines.map((l, i) => (
        <Tag key={i} className={styles.line} data-reveal="">
          <Accent>{l}</Accent>
        </Tag>
      ))}
    </div>
  );
}

function Chapter({ n, title }: { n: string; title: string[] }) {
  return (
    <header className={styles.chapter}>
      <span className={styles.chapterNo} data-reveal="">
        {n}
      </span>
      <h2 className={styles.chapterTitle}>
        {title.map((t, i) => (
          <span key={i} className={styles.chapterLine} data-reveal="">
            <Accent>{t}</Accent>
          </span>
        ))}
      </h2>
    </header>
  );
}

/* --------------------------------------------------------------------------
 * Sections
 * ------------------------------------------------------------------------ */

function Opening() {
  return (
    <section className={styles.opening} data-theme="dark" aria-label="Opening">
      <div className={styles.openingMedia}>
        <Figure
          slug="open-clouds"
          priority
          bare
          cover
          sizes="100vw"
          parallax={16}
          className={styles.openingFig}
        />
        <div className={styles.openingScrim} aria-hidden />
      </div>

      <div className={styles.openingCopy}>
        <p className={styles.kicker}>{OPENING.kicker}</p>
        <h1 className={styles.openingHeadline}>
          {OPENING.headline.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </h1>
      </div>

      <p className={styles.scrollCue} aria-hidden>
        <span />
        scroll
      </p>
    </section>
  );
}

function Thesis() {
  return (
    <section className={styles.thesis} aria-label="In short">
      <p className={styles.thesisLine} data-reveal="">
        {OPENING.thesis}
      </p>
      <p className={styles.thesisSub} data-reveal="">
        {OPENING.sub}
      </p>
    </section>
  );
}

function Origin() {
  return (
    <section className={styles.origin} aria-label="Where I'm from">
      <Narration lines={ORIGIN.lines} className={styles.originText} />
    </section>
  );
}

function Engineering() {
  return (
    <section className={styles.section} aria-labelledby="about-eng">
      <div id="about-eng">
        <Chapter n={ENGINEERING.chapter} title={ENGINEERING.title} />
      </div>

      <div className={styles.engTop}>
        <Figure
          slug="eng-plane"
          sizes="(max-width: 900px) 82vw, 40vw"
          parallax={8}
          className={styles.engPlane}
        />
        <Narration lines={ENGINEERING.intro} className={styles.engIntro} />
      </div>

      <div className={styles.engPair}>
        <Figure
          slug="eng-team"
          caption="Model-aircraft competition. We came away with the small trophy."
          sizes="(max-width: 900px) 88vw, 52vw"
          className={styles.engTeam}
        />
        <Figure
          slug="eng-nose"
          sizes="(max-width: 900px) 66vw, 34vw"
          parallax={12}
          secret="nobody remembers whose idea the pose was."
          className={`${styles.engNose} ${styles.smHide}`}
        />
      </div>

      <p className={styles.para} data-reveal="">
        {ENGINEERING.transition}
      </p>

      <blockquote className={styles.pull} data-reveal="">
        {ENGINEERING.pull}
      </blockquote>

      <Figure
        slug="eng-wing-sky"
        sizes="100vw"
        parallax={18}
        cover
        className={styles.bleed}
        caption="Window seat. Somewhere over the middle of nowhere."
      />
    </section>
  );
}

function People() {
  return (
    <section className={styles.section} aria-labelledby="about-people">
      <div id="about-people">
        <Chapter n={PEOPLE.chapter} title={PEOPLE.title} />
      </div>

      <Figure
        slug="ppl-beach"
        sizes="(max-width: 1024px) 92vw, 960px"
        parallax={11}
        className={styles.pplBeach}
        secret="about a second after this, we were all in."
      />

      <div className={styles.pplGrid}>
        <Narration lines={PEOPLE.lines} className={styles.pplText} />
        <Figure
          slug="ppl-sunset"
          sizes="(max-width: 900px) 88vw, 44vw"
          parallax={9}
          className={styles.pplSunset}
        />
        <Figure
          slug="ppl-forest"
          caption={PEOPLE.caption}
          sizes="(max-width: 900px) 88vw, 50vw"
          parallax={7}
          className={styles.pplForest}
        />
        <Figure
          slug="ppl-fair"
          sizes="(max-width: 900px) 46vw, 22vw"
          parallax={14}
          className={`${styles.pplFair} ${styles.smHide}`}
        />
      </div>
    </section>
  );
}

function TravelIntro() {
  return (
    <section className={styles.section} aria-labelledby="about-travel">
      <div id="about-travel">
        <Chapter n={TRAVEL.chapter} title={TRAVEL.title} />
      </div>
      <Narration lines={TRAVEL.lines} className={styles.wideText} />
    </section>
  );
}

function TravelClose() {
  return (
    <section className={styles.midStatement} aria-label="On travel">
      <p className={styles.midLine} data-reveal="">
        {TRAVEL.close}
      </p>
    </section>
  );
}

function PhotographyIntro() {
  return (
    <section className={styles.section} aria-labelledby="about-photo">
      <div id="about-photo">
        <Chapter n={PHOTOGRAPHY.chapter} title={PHOTOGRAPHY.title} />
      </div>
      <Narration lines={PHOTOGRAPHY.lines} className={styles.wideText} />
    </section>
  );
}

function Coffee() {
  return (
    <section className={styles.coffee} aria-label="Slow moments">
      <Figure
        slug="cof-breakfast"
        sizes="(max-width: 900px) 88vw, 46vw"
        parallax={6}
        secret="i ate the other croissant too."
        className={styles.coffeeFig}
      />
      <p className={styles.coffeeLine} data-reveal="">
        {COFFEE.line}
      </p>
      <p className={styles.coffeeSmall} data-reveal="">
        {COFFEE.small}
      </p>
    </section>
  );
}

function Adventure() {
  return (
    <section className={styles.section} aria-labelledby="about-adv">
      <div id="about-adv">
        <Chapter n={ADVENTURE.chapter} title={ADVENTURE.title} />
      </div>

      <div className={styles.advScatter}>
        <Figure slug="adv-kayak" sizes="(max-width: 900px) 88vw, 42vw" parallax={8} className={styles.adv1} />
        <Figure slug="adv-moto-rocks" sizes="(max-width: 900px) 80vw, 38vw" parallax={11}
          secret="that is a road. technically." className={styles.adv2} />
        <Narration lines={ADVENTURE.lines} className={styles.advText} />
        <Figure slug="adv-coaster" sizes="(max-width: 900px) 56vw, 24vw" parallax={16} className={`${styles.adv3} ${styles.smHide}`} />
        <Figure slug="adv-snowman" sizes="(max-width: 900px) 48vw, 20vw" parallax={13} className={styles.adv4}
          caption="The snowman. Roughly life-size, for an ant." />
        <Figure slug="adv-wings" sizes="(max-width: 900px) 56vw, 24vw" parallax={10} className={`${styles.adv5} ${styles.smHide}`} />
      </div>

      <p className={styles.para} data-reveal="">
        {ADVENTURE.close}
      </p>
    </section>
  );
}

function Quiet() {
  return (
    <section className={styles.section} aria-labelledby="about-quiet">
      <div id="about-quiet">
        <Chapter n={QUIET.chapter} title={QUIET.title} />
      </div>

      <p className={styles.quietLine} data-reveal="">
        {QUIET.lines[0]}
      </p>

      <div className={styles.quietRow}>
        <Figure slug="qui-pines" sizes="(max-width: 900px) 62vw, 30vw" parallax={10}
          secret="yes, i lay in the mud for this one." className={styles.quiPines} />
        <Figure slug="qui-karst" sizes="(max-width: 900px) 62vw, 28vw" parallax={8} className={`${styles.quiKarst} ${styles.smHide}`} />
      </div>

      <p className={`${styles.quietLine} ${styles.quietLineR}`} data-reveal="">
        {QUIET.lines[1]}
      </p>

      {/* wrapper is a marker so the fixed nav flips to white over this dark frame */}
      <div data-theme="dark" className={styles.bleedHost}>
        <Figure slug="qui-sonamarg2" sizes="100vw" parallax={18} cover className={styles.bleed} />
      </div>

      <p className={styles.quietLineWide} data-reveal="">
        {QUIET.lines[2]}
      </p>

      <div className={styles.quietRow}>
        <Figure slug="qui-walk" sizes="(max-width: 900px) 60vw, 26vw" parallax={12} className={styles.quiWalk} />
        <Figure slug="qui-clocktower" sizes="(max-width: 900px) 54vw, 24vw" parallax={9} className={`${styles.quiClock} ${styles.smHide}`} />
        <Figure slug="qui-mist-house" sizes="(max-width: 900px) 78vw, 34vw" parallax={6} className={styles.quiMist} />
      </div>
    </section>
  );
}

function Care() {
  return (
    <section className={styles.care} aria-labelledby="about-care">
      <div id="about-care">
        <Chapter n={CARE.chapter} title={CARE.title} />
      </div>
      <div className={styles.carePair}>
        <Figure slug="care-toddler" framed sizes="(max-width: 900px) 70vw, 30vw" className={styles.care1} />
        <Figure slug="care-peek" framed sizes="(max-width: 900px) 56vw, 24vw" className={styles.care2} />
      </div>
      <p className={styles.careLine} data-reveal="">
        {CARE.line}
      </p>
    </section>
  );
}

function Present() {
  return (
    <section className={styles.present} aria-labelledby="about-present">
      <div id="about-present">
        <Chapter n={PRESENT.chapter} title={PRESENT.title} />
      </div>
      <Narration lines={PRESENT.lines} className={styles.presentText} />
      <p className={styles.presentPull} data-reveal="">
        {PRESENT.pull.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </p>
    </section>
  );
}

function Ending() {
  return (
    <section className={styles.ending} data-theme="dark" aria-label="End">
      <Figure slug="trv-halong-dawn" sizes="100vw" bare cover parallax={16} className={styles.endingFig} />
      <div className={styles.endingScrim} aria-hidden />
      <div className={styles.endingFade} aria-hidden />
      <div className={styles.endingCopy}>
        <p className={styles.endingLine} data-reveal="">
          {ENDING.line}
        </p>
        <Link href={ENDING.ctaHref} className={styles.endingCta} data-cursor="link" data-cursor-sticky>
          {ENDING.cta}
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
            <path
              d="M5 12h13m0 0-5.5-5.5M18 12l-5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
 * Orchestrator
 * ------------------------------------------------------------------------ */

export function AboutStory() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Flip the fixed nav to white while a dark full-bleed section (opening,
  // travel reel, ending) sits under it. Hit-tests the point under the nav each
  // frame — pin-proof, works on every viewport, motion or not.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const html = document.documentElement;
      let raf = 0;

      const update = () => {
        raf = 0;
        const el = document.elementFromPoint(48, 44); // in the header band, left of the wordmark
        const onDark = !!(el && root.contains(el) && el.closest('[data-theme="dark"]'));
        if (onDark) html.dataset.navContrast = 'light';
        else delete html.dataset.navContrast;
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };

      const lenis = getLenisInstance();
      lenis?.on('scroll', onScroll);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      window.addEventListener('transition:complete', update);
      const t = window.setTimeout(update, 80);

      return () => {
        lenis?.off('scroll', onScroll);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        window.removeEventListener('transition:complete', update);
        window.clearTimeout(t);
        if (raf) cancelAnimationFrame(raf);
        delete html.dataset.navContrast;
      };
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      if (reduced) return;
      const root = rootRef.current;
      if (!root) return;

      // --- reveal: crops settle open + inner image un-scales -----------
      // IntersectionObserver-driven (not ScrollTrigger) so a piece of text can
      // never get stranded invisible — the essay is mostly words. Entries that
      // land in the same frame are staggered together for a grouped feel.
      const crops = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
      gsap.set(crops, { autoAlpha: 0 });

      const revealEl = (el: HTMLElement, delay: number) => {
        const img = el.querySelector('img');
        if (img) {
          gsap.to(el, { autoAlpha: 1, duration: 0.9, delay, ease: 'power3.out' });
          gsap.fromTo(
            img,
            { scale: 1.06 },
            { scale: 1, duration: 1.2, delay, ease: 'power3.out' },
          );
        } else {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.9, delay, ease: 'power3.out' },
          );
        }
      };

      let queue: HTMLElement[] = [];
      let flushId = 0;
      const flush = () => {
        flushId = 0;
        queue.forEach((el, i) => revealEl(el, Math.min(i * 0.08, 0.4)));
        queue = [];
      };

      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            io.unobserve(e.target);
            queue.push(e.target as HTMLElement);
          }
          if (queue.length && !flushId) flushId = requestAnimationFrame(flush);
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
      );
      crops.forEach((c) => io.observe(c));

      // --- parallax: images drift within their frame, every viewport --------
      // The image already carries ~24% of vertical headroom (more for the
      // full-bleed frames), so the drift never exposes an edge. Phones and
      // tablets get a gentler amount so it stays a texture, not a lurch.
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const small = window.matchMedia('(max-width: 900px)').matches;
        const layers = gsap.utils.toArray<HTMLElement>('[data-parallax]', root);
        layers.forEach((el) => {
          let amt = parseFloat(getComputedStyle(el).getPropertyValue('--px')) || 8;
          if (small) amt *= 0.58;
          const holder = el.closest('figure') ?? el;
          gsap.fromTo(
            el,
            { yPercent: -amt / 2 },
            {
              yPercent: amt / 2,
              ease: 'none',
              scrollTrigger: {
                trigger: holder,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });

      ScrollTrigger.refresh();

      return () => {
        io.disconnect();
        if (flushId) cancelAnimationFrame(flushId);
        mm.revert();
        gsap.set(crops, { clearProps: 'opacity,visibility,transform' });
      };
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <div ref={rootRef} className={styles.root}>
      {/* real, ordered prose for assistive tech + crawlers — the visible
          headline in <Opening> is the page's single <h1> */}
      <div className={styles.sr}>
        <p>About Santosh Mudragada, beyond the design work.</p>
        {SR_PARAGRAPHS.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <Opening />
      <Thesis />
      <Origin />
      <Engineering />
      <People />
      <TravelIntro />
      <TravelReel />
      <TravelClose />
      <PhotographyIntro />
      <PhotoRoll />
      <Coffee />
      <Adventure />
      <Quiet />
      <Care />
      <Present />
      <Ending />
    </div>
  );
}

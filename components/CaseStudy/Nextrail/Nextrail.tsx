'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { HeroMarquee } from './HeroMarquee';
import { Feed2FlyScroll } from './Feed2FlyScroll';
import styles from './Nextrail.module.scss';

const U = '/nextrail_casestudy/ui';

const PILLS = ['Group project', '7 members', 'UX/UI design', 'AI experience'];

const INSIGHTS = [
  {
    n: '01',
    statement: 'Inspiration lives on social media.',
    body: 'People find where to go through reels, shorts and creator videos far more than through travel sites or blogs. The discovery already happened before any planning tool is opened.',
  },
  {
    n: '02',
    statement: 'Saved content rarely becomes action.',
    body: 'Everyone saves with the intention of coming back to it. Almost no one organises those saves, and most are never opened again.',
  },
  {
    n: '03',
    statement: 'Planning still starts from scratch.',
    body: 'Even with a camera roll full of inspiration, planning means switching between maps, notes and booking tabs and rebuilding everything by hand.',
  },
];

const EXPERIENCE = [
  {
    label: 'Discover',
    title: 'Everything you sent, in one place.',
    copy: 'The content you shared into Nextrail, gathered and grouped by destination instead of scattered across apps.',
    media: [`${U}/feed2fly-grid.png`, `${U}/organize-reels.png`],
  },
  {
    label: 'Explore',
    title: 'Go deeper on the places that caught your eye.',
    copy: 'Open a destination to see the exact clips behind it, filter by vibe, platform or creator, and keep only what still feels right.',
    media: [`${U}/organize-reels-2.png`, `${U}/organize-filter.png`],
  },
  {
    label: 'Plan',
    title: 'A day-by-day trip, built from your feed.',
    copy: 'Who’s going, when and your budget turn the saved inspiration into an itinerary with places, stays and a map — editable end to end.',
    media: [`${U}/trip-summary.png`, `${U}/itinerary-map.png`],
  },
];

const CONTRIB = [
  {
    h: 'Product thinking',
    p: 'Exploring the opportunity around how people discover travel and where planning breaks down.',
  },
  {
    h: 'UX design',
    p: 'Helping structure the user journeys and interaction flows across the product.',
  },
  {
    h: 'Feed2Fly',
    p: 'Contributing to the concept and the experience of turning saved travel content into an actionable plan.',
    feed: true,
  },
  {
    h: 'UI design',
    p: 'Designing and refining key interfaces and product moments.',
  },
];

const LESSONS = [
  {
    h: 'Start with behaviour, not features.',
    p: 'Feed2Fly came from something people already do — save and share travel content. The work wasn’t teaching a new habit; it was making an existing one pay off.',
  },
  {
    h: 'Inspiration needs structure.',
    p: 'Discovery is spontaneous and emotional. Planning is structured and practical. The whole design problem was the bridge between those two moments.',
  },
];

export function Nextrail() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const triadRef = useRef<HTMLUListElement>(null);
  const [cold, setCold] = useState(false);


  // the "forget" word cools once the triad has held in view
  useEffect(() => {
    const el = triadRef.current;
    if (!el) return;
    let t = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        t = window.setTimeout(() => setCold(true), reduced ? 200 : 900);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [reduced]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const kill: Array<() => void> = [];

      // hero title line-mask
      const lines = q<HTMLElement>(`.${styles.tl} > span`);
      if (lines.length) {
        if (reduced) {
          gsap.set(lines, { clearProps: 'transform' });
        } else {
          const tw = gsap.fromTo(
            lines,
            { yPercent: 115 },
            { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.08, delay: 0.1 },
          );
          kill.push(() => {
            tw.kill();
            gsap.set(lines, { clearProps: 'transform' });
          });
        }
      }

      // one-shot scroll reveals — transform + opacity only
      if (!reduced) {
        q<HTMLElement>(`.${styles.rise}`).forEach((el) => {
          const tw = gsap.from(el, {
            y: 34,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          });
          kill.push(() => {
            tw.scrollTrigger?.kill();
            tw.kill();
          });
        });

        // opportunity — the two questions drift past each other as you scroll
        const opp = q<HTMLElement>(`.${styles.opp}`)[0];
        const oldQ = q<HTMLElement>('[data-old]')[0];
        const newQ = q<HTMLElement>('[data-new]')[0];
        if (opp && oldQ && newQ) {
          const st = {
            trigger: opp,
            start: 'top 78%',
            end: 'bottom 58%',
            scrub: true,
          } as const;
          const t1 = gsap.fromTo(oldQ, { xPercent: 2 }, { xPercent: -4, ease: 'none', scrollTrigger: st });
          const t2 = gsap.fromTo(
            newQ,
            { xPercent: 6, autoAlpha: 0.5 },
            { xPercent: 0, autoAlpha: 1, ease: 'none', scrollTrigger: st },
          );
          kill.push(() => {
            [t1, t2].forEach((t) => {
              t.scrollTrigger?.kill();
              t.kill();
            });
            gsap.set([oldQ, newQ], { clearProps: 'transform,opacity' });
          });
        }

        // feed2fly reveal device — a small parallax lift
        const dev = q<HTMLElement>(`.${styles.revealDevice} img`)[0];
        if (dev) {
          const tw = gsap.fromTo(
            dev,
            { yPercent: 6 },
            {
              yPercent: -6,
              ease: 'none',
              scrollTrigger: {
                trigger: q<HTMLElement>(`.${styles.reveal}`)[0],
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
          kill.push(() => {
            tw.scrollTrigger?.kill();
            tw.kill();
            gsap.set(dev, { clearProps: 'transform' });
          });
        }
      }

      ScrollTrigger.refresh();
      return () => kill.forEach((f) => f());
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <article ref={rootRef} className={styles.root}>
      {/* ============================================================ HERO */}
      <header className={styles.hero} data-nav-boundary>
        <HeroMarquee />

        <div className={styles.heroInner}>
          <ul className={styles.pills}>
            <li data-accent>
              <i aria-hidden /> {PILLS[0]}
            </li>
            {PILLS.slice(1).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <h1 className={styles.heroTitle} aria-label="Nextrail">
            <span className={styles.tl}>
              <span>Nextrail</span>
            </span>
            <svg className={styles.mark} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </h1>

          <p className={styles.heroSay}>
            A group exploration of how AI can take you{' '}
            <b>from travel inspiration to an actual trip</b> — starting from the content
            you already save, not a blank search.
          </p>

          <p className={styles.roleLine}>
            <span>My role</span> Product Designer
          </p>
        </div>
      </header>

      {/* ========================================================= PROBLEM */}
      <section className={styles.section} aria-labelledby="problem">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>The problem</p>
          <h2 id="problem" className={`${styles.h2} ${styles.rise}`}>
            We save hundreds of travel ideas.
            <br />
            <em>Most never become trips.</em>
          </h2>
        </div>

        <p className={`${styles.lede} ${styles.rise}`}>
          We find places through Instagram, TikTok and YouTube every day — a reel here, a
          saved video there, a link sent to a friend. The saving is effortless. The problem
          is what happens next: when it’s time to plan, all of it is scattered across apps,
          and planning starts from zero.
        </p>

        <ul ref={triadRef} className={styles.triad} data-cold={cold || undefined} aria-hidden>
          <li>Discover</li>
          <li>Save</li>
          <li data-lost>Forget</li>
        </ul>

        <p className={`${styles.turn} ${styles.rise}`}>
          What if saved inspiration could <em>become the trip?</em>
        </p>
      </section>

      {/* ======================================================== RESEARCH */}
      <section className={styles.section} aria-labelledby="research">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>What we found</p>
          <h2 id="research" className={`${styles.h2} ${styles.rise}`}>
            Three things kept coming up.
          </h2>
        </div>

        <div className={styles.insights}>
          {INSIGHTS.map((it) => (
            <div key={it.n} className={`${styles.insight} ${styles.rise}`}>
              <span className={styles.insightN}>{it.n}</span>
              <div>
                <p className={styles.insightStatement}>{it.statement}</p>
                <p className={styles.insightBody}>{it.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className={`${styles.micro} ${styles.rise}`}>
          From the team’s interviews and our own saved folders. A small sample —
          directional, not definitive.
        </p>
      </section>

      {/* ===================================================== OPPORTUNITY */}
      <section className={`${styles.section} ${styles.opp}`} aria-labelledby="opportunity">
        <p className={`${styles.oppLead} ${styles.rise}`}>We stopped asking</p>
        <p id="opportunity" className={styles.oppQ} data-old>
          “Where do you want to go?”
        </p>
        <p className={`${styles.oppLead} ${styles.rise}`}>and started asking</p>
        <p className={styles.oppQ} data-new>
          “What already inspired you?”
        </p>
      </section>

      {/* ================================================ INTRODUCING FEED2FLY */}
      <section className={styles.reveal} id="feed2fly" aria-labelledby="feed2fly-h">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.revealMap} src="/nextrail_casestudy/worldmap.png" alt="" />

        <div className={styles.revealInner}>
          <p className={`${styles.revealKick} ${styles.rise}`}>Introducing</p>
          <h2 id="feed2fly-h" className={`${styles.revealTitle} ${styles.rise}`}>
            Feed2Fly.
          </h2>
          <p className={`${styles.revealSay} ${styles.rise}`}>
            Your saved travel content, turned into your next trip.
          </p>
          <p className={`${styles.revealBody} ${styles.rise}`}>
            Feed2Fly lets you share the travel content you find on social platforms straight
            into Nextrail. From there, Nextrail organises that inspiration by destination and
            turns it into something you can act on.
          </p>
        </div>

        <figure className={styles.revealDevice}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${U}/trip-summary.png`} alt="A Nextrail trip summary built from Feed2Fly" />
        </figure>
      </section>

      {/* ==================================================== HOW IT WORKS */}
      <section className={styles.section} id="how" aria-labelledby="how-h">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`} data-violet>
            How it works
          </p>
          <h2 id="how-h" className={`${styles.h2} ${styles.rise}`}>
            Four beats, one path.
          </h2>
        </div>

        <Feed2FlyScroll />
      </section>

      {/* =================================================== THE EXPERIENCE */}
      <section className={styles.section} aria-labelledby="experience">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`} data-violet>
            The experience
          </p>
          <h2 id="experience" className={`${styles.h2} ${styles.rise}`}>
            What it feels like to use.
          </h2>
        </div>

        <div className={styles.moments}>
          {EXPERIENCE.map((m) => (
            <div key={m.label} className={`${styles.moment} ${styles.rise}`}>
              <div>
                <p className={styles.momentLabel}>{m.label}</p>
                <h3 className={styles.momentTitle}>{m.title}</h3>
                <p className={styles.momentCopy}>{m.copy}</p>
              </div>
              <div className={styles.momentMedia}>
                {m.media.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" loading="lazy" decoding="async" draggable={false} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className={`${styles.micro} ${styles.rise}`}>
          Only the screens that carry the Feed2Fly story. Booking and other flows stayed
          exploratory and are left out here.
        </p>
      </section>

      {/* ====================================================== PROCESS */}
      <section className={styles.section} aria-labelledby="process">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Process</p>
          <h2 id="process" className={`${styles.h2} ${styles.rise}`}>
            From idea to interface.
          </h2>
        </div>

        <div className={`${styles.ladder} ${styles.rise}`}>
          {['Idea', 'User flow', 'Wireframes', 'Interface'].map((n, i, a) => (
            <span key={n} className={styles.ladderNode} data-strong={i === a.length - 1 || undefined}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {n}
              {i < a.length - 1 && (
                <span className={styles.ladderArrow} aria-hidden>
                  →
                </span>
              )}
            </span>
          ))}
        </div>

        <p className={`${styles.lede} ${styles.rise}`}>
          As a group project, the early artefacts stayed rough and shared. Feed2Fly is the
          thread we carried all the way to a working prototype — every screen in this study
          is from that build.
        </p>
      </section>

      {/* ================================================== CONTRIBUTION */}
      <section className={styles.section} aria-labelledby="role">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>My role</p>
          <h2 id="role" className={`${styles.h2} ${styles.rise}`}>
            My role in Nextrail.
          </h2>
        </div>

        <p className={`${styles.lede} ${styles.rise}`}>
          I worked in a seven-person team on the product thinking, user experience and
          interface direction for Nextrail — with Feed2Fly as the piece I stayed closest to.
        </p>

        <div className={styles.contribs}>
          {CONTRIB.map((c) => (
            <div
              key={c.h}
              className={`${styles.contrib} ${styles.rise}`}
              data-feed={c.feed || undefined}
            >
              <h3>{c.h}</h3>
              <p>{c.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== REFLECTION */}
      <section className={`${styles.section} ${styles.close}`} aria-labelledby="reflection">
        <h2 id="reflection" className={`${styles.h2} ${styles.rise}`}>
          What I learned.
        </h2>

        <div className={styles.lessons}>
          {LESSONS.map((l) => (
            <div key={l.h} className={`${styles.lesson} ${styles.rise}`}>
              <h3>{l.h}</h3>
              <p>{l.p}</p>
            </div>
          ))}
        </div>

        <Link href="/work" className={`${styles.back} ${styles.rise}`} data-cursor="link">
          <span aria-hidden>←</span> Back to selected work
        </Link>
      </section>
    </article>
  );
}

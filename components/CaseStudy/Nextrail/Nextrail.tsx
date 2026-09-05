'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { HeroMarquee } from './HeroMarquee';
import { Feed2FlyScroll } from './Feed2FlyScroll';
import { QuantResearch } from './QuantResearch';
import { FoundReveal } from './found/FoundReveal';
import { InsightFlow } from './insights/InsightFlow';
import { InsightAccumulate } from './insights/InsightAccumulate';
import { InsightConnect } from './insights/InsightConnect';
import styles from './Nextrail.module.scss';

const U = '/nextrail_casestudy/ui';

const PILLS = ['Group project', '7 members', 'UX/UI design', 'AI experience'];

const INSIGHTS = [
  {
    n: '01',
    statement: 'Inspiration lives on social media.',
    body: 'People find where to go through reels, shorts and creator videos far more than through travel sites or blogs. The discovery already happened before any planning tool is opened.',
    Anim: InsightFlow,
  },
  {
    n: '02',
    statement: 'Saved content rarely becomes action.',
    body: 'Everyone saves with the intention of coming back to it. Almost no one organises those saves, and most are never opened again.',
    Anim: InsightAccumulate,
  },
  {
    n: '03',
    statement: 'Planning still starts from scratch.',
    body: 'Even with a camera roll full of inspiration, planning means switching between maps, notes and booking tabs and rebuilding everything by hand.',
    Anim: InsightConnect,
  },
];

// Recurring themes from the secondary scan + interviews — the raw material the
// three headline insights are distilled from.
const OBSERVATIONS: Array<[string, string]> = [
  ['Scattered planning', 'Maps in one tab, notes in another, bookings in a third: nothing talks to anything.'],
  ['Info overload', 'Endless “top 10” lists, none of them yours. More reading than deciding.'],
  ['Hard to find inspiration', 'The ideas worth acting on sit in feeds and DMs, not on travel sites.'],
  ['Personalisation & vibe', 'People want a trip that matches their mood, not a generic itinerary.'],
  ['Budget stress', 'Cost stays a guess until the booking screen. No running total anywhere.'],
  ['One-stop booking', 'Hopping apps to compare stays, flights and activities kills the momentum.'],
  ['Safety is critical', 'Families want verified stays and a read on crowds before they commit.'],
  ['On-the-go changes', 'Plans shift mid-trip; a fixed itinerary can’t keep up.'],
  ['Wants an AI planner', 'People already expect something to turn their inputs into a real plan.'],
];

const PERSONAS = [
  {
    photo: '/nextrail_casestudy/people/traveler.png',
    photoPos: '50% 20%',
    name: 'Riya Mehta',
    meta: '24 · Mumbai · Solo traveller · UX designer',
    quote: 'I save reels all the time. They never turn into an actual trip.',
    traits: [
      'Travels for local culture, not the landmark checklist',
      'Wants verified stays and a plan that fits her mood',
    ],
    needs: 'One app, information she can trust, and planning that starts from what already inspired her.',
  },
  {
    photo: '/nextrail_casestudy/people/friends.jpg',
    photoPos: '44% 26%',
    name: 'Rajiv Sharma',
    meta: '35 · Pune · Family traveller · Runs a business',
    quote: 'A family trip needs more than bookings. We need peace of mind.',
    traits: [
      'Plans kid-friendly trips around safety and comfort',
      'Travels to spend unhurried time with family',
    ],
    needs: 'Clean verified stays, crowd and safety cues, and one place to plan the whole thing.',
  },
];

// Verbatim lines pulled from interview notes — its own subsection of the
// research, not a rewrite of the personas or the nine patterns above.
const INTERVIEW_QUOTES = [
  'I keep saving reels and videos, but I never know how to turn them into an actual trip.',
  'Every app gives me pieces, but none of them give me everything I need in one place.',
  'I spend so much time planning, only to realize I’ve gone way over my budget.',
  'Why can’t I just drop my vibe or mood, and get a trip plan built around that?',
  'Sometimes I just want quick, local experiences without the usual tourist chaos.',
  'I use Google Maps, Booking.com, and ChatGPT, but I still end up feeling confused and unprepared.',
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
    p: 'Feed2Fly came from something people already do: save and share travel content. The work wasn’t teaching a new habit; it was making an existing one pay off.',
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
          </h1>

          <p className={styles.heroSay}>
            A group exploration of how AI can take you{' '}
            <b>from travel inspiration to an actual trip</b>, starting from the content
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
          We find places through Instagram, TikTok and YouTube every day: a reel here, a
          saved video there, a link sent to a friend. The saving is effortless. The problem
          is what happens next: when it’s time to plan, all of it is scattered across apps,
          and planning starts from zero.
        </p>

        <ul ref={triadRef} className={styles.triad} data-cold={cold || undefined} aria-hidden>
          {['Discover', 'Save', 'Forget'].map((s, i) => (
            <li key={s} data-lost={i === 2 || undefined}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* ======================================================== RESEARCH */}
      <section className={styles.section} aria-labelledby="research">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>What we found</p>
          <h2 id="research" className={`${styles.h2} ${styles.rise}`}>
            Three things kept coming up.
          </h2>
        </div>

        <FoundReveal points={INSIGHTS} />
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
            Feed<span className={styles.revealTwo}>2</span>Fly.
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

      {/* ==================================================== RESEARCH BLOCK */}
      <section className={styles.section} aria-labelledby="research-lead">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Research</p>
          <h2 id="research-lead" className={`${styles.h2} ${styles.rise}`}>
            The work behind it.
          </h2>
        </div>

        <p className={`${styles.lede} ${styles.rise}`}>
          Before any of this took shape, we scanned 40+ travel platforms, followed how
          travel spreads on social, pulled threads from travel communities on Reddit, and
          sat down with real travellers: solo adventurers, weekend groups and families.
          The trips were different. The frustration was identical.
        </p>

        {/* ---- observations ---- */}
        <div className={styles.block}>
          <p className={`${styles.blockKick} ${styles.rise}`}>What kept coming up</p>
          <h3 className={`${styles.blockTitle} ${styles.rise}`}>Nine patterns, over and over.</h3>

          <ol className={`${styles.obs} ${styles.rise}`}>
            {OBSERVATIONS.map(([h, p], i) => (
              <li key={h} className={styles.ob}>
                <span className={styles.obN}>{String(i + 1).padStart(2, '0')}</span>
                <h4 className={styles.obH}>{h}</h4>
                <p className={styles.obP}>{p}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* ---- quantitative ---- */}
        <div className={styles.block}>
          <p className={`${styles.blockKick} ${styles.rise}`}>By the numbers</p>
          <h3 className={`${styles.blockTitle} ${styles.rise}`}>What the survey said.</h3>
          <QuantResearch />
        </div>

        {/* ---- personas ---- */}
        <div className={styles.block}>
          <p className={`${styles.blockKick} ${styles.rise}`}>Who we built for</p>
          <h3 className={`${styles.blockTitle} ${styles.rise}`}>
            Two travellers we kept in the room.
          </h3>
          <p className={`${styles.blockLede} ${styles.rise}`}>
            Our audience runs 16–50 and loves to travel. Two of them stood in for the rest
            through every design decision.
          </p>

          <div className={`${styles.personas} ${styles.rise}`}>
            {PERSONAS.map((p, i) => (
              <article key={p.name} className={styles.persona} data-i={i + 1}>
                <header className={styles.personaHead}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.personaPhoto}
                    src={p.photo}
                    alt=""
                    style={{ objectPosition: p.photoPos }}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                  <div>
                    <h4 className={styles.personaName}>{p.name}</h4>
                    <p className={styles.personaMeta}>{p.meta}</p>
                  </div>
                </header>

                <blockquote className={styles.personaQuote}>
                  <span aria-hidden>“</span>
                  {p.quote}
                  <span aria-hidden>”</span>
                </blockquote>

                <ul className={styles.personaTraits}>
                  {p.traits.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>

                <p className={styles.personaNeeds}>
                  <span>Needs</span> {p.needs}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* ---- interview insights ---- */}
        <div className={styles.block}>
          <p className={`${styles.blockKick} ${styles.rise}`}>Interview insights</p>
          <h3 className={`${styles.blockTitle} ${styles.rise}`}>In their own words.</h3>

          <div className={`${styles.quoteWall} ${styles.rise}`}>
            <ul className={styles.quoteGrid}>
              {INTERVIEW_QUOTES.map((q, i) => (
                <li key={q} className={styles.quoteCard} data-i={i}>
                  <span className={styles.quoteMark} aria-hidden>
                    “
                  </span>
                  <p>{q}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ==================================================== HOW IT WORKS */}
      <section className={`${styles.section} ${styles.howSection}`} id="how" aria-labelledby="how-h">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>How it works</p>
          <h2 id="how-h" className={`${styles.h2} ${styles.rise}`}>
            Four beats, one path.
          </h2>
        </div>

        <Feed2FlyScroll />
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
          interface direction for Nextrail, with Feed2Fly as the piece I stayed closest to.
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

        <dl className={`${styles.carry} ${styles.rise}`}>
          {LESSONS.map((l) => (
            <div key={l.h}>
              <dt>{l.h}</dt>
              <dd>{l.p}</dd>
            </div>
          ))}
        </dl>

        <Link href="/work" className={`${styles.back} ${styles.rise}`} data-cursor="link">
          <span aria-hidden>←</span> Back to selected work
        </Link>
      </section>
    </article>
  );
}

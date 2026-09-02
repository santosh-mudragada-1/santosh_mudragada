'use client';

import { Fragment, useRef } from 'react';
import Link from 'next/link';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { HeroBoard } from './HeroBoard';
import { JourneyScroll } from './JourneyScroll';
import { TryIt } from './TryIt';
import styles from './ChessCom.module.scss';

const TAGS = ['UX', 'Game-based learning', 'Chess.com', 'Prototype'];

const NET = [
  { band: 'Under 1000', n: 6, w: 24 },
  { band: '1000 – 1400', n: 10, w: 40 },
  { band: '1400 – 1800', n: 16, w: 64 },
  { band: '1800 +', n: 25, w: 100 },
];

const PARTS = [
  {
    name: 'Puzzle board',
    role: 'Legal-move dots, a ring for captures, a shake on the wrong square, mate detection on the right one.',
    tag: 'Runs live',
  },
  {
    name: 'Engine eval bar',
    role: 'The centipawn-and-mate scale, and the red band that shows exactly what the blunder gave away.',
    tag: 'Runs live',
  },
  {
    name: 'Coach',
    role: 'Move classification — blunder, best, brilliant — and the one line that explains the current state.',
    tag: 'Runs live',
  },
  {
    name: 'Solve ladder',
    role: 'Hint, then arrow, then reveal. Each step costs more; only the last one records a failure.',
    tag: 'Runs live',
  },
  {
    name: 'End-of-set card',
    role: 'Clean, hinted and failed reported separately, with the next action ordered by usefulness.',
    tag: 'Runs live',
  },
  {
    name: 'Chess.com shell',
    role: 'Nav, home and the surrounding pages — painted for context so the prototype has somewhere to live.',
    tag: 'Context',
  },
];

const UPGRADE_FLOW = [
  'Hit the wall at puzzle 3',
  'Upgrade in place — no reload',
  'Short celebration',
  'Resume at puzzle 4',
];

function Lock() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" aria-hidden>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" fill="currentColor" />
      <path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

const DECISIONS = [
  { n: '01', d: 'The engine’s best move is not a puzzle.', out: 'Puzzles that are unfair, not hard.' },
  { n: '02', d: 'One mistake is one lesson, however many disasters followed.', out: 'A set that drills one error and calls it four.' },
  { n: '03', d: 'Rating sets how deep we look, never how hard the puzzle is.', out: 'Deciding in advance what you can handle.' },
  { n: '04', d: 'The bar explains the loss, so the copy doesn’t have to.', out: 'A sentence doing a picture’s job.' },
  { n: '05', d: 'Show free members the whole set, including what they can’t reach.', out: 'Hiding the thing you’re selling.' },
];

const METRICS = [
  { name: 'Repeat-mistake rate', q: 'Do players make fewer of the same mistakes after drilling them?', primary: true },
  { name: 'Clean-solve rate', q: 'Solved without hints or the solution?' },
  { name: 'Abandonment', q: 'Do players leave when a puzzle feels unfair or irrelevant?' },
  { name: 'Return rate', q: 'Do they come back for more of their own puzzles?' },
  { name: 'Review → puzzle', q: 'How many reviewed games yield one worth practising?' },
];

export function ChessCom() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const kill: Array<() => void> = [];

      // hero line-mask
      const lines = q<HTMLElement>(`.${styles.tl} > span`);
      if (lines.length) {
        if (reduced) gsap.set(lines, { yPercent: 0 });
        else {
          gsap.fromTo(
            lines,
            { yPercent: 115 },
            { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.08, delay: 0.1 },
          );
          kill.push(() => gsap.killTweensOf(lines));
        }
      }

      // scroll reveals: one-shot, transform + opacity only
      q<HTMLElement>(`.${styles.rise}`).forEach((el) => {
        if (reduced) return;
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

      // rating bars grow in
      const bars = q<HTMLElement>(`.${styles.netBar} i`);
      if (bars.length && !reduced) {
        const tw = gsap.from(bars, {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 1,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: bars[0].closest(`.${styles.netGrid}`), start: 'top 80%' },
        });
        kill.push(() => {
          tw.scrollTrigger?.kill();
          tw.kill();
        });
      }

      // versions — V1 queue bars fill left-to-right
      const vqBars = q<HTMLElement>(`.${styles.vQueue} span`);
      if (vqBars.length && !reduced) {
        const tw = gsap.from(vqBars, {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: { trigger: vqBars[0].closest(`.${styles.vCard}`), start: 'top 78%' },
        });
        kill.push(() => {
          tw.scrollTrigger?.kill();
          tw.kill();
        });
      }

      // versions — V2 diary cells drop into the grid
      const calCells = q<HTMLElement>(`.${styles.cal} span`);
      if (calCells.length && !reduced) {
        const tw = gsap.from(calCells, {
          scale: 0.3,
          duration: 0.5,
          ease: 'back.out(1.6)',
          stagger: { each: 0.02, grid: [4, 7], from: 'start' },
          scrollTrigger: { trigger: calCells[0].closest(`.${styles.vCard}`), start: 'top 78%' },
        });
        kill.push(() => {
          tw.scrollTrigger?.kill();
          tw.kill();
        });
      }

      // wall — plan tiles pop in along each strip
      const planTiles = q<HTMLElement>(`.${styles.planTile}`);
      if (planTiles.length && !reduced) {
        const tw = gsap.from(planTiles, {
          scale: 0.2,
          duration: 0.4,
          ease: 'back.out(1.7)',
          stagger: 0.03,
          scrollTrigger: { trigger: planTiles[0].closest(`.${styles.plans}`), start: 'top 80%' },
        });
        kill.push(() => {
          tw.scrollTrigger?.kill();
          tw.kill();
        });
      }

      ScrollTrigger.refresh();
      return () => kill.forEach((f) => f());
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <article ref={rootRef} className={styles.root}>
      {/* ============================================================ HERO */}
      <header className={styles.hero}>
        <HeroBoard />

        <div className={styles.heroInner}>
          <ul className={styles.tags}>
            <li data-accent>
              <i aria-hidden /> Product design concept
            </li>
            {TAGS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <h1 className={styles.heroTitle} aria-label="Game-Based Puzzles">
            <span className={styles.tl}>
              <span>Game-Based</span>
            </span>
            <span className={styles.tl}>
              <span className={styles.accent}>Puzzles</span>
            </span>
          </h1>

          <hr className={styles.rule} />

          <div className={styles.heroFoot}>
            <p className={styles.heroSay}>
              Your own blunders, handed back as puzzles. <b>The loop finally closes.</b>
            </p>
            <div className={styles.ctaCol}>
              <a
                href="https://game-based-puzzles.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaProto}
                data-cursor="link"
              >
                <span className={styles.ctaProtoDot} aria-hidden />
                Test the live prototype
                <span className={styles.ctaProtoGo} aria-hidden>
                  ↗
                </span>
              </a>
              <p className={styles.protoNote}>
                I rebuilt it inside a replica of Chess.com, but only{' '}
                <b>Game-Based&nbsp;Puzzles</b> runs end to end. The surrounding pages
                are there for context.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= CONTEXT */}
      <section className={styles.section} aria-labelledby="context">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Context</p>
          <h2 id="context" className={`${styles.h2} ${styles.rise}`}>
            Review already works.
            <br />
            It just ends too early.
          </h2>
        </div>
        <p className={`${styles.lede} ${styles.rise}`}>
          You see the mistake once, understand it, and move on. Nothing brings that exact
          decision back for practice.
        </p>

        <ol className={`${styles.loop} ${styles.rise}`} aria-label="Current loop">
          {['Play', 'Review', 'Understand', 'Move on'].map((s, i) => (
            <li key={s} data-dead={i === 3 || undefined}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {s}
            </li>
          ))}
        </ol>
      </section>

      {/* ======================================================= THE SHIFT */}
      <section className={`${styles.section} ${styles.shift}`} aria-labelledby="shift">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>The shift</p>
          <h2 id="shift" className={`${styles.h2} ${styles.rise}`}>Close the loop.</h2>
        </div>
        <ol className={`${styles.loop} ${styles.loopWide} ${styles.rise}`} aria-label="Extended loop">
          {['Play', 'Detect', 'Practice', 'Feedback', 'Progress', 'Return'].map((s, i) => (
            <li key={s} data-new={i >= 2 || undefined}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {s}
            </li>
          ))}
        </ol>
        <p className={`${styles.micro} ${styles.rise}`}>
          Every Chess.com puzzle (Daily, Rush, Battle) draws from <em>other people&rsquo;s</em>{' '}
          games. Not yours.
        </p>
      </section>

      {/* ======================================================= JOURNEY */}
      <section className={styles.section} aria-labelledby="journey">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>One blunder, end to end</p>
          <h2 id="journey" className={`${styles.h2} ${styles.rise}`}>Watch it happen.</h2>
        </div>
        <JourneyScroll />
      </section>

      {/* ======================================================== INSIGHT */}
      <section className={`${styles.section} ${styles.quoteSec}`}>
        <blockquote className={`${styles.quote} ${styles.rise}`}>
          The best puzzle for you is one you&rsquo;ve already <em>failed</em>: under a clock, in a
          game that mattered.
        </blockquote>
      </section>

      {/* ========================================================= TRY IT */}
      <section className={`${styles.section} ${styles.tryOut}`} aria-labelledby="tryit">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Interactive</p>
          <h2 id="tryit" className={`${styles.h2} ${styles.rise}`}>Your turn: three puzzles.</h2>
        </div>
        <p className={`${styles.lede} ${styles.rise}`}>
          Live, right here: a back-rank mate, a knight fork and a hanging queen. Each state is
          explained as it happens.
        </p>
        <TryIt />
      </section>

      {/* ================================================ INSIGHT (fair) */}
      <section className={`${styles.section} ${styles.quoteSec}`}>
        <blockquote className={`${styles.quote} ${styles.rise}`}>
          The hard part was never generating puzzles. It was generating <em>fair</em> ones.
        </blockquote>
        <p className={`${styles.quoteBy} ${styles.rise}`}>The finding that reshaped the product</p>
      </section>

      {/* ========================================================== FAIR */}
      <section className={styles.section} aria-labelledby="fair">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>How the set gets built</p>
          <h2 id="fair" className={`${styles.h2} ${styles.rise}`}>
            Rating decides how wide we cast the net.
          </h2>
        </div>

        <p className={`${styles.fairLede} ${styles.rise}`}>
          <b>Prototype heuristic:</b> a lower-rated player&rsquo;s games may hold more teachable
          moments, while a stronger player&rsquo;s games may need a wider search to find
          worthwhile ones. So the depth of analysis is read off the player&rsquo;s Elo, rather
          than fixed at one number of games.
        </p>
        <p className={`${styles.fairNote} ${styles.rise}`}>
          An exploration rule, not a validated formula &mdash; the bands below are a starting
          point to test, not a measured result.
        </p>

        <div className={`${styles.netGrid} ${styles.rise}`}>
          {NET.map((r) => (
            <div key={r.band} className={styles.netCard}>
              <span className={styles.netCardBand}>{r.band}</span>
              <b className={styles.netCardN}>{r.n}</b>
              <span className={styles.netCardLabel}>games analysed</span>
              <span className={styles.netBar}>
                <i style={{ width: `${r.w}%` }} />
              </span>
            </div>
          ))}
        </div>

        <p className={`${styles.micro} ${styles.rise}`}>
          The set size is still never padded &mdash; the net widens, the quality gates
          don&rsquo;t move. If the games only held eight fair puzzles, the set is eight.
        </p>
      </section>

      {/* ====================================================== VERSIONS */}
      <section className={styles.section} aria-labelledby="versions">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Two versions, one switch</p>
          <h2 id="versions" className={`${styles.h2} ${styles.rise}`}>
            Which games become which puzzles, and when?
          </h2>
        </div>

        <div className={styles.versions}>
          <div className={`${styles.vCard} ${styles.rise}`}>
            <div className={styles.vTop}>
              <span className={styles.vTag}>V1</span>
              <h3 className={styles.h3}>The rolling window</h3>
            </div>
            <div className={styles.vQueue} aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} data-solved={i < 2 || undefined} />
              ))}
            </div>
            <p className={styles.note}>
              Your last N games, pooled into one set that&rsquo;s always full. A queue: zero
              navigation, best of a wide pool.
            </p>
          </div>

          <div className={`${styles.vCard} ${styles.rise}`}>
            <div className={styles.vTop}>
              <span className={styles.vTag}>V2</span>
              <h3 className={styles.h3}>The diary</h3>
            </div>
            <div className={styles.cal} aria-hidden>
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  data-state={
                    i === 20 ? 'today' : [2, 5, 6, 9, 12, 13, 16, 19].includes(i) ? 'done' : [1, 8, 15, 17].includes(i) ? 'has' : undefined
                  }
                />
              ))}
            </div>
            <p className={styles.note}>
              Puzzles grouped by the day you played. The calendar <em>is</em> the progress
              record, so streaks and gaps become visible.
            </p>
          </div>
        </div>

        <p className={`${styles.micro} ${styles.rise}`}>
          Both shipped behind a switch. V2&rsquo;s &ldquo;a day is as long as it is&rdquo; killed
          V1&rsquo;s daily quota.
        </p>
      </section>

      {/* =================================================== BUILT PIECES */}
      <section className={styles.section} aria-labelledby="parts">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>What actually got built</p>
          <h2 id="parts" className={`${styles.h2} ${styles.rise}`}>
            The pieces, and which ones are wired.
          </h2>
        </div>
        <p className={`${styles.lede} ${styles.rise}`}>
          Game-Based Puzzles runs end to end. Everything around it is painted for context, so the
          flow has somewhere to happen.
        </p>
        <div className={styles.parts}>
          {PARTS.map((p) => (
            <div
              key={p.name}
              className={`${styles.part} ${styles.rise}`}
              data-context={p.tag === 'Context' || undefined}
            >
              <span className={styles.partTop}>
                <span className={styles.partName}>{p.name}</span>
                <span className={styles.partTag}>{p.tag}</span>
              </span>
              <p>{p.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================== DECISIONS */}
      <section className={styles.section} aria-labelledby="decisions">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Product decisions</p>
          <h2 id="decisions" className={`${styles.h2} ${styles.rise}`}>
            Five calls that changed what it does.
          </h2>
        </div>
        <ol className={styles.dec}>
          {DECISIONS.map((d) => (
            <li key={d.n} className={styles.rise}>
              <span className={styles.decN}>{d.n}</span>
              <p className={styles.decD}>{d.d}</p>
              <p className={styles.decOut}>
                <span>Ruled out</span> {d.out}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ========================================================== WALL */}
      <section className={styles.section} aria-labelledby="wall">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Free vs premium</p>
          <h2 id="wall" className={`${styles.h2} ${styles.rise}`}>The wall is the pitch.</h2>
        </div>
        <p className={`${styles.lede} ${styles.rise}`}>
          The set is never trimmed for free members. They see all twelve, and exactly how far in
          the wall sits.
        </p>

        <div className={styles.plans}>
          <div className={`${styles.planCard} ${styles.rise}`}>
            <div className={styles.planHead}>
              <span className={styles.planName}>Free</span>
              <span className={styles.planPill}>3 puzzles a day</span>
            </div>
            <div className={styles.planStrip} aria-hidden>
              {Array.from({ length: 12 }).map((_, i) => (
                <Fragment key={i}>
                  {i === 3 && <span className={styles.planWall} />}
                  <span className={styles.planTile} data-state={i < 3 ? 'done' : 'locked'}>
                    {i < 3 ? '✓' : <Lock />}
                  </span>
                </Fragment>
              ))}
            </div>
            <div className={styles.planRow}>
              <span>
                Counter reads <b>Puzzle 3 / 12</b>
              </span>
              <span className={styles.planRowAside}>not 3 / 3</span>
            </div>
            <p className={styles.planHint}>Locked puzzles stay visible, greyed.</p>
            <p className={styles.planNote}>
              A queue that looks three long has nothing to sell.{' '}
              <b>The puzzles you can see but can&rsquo;t reach are the argument</b> &mdash; stated
              as a fact, not a sales line.
            </p>
          </div>

          <div className={`${styles.planCard} ${styles.rise}`} data-premium>
            <div className={styles.planHead}>
              <span className={styles.planName}>Premium</span>
              <span className={styles.planPill} data-on>
                The whole set
              </span>
            </div>
            <div className={styles.planStrip} aria-hidden>
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className={styles.planTile}
                  data-state={i < 9 ? 'done' : i === 9 ? 'current' : 'upcoming'}
                >
                  {i < 9 ? '✓' : i + 1}
                </span>
              ))}
            </div>
            <div className={styles.planRow}>
              <span>
                End card <b>You&rsquo;re all caught up!</b>
              </span>
            </div>
            <p className={styles.planHint}>Retry 3 · Next theme · Solve again.</p>
            <p className={styles.planNote}>
              The end card is about improvement, not celebration. Actions are ordered by
              usefulness and the default focus moves down the list as options disappear &mdash;{' '}
              <b>the most useful remaining action is always under your finger</b>.
            </p>
          </div>
        </div>

        <ol className={`${styles.loop} ${styles.rise}`} aria-label="Upgrade flow">
          {UPGRADE_FLOW.map((s, i) => (
            <li key={s}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {s}
            </li>
          ))}
        </ol>

        <p className={`${styles.micro} ${styles.rise}`}>
          The most common way to ruin an upgrade moment is to make someone find their place
          again.
        </p>
      </section>

      {/* ====================================================== MEASURE */}
      <section className={styles.section} aria-labelledby="measure">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>The hypothesis</p>
          <h2 id="measure" className={`${styles.h2} ${styles.rise}`}>What I&rsquo;d want to measure.</h2>
        </div>
        <div className={styles.metrics}>
          {METRICS.map((m) => (
            <div key={m.name} className={`${styles.metric} ${styles.rise}`} data-primary={m.primary || undefined}>
              <span className={styles.metricName}>
                {m.name}
                {m.primary && <i>primary</i>}
              </span>
              <p>{m.q}</p>
            </div>
          ))}
        </div>
        <p className={`${styles.micro} ${styles.rise}`}>
          A prototype, not a launch: outcomes to validate, not claim.
        </p>
      </section>

      {/* ======================================================== CLOSE */}
      <section className={`${styles.section} ${styles.close}`} aria-labelledby="close">
        <h2 id="close" className={`${styles.h2} ${styles.rise}`}>What I&rsquo;d carry forward.</h2>
        <dl className={`${styles.carry} ${styles.rise}`}>
          <div>
            <dt>Spaced repetition</dt>
            <dd>The prototype builds the puzzles; it doesn&rsquo;t yet schedule their return.</dd>
          </div>
          <div>
            <dt>Named weaknesses</dt>
            <dd>&ldquo;Blunder&rdquo; is a severity, not a lesson. Cluster into back rank, hanging pieces, endgames.</dd>
          </div>
          <div>
            <dt>Queue first, diary on top</dt>
            <dd>The queue is the better product, the diary the better habit. Ship the queue as default.</dd>
          </div>
        </dl>
        <Link href="/work" className={`${styles.back} ${styles.rise}`} data-cursor="link">
          <span aria-hidden>←</span> Back to selected work
        </Link>
      </section>
    </article>
  );
}

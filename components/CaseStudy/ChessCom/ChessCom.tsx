'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Board, EvalBar, CoachBubble, Confetti } from '@/components/CaseStudy/chess';
import { HeroBoard } from './HeroBoard';
import styles from './ChessCom.module.scss';

// The back-rank position the "journey" section plays out — White to find Rd8#.
const FEN_BEFORE = '6k1/5ppp/8/8/8/8/5PPP/3R2K1';
const FEN_AFTER = '3R2k1/5ppp/8/8/8/8/5PPP/6K1';

const TAGS = ['UX', 'Game-based learning', 'Chess.com', 'Prototype'];

const NET = [
  { band: 'Under 1000', n: 6, w: 24 },
  { band: '1000–1400', n: 10, w: 40 },
  { band: '1400–1800', n: 16, w: 64 },
  { band: '1800 +', n: 25, w: 100 },
];

const GATES = [
  { name: 'Findable', rule: 'First move is a capture, a check, or mate.', out: 'A quiet move nothing asks you to look at.' },
  { name: 'Singular', rule: 'Beats the second-best move by a clear margin.', out: 'A coin toss you’re told you lost.' },
  { name: 'Worth it', rule: 'Wins something decisive — mate or real material.', out: 'A puzzle whose answer wins a tenth of a pawn.' },
];

const BEATS: Array<[string, string]> = [
  ['Play', 'A real game from your archive.'],
  ['Detect', 'Stockfish flags the move — the blunder hands back the mate and the rook.'],
  ['Rewind', 'The board returns to the instant before the decision.'],
  ['Decide', 'Legal dots, a ring for the key capture, a three-step hint ladder.'],
  ['Feedback', 'The right move — green sweeps back up the bar.'],
  ['Return', 'Home card, set counter and queue all update at once.'],
];

const DECISIONS = [
  { n: '01', d: 'The engine’s best move is not a puzzle.', out: 'Puzzles that are unfair, not hard.' },
  { n: '02', d: 'One mistake is one lesson, however many disasters followed.', out: 'A set that drills one error and calls it four.' },
  { n: '03', d: 'Rating sets how deep we look, never how hard the puzzle is.', out: 'Deciding in advance what you can handle.' },
  { n: '04', d: 'The bar explains the loss, so the copy doesn’t have to.', out: 'A sentence doing a picture’s job.' },
  { n: '05', d: 'Show free members the whole set — including what they can’t reach.', out: 'Hiding the thing you’re selling.' },
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
  const journeyRef = useRef<HTMLDivElement>(null);
  const [solved, setSolved] = useState(false);

  // the journey board plays itself out once it holds in view
  useEffect(() => {
    const el = journeyRef.current;
    if (!el) return;
    let t = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        t = window.setTimeout(() => setSolved(true), reduced ? 400 : 1600);
      },
      { threshold: 0.55 },
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

      // scroll reveals — one-shot, transform + opacity only
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
          scrollTrigger: { trigger: bars[0].closest(`.${styles.net}`), start: 'top 80%' },
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
              <div className={styles.ctas}>
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
                <a href="#journey" className={styles.ctaGhost} data-cursor="link">
                  Watch the story <span aria-hidden>↓</span>
                </a>
              </div>
              <p className={styles.protoNote}>
                I rebuilt it inside a replica of Chess.com &mdash; only{' '}
                <b>Game-Based&nbsp;Puzzles</b> runs end to end. The surrounding pages
                are there for context.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= THE GAP */}
      <section className={styles.section} aria-labelledby="gap">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>The gap</p>
          <h2 id="gap" className={`${styles.h2} ${styles.rise}`}>
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
          Every Chess.com puzzle — Daily, Rush, Battle — draws from <em>other people&rsquo;s</em>{' '}
          games. Not yours.
        </p>
      </section>

      {/* ======================================================== INSIGHT */}
      <section className={`${styles.section} ${styles.quoteSec}`}>
        <blockquote className={`${styles.quote} ${styles.rise}`}>
          The best puzzle for you is one you&rsquo;ve already <em>failed</em> — under a clock, in a
          game that mattered.
        </blockquote>
      </section>

      {/* ========================================================== FAIR */}
      <section className={styles.section} aria-labelledby="fair">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>How the set is built</p>
          <h2 id="fair" className={`${styles.h2} ${styles.rise}`}>
            The hard part wasn&rsquo;t generating puzzles.
            <br />
            It was generating <em>fair</em> ones.
          </h2>
        </div>

        <div className={styles.rules}>
          <div className={`${styles.rule} ${styles.rise}`}>
            <h3 className={styles.h3}>
              <span className={styles.ruleN}>1</span> Rating widens the net
            </h3>
            <p className={styles.note}>
              Search depth is read off your Elo, not fixed at a round number. The net widens; the
              gates don&rsquo;t move.
            </p>
            <div className={styles.net}>
              {NET.map((r) => (
                <div key={r.band} className={styles.netRow}>
                  <span className={styles.netBand}>{r.band}</span>
                  <span className={styles.netBar}>
                    <i style={{ width: `${r.w}%` }} />
                  </span>
                  <b className={styles.netN}>{r.n}</b>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.rule} ${styles.rise}`}>
            <h3 className={styles.h3}>
              <span className={styles.ruleN}>2</span> Three gates, every puzzle
            </h3>
            <div className={styles.gates}>
              {GATES.map((g) => (
                <div key={g.name} className={styles.gate}>
                  <span className={styles.gateName}>{g.name}</span>
                  <p>{g.rule}</p>
                  <p className={styles.gateOut}>
                    <span>Rules out</span> {g.out}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================= JOURNEY */}
      <section className={styles.section} aria-labelledby="journey">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>One blunder, end to end</p>
          <h2 id="journey" className={`${styles.h2} ${styles.rise}`}>Watch it happen.</h2>
        </div>

        <div className={styles.journey}>
          <ol className={`${styles.beats} ${styles.rise}`}>
            {BEATS.map(([name, what], i) => (
              <li key={name} data-on={solved && i >= 4 ? true : undefined}>
                <span className={styles.beatN}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.beatName}>{name}</span>
                <span className={styles.beatWhat}>{what}</span>
              </li>
            ))}
          </ol>

          <div ref={journeyRef} className={`${styles.stage} ${styles.rise}`}>
            <div className={styles.frame}>
              <div className={styles.frameBoard}>
                <Board
                  fen={solved ? FEN_AFTER : FEN_BEFORE}
                  orientation="white"
                  hint={solved ? [] : ['d1']}
                  highlight={solved ? ['d1', 'd8'] : []}
                  danger={solved ? 'g8' : null}
                  mated={solved}
                  lastMove={solved ? { from: 'd1', to: 'd8' } : null}
                />
                <div className={styles.frameEval}>
                  {solved ? (
                    <EvalBar cp={1200} label="1-0" peakMate={1} peakLabel="M1" decided isUserMove step="s" />
                  ) : (
                    <EvalBar cp={-40} label="−0.4" peakMate={1} peakLabel="M1" loop step="u" />
                  )}
                </div>
                {solved && <Confetti run />}
              </div>
              <CoachBubble
                classification="best"
                evalText={solved ? '1-0' : undefined}
                text={
                  solved
                    ? '♜–d8# — checkmate on the weak back rank. The king never had a square.'
                    : 'A forced mate is on the board. The rook can only be one move.'
                }
              />
              <p className={styles.frameCap}>
                {solved
                  ? 'The right move — green sweeps back up the eval bar.'
                  : 'M1 was available. The blunder left −5.0: the mate and the rook.'}
              </p>
            </div>
          </div>
        </div>

        <p className={`${styles.micro} ${styles.rise}`}>
          Difficulty is <em>read off the position</em> — moves to find, alternatives, whether the
          key move forces, size of payoff — shown as a muted badge. An output, never an input.
        </p>
      </section>

      {/* ====================================================== VERSIONS */}
      <section className={styles.section} aria-labelledby="versions">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Two versions, one switch</p>
          <h2 id="versions" className={`${styles.h2} ${styles.rise}`}>
            Which games become which puzzles — and when?
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
              Your last N games, pooled into one set that&rsquo;s always full. A queue — zero
              navigation, best-of a wide pool.
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
              Puzzles grouped by the day you played. The calendar <em>is</em> the progress record
              — streaks and gaps become visible.
            </p>
          </div>
        </div>

        <p className={`${styles.micro} ${styles.rise}`}>
          Both shipped behind a switch. V2&rsquo;s &ldquo;a day is as long as it is&rdquo; killed
          V1&rsquo;s daily quota.
        </p>
      </section>

      {/* ========================================================== WALL */}
      <section className={styles.section} aria-labelledby="wall">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Free vs premium</p>
          <h2 id="wall" className={`${styles.h2} ${styles.rise}`}>The wall is the pitch.</h2>
        </div>
        <p className={`${styles.lede} ${styles.rise}`}>
          Free members see the whole set — locked, and exactly how far in the wall sits. Upgrading
          resumes at the next puzzle, no reload.
        </p>

        <div className={`${styles.wallRow} ${styles.rise}`} aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className={styles.wallTile}
              data-state={i < 3 ? 'done' : i === 3 ? 'next' : 'locked'}
            >
              {i < 3 ? '✓' : i >= 4 ? '⌐' : ''}
            </span>
          ))}
          <span className={styles.wallLine} />
        </div>
        <p className={`${styles.micro} ${styles.rise}`}>
          Counter reads <em>Puzzle 3 / 12</em> — the whole set, never <em>3 / 3</em>.
        </p>
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
          A prototype, not a launch — outcomes to validate, not claim.
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
            <dd>&ldquo;Blunder&rdquo; is a severity, not a lesson — cluster into back rank, hanging pieces, endgames.</dd>
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

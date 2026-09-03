'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Board, CoachBubble } from '@/components/CaseStudy/chess';
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

// Move-classification taxonomy for the badge-stack tile (bottom four are mined)
const BADGES = [
  { name: 'Brilliant', icon: 'brilliant', color: '#26c2a3' },
  { name: 'Great', icon: 'great', color: '#5c8bb0' },
  { name: 'Best', icon: 'best', color: '#81b64c' },
  { name: 'Excellent', icon: 'excellent', color: '#95b776' },
  { name: 'Good', icon: 'good', color: '#a8a89a' },
  { name: 'Book', icon: 'book', color: '#a88865' },
  { name: 'Inaccuracy', icon: 'inaccuracy', color: '#f0c15c' },
  { name: 'Mistake', icon: 'mistake', color: '#e58f2a' },
  { name: 'Miss', icon: 'missed', color: '#e0a03c' },
  { name: 'Blunder', icon: 'blunder', color: '#ca3431' },
];

const MATE_FEN = '3R2k1/5ppp/8/8/8/8/5PPP/6K1';

const UPGRADE_FLOW = [
  'Hit the wall at puzzle 3',
  'Upgrade in place, no reload',
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

// V1 rolling-window demo — a row scans, then the set refills, on a loop
const WINDOW_GAMES = [
  { opp: 'vs. Kowalski', n: '2 puzzles', ok: true },
  { opp: 'vs. Ferreira', n: '3 puzzles', ok: false },
  { opp: 'vs. Novak', n: '1 puzzle', ok: true },
  { opp: 'vs. Reyes', n: '4 puzzles', ok: false },
  { opp: 'vs. Adeyemi', n: '2 puzzles', ok: true },
  { opp: 'vs. Haddad', n: '0 puzzles', ok: false },
  { opp: 'vs. Petrov', n: '2 puzzles', ok: true },
];

// V2 diary demo — a real month; cleared days land in the order they were cleared
const CAL_CLEARED = [3, 4, 8, 11, 15, 16, 22];
const CAL_HAS = [5, 9, 12, 18, 19, 23, 25];
const CAL_TODAY = 26;

// Product decisions — a Chess.com "game review" that steps on scroll: the
// sticky rail + panel stay put while the track scrolls past, advancing the
// active call. Click a rail item to jump to it.
function Decisions() {
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // keep the active rail item in view as the section scroll-steps
  useEffect(() => {
    const rail = railRef.current;
    const btn = rail?.children[active] as HTMLElement | undefined;
    if (!rail || !btn || rail.scrollWidth <= rail.clientWidth) return;
    const railRect = rail.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const target =
      rail.scrollLeft + (btnRect.left - railRect.left) - rail.clientWidth / 2 + btnRect.width / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [active]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const total = track.offsetHeight - vh;
      if (total < vh * 0.5) return; // not pinned (small screen) — leave as-is
      const scrolled = -track.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, scrolled / total));
      const idx = Math.min(
        DECISIONS.length - 1,
        Math.max(0, Math.floor(p * DECISIONS.length - 1e-6)),
      );
      setActive((prev) => (prev === idx ? prev : idx));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const total = track.offsetHeight - window.innerHeight;
    if (total <= 0) {
      setActive(i);
      return;
    }
    const top =
      window.scrollY +
      track.getBoundingClientRect().top +
      (total * (i + 0.5)) / DECISIONS.length;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const d = DECISIONS[active];

  return (
    <div className={styles.drTrack} ref={trackRef}>
      <div className={styles.drReview}>
        <div
          className={styles.drRail}
          role="tablist"
          aria-label="Product decisions"
          ref={railRef}
        >
          {DECISIONS.map((item, i) => (
            <button
              key={item.n}
              type="button"
              role="tab"
              aria-selected={active === i}
              data-on={active === i || undefined}
              className={styles.drItem}
              onClick={() => goTo(i)}
            >
              <b>{item.n}</b>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/case-study/move-types/${item.icon}.png`} alt="" width={24} height={24} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.drPanel}>
          <div key={active} className={styles.drPanelInner}>
            <p className={styles.drKicker}>
              Decision {d.n}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/case-study/move-types/${d.icon}.png`} alt="" width={18} height={18} />
              <i style={{ color: `color-mix(in oklab, ${d.color} 66%, var(--fg))` }}>{d.tag}</i>
            </p>
            <h3 className={styles.drClaim}>{d.claim}</h3>
            <div className={styles.drSay}>
              <CoachBubble classification={d.icon} text={d.coach} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Built pieces — real prototype screens in the Chess.com surface, framed by
// portfolio-theme tiles. Ported from framercomponent.tsx §9.6.
function BuiltPieces() {
  return (
    <div className={styles.bento}>
      {/* home hero card */}
      <figure className={`${styles.tile} ${styles.tileHome} ${styles.rise}`}>
        <div className={styles.tileFrame}>
          <div className={styles.bPreview}>
            <div className={styles.bPreviewBoard}>
              <Board fen={MATE_FEN} orientation="white" showCoordinates={false} />
            </div>
            <div className={styles.bPreviewBody}>
              <p className={styles.bPreviewTitle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/case-study/game-based-puzzles.svg" alt="" width={18} height={18} />
                Game Puzzles
              </p>
              <p className={styles.bPreviewSub}>
                <span className={styles.bPreviewCount}>4/12</span> completed
              </p>
              <div className={styles.bProgress}>
                <div className={styles.bProgressFill} />
              </div>
              <button type="button" className={`${styles.bBtn} ${styles.bBtnPrimary} ${styles.bShimmer}`}>
                Solve Puzzles
              </button>
            </div>
          </div>
        </div>
        <figcaption className={styles.tileCap}>
          <h4>Home hero card</h4>
          <p>Reads the same progress state the solver writes to, so it can never drift.</p>
        </figcaption>
      </figure>

      {/* evaluation bar */}
      <figure className={`${styles.tile} ${styles.tileEval} ${styles.rise}`}>
        <div className={styles.tileFrame}>
          <div className={styles.bEvalRow}>
            <div className={styles.bEvalCol}>
              <div className={styles.bEval}>
                <span className={styles.bEvalFill} style={{ height: '68%' }} />
                <span className={styles.bEvalMid} />
                <span className={`${styles.bEvalNum} ${styles.bEvalNumLive}`}>+5.0</span>
              </div>
              <span className={styles.bEvalLbl}>Available</span>
            </div>
            <div className={styles.bEvalCol}>
              <div className={styles.bEval}>
                <span className={styles.bEvalFill} style={{ height: '54%' }} />
                <span className={styles.bEvalBand} data-loss style={{ bottom: '54%', height: '14%' }}>
                  <span className={styles.bEvalHot} />
                </span>
                <span className={styles.bEvalMid} />
                <span className={`${styles.bEvalNum} ${styles.bEvalNumLive}`}>+1.0</span>
                <span
                  className={`${styles.bEvalNum} ${styles.bEvalNumDrop}`}
                  style={{ bottom: 'calc(61% - 5px)' }}
                >
                  4.0<span className={styles.bEvalArrow}>↓</span>
                </span>
              </div>
              <span className={styles.bEvalLbl}>Dropped 4.0</span>
            </div>
            <div className={styles.bEvalCol}>
              <div className={styles.bEval}>
                <span className={styles.bEvalFill} style={{ height: '100%' }} />
                <span className={styles.bEvalBand} data-gain style={{ bottom: '54%', height: '46%' }}>
                  <span className={styles.bEvalHot} />
                </span>
                <span className={styles.bEvalMid} />
                <span className={`${styles.bEvalNum} ${styles.bEvalNumLive}`}>1-0</span>
              </div>
              <span className={styles.bEvalLbl}>Won back</span>
            </div>
          </div>
        </div>
        <figcaption className={styles.tileCap}>
          <h4>Evaluation bar</h4>
          <p>
            The red band carries the size of the drop, or the mate thrown away. No subtraction
            required.
          </p>
        </figcaption>
      </figure>

      {/* classification badges */}
      <figure className={`${styles.tile} ${styles.tileBadges} ${styles.rise}`}>
        <div className={styles.tileFrame}>
          <div className={styles.bStack}>
            {BADGES.map((b, i) => (
              <span
                key={b.name}
                className={styles.bBadge}
                style={{
                  color: `color-mix(in oklab, ${b.color} 72%, var(--fg))`,
                  ['--i' as string]: `${i * 30}ms`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/case-study/move-types/${b.icon}.png`} alt="" width={28} height={28} />
                {b.name}
              </span>
            ))}
            <span className={styles.bStackNote}>Puzzles are mined from the bottom four.</span>
          </div>
        </div>
        <figcaption className={styles.tileCap}>
          <h4>Classification badges</h4>
          <p>Official art, one colour each: the taxonomy the queue is built on.</p>
        </figcaption>
      </figure>

      {/* the coach */}
      <figure className={`${styles.tile} ${styles.tileCoach} ${styles.rise}`}>
        <div className={styles.tileFrame}>
          <CoachBubble
            classification="missed"
            caret
            text="♜xd8#. Checkmate on the weak back rank. Spot a forced mate in one and start it with the right move."
          />
        </div>
        <figcaption className={styles.tileCap}>
          <h4>The coach</h4>
          <p>Two halves: what happened, then the pattern to take away.</p>
        </figcaption>
      </figure>

      {/* completion — free vs premium */}
      <figure className={`${styles.tile} ${styles.tileDone} ${styles.rise}`}>
        <div className={styles.tileFrame}>
          <div className={styles.bDoneRow}>
            <div className={styles.bComplete}>
              <p className={styles.bCompleteTitle}>Get Unlimited Puzzles!</p>
              <div className={styles.bCompleteStats}>
                <div>
                  <b>3/3</b>
                  <span>Clean</span>
                </div>
                <div>
                  <b>0</b>
                  <span>Hint</span>
                </div>
                <div>
                  <b>9</b>
                  <span>Locked</span>
                </div>
              </div>
              <button type="button" className={`${styles.bBtn} ${styles.bBtnInfo} ${styles.bShimmer}`}>
                Go Premium
              </button>
            </div>
            <div className={styles.bComplete}>
              <p className={styles.bCompleteTitle}>You&rsquo;re all caught up!</p>
              <div className={styles.bCompleteStats}>
                <div>
                  <b>9</b>
                  <span>Clean</span>
                </div>
                <div>
                  <b>2</b>
                  <span>Hint</span>
                </div>
                <div>
                  <b>1</b>
                  <span>Failed</span>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.bBtn} ${styles.bBtnPrimary} ${styles.bShimmer}`}
              >
                Retry 3 puzzles
              </button>
            </div>
          </div>
        </div>
        <figcaption className={styles.tileCap}>
          <h4>Completion: free vs premium</h4>
          <p>The set is never trimmed. Free members see all 12 and exactly where the wall sits.</p>
        </figcaption>
      </figure>

      {/* solver rows */}
      <figure className={`${styles.tile} ${styles.tileRows} ${styles.rise}`}>
        <div className={styles.tileFrame}>
          <div className={styles.bRows}>
            <div className={`${styles.bRow} ${styles.bRowMistake}`}>
              <span>You played</span>
              <s className={styles.bFig}>♜d3</s>
              <span className={styles.bRowEnd} data-loss>
                M1 → −5.0
              </span>
            </div>
            <div className={`${styles.bRow} ${styles.bRowSolved}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/case-study/move-types/best.png" alt="" width={18} height={18} />
              <span className={styles.bFig}>♜xd8#</span>
              <span className={styles.bRowEnd}>is correct!</span>
            </div>
            <div className={`${styles.bRow} ${styles.bRowPulse}`}>Solved · 1-0</div>
          </div>
        </div>
        <figcaption className={styles.tileCap}>
          <h4>Solver rows</h4>
          <p>Figurine notation, because &ldquo;Rd3&rdquo; reads wrong in a Chess.com context.</p>
        </figcaption>
      </figure>
    </div>
  );
}

const DECISIONS = [
  {
    n: '01',
    tag: 'Brilliant',
    icon: 'brilliant',
    color: '#26c2a3',
    label: 'What counts as a puzzle',
    claim: 'The engine’s best move is not a puzzle.',
    coach:
      'Not every engine disagreement is teachable. Three gates now stand between a raw disagreement and a puzzle: findable, singular, worth it. Eight solid puzzles beat fifteen with five duds.',
  },
  {
    n: '02',
    tag: 'Great',
    icon: 'great',
    color: '#5c8bb0',
    label: 'One mistake, one lesson',
    claim: 'One mistake is one lesson, however many disasters followed it.',
    coach:
      'One error, repeated in a game, used to become four near-identical puzzles. Near-duplicates now collapse into the single clearest instance, so one mistake teaches one lesson.',
  },
  {
    n: '03',
    tag: 'Best',
    icon: 'best',
    color: '#81b64c',
    label: 'What rating decides',
    claim: 'Rating sets how deep we look, never how hard the puzzle is.',
    coach:
      'Rating sets depth of search, never puzzle difficulty. A mate in three stays a mate in three for an 1100: the whole idea, not a truncated half of it.',
  },
  {
    n: '04',
    tag: 'Excellent',
    icon: 'excellent',
    color: '#95b776',
    label: 'The bar does the talking',
    claim: 'The bar explains the loss, so the copy doesn’t have to.',
    coach:
      'The eval bar carries the cost of a move on its own, anchored at what was available, draining to what was left. No two numbers to subtract in your head.',
  },
  {
    n: '05',
    tag: 'Good',
    icon: 'good',
    color: '#a8a89a',
    label: 'The whole set, wall included',
    claim: 'Show free members the whole set, including what they can’t reach.',
    coach:
      'Free members see the whole set, all twelve, with the wall shown exactly where it falls. Upgrading resumes at the next puzzle, and the locked ones are the pitch.',
  },
] as const;

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
          <div className={styles.tags} aria-label="Case study tags">
            <ul className={styles.tagsSet}>
              <li>Product design concept</li>
              {TAGS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <ul className={`${styles.tagsSet} ${styles.tagsDupe}`} aria-hidden>
              <li>Product design concept</li>
              {TAGS.map((t) => (
                <li key={`dupe-${t}`}>{t}</li>
              ))}
            </ul>
          </div>

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
          An exploration rule, not a validated formula. The bands below are a starting point to
          test, not a measured result.
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
          The set size is still never padded. The net widens, the quality gates don&rsquo;t move.
          If the games only held eight fair puzzles, the set is eight.
        </p>
      </section>

      {/* ====================================================== VERSIONS */}
      <section className={styles.section} aria-labelledby="versions">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Two versions, one switch</p>
          <h2 id="versions" className={`${styles.h2} ${styles.rise}`}>
            Which games become
            <br />
            which puzzles, and when?
          </h2>
        </div>
        <p className={`${styles.lede} ${styles.rise}`}>
          Two answers were arguable. Rather than argue in the abstract, both were built, so they
          can be tested on real players rather than decided in a room.
        </p>

        <div className={styles.versions}>
          {/* V1 — the rolling window */}
          <article className={`${styles.version} ${styles.rise}`}>
            <div className={styles.versionHead}>
              <span className={styles.vTag}>V1</span>
              <span className={styles.versionMicro}>The rolling window</span>
            </div>
            <div className={styles.versionDemo}>
              <div className={styles.window} aria-hidden>
                {WINDOW_GAMES.map((g, i) => (
                  <div
                    key={g.opp}
                    className={styles.windowGame}
                    style={{ ['--i' as string]: `${(i * 0.1).toFixed(1)}s` }}
                  >
                    <i data-ok={g.ok || undefined} />
                    {g.opp} <span>{g.n}</span>
                  </div>
                ))}
                <p className={styles.windowMore}>+ 3 more recent games</p>
                <div className={styles.windowOut}>One standing set · 12 puzzles</div>
              </div>
            </div>
            <div className={styles.versionBody}>
              <h3>Your last N reviewed games</h3>
              <p>
                Everything mineable goes into one pool; the best of it becomes a single set
                that&rsquo;s always there.
              </p>
              <ul className={styles.pros}>
                <li>Zero navigation: open the page, puzzles are waiting</li>
                <li>Best-of selection from a wide pool</li>
                <li data-con>No sense of time or rhythm; it&rsquo;s a bucket, not a record</li>
                <li data-con>Once solved, there&rsquo;s nothing to come back to</li>
              </ul>
            </div>
          </article>

          {/* V2 — the diary */}
          <article className={`${styles.version} ${styles.rise}`}>
            <div className={styles.versionHead}>
              <span className={styles.vTag}>V2</span>
              <span className={styles.versionMicro}>The diary</span>
            </div>
            <div className={styles.versionDemo}>
              <div className={styles.cal} aria-hidden>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={`dow-${i}`} className={styles.calDow}>
                    {d}
                  </span>
                ))}
                {Array.from({ length: 2 }).map((_, i) => (
                  <span key={`empty-${i}`} className={`${styles.calDay} ${styles.calEmpty}`} />
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const at = CAL_CLEARED.indexOf(day);
                  const isToday = day === CAL_TODAY;
                  const cls = [
                    styles.calDay,
                    at > -1 ? styles.calDone : '',
                    CAL_HAS.includes(day) || isToday ? styles.calHas : '',
                    isToday ? styles.calToday : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <span
                      key={day}
                      className={cls}
                      style={at > -1 ? { ['--i' as string]: `${(at * 0.13).toFixed(2)}s` } : undefined}
                    >
                      <span>{day}</span>
                    </span>
                  );
                })}
              </div>
              <div className={styles.calLegend} aria-hidden>
                <span>
                  <i data-cleared /> Cleared
                </span>
                <span>
                  <i data-has /> Has puzzles
                </span>
                <span>
                  <i data-today /> Today
                </span>
              </div>
            </div>
            <div className={styles.versionBody}>
              <h3>Puzzles from the day you played</h3>
              <p>
                Grouped by date, with a stepper and a month calendar. No target, no padding. A
                day is as long as that day&rsquo;s chess deserved.
              </p>
              <ul className={styles.pros}>
                <li>
                  The calendar <em>is</em> the progress record, so streaks and gaps become
                  visible
                </li>
                <li>An uncleared day sits there, visibly uncleared</li>
                <li data-con>Play nothing, get nothing: empty days are real</li>
                <li data-con>A navigation decision before you can solve anything</li>
              </ul>
            </div>
          </article>
        </div>

        <div className={`${styles.vSwitch} ${styles.rise}`}>
          <span className={styles.vSwitchStep}>
            <b>?</b> Still open
          </span>
          <p>
            Both are live in the prototype behind a switch, so the same account can be run on
            either. <b>V1 optimises the session</b>: always full, no decisions.{' '}
            <b>V2 optimises the return</b>: an uncleared day pulls you back. Which one wins is a
            research question, not a taste one.
          </p>
        </div>
      </section>

      {/* =================================================== BUILT PIECES */}
      <section className={styles.section} aria-labelledby="parts">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Built pieces</p>
          <h2 id="parts" className={`${styles.h2} ${styles.rise}`}>
            The parts that
            <br />
            carry the feature.
          </h2>
        </div>
        <p className={`${styles.lede} ${styles.rise}`}>Real screens from the prototype. One line each.</p>
        <BuiltPieces />
      </section>

      {/* ===================================================== DECISIONS */}
      <section className={styles.section} aria-labelledby="decisions">
        <div className={styles.head}>
          <p className={`${styles.kick} ${styles.rise}`}>Product decisions</p>
          <h2 id="decisions" className={`${styles.h2} ${styles.rise}`}>
            Five calls that
            <br />
            changed the product.
          </h2>
        </div>
        <Decisions />
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
              <b>The puzzles you can see but can&rsquo;t reach are the argument</b>, stated as a
              fact, not a sales line.
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
              usefulness and the default focus moves down the list as options disappear, so{' '}
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

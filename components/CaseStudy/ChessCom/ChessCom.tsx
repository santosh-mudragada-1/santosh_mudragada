'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { revealUp } from '@/lib/motion/reveal';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './ChessCom.module.scss';

// ---------------------------------------------------------------------------
// Content — adapted from the project's own case-study document.
// ---------------------------------------------------------------------------

const META: Array<[string, string]> = [
  ['Role', 'Product design — end to end, solo'],
  ['Timeline', '2 weeks · Jul–Aug 2026'],
  ['Tools', 'Figma · Next.js · TypeScript · Stockfish 18 · chess.js'],
  ['Type', 'Working prototype, engine-verified'],
];

const NET: Array<[string, string]> = [
  ['Under 1000', '6 games'],
  ['1000 – 1400', '10 games'],
  ['1400 – 1800', '16 games'],
  ['1800 +', '25 games'],
];

const GATES: Array<{ name: string; rule: string; prevents: string }> = [
  {
    name: 'Findable',
    rule: 'The first move is a capture, a check, or mate.',
    prevents: 'A quiet move nothing asks you to look at.',
  },
  {
    name: 'Singular',
    rule: 'It beats the second-best move by a clear margin.',
    prevents: 'A coin toss the solver is told they lost.',
  },
  {
    name: 'Worth it',
    rule: 'It wins something decisive — mate or real material.',
    prevents: "A puzzle whose answer wins a tenth of a pawn.",
  },
];

const BEATS: Array<[string, string]> = [
  ['Play', 'A real game pulled from your archive.'],
  [
    'Detect',
    'Stockfish flags the move. The blunder hands back the mate and the rook.',
  ],
  ['Rewind', 'The board returns to the instant before the decision.'],
  ['Decide', 'Legal dots, a ring for the key capture, a three-step hint ladder.'],
  ['Feedback', '♜xd8#. Green sweeps back up the eval bar.'],
  ['Return', 'Home card, set counter and queue all update at once.'],
];

const DECISIONS: Array<{ n: string; decision: string; ruledOut: string }> = [
  {
    n: '01',
    decision:
      "The engine's best move is not a puzzle. Three gates separate an engine disagreement from a genuinely teachable position.",
    ruledOut: 'Puzzles that are unfair rather than hard.',
  },
  {
    n: '02',
    decision:
      'One mistake is one lesson, however many disasters followed it. Near-duplicate errors collapse into the clearest instance.',
    ruledOut: 'A set that drills one mistake and calls it four.',
  },
  {
    n: '03',
    decision:
      'Rating sets how deep we look, never how hard the puzzle is. A mate in three stays a mate in three.',
    ruledOut: 'Deciding in advance what someone can handle.',
  },
  {
    n: '04',
    decision:
      'The bar explains the loss, so the copy does not have to. A visual read instead of two numbers to subtract.',
    ruledOut: "A sentence doing a picture's job.",
  },
  {
    n: '05',
    decision:
      'Show free members the whole set, including what they cannot reach. Upgrading resumes at the exact puzzle.',
    ruledOut: 'Hiding the thing you are selling.',
  },
];

const METRICS: Array<{ name: string; q: string; primary?: boolean }> = [
  {
    name: 'Repeat-mistake rate',
    q: 'Do players make fewer of the same mistakes after practising them as personalised puzzles?',
    primary: true,
  },
  {
    name: 'Clean-solve rate',
    q: 'Can players solve generated puzzles without hints or the solution?',
  },
  {
    name: 'Puzzle abandonment',
    q: 'Do players leave because a puzzle feels confusing, unfair, or irrelevant?',
  },
  {
    name: 'Return rate',
    q: 'Do players come back to solve more of their personalised puzzles?',
  },
  {
    name: 'Review → puzzle conversion',
    q: 'How many reviewed games produce at least one puzzle worth practising?',
  },
];

// Back-rank mate diagram — file a–h (0–7), rank 8→1 (row 0–7).
type Piece = { sq: [number, number]; g: string; white: boolean };
const BOARD: Piece[] = [
  { sq: [6, 0], g: '♚', white: false }, // g8 black king
  { sq: [5, 1], g: '♟', white: false }, // f7
  { sq: [6, 1], g: '♟', white: false }, // g7
  { sq: [7, 1], g: '♟', white: false }, // h7
  { sq: [3, 0], g: '♜', white: false }, // d8 — the mating rook
  { sq: [6, 7], g: '♔', white: true }, // g1 white king
  { sq: [5, 6], g: '♙', white: true }, // f2
  { sq: [6, 6], g: '♙', white: true }, // g2
  { sq: [7, 6], g: '♙', white: true }, // h2
];

export function ChessCom() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const cleanups: Array<() => void> = [];

      // hero line-mask entrance (fires on mount, not scroll)
      const lines = root.querySelectorAll<HTMLElement>(`.${styles.titleLine} > span`);
      if (lines.length) {
        if (reduced) {
          gsap.set(lines, { yPercent: 0, autoAlpha: 1 });
        } else {
          cleanups.push(() => gsap.killTweensOf(lines));
          gsap.fromTo(
            lines,
            { yPercent: 108 },
            {
              yPercent: 0,
              duration: 1,
              ease: 'expo.out',
              stagger: 0.09,
              delay: 0.15,
            },
          );
        }
      }

      // section reveals
      cleanups.push(
        revealUp(root.querySelectorAll(`.${styles.reveal}`), {
          y: 30,
          stagger: 0.08,
          start: 'top 84%',
        }),
      );

      // eval-bar fills scrub in as the journey scrolls through
      if (!reduced) {
        const drop = root.querySelector<HTMLElement>(`.${styles.evalDrop}`);
        const gain = root.querySelector<HTMLElement>(`.${styles.evalGain}`);
        if (drop && gain) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: drop.closest(`.${styles.evalWrap}`),
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
          });
          tl.fromTo(
            drop,
            { scaleY: 0 },
            { scaleY: 1, duration: 0.7, ease: 'power2.in' },
          ).fromTo(
            gain,
            { scaleY: 0 },
            { scaleY: 1, duration: 0.9, ease: 'power3.out' },
            '+=0.25',
          );
          cleanups.push(() => tl.scrollTrigger?.kill());
        }
      }

      return () => cleanups.forEach((c) => c());
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  return (
    <article ref={rootRef} className={styles.root}>
      {/* ---------------------------------------------------------------- Hero */}
      <header className={styles.hero}>
        <Link href="/work" className={styles.back} data-cursor="link">
          <span aria-hidden>←</span> Selected work
        </Link>

        <p className={styles.eyebrow}>
          Chess.com <span aria-hidden>·</span> Game-based learning{' '}
          <span aria-hidden>·</span> 2026
        </p>

        <h1 className={styles.title} aria-label="Your own blunders, handed back as puzzles.">
          <span className={styles.titleLine}>
            <span>Your own</span>
          </span>
          <span className={styles.titleLine}>
            <span>
              blunders<em>,</em>
            </span>
          </span>
          <span className={styles.titleLine}>
            <span>handed back</span>
          </span>
          <span className={styles.titleLine}>
            <span>as puzzles.</span>
          </span>
        </h1>

        <dl className={`${styles.meta} ${styles.reveal}`}>
          {META.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <p className={`${styles.disclaimer} ${styles.reveal}`}>
          Independent design concept. Borrows Chess.com&rsquo;s design language;
          not affiliated with or endorsed by Chess.com. Sample games and figures
          are fabricated for the prototype.
        </p>
      </header>

      {/* ------------------------------------------------------------- Context */}
      <section className={styles.section} aria-labelledby="context">
        <h2 id="context" className={`${styles.h2} ${styles.reveal}`}>
          Review already works. It just ends too early.
        </h2>
        <p className={`${styles.lede} ${styles.reveal}`}>
          Chess.com lets you review a finished game — see exactly where it went
          wrong and read the engine&rsquo;s explanation of what should have
          happened instead. It&rsquo;s useful, but it&rsquo;s a single session.
          Once the analysis is over you move to the next game, and that exact
          decision disappears back into your history with no natural reason to
          see it again.
        </p>

        <ol className={`${styles.loop} ${styles.reveal}`} aria-label="Current loop">
          {['Play', 'Review', 'Understand', 'Move on'].map((s, i) => (
            <li key={s} data-last={i === 3 || undefined}>
              <span className={styles.loopNum}>{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </section>

      {/* ----------------------------------------------------------------- Gap */}
      <section className={styles.section} aria-labelledby="gap">
        <h2 id="gap" className={`${styles.h2} ${styles.reveal}`}>
          The missing piece isn&rsquo;t analysis. It&rsquo;s practice — and a
          reason to return.
        </h2>

        <div className={`${styles.split} ${styles.reveal}`}>
          <div className={styles.splitCol}>
            <span className={styles.colLabel}>Today — ends at step 4</span>
            <ol className={styles.stepList}>
              {['Play', 'Review', 'Understand', 'Done'].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <div className={styles.splitCol} data-accent>
            <span className={styles.colLabel}>The opportunity — six steps</span>
            <ol className={styles.stepList}>
              {['Play', 'Detect', 'Practice', 'Feedback', 'Progress', 'Return'].map(
                (s, i) => (
                  <li key={s} data-new={i >= 2 || undefined}>
                    {s}
                  </li>
                ),
              )}
            </ol>
          </div>
        </div>

        <p className={`${styles.body} ${styles.reveal}`}>
          Every Chess.com puzzle product — Daily Puzzle, Puzzle Rush, Puzzle
          Battle, Custom Puzzles — draws from <em>other people&rsquo;s</em> games.
          Good tactics training; not <em>your</em> tactics training.
        </p>

        <blockquote className={`${styles.quote} ${styles.reveal}`}>
          The best puzzle for you is one you have already failed — under a clock,
          in a game that mattered.
        </blockquote>
      </section>

      {/* --------------------------------------------------------------- Fair */}
      <section className={styles.section} aria-labelledby="fair">
        <p className={`${styles.kicker} ${styles.reveal}`}>How the set gets built</p>
        <h2 id="fair" className={`${styles.h2} ${styles.reveal}`}>
          The hard part was never generating puzzles. It was generating{' '}
          <em>fair</em> ones.
        </h2>
        <p className={`${styles.lede} ${styles.reveal}`}>
          A raw engine blunder-list is a list of moments where a 3500-rated engine
          disagreed with a 1200-rated human. Two rules do most of the work.
        </p>

        <div className={`${styles.ruleBlock} ${styles.reveal}`}>
          <h3 className={styles.h3}>1 · Rating decides how wide we cast the net</h3>
          <p className={styles.body}>
            A prototype heuristic, not a validated formula: search depth is read
            off the player&rsquo;s Elo rather than fixed at a round number. The
            net widens; the quality gates don&rsquo;t move. If those games only
            held eight fair puzzles, the set is eight.
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rating</th>
                <th>Games analysed</th>
              </tr>
            </thead>
            <tbody>
              {NET.map(([r, g]) => (
                <tr key={r}>
                  <td>{r}</td>
                  <td>{g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`${styles.ruleBlock} ${styles.reveal}`}>
          <h3 className={styles.h3}>2 · Three gates every puzzle must clear</h3>
          <div className={styles.gateGrid}>
            {GATES.map((g) => (
              <div key={g.name} className={styles.gate}>
                <span className={styles.gateName}>{g.name}</span>
                <p className={styles.gateRule}>{g.rule}</p>
                <p className={styles.gatePrevents}>
                  <span aria-hidden>Rules out</span> {g.prevents}
                </p>
              </div>
            ))}
          </div>
          <p className={styles.finePrint}>
            Positions that fail a gate are simply not made into puzzles.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ Journey */}
      <section className={styles.section} aria-labelledby="journey">
        <p className={`${styles.kicker} ${styles.reveal}`}>The journey</p>
        <h2 id="journey" className={`${styles.h2} ${styles.reveal}`}>
          One blunder, end to end.
        </h2>

        <div className={styles.journeyGrid}>
          <ol className={`${styles.beats} ${styles.reveal}`}>
            {BEATS.map(([name, what], i) => (
              <li key={name}>
                <span className={styles.beatNum}>{i + 1}</span>
                <span className={styles.beatName}>{name}</span>
                <span className={styles.beatWhat}>{what}</span>
              </li>
            ))}
          </ol>

          <div className={`${styles.diagram} ${styles.reveal}`}>
            <div
              className={styles.board}
              role="img"
              aria-label="Back-rank mate: the black king on g8 is boxed in by its own pawns; a rook on d8 delivers mate along the back rank."
            >
              {Array.from({ length: 64 }).map((_, i) => {
                const file = i % 8;
                const rank = Math.floor(i / 8);
                const dark = (file + rank) % 2 === 1;
                const piece = BOARD.find(
                  (p) => p.sq[0] === file && p.sq[1] === rank,
                );
                return (
                  <span
                    key={i}
                    className={styles.sq}
                    data-dark={dark || undefined}
                    data-mate={rank === 0 && file === 6 ? true : undefined}
                  >
                    {piece && (
                      <span
                        className={styles.piece}
                        data-white={piece.white || undefined}
                      >
                        {piece.g}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>

            <div className={styles.evalWrap}>
              <div className={styles.evalBar}>
                {/* red drop first, green recovery painted on top */}
                <span className={styles.evalDrop} />
                <span className={styles.evalGain} />
              </div>
              <div className={styles.evalCaption}>
                <b>M1</b> was on the board.
                <br />
                The blunder left <b>−5.0</b> — the mate and the rook.
                <br />A correct move sweeps the bar back green.
              </div>
            </div>
          </div>
        </div>

        <p className={`${styles.finePrint} ${styles.reveal}`}>
          Difficulty is <em>read off the position</em> — moves to find, playable
          alternatives, whether the key move forces, size of payoff — and shown
          as a muted badge. It is an output, never an input.
        </p>
      </section>

      {/* ------------------------------------------------------- Two versions */}
      <section className={styles.section} aria-labelledby="versions">
        <p className={`${styles.kicker} ${styles.reveal}`}>Two versions</p>
        <h2 id="versions" className={`${styles.h2} ${styles.reveal}`}>
          Which games become which puzzles — and when do they arrive?
        </h2>
        <p className={`${styles.lede} ${styles.reveal}`}>
          Two answers were arguable, so both were built and kept switchable on the
          same account — to be tested on real players instead of decided in a
          room.
        </p>

        <div className={`${styles.versions} ${styles.reveal}`}>
          <div className={styles.version}>
            <span className={styles.versionTag}>V1</span>
            <h3 className={styles.h3}>The rolling window</h3>
            <p className={styles.body}>
              Your last N reviewed games, pooled into one standing set that is
              always full. A queue, like Puzzle Rush — zero navigation,
              best-of selection from a wide pool.
            </p>
            <p className={styles.finePrint}>
              Gives up: no sense of time, nothing to return to once solved.
            </p>
          </div>
          <div className={styles.version}>
            <span className={styles.versionTag}>V2</span>
            <h3 className={styles.h3}>The diary</h3>
            <p className={styles.body}>
              Puzzles grouped by the day you played, behind a date stepper that
              opens into a month calendar. A training log, like an activity ring —
              the calendar <em>is</em> the progress record.
            </p>
            <p className={styles.finePrint}>
              Gives up: empty days are real; a navigation decision before you can
              solve.
            </p>
          </div>
        </div>

        <p className={`${styles.body} ${styles.reveal}`}>
          <strong>What V2 taught V1:</strong> V1 originally chased a hard target
          of 15 puzzles a day, relaxing its own quality standards to reach it.
          V2&rsquo;s &ldquo;a day is as long as it is&rdquo; turned out to be the
          better principle for both. The quota was deleted.
        </p>
      </section>

      {/* --------------------------------------------------- Free vs premium */}
      <section className={styles.section} aria-labelledby="business">
        <p className={`${styles.kicker} ${styles.reveal}`}>Free vs premium</p>
        <h2 id="business" className={`${styles.h2} ${styles.reveal}`}>
          The feature had to work as a business case, not just a training tool.
        </h2>

        <ul className={`${styles.facts} ${styles.reveal}`}>
          <li>
            Free members solve <strong>3 puzzles a day</strong>; the counter
            still reads <em>Puzzle&nbsp;3&nbsp;/&nbsp;12</em> — the whole set,
            never <em>3&nbsp;/&nbsp;3</em>.
          </li>
          <li>
            The set is never trimmed. Free sees all twelve, greyed and locked,
            and exactly how far in the wall sits.
          </li>
          <li>
            Upgrading happens in place: hit the wall at puzzle&nbsp;3 → upgrade
            without a reload → a short celebration → <strong>resume at
            puzzle&nbsp;4</strong>.
          </li>
        </ul>

        <blockquote className={`${styles.quote} ${styles.reveal}`}>
          The puzzles you can see but can&rsquo;t reach <em>are</em> the pitch. A
          queue that looks three long has nothing to sell.
        </blockquote>
      </section>

      {/* -------------------------------------------------------- Decisions */}
      <section className={styles.section} aria-labelledby="decisions">
        <p className={`${styles.kicker} ${styles.reveal}`}>Product decisions</p>
        <h2 id="decisions" className={`${styles.h2} ${styles.reveal}`}>
          Each of these changed what the feature does, not how it looks.
        </h2>

        <ol className={styles.decisions}>
          {DECISIONS.map((d) => (
            <li key={d.n} className={styles.reveal}>
              <span className={styles.decNum}>{d.n}</span>
              <p className={styles.decText}>{d.decision}</p>
              <p className={styles.decRuled}>
                <span aria-hidden>Ruled out</span> {d.ruledOut}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* -------------------------------------------------------- Hypothesis */}
      <section className={styles.section} aria-labelledby="hypothesis">
        <p className={`${styles.kicker} ${styles.reveal}`}>The hypothesis</p>
        <h2 id="hypothesis" className={`${styles.h2} ${styles.reveal}`}>
          A working prototype, not a launch. These are outcomes I&rsquo;d want to
          validate — not claim.
        </h2>

        <ul className={`${styles.facts} ${styles.reveal}`}>
          <li>
            <strong>Close the loop</strong> — review shouldn&rsquo;t be the final
            step; the mistake becomes something you practise.
          </li>
          <li>
            <strong>Relevance over volume</strong> — every puzzle comes from a
            position the player has already experienced.
          </li>
          <li>
            <strong>Fairness over difficulty</strong> — a difficult puzzle can
            still be useful; an unfair one cannot.
          </li>
          <li>
            <strong>An honest wall</strong> — free players understand the value of
            the complete set before they reach the limit.
          </li>
        </ul>

        <div className={`${styles.metrics} ${styles.reveal}`}>
          {METRICS.map((m) => (
            <div key={m.name} className={styles.metric} data-primary={m.primary || undefined}>
              <span className={styles.metricName}>
                {m.name}
                {m.primary && <span className={styles.primaryTag}>primary</span>}
              </span>
              <p className={styles.metricQ}>{m.q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- Reflection */}
      <section className={styles.section} aria-labelledby="reflection">
        <p className={`${styles.kicker} ${styles.reveal}`}>Reflection</p>
        <h2 id="reflection" className={`${styles.h2} ${styles.reveal}`}>
          What I&rsquo;d carry forward.
        </h2>

        <dl className={`${styles.reflect} ${styles.reveal}`}>
          <div>
            <dt>Spaced repetition</dt>
            <dd>
              The biggest gap. The prototype builds the puzzles; it doesn&rsquo;t
              yet schedule their return.
            </dd>
          </div>
          <div>
            <dt>Named weaknesses</dt>
            <dd>
              &ldquo;Blunder&rdquo; is a severity, not a lesson. Cluster into back
              rank, hanging pieces, rook endgames.
            </dd>
          </div>
          <div>
            <dt>One pipeline, two views</dt>
            <dd>
              The queue is the better product, the diary the better habit. Carry
              the queue forward as default, layer the diary on top.
            </dd>
          </div>
          <div>
            <dt>What I&rsquo;d do differently</dt>
            <dd>
              Get real games into the pipeline earlier. Every hard product problem
              appeared only once real data was flowing.
            </dd>
          </div>
        </dl>

        <Link href="/work" className={`${styles.back} ${styles.reveal}`} data-cursor="link">
          <span aria-hidden>←</span> Back to selected work
        </Link>
      </section>
    </article>
  );
}

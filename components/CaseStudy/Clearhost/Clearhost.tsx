'use client';

import Link from 'next/link';
import { Reveal, SectionMark } from './shared';
import { HeroReveal } from './HeroReveal';
import { FragmentsToOne } from './FragmentsToOne';
import { WorkspaceStory } from './WorkspaceStory';
import { ProductWorkflow } from './ProductWorkflow';
import { ProductDecisions } from './ProductDecisions';
import { ProductTour } from './ProductTour';
import { DefiningDeck } from './DefiningDeck';
import { DeckLiveBg } from './DeckLiveBg';
import { ArrowUpRight, ArrowRight, ArrowDown, ArrowLeft, Check, Loader } from './icons';
import { cx } from './cx';
import {
  clearhost,
  heroTags,
  responsibilities,
  demoResearch,
  industryLearnings,
  insights,
  problemStatement,
  gtmSignal,
  gtmSteps,
  readiness,
  productGoals,
  learnings,
} from './content';
import styles from './Clearhost.module.scss';

export function Clearhost() {
  return (
    <article className={styles.root}>
      {/* ==================================================== 1 · OVERVIEW */}
      <section id="overview" className={cx(styles.section, styles.overview)}>
        <div className={styles.hero}>
          <Reveal direction="none" className={styles.heroVisualWrap}>
            <HeroReveal src={clearhost.heroVideo} className={styles.heroVisual} />
          </Reveal>

          <div className={cx(styles.container, styles.heroInner)}>
            <Reveal delay={0.04}>
              <ul className={styles.pills}>
                <li data-accent>
                  <i aria-hidden /> {heroTags[0]}
                </li>
                {heroTags.slice(1).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Reveal>

            <div className={styles.ovHeadRow}>
              <Reveal direction="none">
                <h1 className={styles.ovWordmark}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={clearhost.wordmarkLogo}
                    alt="ClearHost"
                    width={610}
                    height={197}
                    className={styles.ovLogoLockup}
                    draggable={false}
                  />
                </h1>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <p className={styles.ovHeadline}>{clearhost.headline}</p>
            </Reveal>
            <Reveal delay={0.14}>
              <p className={styles.ovSub}>{clearhost.sub}</p>
            </Reveal>
          </div>
        </div>

        <div className={styles.container}>
          <Reveal delay={0.18}>
            <p className={cx(styles.eyebrow, styles.ownedEyebrow)}>What I owned</p>
          </Reveal>
        </div>

        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {[0, 1].map((dup) =>
              responsibilities.map((r) => (
                <span
                  key={`${dup}-${r}`}
                  aria-hidden={dup === 1 || undefined}
                  className={styles.marqueeItem}
                >
                  {r}
                  <i aria-hidden>✦</i>
                </span>
              )),
            )}
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.ovFragments}>
            <FragmentsToOne />
          </div>
        </div>
      </section>

      {/* ================================================= 2 · OPPORTUNITY */}
      <section id="opportunity" className={cx(styles.section, styles.opportunity)}>
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="02" title="The opportunity" />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
              I started with a wall of notes,{' '}
              <span className={styles.accent}>not a solution.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.lede}>
              Everything I heard in the field went up on one board. Then I looked for the
              pattern, and the same two systems kept separating out.
            </p>
          </Reveal>
        </div>

        <div className={cx(styles.fullBleed, styles.workspaceWrap)}>
          <WorkspaceStory />
        </div>
      </section>

      {/* ================================================== 3 · DISCOVERY */}
      <section id="discovery" className={styles.section}>
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="03" title="Discovery &amp; research" />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
              Understanding the <span className={styles.accent}>industry</span>.
            </h2>
          </Reveal>

          {/* demo research */}
          <div className={styles.demoWrap}>
            <Reveal direction="right">
              <div>
                <p className={styles.eyebrow}>Before designing anything</p>
                <h3 className={styles.demoTitle}>
                  I ran demos and mapped how existing platforms think.
                </h3>
                <p className={styles.demoCopy}>
                  To learn the mental model an owner is asked to adopt, and where each one
                  gives up.
                </p>
              </div>
            </Reveal>
            <ul className={styles.demoList}>
              {demoResearch.map((item, i) => (
                <li key={item}>
                  <Reveal delay={i * 0.07} direction="left">
                    <div className={styles.demoItem}>
                      <span>
                        <Check size={14} />
                      </span>
                      <span>{item}</span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          {/* key learnings */}
          <div style={{ marginTop: '4rem' }}>
            <p className={styles.eyebrow}>Key learnings</p>
            <ul className={styles.domainList}>
              {industryLearnings.map((l, i) => (
                <li key={l.label}>
                  <Reveal delay={i * 0.05}>
                    <div className={styles.domainRow}>
                      <span className={styles.domainLabel}>{l.label}</span>
                      <ArrowRight size={16} className={styles.domainArrow} />
                      <p className={styles.domainBody}>{l.body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          {/* insights */}
          <div style={{ marginTop: '4rem' }}>
            <p className={styles.eyebrow}>What it added up to</p>
            <h3 className={styles.sectionSubTitle}>Five insights, over and over.</h3>
            <Reveal delay={0.05}>
              <ol className={styles.insightsGrid}>
                {insights.slice(0, 3).map((ins, i) => (
                  <li key={ins.headline} className={styles.insightCell}>
                    <span className={styles.insightN}>{String(i + 1).padStart(2, '0')}</span>
                    <h4 className={styles.insightH}>{ins.headline}</h4>
                    <p className={styles.insightB}>{ins.body}</p>
                  </li>
                ))}
              </ol>
              {/* last row: 2 items, sized to split the row evenly rather than
                  matching the 3-up grid's own column widths above */}
              <ol className={cx(styles.insightsGrid, styles.insightsGridRest)}>
                {insights.slice(3).map((ins, i) => (
                  <li key={ins.headline} className={styles.insightCell}>
                    <span className={styles.insightN}>{String(i + 4).padStart(2, '0')}</span>
                    <h4 className={styles.insightH}>{ins.headline}</h4>
                    <p className={styles.insightB}>{ins.body}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================ PROCESS · workflow */}
      <ProductWorkflow />

      {/* =================================================== 4 · DEFINING */}
      <section id="defining" className={cx(styles.section, styles.defining)}>
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="04" title="Defining the product" />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
              From what I saw <span className={styles.accent}>to what we&apos;d build</span>.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <blockquote className={styles.problemQuote}>
              <p>Problem statement</p>
              <p>{problemStatement}</p>
            </blockquote>
          </Reveal>
        </div>

        {/* the positioning deck, on the same board surface as §2 */}
        <div className={styles.deckStage}>
          <DeckLiveBg />
          <div className={styles.container}>
            <div className={styles.deckStageHead}>
              <p className={styles.eyebrow}>The calls we had to make</p>
              <span className={cx(styles.deckStageHint, styles.deckStageHintHover)}>
                hover to spread the deck
              </span>
              <span className={cx(styles.deckStageHint, styles.deckStageHintTouch)}>
                tap a card to browse
              </span>
            </div>
          </div>
          <div className={styles.deckMount}>
            <DefiningDeck />
          </div>
        </div>

        <div className={styles.container}>
          {/* GTM */}
          <div className={styles.statBlock}>
            <p className={styles.eyebrow}>Go-to-market · who we launch for</p>
            <Reveal delay={0.05}>
              <p className={styles.gtmSignal}>{gtmSignal}</p>
            </Reveal>
            <ol className={styles.gtmGrid}>
              {gtmSteps.map((step, i) => (
                <li key={step.k} className={styles.rvFull}>
                  <Reveal delay={i * 0.06} className={styles.rvFull}>
                    <div className={styles.gtmItem}>
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      <span>{step.k}</span>
                      <span>{step.v}</span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ==================================== 5 · PRODUCT DESIGN & DECISIONS */}
      <ProductDecisions />

      {/* ============================================= 6 · PRODUCT TOUR */}
      <ProductTour />

      {/* ================================================= · VALIDATION */}
      {/* Hidden for now (user request, 2026-09-09) — "Usability testing & QA"
          section temporarily removed from all devices. To restore: bring back
          the <section id="validation"> block (SectionMark n="07"), re-add the
          `ProofOfWork` / `qaProof` imports, and bump Outcome→08 / Learnings→09. */}

      {/* ==================================================== 7 · OUTCOME */}
      <section id="outcome" className={styles.section}>
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="07" title="Outcome" />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
              Certified for production.{' '}
              <span className={styles.accent}>Onboarding real hotels next.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.lede}>
              Honest version: the core is built and certified; the market proof is still
              ahead. Here&apos;s exactly what&apos;s shipped and what&apos;s still in
              progress.
            </p>
          </Reveal>

          <ul className={styles.readyGrid}>
            {readiness.map((r, i) => (
              <li key={r.label} className={styles.rvFull}>
                <Reveal delay={i * 0.06} className={styles.rvFull}>
                  <div
                    className={cx(
                      styles.readyRow,
                      r.state === 'done' && styles.readyRowDone,
                    )}
                  >
                    <span
                      className={cx(
                        styles.readyDot,
                        r.state === 'done' && styles.readyDotDone,
                      )}
                    >
                      {r.state === 'done' ? <Check size={16} /> : <Loader size={16} />}
                    </span>
                    <div>
                      <p className={styles.readyLabel}>{r.label}</p>
                      <p className={styles.readyNote}>
                        {r.state === 'done' ? 'done' : 'in progress'} · {r.note}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <div className={styles.statBlock}>
            <div className={styles.blockHead}>
              <p className={styles.eyebrow}>What we&apos;re aiming for</p>
              <span className={styles.blockNote}>product goals · to be validated</span>
            </div>
            <ul className={styles.statGrid}>
              {productGoals.map((g, i) => (
                <li key={g.title} className={styles.rvFull}>
                  <Reveal delay={i * 0.06} className={styles.rvFull}>
                    <div className={styles.statItem}>
                      <span className={styles.goalTitle}>{g.title}</span>
                      <span className={styles.goalBody}>{g.body}</span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          <Reveal>
            <p className={styles.betLine}>
              The bet: own the one thing no incumbent owns end to end,{' '}
              <span className={styles.accent}>
                helping India&apos;s independent hosts grow direct
              </span>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================================================== 8 · LEARNINGS */}
      <section id="learnings" className={styles.section}>
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="08" title="Learnings" />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
              What building this <span className={styles.accent}>changed in me</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.lede}>
              Not tidy takeaways: the places my thinking changed as the product moved from
              research to certification.
            </p>
          </Reveal>

          <ul className={styles.learnGrid}>
            {learnings.map((l, i) => (
              <li key={l.after} className={styles.rvFull}>
                <Reveal delay={(i % 2) * 0.06} className={styles.rvFull}>
                  <div className={styles.learnCard}>
                    <p className={styles.learnBefore}>{l.before}</p>
                    <ArrowDown size={16} className={styles.learnArrow} />
                    <p className={styles.learnAfter}>{l.after}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal>
            <div className={styles.close}>
              <div>
                <p className={styles.closeTitle}>
                  ClearHost is certified and onboarding its first hotels.
                </p>
                <p className={styles.closeSub}>
                  The owners whose workflows shaped the product get to use it first.
                </p>
              </div>
              <div className={styles.closeActions}>
                <a
                  href={clearhost.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx(styles.btn, styles.btnPrimary)}
                >
                  Visit {clearhost.liveLabel}
                  <ArrowUpRight size={16} />
                </a>
                <Link href="/work" className={cx(styles.btn, styles.btnGhost)} data-cursor="link">
                  <ArrowLeft size={16} />
                  All work
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}

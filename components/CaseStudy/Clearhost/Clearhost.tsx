'use client';

import Link from 'next/link';
import { Reveal, SectionMark, DecisionCard, ProofOfWork } from './shared';
import { HeroReveal } from './HeroReveal';
import { FragmentsToOne } from './FragmentsToOne';
import { WorkspaceStory } from './WorkspaceStory';
import { PersonaNotebook } from './PersonaNotebook';
import { ProductWorkflow } from './ProductWorkflow';
import { DefiningDeck } from './DefiningDeck';
import { DeckLiveBg } from './DeckLiveBg';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  Check,
  Quote,
  RotateCcw,
  Loader,
} from './icons';
import { cx } from './cx';
import {
  clearhost,
  heroMeta,
  heroTags,
  responsibilities,
  interviewQuestions,
  edgeCases,
  demoResearch,
  insights,
  discoveryProof,
  problemStatement,
  icp,
  vision,
  successMetrics,
  marketStats,
  gtmSignal,
  gtmSteps,
  decisions,
  modules,
  executionProof,
  qaLoop,
  qaProof,
  readiness,
  targetKpis,
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
            <Reveal>
              <SectionMark n="01" title="Overview" />
            </Reveal>

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={clearhost.logo}
                  alt=""
                  width={192}
                  height={192}
                  className={styles.ovLogo}
                  draggable={false}
                />
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className={styles.ovWordmark}>clearhost</h1>
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
          <Reveal delay={0.15}>
            <dl className={styles.ovMeta}>
              {heroMeta.map((m) => (
                <div key={m.label} className={styles.ovMetaItem}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
              <div className={styles.ovLive}>
                <dt className="u-visually-hidden">Live site</dt>
                <dd>
                  <a href={clearhost.liveUrl} target="_blank" rel="noopener noreferrer">
                    {clearhost.liveLabel}
                    <ArrowUpRight size={14} />
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>
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
              pattern — and the same two systems kept separating out.
            </p>
          </Reveal>
        </div>

        <div className={cx(styles.fullBleed, styles.workspaceWrap)}>
          <WorkspaceStory />
        </div>

        <div className={styles.container}>
          <div className={styles.notebookWrap}>
            <PersonaNotebook />
          </div>
        </div>
      </section>

      {/* ================================================== 3 · DISCOVERY */}
      <section
        id="discovery"
        className={cx(styles.section, styles.sectionTint)}
      >
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="03" title="Discovery &amp; research" />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
              I wasn&apos;t validating an idea.{' '}
              <span className={styles.accent}>I was learning how they run.</span>
            </h2>
          </Reveal>

          {/* the questions */}
          <div style={{ marginTop: '2.5rem' }}>
            <p className={styles.eyebrow}>The questions I asked our user segment</p>
            <ul className={styles.qGrid}>
              {interviewQuestions.map((q, i) => (
                <li key={q} className={styles.rvFull}>
                  <Reveal delay={i * 0.05} className={styles.rvFull}>
                    <div className={styles.qCard}>
                      <Quote size={16} />
                      <p>{q}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          {/* the cases I hunted for */}
          <div style={{ marginTop: '3rem' }}>
            <p className={styles.eyebrow}>The cases I hunted for</p>
            <ul className={styles.qGrid}>
              {edgeCases.map((e, i) => (
                <li key={e} className={styles.rvFull}>
                  <Reveal delay={i * 0.05} className={styles.rvFull}>
                    <div className={styles.qCard}>
                      <span className={styles.qDot} aria-hidden />
                      <p>{e}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

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

          {/* insights */}
          <div style={{ marginTop: '4rem' }}>
            <p className={styles.eyebrow}>What it added up to · 5 insights</p>
            <ul className={styles.insightList}>
              {insights.map((ins, i) => (
                <li
                  key={ins.headline}
                  className={cx(i === 0 && styles.insightWide, styles.rvFull)}
                >
                  <Reveal delay={(i % 2) * 0.06} className={styles.rvFull}>
                    <div className={styles.insightCard}>
                      <span className={styles.insightN}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className={styles.insightH}>{ins.headline}</h3>
                        <p className={styles.insightB}>{ins.body}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          <ProofOfWork items={discoveryProof} />
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
              <span className={styles.deckStageHint}>hover to spread the deck</span>
            </div>
          </div>
          <div className={styles.deckMount}>
            <DefiningDeck />
          </div>
        </div>

        <div className={styles.container}>
          {/* ICP + vision */}
          <div className={styles.twoCol}>
            <Reveal className={styles.rvFull}>
              <div className={styles.card}>
                <p className={styles.eyebrow}>Who it&apos;s for</p>
                <h3 className={styles.cardTitle}>{icp.who}</h3>
                <ul className={styles.pillRow}>
                  {icp.types.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className={styles.cardBody}>{icp.buyer}</p>
                <p className={styles.cardNot}>{icp.not}</p>
              </div>
            </Reveal>
            <Reveal delay={0.06} className={styles.rvFull}>
              <div className={cx(styles.card, styles.cardVision)}>
                <p className={styles.eyebrow}>Product vision</p>
                <p className={styles.visionText}>{vision}</p>
              </div>
            </Reveal>
          </div>

          {/* success metrics */}
          <div className={styles.statBlock}>
            <div className={styles.blockHead}>
              <p className={styles.eyebrow}>How we&apos;d know it worked</p>
              <span className={styles.blockNote}>targets · pre-launch</span>
            </div>
            <ul className={styles.statGrid}>
              {successMetrics.map((m, i) => (
                <li key={m.label} className={styles.rvFull}>
                  <Reveal delay={i * 0.06} className={styles.rvFull}>
                    <div className={cx(styles.statItem, styles.statItemDashed)}>
                      <span className={cx(styles.statValue, styles.statValueSm)}>
                        {m.target}
                      </span>
                      <span className={styles.statLabel}>{m.label}</span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          {/* market */}
          <div className={styles.statBlock}>
            <p className={styles.eyebrow}>The market · 2025–26</p>
            <ul className={styles.statGrid}>
              {marketStats.map((s, i) => (
                <li key={s.label} className={styles.rvFull}>
                  <Reveal delay={i * 0.06} className={styles.rvFull}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{s.value}</span>
                      <span className={styles.statLabel}>{s.label}</span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

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

      {/* =================================================== 5 · STRATEGY */}
      <section id="strategy" className={cx(styles.section, styles.sectionTint)}>
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="05" title="Design strategy &amp; key decisions" />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
              The features are the boring part.{' '}
              <span className={styles.accent}>Here&apos;s the thinking.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.lede}>
              Four calls shaped the whole product. For each one — what we were looking at,
              why we chose it, what it cost us, and what it bought.
            </p>
          </Reveal>

          <div className={styles.decisionGrid}>
            {decisions.map((d, i) => (
              <DecisionCard key={d.decision} decision={d} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== 6 · EXECUTION */}
      <section id="execution" className={styles.section}>
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="06" title="Design execution" />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
              We built the reason to switch <span className={styles.accent}>first</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.lede}>
              One designer, five engineers, a six-month runway. I designed in modules — each
              flow specced, prototyped and design-QA&apos;d before the next began, and the
              order wasn&apos;t arbitrary. Every module unlocked the next.
            </p>
          </Reveal>

          <div style={{ marginTop: '3rem' }}>
            <p className={styles.eyebrow}>Why this order</p>
            <ol className={styles.moduleList}>
              {modules.map((m, i) => (
                <li key={m.label}>
                  <Reveal delay={i * 0.05} direction="right">
                    <div className={styles.moduleRow}>
                      <span className={styles.moduleNum}>{i + 1}</span>
                      <div>
                        <p className={styles.modulePhase}>
                          {m.phase} <span>· {m.work}</span>
                        </p>
                        <p className={styles.moduleWhy}>{m.why}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          <Reveal>
            <p className={styles.execNote}>
              ↳ Prioritisation was ruthless: impact-over-effort, and &ldquo;does this stop
              the bleeding?&rdquo; over &ldquo;is this a nice feature?&rdquo; I wrote a
              design spec per module and worked screen-by-screen with dev — one flow at a
              time.
            </p>
          </Reveal>

          <ProofOfWork items={executionProof} />
        </div>
      </section>

      {/* ================================================= 7 · VALIDATION */}
      <section id="validation" className={cx(styles.section, styles.sectionTint)}>
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="07" title="Usability testing &amp; QA" />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
              I broke every module <span className={styles.accent}>before it moved on</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.lede}>
              No waiting until the end to find out it&apos;s broken. Every module got tested
              from the owner&apos;s chair — annotated screenshots, bug lists, UX nitpicks —
              and fixes were a standing line item in the next sprint, never an afterthought.
            </p>
          </Reveal>

          <div style={{ marginTop: '3rem' }}>
            <p className={cx(styles.eyebrow, styles.qaLoopHead)}>
              The loop, every module
              <RotateCcw size={14} />
            </p>
            <ol className={styles.qaGrid}>
              {qaLoop.map((s, i) => (
                <li key={s.step} className={styles.qaItem}>
                  <Reveal delay={i * 0.06} className={styles.rvFull}>
                    <div className={styles.qaCard}>
                      <span>Step {i + 1}</span>
                      <span>{s.step}</span>
                      <span>{s.detail}</span>
                    </div>
                  </Reveal>
                  {i < qaLoop.length - 1 ? (
                    <ArrowRight size={16} className={styles.qaArrow} />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          <ProofOfWork items={qaProof} />
        </div>
      </section>

      {/* ==================================================== 8 · OUTCOME */}
      <section id="outcome" className={styles.section}>
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="08" title="Outcome" />
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
              <span className={styles.blockNote}>modeled / target · not yet measured</span>
            </div>
            <ul className={styles.statGrid}>
              {targetKpis.map((k, i) => (
                <li key={k.label} className={styles.rvFull}>
                  <Reveal delay={i * 0.06} className={styles.rvFull}>
                    <div className={styles.statItem}>
                      <span className={cx(styles.statValue, styles.statValueSm)}>
                        {k.value}
                      </span>
                      <span className={styles.statLabel}>{k.label}</span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          <Reveal>
            <p className={styles.betLine}>
              The bet: own the one thing no incumbent owns end to end —{' '}
              <span className={styles.accent}>
                helping India&apos;s independent hosts grow direct
              </span>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================================================== 9 · LEARNINGS */}
      <section id="learnings" className={cx(styles.section, styles.sectionTint)}>
        <div className={styles.container}>
          <Reveal>
            <SectionMark n="09" title="Learnings" />
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
              What building this <span className={styles.accent}>changed in me</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.lede}>
              Not tidy takeaways — the actual places my thinking shifted between the first
              interview and the certification.
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
                  The owners whose day I sat through get to use it first.
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

'use client';

import type { ReactNode } from 'react';
import type { WorkflowStep } from './content';
import { ArrowRight, Check, FileText, GitBranch, MessageSquare, Rocket } from './icons';
import { cx } from './cx';
import styles from './ProductWorkflow.module.scss';

/* -------------------------------------------------------------------------- */
/*  Printed-artifact primitives + the twelve artifacts.                        */
/* -------------------------------------------------------------------------- */

function Sheet({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.sheet, className)}>{children}</div>;
}

function Cap({ children }: { children: ReactNode }) {
  return <span className={styles.cap}>{children}</span>;
}

function Lead({ children }: { children: ReactNode }) {
  return <span className={styles.lead}>{children}</span>;
}

function Tag({
  children,
  tone = 'muted',
  className,
}: {
  children: ReactNode;
  tone?: 'muted' | 'accent' | 'ok' | 'warn';
  className?: string;
}) {
  return (
    <span
      className={cx(
        styles.tag,
        tone === 'muted' && styles.tagMuted,
        tone === 'accent' && styles.tagAccent,
        tone === 'ok' && styles.tagOk,
        tone === 'warn' && styles.tagWarn,
        className,
      )}
    >
      {children}
    </span>
  );
}

function Dot({ tone }: { tone: 'ok' | 'warn' | 'bad' | 'accent' }) {
  return (
    <span
      aria-hidden
      className={cx(
        styles.dot,
        tone === 'ok' && styles.dotOk,
        tone === 'warn' && styles.dotWarn,
        tone === 'bad' && styles.dotBad,
        tone === 'accent' && styles.dotAccent,
      )}
    />
  );
}

/** A strip of masking tape — the pinned-to-the-board detail. */
export function Tape({ className }: { className?: string }) {
  return <span aria-hidden className={cx(styles.tape, className)} />;
}

/* -------------------------------------------------------------------------- */

function StickyArtifact({ insight }: { insight: string }) {
  return (
    <div className={styles.aSticky}>
      <p>{insight}</p>
      <span aria-hidden className={styles.aStickyFold} />
    </div>
  );
}

function NotionArtifact({ count, date, quote }: { count: string; date: string; quote: string }) {
  const [n, ...rest] = count.split(' ');
  return (
    <Sheet>
      <div className={styles.aNotionTop}>
        <FileText size={16} className={styles.mutedIcon} />
        <Lead>{n}</Lead>
        <span className={styles.aNotionUnit}>{rest.join(' ')}</span>
      </div>
      <Cap>{date}</Cap>
      <p className={styles.aNotionQuote}>&ldquo;{quote}&rdquo;</p>
    </Sheet>
  );
}

function ClusterArtifact({ notes, core }: { notes: string[]; core: string }) {
  const tilts = [styles.tilt0, styles.tilt1, styles.tilt2, styles.tilt3];
  return (
    <div>
      <div className={styles.aClusterGrid}>
        {notes.map((n, i) => (
          <span key={n} className={cx(styles.aClusterNote, tilts[i % tilts.length])}>
            {n}
          </span>
        ))}
      </div>
      <div className={styles.aClusterCore}>
        <Cap>Core need</Cap>
        <p>{core}</p>
      </div>
    </div>
  );
}

function PriorityArtifact({
  rows,
}: {
  rows: { label: string; impact: number; effort: number; chip: string }[];
}) {
  return (
    <Sheet>
      <div className={styles.rowBetween}>
        <Cap>Impact · effort</Cap>
        <Cap>Call</Cap>
      </div>
      <ul className={styles.aPriorityList}>
        {rows.map((r) => (
          <li key={r.label}>
            <span className={styles.aPriorityLabel}>{r.label}</span>
            <span aria-hidden className={styles.aPriorityBars}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className={i < r.impact ? styles.barOn : styles.barOff} />
              ))}
            </span>
            <span className={styles.aPriorityEffort}>e{r.effort}</span>
            <Tag
              tone={r.chip === 'Must' ? 'accent' : r.chip === 'Should' ? 'warn' : 'muted'}
              className={styles.aPriorityChip}
            >
              {r.chip}
            </Tag>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

function LinearArtifact({
  ref_,
  status,
  summary,
  owner,
  version,
  comments,
}: {
  ref_: string;
  status: string;
  summary: string;
  owner: string;
  version: string;
  comments: number;
}) {
  return (
    <Sheet>
      <div className={styles.aLinearTop}>
        <span className={styles.aLinearRef}>{ref_}</span>
        <Tag tone="warn" className={styles.mlAuto}>
          {status}
        </Tag>
      </div>
      <p className={styles.aLinearSummary}>{summary}</p>
      <div className={styles.aLinearMeta}>
        <span className={styles.aLinearOwner}>{owner}</span>
        <span className={styles.aLinearVersion}>{version}</span>
        <span className={styles.aLinearComments}>
          <MessageSquare size={14} />
          {comments}
        </span>
      </div>
    </Sheet>
  );
}

function FlowArtifact({ nodes, edgeCases }: { nodes: string[]; edgeCases: number }) {
  return (
    <Sheet>
      <Cap>Happy path</Cap>
      <div className={styles.aFlowRow}>
        {nodes.map((n, i) => (
          <span key={n} className={styles.aFlowNode}>
            <span className={i === nodes.length - 1 ? styles.aFlowChipLast : styles.aFlowChip}>
              {n}
            </span>
            {i < nodes.length - 1 && <ArrowRight size={12} className={styles.mutedIcon} />}
          </span>
        ))}
      </div>
      <p className={styles.aFlowNote}>+ {edgeCases} edge cases mapped</p>
    </Sheet>
  );
}

function SprintArtifact({
  sprint,
  tasks,
  done,
  blocked,
}: {
  sprint: string;
  tasks: number;
  done: number;
  blocked: number;
}) {
  const pct = Math.round((done / Math.max(tasks, 1)) * 100);
  return (
    <Sheet>
      <div className={styles.rowBetween}>
        <Cap>{sprint}</Cap>
        <Tag>{tasks} tasks</Tag>
      </div>
      <div className={styles.aSprintLead}>
        <Lead>{done}</Lead>
        <span>/ {tasks} done</span>
      </div>
      <div className={styles.aSprintBar}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className={styles.aSprintBlocked}>
        <Dot tone="bad" />
        {blocked} blocked
      </p>
    </Sheet>
  );
}

function BuildArtifact({
  branch,
  tasks,
}: {
  branch: string;
  tasks: { label: string; done: boolean }[];
}) {
  return (
    <Sheet>
      <div className={styles.aBuildBranch}>
        <GitBranch size={14} className={styles.mutedIcon} />
        <span>{branch}</span>
      </div>
      <ul className={styles.aBuildList}>
        {tasks.map((t) => (
          <li key={t.label}>
            <span aria-hidden className={t.done ? styles.aBuildBoxDone : styles.aBuildBox}>
              {t.done && <Check size={10} />}
            </span>
            <span className={t.done ? styles.aBuildLabelDone : styles.aBuildLabel}>{t.label}</span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

function QaArtifact({
  passed,
  needsFix,
  open,
}: {
  passed: number;
  needsFix: number;
  open: number;
}) {
  const rows = [
    { tone: 'warn' as const, label: 'Needs fix', value: needsFix },
    { tone: 'bad' as const, label: 'Open', value: open },
  ];
  return (
    <Sheet>
      <Cap>Module sign-off</Cap>
      <div className={styles.aQaLead}>
        <Lead>{passed}</Lead>
        <span>checks passed</span>
      </div>
      <ul className={styles.aQaList}>
        {rows.map((r) => (
          <li key={r.label}>
            <Dot tone={r.tone} />
            <span>{r.label}</span>
            <span className={styles.aQaValue}>{r.value}</span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

function LaunchArtifact({
  env,
  badge,
  release,
  note,
}: {
  env: string;
  badge: string;
  release: string;
  note: string;
}) {
  return (
    <Sheet className={styles.aLaunch}>
      <div className={styles.aLaunchTop}>
        <Rocket size={16} className={styles.accentIcon} />
        <Cap>{env}</Cap>
        <span className={styles.aLaunchBadge}>
          <Dot tone="ok" />
          {badge}
        </span>
      </div>
      <p className={styles.aLaunchRelease}>{release}</p>
      <p className={styles.aLaunchNote}>{note}</p>
      <svg aria-hidden viewBox="0 0 120 44" preserveAspectRatio="none" className={styles.aLaunchCircle} fill="none">
        <path
          d="M60 3C88 3 116 8 116 22S88 41 60 41 4 36 4 22 30 4 62 4"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    </Sheet>
  );
}

function LearnArtifact({
  caption,
  series,
  stats,
}: {
  caption: string;
  series: number[];
  stats: { label: string; value: string }[];
}) {
  const max = Math.max(...series, 1);
  return (
    <Sheet>
      <div className={styles.rowBetween}>
        <Cap>{caption}</Cap>
        <Tag>Modelled</Tag>
      </div>
      <div aria-hidden className={styles.aLearnBars}>
        {series.map((v, i) => (
          <span
            key={i}
            className={i === series.length - 1 ? styles.aLearnBarLast : styles.aLearnBar}
            style={{ height: `${Math.max(14, (v / max) * 100)}%` }}
          />
        ))}
      </div>
      <ul className={styles.aLearnStats}>
        {stats.map((s) => (
          <li key={s.label}>
            <span>{s.label}</span>
            <span className={styles.aLearnStatValue}>{s.value}</span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

function IterateArtifact({ heading, items }: { heading: string; items: string[] }) {
  return (
    <Sheet className={styles.aIterate}>
      <Cap>{heading}</Cap>
      <ul className={styles.aIterateList}>
        {items.map((it) => (
          <li key={it}>
            <span aria-hidden className={styles.aIterateDot} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */

export function ArtifactCard({ step }: { step: WorkflowStep }) {
  switch (step.kind) {
    case 'sticky':
      return <StickyArtifact insight={step.insight} />;
    case 'notion':
      return <NotionArtifact count={step.count} date={step.date} quote={step.quote} />;
    case 'cluster':
      return <ClusterArtifact notes={step.notes} core={step.core} />;
    case 'priority':
      return <PriorityArtifact rows={step.rows} />;
    case 'linear':
      return (
        <LinearArtifact
          ref_={step.ref}
          status={step.status}
          summary={step.summary}
          owner={step.owner}
          version={step.version}
          comments={step.comments}
        />
      );
    case 'flow':
      return <FlowArtifact nodes={step.nodes} edgeCases={step.edgeCases} />;
    case 'sprint':
      return (
        <SprintArtifact
          sprint={step.sprint}
          tasks={step.tasks}
          done={step.done}
          blocked={step.blocked}
        />
      );
    case 'build':
      return <BuildArtifact branch={step.branch} tasks={step.tasks} />;
    case 'qa':
      return <QaArtifact passed={step.passed} needsFix={step.needsFix} open={step.open} />;
    case 'launch':
      return (
        <LaunchArtifact env={step.env} badge={step.badge} release={step.release} note={step.note} />
      );
    case 'learn':
      return <LearnArtifact caption={step.caption} series={step.series} stats={step.stats} />;
    case 'iterate':
      return <IterateArtifact heading={step.heading} items={step.items} />;
  }
}

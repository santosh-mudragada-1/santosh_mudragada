'use client';

import { motion, type Variants } from 'framer-motion';
import { EASE, DUR } from '@/lib/motion/config';
import type { Decision, Artifact, ArtifactKind } from './content';
import {
  FileText,
  Kanban,
  Monitor,
  MonitorPlay,
  NotebookPen,
  PenTool,
  Table2,
  Camera,
  type IconComponent,
} from './icons';
import { cx } from './cx';
import styles from './shared.module.scss';

/* -------------------------------------------------------------------------- */
/*  Reveal — declarative in-view entrance (framer-motion).                     */
/* -------------------------------------------------------------------------- */

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const offsets: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 20 },
  down: { y: -20 },
  left: { x: 20 },
  right: { x: -20 },
  none: {},
};

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  amount?: number;
}

export function Reveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = DUR.slow,
  amount = 0.3,
}: RevealProps) {
  const variants: Variants = {
    hidden: { opacity: 0, ...offsets[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, delay, ease: EASE.expoOut },
    },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section / chapter markers — numbered eyebrow with a lead rule.             */
/* -------------------------------------------------------------------------- */

export function SectionMark({
  title,
  className,
}: {
  n?: string;
  title: string;
  className?: string;
}) {
  return <p className={cx(styles.mark, className)}>{title}</p>;
}

export function ChapterMark({
  index,
  title,
  className,
}: {
  index: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cx(styles.mark, className)}>
      <span aria-hidden className={styles.markRule} />
      <span className={styles.markN}>Chapter {index}</span>
      <span aria-hidden className={styles.markDot}>
        ·
      </span>
      <span className={styles.markTitle}>{title}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MediaPlaceholder — a labelled dashed frame for real media dropped later.   */
/* -------------------------------------------------------------------------- */

export function MediaPlaceholder({
  label,
  note,
  ratio = '16 / 10',
  icon: Icon = Camera,
  className,
}: {
  label: string;
  note?: string;
  ratio?: string;
  icon?: IconComponent;
  className?: string;
}) {
  return (
    <div className={cx(styles.media, className)} style={{ aspectRatio: ratio }}>
      <div className={styles.mediaInner}>
        <Icon size={22} />
        <span className={styles.mediaLabel}>{label}</span>
        {note ? <span className={styles.mediaNote}>{note}</span> : null}
      </div>
      <span className={styles.mediaTag}>placeholder</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ProofOfWork — a scattered strip of real-artifact placeholders.            */
/* -------------------------------------------------------------------------- */

const kindMeta: Record<ArtifactKind, { icon: IconComponent; tag: string }> = {
  screenshot: { icon: Monitor, tag: 'screen' },
  recording: { icon: MonitorPlay, tag: 'recording' },
  doc: { icon: FileText, tag: 'doc' },
  sheet: { icon: Table2, tag: 'sheet' },
  design: { icon: PenTool, tag: 'figma' },
  notes: { icon: NotebookPen, tag: 'notes' },
  board: { icon: Kanban, tag: 'board' },
};

const tilts = [styles.t0, styles.t1, styles.t2, styles.t3, styles.t1, styles.t0];

export function ProofOfWork({
  items,
  caption,
  className,
}: {
  items: Artifact[];
  caption?: string;
  className?: string;
}) {
  return (
    <div className={cx(styles.proof, className)}>
      <div className={styles.proofHead}>
        <span className={styles.eyebrow}>Proof of work</span>
        <span className={styles.proofLine} aria-hidden />
        <span className={styles.proofMeta}>behind the scenes</span>
      </div>

      <ul className={styles.proofGrid}>
        {items.map((a, i) => {
          const meta = kindMeta[a.kind];
          const Icon = meta.icon;
          return (
            <li key={a.label} className={styles.proofItem}>
              <Reveal delay={i * 0.05}>
                <figure className={cx(styles.proofFig, tilts[i % tilts.length])}>
                  <div className={styles.proofCard}>
                    <Icon size={22} />
                    <span className={styles.proofKind}>{meta.tag}</span>
                  </div>
                  <figcaption className={styles.proofCaption}>
                    <span className={styles.proofLabel}>{a.label}</span>
                    {a.note ? <span className={styles.proofNote}>{a.note}</span> : null}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          );
        })}
      </ul>

      {caption ? <p className={styles.proofFoot}>{caption}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DecisionCard — a product decision told as thinking, not a feature.         */
/* -------------------------------------------------------------------------- */

const facets: {
  key: keyof Pick<Decision, 'context' | 'why' | 'tradeoff' | 'impact'>;
  label: string;
  cls: string;
}[] = [
  { key: 'context', label: 'Context', cls: styles.fContext },
  { key: 'why', label: 'Why', cls: styles.fWhy },
  { key: 'tradeoff', label: 'Tradeoff', cls: styles.fTradeoff },
  { key: 'impact', label: 'Impact', cls: styles.fImpact },
];

export function DecisionCard({ decision, i = 0 }: { decision: Decision; i?: number }) {
  const Icon = decision.icon;
  return (
    <Reveal delay={(i % 2) * 0.06} className={styles.dcWrap}>
      <article className={styles.dc}>
        <header className={styles.dcHead}>
          <span className={styles.dcIcon}>
            <Icon size={20} />
          </span>
          <h3 className={styles.dcTitle}>{decision.decision}</h3>
        </header>
        <div className={styles.dcFacets}>
          {facets.map((f) => (
            <div key={f.key} className={cx(styles.dcFacet, f.cls)}>
              <span className={styles.dcFacetLabel}>{f.label}</span>
              <p className={styles.dcFacetBody}>{decision[f.key]}</p>
            </div>
          ))}
        </div>
      </article>
    </Reveal>
  );
}

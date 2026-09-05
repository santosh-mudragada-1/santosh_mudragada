'use client';

import type { CSSProperties, ReactNode } from 'react';
import { persona } from './content';
import { cx } from './cx';
import styles from './PersonaNotebook.module.scss';

/* -------------------------------------------------------------------------- */
/*  Shared pieces of the discovery notebook.                                   */
/*                                                                            */
/*  The notebook is a photograph cut into three: a top edge, a bottom edge,    */
/*  and one dot-free row from the middle that stretches to whatever height the  */
/*  page needs. The dot grid is laid back over the stretch at the pitch        */
/*  measured off the photo. Everything on it — polaroid, clip, tapes, doodles, */
/*  icons — is a supplied asset placed against measured percentages.           */
/* -------------------------------------------------------------------------- */

const A = '/clearhost/persona';

export interface Book {
  top: string;
  mid: string;
  bot: string;
  w: number;
  topH: number;
  botH: number;
  pages: [number, number][];
  dot: number;
  dotX: number;
  dotY: number;
}

export const SPREAD: Book = {
  top: `${A}/nb-top.webp`,
  mid: `${A}/nb-mid.webp`,
  bot: `${A}/nb-bot.webp`,
  w: 1281,
  topH: 62,
  botH: 71,
  pages: [
    [3.67, 47.46],
    [48.32, 96.02],
  ],
  dot: 1.4442,
  dotX: 1.13,
  dotY: 0.43,
};

export const PAGE: Book = {
  top: `${A}/pg-top.webp`,
  mid: `${A}/pg-mid.webp`,
  bot: `${A}/pg-bot.webp`,
  w: 647,
  topH: 62,
  botH: 71,
  pages: [[7.26, 92.74]],
  dot: 2.8594,
  dotX: 2.24,
  dotY: 0.85,
};

const DIM: Record<string, [number, number]> = {
  'agasthya.webp': [760, 682],
  'ico-age.png': [151, 173],
  'ico-property.png': [196, 184],
  'ico-rooms.png': [191, 183],
  'ico-team.png': [230, 146],
  'ico-location.png': [112, 150],
  'ico-est.png': [163, 140],
  'ico-check.png': [160, 149],
  'ico-cross.png': [160, 149],
  'ico-hands.png': [193, 118],
  'ico-chat.png': [193, 117],
  'dot-yellow.png': [73, 67],
  'doodle-star.png': [243, 239],
  'doodle-quote.png': [138, 92],
  'doodle-squiggle.png': [388, 58],
  'doodle-squiggle-sm.png': [232, 76],
  'doodle-bolt.png': [198, 165],
  'doodle-target.png': [220, 189],
  'logo-makemytrip.png': [128, 128],
  'logo-booking.png': [160, 90],
  'logo-airbnb.png': [128, 141],
  'logo-whatsapp.png': [128, 42],
  'logo-excel.png': [128, 128],
  'polaroid.webp': [418, 441],
  'clip-gold.webp': [80, 321],
  'tape-lavender.webp': [554, 128],
  'tape-kraft.webp': [502, 123],
};

export function Asset({ name, className }: { name: string; className?: string }) {
  const [w, h] = DIM[name] ?? [100, 100];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`${A}/${name}`} alt="" aria-hidden width={w} height={h} className={className} draggable={false} />
  );
}

/* -------------------------------------------------------------------------- */

export function Surface({
  g,
  children,
  className,
}: {
  g: Book;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx(styles.surface, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={g.top} alt="" width={g.w} height={g.topH} className={styles.surfaceImg} draggable={false} />
      <div className={styles.surfaceMid} style={{ backgroundImage: `url("${g.mid}")` }}>
        {g.pages.map(([l, r]) => (
          <div
            key={l}
            aria-hidden
            className={styles.pageGrid}
            style={{
              left: `${l}%`,
              right: `${100 - r}%`,
              backgroundSize: `${g.dot}cqw ${g.dot}cqw`,
              backgroundPosition: `${g.dotX}cqw ${g.dotY}cqw`,
            }}
          />
        ))}
        {children}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={g.bot}
        alt=""
        width={g.w}
        height={g.botH}
        className={cx(styles.surfaceImg, styles.surfaceBot)}
        draggable={false}
      />
    </div>
  );
}

/** A doodle from the supplied sheet, wiped on as though it were being drawn. */
export function Doodle({ src, style }: { src: string; style?: CSSProperties }) {
  return (
    <span data-doodle className={styles.doodle} style={style}>
      <Asset name={src} className={styles.doodleImg} />
    </span>
  );
}

/** Hand-drawn purple rule, stroked on by GSAP. */
export function Rule({ style, width = 300 }: { style?: CSSProperties; width?: number }) {
  return (
    <svg viewBox={`0 0 ${width} 13`} fill="none" aria-hidden className={styles.rule} style={style}>
      <path
        data-rule
        d={`M3 8.4 C ${width * 0.18} 3.2, ${width * 0.36} 11.4, ${width * 0.53} 6.2 S ${
          width * 0.8
        } 3.4, ${width - 3} 8`}
        stroke="var(--nb-purple)"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Runs the highlighter over each phrase in `marks`, in order, through `text`. */
export function MarkedAll({ text, marks }: { text: string; marks: readonly string[] }) {
  const out: ReactNode[] = [];
  let rest = text;
  marks.forEach((m, i) => {
    const at = rest.indexOf(m);
    if (at < 0) return;
    out.push(rest.slice(0, at));
    out.push(
      <span key={i} data-mark className={styles.mark}>
        {m}
      </span>,
    );
    rest = rest.slice(at + m.length);
  });
  out.push(rest);
  return <>{out}</>;
}

export const Marked = ({ text, mark }: { text: string; mark: string }) => (
  <MarkedAll text={text} marks={[mark]} />
);

/** A loose sheet of research, resting on the page. */
export function Card({
  title,
  doodle,
  extra,
  children,
  style,
}: {
  title: string;
  doodle?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={styles.card} style={style}>
      {doodle}
      {extra}
      <p className={cx(styles.monoBold, styles.tLabel, styles.ink)}>{title}</p>
      <Rule style={{ marginBottom: '4%', width: '38%' }} width={150} />
      {children}
    </div>
  );
}

/* --- the left page --------------------------------------------------------- */

export function ProfileWho() {
  return (
    <>
      <header className={styles.whoHeader}>
        <h3 className={cx(styles.hand, styles.tHand, styles.ink)}>{persona.title}</h3>
        <Rule style={{ width: '42%' }} width={170} />
        <Doodle
          src="doodle-star.png"
          style={{ top: '-26%', left: '46%', width: '9%', transform: 'rotate(9deg)' }}
        />
      </header>

      <div className={styles.photoWrap}>
        <div className={styles.polaroid}>
          <div className={styles.polaroidInner}>
            <Asset name="polaroid.webp" className={styles.polaroidImg} />
            <span className={styles.polaroidPhoto}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${A}/agasthya.webp`}
                alt={`${persona.name}, the owner-operator this was built for`}
                width={760}
                height={682}
                draggable={false}
              />
            </span>
            <span className={styles.polaroidName}>
              <span className={cx(styles.hand, styles.tHand, styles.ink)} style={{ letterSpacing: '0.03em' }}>
                {persona.name}
              </span>
              <Rule style={{ marginTop: '-0.25rem', width: '62%' }} width={150} />
            </span>
          </div>
          <span data-clip className={styles.clip}>
            <Asset name="clip-gold.webp" />
          </span>
          <span data-tape className={styles.tapeK}>
            <Asset name="tape-kraft.webp" />
          </span>
        </div>

        <div className={styles.profileCol}>
          <p className={cx(styles.hand, styles.tHand, styles.ink)}>{persona.role}</p>
          <Rule style={{ width: '74%' }} width={220} />
          <dl className={styles.profileList}>
            {persona.profile.map((f) => (
              <div key={f.k} data-profile className={styles.profileRow}>
                <Asset name={`ico-${f.icon}.png`} />
                <dt className={cx(styles.mono, styles.tSmall, styles.muted)}>{f.k}</dt>
                <dd className={cx(styles.hand, styles.tHandSm, styles.ink)}>{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </>
  );
}

/** A running head, for a page that starts mid-thought. */
export function PageHead({ style }: { style?: CSSProperties }) {
  return (
    <header className={styles.whoHeader} style={style}>
      <h3 className={cx(styles.hand, styles.tHand, styles.ink)}>{persona.name}</h3>
      <Rule style={{ width: '38%' }} width={150} />
    </header>
  );
}

/** What he runs the hotel on today. */
export function ToolsGrid() {
  return (
    <div>
      <p className={cx(styles.monoBold, styles.tLabel, styles.purple)}>Runs the hotel on</p>
      <Rule style={{ width: '34%' }} width={140} />
      <ul className={styles.toolsList}>
        {persona.tools.map((t) => (
          <li key={t.label} data-tool>
            <span className={cx(styles.tool, styles.tSmall, styles.ink)}>
              <Asset name={t.logo ?? 'ico-rooms.png'} />
              <span>{t.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The line that says what the whole thing was for. */
export function QuoteCard({ style }: { style?: CSSProperties }) {
  return (
    <div data-quote className={styles.quote} style={style}>
      <div className={styles.quoteInner}>
        <Doodle
          src="doodle-quote.png"
          style={{ top: '-9%', right: '5%', width: '10%', transform: 'rotate(6deg)' }}
        />
        <p className={cx(styles.hand, styles.tHand, styles.ink)}>
          &ldquo;
          <MarkedAll text={persona.quote} marks={persona.quoteMarks} />
          &rdquo;
        </p>
      </div>
      <span data-tape className={styles.quoteTape}>
        <Asset name="tape-lavender.webp" />
      </span>
    </div>
  );
}

/** Notebook metadata: this is a composite, and says so. */
export function Footnote({ style }: { style?: CSSProperties }) {
  return (
    <p className={cx(styles.footnote, styles.tNote, styles.muted)} style={style}>
      <Asset name="dot-yellow.png" />
      {persona.footnote}
    </p>
  );
}

export function ProfileTools({ lead = false }: { lead?: boolean }) {
  return (
    <>
      {lead && <PageHead style={{ marginBottom: '6%' }} />}
      <ToolsGrid />
      <QuoteCard style={{ marginTop: '7%' }} />
      <Footnote style={{ marginTop: '5%' }} />
    </>
  );
}

export function Profile() {
  return (
    <>
      <ProfileWho />
      <div style={{ marginTop: '7%' }}>
        <ProfileTools />
      </div>
    </>
  );
}

/* --- the right page -------------------------------------------------------- */

export function Goals() {
  return (
    <ul className={styles.rows}>
      {persona.goals.map((g) => (
        <li key={g} className={cx(styles.row, styles.icoCheck)}>
          <Asset name="ico-check.png" />
          <span className={cx(styles.tBody, styles.ink)}>{g}</span>
        </li>
      ))}
    </ul>
  );
}

export function Frustrations() {
  return (
    <ul className={styles.rows}>
      {persona.frustrations.map((f) => (
        <li key={f.text} className={cx(styles.row, styles.icoCross, styles.tBody)}>
          <Asset name="ico-cross.png" />
          <span className={cx(styles.italic, styles.ink)}>
            &ldquo;
            <Marked text={f.text} mark={f.mark} />
            &rdquo;
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Triggers() {
  return (
    <ul className={styles.rows}>
      {persona.triggers.map((t) => (
        <li key={t} className={cx(styles.row, styles.rowDot)}>
          <Asset name="dot-yellow.png" />
          <span className={cx(styles.tBody, styles.ink)}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function Success() {
  return (
    <ul className={cx(styles.rows, styles.rowsWide)}>
      {persona.success.map((s) => (
        <li key={s.text} className={cx(styles.row, styles.icoQuote)}>
          <Asset name="doodle-quote.png" />
          <span className={cx(styles.italic, styles.tBody, styles.ink)}>
            &ldquo;
            <Marked text={s.text} mark={s.mark} />
            &rdquo;
          </span>
        </li>
      ))}
    </ul>
  );
}

const JTBD_TINT = [
  { bg: '#f0eafc', chip: '#ded0fa', rule: '#8b6fd8' },
  { bg: '#fbe7ec', chip: '#f7cfd9', rule: '#d9718f' },
  { bg: '#e6f4e9', chip: '#cbe8d3', rule: '#5ea06f' },
] as const;

export function Jtbd() {
  return (
    <div className={styles.jtbd}>
      <p className={cx(styles.monoBold, styles.tLabel, styles.purple)}>Jobs to be done</p>
      <Rule style={{ width: '24%' }} width={110} />
      <div className={styles.jtbdGrid}>
        {persona.jtbd.map((j, i) => {
          const tint = JTBD_TINT[i] ?? JTBD_TINT[0];
          return (
            <div key={j.kind} data-jtbd className={styles.jtbdCard} style={{ background: tint.bg }}>
              <span className={styles.jtbdHead}>
                <span className={styles.jtbdChip} style={{ background: tint.chip }}>
                  <Asset name={j.icon} />
                </span>
                <span className={cx(styles.monoBold, styles.tLabel)} style={{ color: tint.rule }}>
                  {j.kind}
                </span>
              </span>
              <p className={cx(styles.tSmall, styles.ink)} style={{ marginTop: '5%' }}>
                {j.body}
              </p>
              <svg viewBox="0 0 120 10" fill="none" aria-hidden className={styles.jtbdRule}>
                <path
                  data-rule
                  d="M3 6.4 C 24 2.4, 46 9, 66 4.6 S 98 2.6, 117 6"
                  stroke={tint.rule}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

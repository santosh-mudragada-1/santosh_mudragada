'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { persona } from './content';
import { cx } from './cx';
import {
  Card,
  Doodle,
  Footnote,
  Frustrations,
  Goals,
  Jtbd,
  PageHead,
  ProfileWho,
  QuoteCard,
  Rule,
  Success,
  Surface,
  SPREAD,
  ToolsGrid,
  Triggers,
} from './notebook-parts';
import styles from './PersonaNotebook.module.scss';

/* -------------------------------------------------------------------------- */
/*  The spread, on a screen it has to fit inside. Two spreads rather than one   */
/*  squeezed page: who he is, then what the interviews turned up. The book is   */
/*  measured and scaled down to the room available; a layout that already fits  */
/*  is left at 1:1.                                                            */
/* -------------------------------------------------------------------------- */

const vGap = { display: 'flex', flexDirection: 'column' as const };

const GOALS = (
  <Card
    title="Goals"
    doodle={
      <Doodle
        src="doodle-target.png"
        style={{ top: '-5%', right: '4%', width: '13%', transform: 'rotate(-6deg)' }}
      />
    }
  >
    <Goals />
  </Card>
);

const PAINS = (
  <Card
    title="Frustrations · in their words"
    doodle={
      <Doodle
        src="doodle-squiggle-sm.png"
        style={{ top: '-4%', right: '4%', width: '16%', transform: 'rotate(-4deg)' }}
      />
    }
  >
    <Frustrations />
  </Card>
);

const TRIGGERS = (
  <Card
    title="Buying triggers"
    doodle={
      <Doodle
        src="doodle-bolt.png"
        style={{ top: '-5%', right: '5%', width: '10%', transform: 'rotate(8deg)' }}
      />
    }
  >
    <Triggers />
  </Card>
);

const SUCCESS = (
  <Card
    title="Success looks like"
    doodle={
      <Doodle
        src="doodle-star.png"
        style={{ top: '-6%', right: '4%', width: '12%', transform: 'rotate(7deg)' }}
      />
    }
  >
    <Success />
  </Card>
);

function NotesHead() {
  return (
    <header>
      <p className={cx(styles.monoBold, styles.tLabel, styles.purple)}>Discovery notes</p>
      <p className={cx(styles.hand, styles.tHandSm, styles.ink)}>{persona.noteDate}</p>
      <Rule style={{ width: '70%' }} width={130} />
    </header>
  );
}

function Spread({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <Surface g={SPREAD}>
      <div className={styles.spreadGrid}>
        <div className={styles.spreadCol}>{left}</div>
        <div aria-hidden />
        <div>{right}</div>
      </div>
    </Surface>
  );
}

const TABS = [
  { key: 'who', label: 'Persona' },
  { key: 'notes', label: 'Discovery notes' },
] as const;

export function PersonaNotebookDesktop() {
  const [page, setPage] = useState(0);
  const [touched, setTouched] = useState(false);

  const book = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ k: 1, h: 0 });

  const measure = useCallback(() => {
    const el = book.current;
    if (!el) return;
    const natural = el.offsetHeight;
    if (!natural) return;
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    const tabs =
      document
        .querySelector('[aria-label="Case study sections"]')
        ?.parentElement?.getBoundingClientRect().height ?? 0;
    const k = Math.min(1, (window.innerHeight - header - tabs - 56) / natural);
    setFit((prev) =>
      Math.abs(prev.k - k) < 0.002 && prev.h === natural ? prev : { k, h: natural },
    );
  }, []);

  useEffect(() => {
    const el = book.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const open = (i: number) => {
    setPage(i);
    setTouched(true);
  };

  return (
    <div data-nb="spread" className={styles.spreadWrap}>
      <div
        className={styles.spreadFit}
        style={fit.h ? { height: Math.round(fit.h * fit.k) } : undefined}
      >
        <div
          ref={book}
          className={styles.spreadBook}
          style={{ transform: `scale(${fit.k})` }}
        >
          <div role="tablist" aria-label="Notebook spreads" className={styles.tabRow}>
            {TABS.map((t, i) => {
              const isOn = i === page;
              const nudging = !touched && !isOn;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={isOn}
                  onClick={() => open(i)}
                  onMouseEnter={() => setTouched(true)}
                  className={cx(styles.tab, isOn && styles.tabOn, nudging && styles.tabNudge)}
                >
                  {t.label}
                  {nudging && <span aria-hidden className={styles.tabDot} />}
                </button>
              );
            })}
          </div>

          {page === 0 ? (
            <Spread
              left={
                <>
                  <ProfileWho />
                  <QuoteCard style={{ marginTop: '8%' }} />
                  <Footnote style={{ marginTop: '5%' }} />
                </>
              }
              right={
                <>
                  <PageHead style={{ marginBottom: '6%' }} />
                  <ToolsGrid />
                  <div style={{ marginTop: '8%' }}>
                    <Jtbd />
                  </div>
                </>
              }
            />
          ) : (
            <Spread
              left={
                <>
                  <NotesHead />
                  <div style={{ ...vGap, marginTop: '5%', gap: '5%' }}>
                    {GOALS}
                    {TRIGGERS}
                  </div>
                </>
              }
              right={
                <div style={{ ...vGap, gap: '4.5%', paddingTop: '9%' }}>
                  {PAINS}
                  {SUCCESS}
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { persona } from './content';
import { cx } from './cx';
import {
  Card,
  Footnote,
  Frustrations,
  Goals,
  Jtbd,
  PAGE,
  ProfileWho,
  QuoteCard,
  Rule,
  Success,
  Surface,
  ToolsGrid,
  Triggers,
} from './notebook-parts';
import styles from './PersonaNotebook.module.scss';

/* -------------------------------------------------------------------------- */
/*  The notebook on a phone: one page, read top to bottom.                     */
/* -------------------------------------------------------------------------- */

function Head({ title }: { title: string }) {
  return (
    <header className={styles.stackHead}>
      <p className={cx(styles.monoBold, styles.tLabel, styles.purple)}>{title}</p>
      <p className={cx(styles.hand, styles.tHandSm, styles.ink)} style={{ flex: 'none' }}>
        {persona.noteDate}
      </p>
    </header>
  );
}

export function PersonaNotebookMobile() {
  return (
    <div data-nb="stack" className={styles.stack}>
      <Surface g={PAGE}>
        <div className={styles.stackInner}>
          {/* who he is */}
          <ProfileWho />

          {/* what he runs on, and the line it all came down to */}
          <div>
            <ToolsGrid />
            <QuoteCard style={{ marginTop: '8%' }} />
          </div>

          {/* the research, in reading order */}
          <div>
            <Head title="Discovery notes" />
            <Rule style={{ marginBottom: '6%', width: '34%' }} width={140} />
            <div className={styles.stackGroup}>
              <Card title="Goals">
                <Goals />
              </Card>
              <Card title="Frustrations · in their words">
                <Frustrations />
              </Card>
              <Card title="Buying triggers">
                <Triggers />
              </Card>
              <Card title="Success looks like">
                <Success />
              </Card>
            </div>
          </div>

          <Jtbd />

          <Footnote />
        </div>
      </Surface>
    </div>
  );
}

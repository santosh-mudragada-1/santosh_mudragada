'use client';

import { Reveal, SectionMark } from './shared';
import { DormPricingRule } from './DormPricingRule';
import { StayRulesPlayground } from './StayRulesPlayground';
import { ScrollStory } from './ScrollStory';
import { decisionOrder, decisionsIntro, occupancyStory, rateplanStory } from './decisionsContent';
import { cx } from './cx';
import styles from './ProductDecisions.module.scss';

/* -------------------------------------------------------------------------- */
/*  §5 · Product design & decisions — four rules the rate-plan interface had   */
/*  to encode. Two interactive demos (dorm pricing, stay-rule validation) and  */
/*  two scroll-told before/after stories (progressive plan creation,           */
/*  context-aware pricing modes) that take real screenshots once they exist.   */
/* -------------------------------------------------------------------------- */

export function ProductDecisions() {
  return (
    <section id="product-decisions" className={styles.section}>
      <div className={styles.container}>
        <Reveal>
          <SectionMark n="05" title="Product design &amp; decisions" />
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className={styles.h2} style={{ marginTop: '1.25rem' }}>
            {decisionsIntro.title}{' '}
            <span className={styles.accent}>{decisionsIntro.titleAccent}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className={styles.lede}>{decisionsIntro.lede}</p>
        </Reveal>
      </div>

      {decisionOrder.map((d) => (
        <div key={d.id} className={styles.decision}>
          <div className={styles.container}>
            <Reveal>
              <div className={styles.decHead}>
                <div className={styles.decTop}>
                  <span className={styles.decN}>{d.n}</span>
                  <span className={styles.decAspect}>{d.aspect}</span>
                </div>
                <p className={styles.decCall}>{d.call}</p>
              </div>
            </Reveal>
          </div>

          {d.id === 'dorm' && (
            <div className={styles.container}>
              <div className={styles.playground}>
                <DormPricingRule />
              </div>
            </div>
          )}

          {d.id === 'rateplan' && (
            <div className={cx(styles.fullBleed, styles.storyWrap)}>
              <ScrollStory story={rateplanStory} />
            </div>
          )}

          {d.id === 'occupancy' && (
            <div className={cx(styles.fullBleed, styles.storyWrap)}>
              <ScrollStory story={occupancyStory} />
            </div>
          )}

          {d.id === 'stayrules' && (
            <div className={styles.container}>
              <div className={styles.playground}>
                <StayRulesPlayground />
              </div>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

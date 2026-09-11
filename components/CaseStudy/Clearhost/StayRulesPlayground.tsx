'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { stayRules } from './decisionsContent';
import { Check, Minus, Plus } from './icons';
import { cx } from './cx';
import styles from './StayRulesPlayground.module.scss';

/* -------------------------------------------------------------------------- */
/*  Preventing invalid configurations — a validation playground.              */
/*                                                                            */
/*  The system NEVER modifies the host's input. It validates, explains        */
/*  inline, and leaves them in control: an invalid field gets a red border,   */
/*  soft fill, a warning glyph and helper text — all of which settle back to  */
/*  neutral once resolved.                                                     */
/*                                                                            */
/*  Rules: MSA >= 1 · MST >= 1 · MXS >= MSA and MXS >= MST                     */
/*  (the third rule is skipped entirely while "No limit" is on).              */
/* -------------------------------------------------------------------------- */

type FieldKey = 'msa' | 'mst' | 'mxs';

const CAP = 30;
const [MSA, MST, MXS] = stayRules.fields;

export function StayRulesPlayground() {
  const reduced = usePrefersReducedMotion();

  const [msa, setMsa] = useState<number>(stayRules.defaults.msa);
  const [mst, setMst] = useState<number>(stayRules.defaults.mst);
  const [mxs, setMxs] = useState<number>(stayRules.defaults.mxs);
  const [noLimit, setNoLimit] = useState(false);

  const msaInvalid = msa < 1;
  const mstInvalid = mst < 1;
  const mxsInvalid = !noLimit && (mxs < msa || mxs < mst);
  const allValid = !msaInvalid && !mstInvalid && !mxsInvalid;

  const value = { msa, mst, mxs };
  const invalid = { msa: msaInvalid, mst: mstInvalid, mxs: mxsInvalid };
  const setter: Record<FieldKey, (n: number) => void> = { msa: setMsa, mst: setMst, mxs: setMxs };

  const numRefs = {
    msa: useRef<HTMLSpanElement>(null),
    mst: useRef<HTMLSpanElement>(null),
    mxs: useRef<HTMLSpanElement>(null),
  };
  const disp = useRef({ msa, mst, mxs });

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.6,
        ease: 'power3.out',
      });
    }, cardRef);
    return () => ctx.revert();
  }, [reduced]);

  const step = useCallback(
    (k: FieldKey, d: number) => {
      if (k === 'mxs' && noLimit) return;
      const next = Math.max(0, Math.min(CAP, Math.round(disp.current[k]) + d));
      const el = numRefs[k].current;
      if (reduced || !el) {
        disp.current[k] = next;
        if (el) el.textContent = String(next);
        setter[k](next);
        return;
      }
      const proxy = { v: Math.round(disp.current[k]) };
      gsap.to(proxy, {
        v: next,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => {
          const shown = Math.round(proxy.v);
          disp.current[k] = shown;
          el.textContent = String(shown);
        },
        onComplete: () => {
          disp.current[k] = next;
          el.textContent = String(next);
          setter[k](next);
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [noLimit, reduced],
  );

  const renderField = (
    f: (typeof stayRules.fields)[number],
    opts: { isMax?: boolean } = {},
  ) => {
    const k = f.key as FieldKey;
    const dimmed = opts.isMax && noLimit;
    return (
      <div
        key={k}
        className={styles.field}
        data-invalid={invalid[k] ? 'true' : 'false'}
        data-dimmed={dimmed ? 'true' : 'false'}
      >
        <div className={styles.fieldTop}>
          <div className={styles.fieldMeta}>
            <span className={styles.fieldTitleRow}>
              <span className={styles.fieldTitle}>{f.title}</span>
              <span className={styles.warn} aria-hidden>
                !
              </span>
            </span>
            <span className={styles.fieldSub}>{f.sub}</span>
          </div>

          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => step(k, -1)}
              aria-label={`Decrease ${f.title}`}
            >
              <Minus size={15} />
            </button>
            <span className={styles.valueBox}>
              <span
                ref={numRefs[k]}
                className={styles.num}
                data-hidden={dimmed ? 'true' : 'false'}
              >
                {value[k]}
              </span>
              {opts.isMax && (
                <span className={styles.noLimitLabel} data-shown={dimmed ? 'true' : 'false'}>
                  No limit
                </span>
              )}
            </span>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => step(k, 1)}
              aria-label={`Increase ${f.title}`}
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        <div className={styles.msg} role={invalid[k] ? 'alert' : undefined}>
          <span className={styles.msgDot} aria-hidden />
          <span>{f.error}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.root}>
      <div ref={cardRef} className={styles.card} data-ready={allValid ? 'true' : 'false'}>
        <div className={styles.header}>
          <span className={styles.panelTitle}>{stayRules.panelTitle}</span>
          <span className={styles.fieldSub}>{stayRules.panelSubtitle}</span>
        </div>

        {renderField(MSA)}
        {renderField(MST)}
        {renderField(MXS, { isMax: true })}

        <div className={styles.noLimitRow} data-on={noLimit ? 'true' : 'false'}>
          <div className={styles.fieldMeta}>
            <span className={styles.fieldTitle}>{stayRules.noLimit.title}</span>
            <span className={styles.fieldSub}>{stayRules.noLimit.sub}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={noLimit}
            aria-label={stayRules.noLimit.title}
            className={styles.track}
            onClick={() => setNoLimit((v) => !v)}
          >
            <span className={styles.knob} />
          </button>
        </div>

        <div className={cx(styles.ready)} aria-hidden={!allValid}>
          <span className={styles.readyIcon}>
            <Check size={12} />
          </span>
          <span>{stayRules.success}</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, MotionConfig } from 'framer-motion';
import { EASE } from '@/lib/motion/config';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { dormRule } from './decisionsContent';
import { Check, MousePointer2, X } from './icons';
import { cx } from './cx';
import styles from './DormPricingRule.module.scss';

/* -------------------------------------------------------------------------- */
/*  Dormitory-specific pricing — "the interface guides you to the valid       */
/*  configuration". Ported from a Framer Motion prototype into the portfolio  */
/*  paper/ink/orange shell.                                                    */
/*                                                                            */
/*  Per-room pricing is never removed for dormitories — it stays on screen,   */
/*  dimmed, struck through, padlocked, so the rule is legible at a glance.    */
/*  The selection highlight is a shared `layoutId`: switching to Dormitory    */
/*  while "Per room" is active makes it physically travel to "Per person" —   */
/*  you watch the system correct an invalid choice.                           */
/* -------------------------------------------------------------------------- */

type RoomType = 'private' | 'dorm';
type Pricing = 'room' | 'person';

const ANIM = 0.4;

function Lock({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden fill="none">
      <rect x="2.6" y="5.4" width="6.8" height="5" rx="1.3" fill="currentColor" />
      <path
        d="M4.3 5.4V4.3a1.7 1.7 0 0 1 3.4 0v1.1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CompareRow({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className={cx(styles.cmpRow, allowed ? styles.cmpYes : styles.cmpNo)}>
      <span className={styles.cmpIcon}>{allowed ? <Check size={12} /> : <X size={12} />}</span>
      <span className={styles.cmpLabel}>{label}</span>
    </div>
  );
}

export function DormPricingRule() {
  const reduced = usePrefersReducedMotion();

  const [roomType, setRoomType] = useState<RoomType>('private');
  const [pricing, setPricing] = useState<Pricing>('room');
  const [touched, setTouched] = useState(false);
  const [corrected, setCorrected] = useState(false);
  const [settled, setSettled] = useState(false);

  const isDorm = roomType === 'dorm';
  const effective: Pricing = isDorm ? 'person' : pricing;
  const nudgeActive = !reduced && !touched && !isDorm;

  const prevDorm = useRef(isDorm);
  useEffect(() => {
    if (isDorm && !prevDorm.current && pricing === 'room') {
      setCorrected(true);
      const t = window.setTimeout(() => setCorrected(false), 2200);
      prevDorm.current = isDorm;
      return () => window.clearTimeout(t);
    }
    prevDorm.current = isDorm;
  }, [isDorm, pricing]);

  useEffect(() => {
    setSettled(false);
    if (!isDorm) return;
    const t = window.setTimeout(() => setSettled(true), reduced ? 0 : ANIM * 1000 + 160);
    return () => window.clearTimeout(t);
  }, [isDorm, reduced]);

  const spring = { type: 'spring' as const, stiffness: 440, damping: 34 };

  return (
    <div className={styles.root}>
      <MotionConfig
        transition={{ duration: reduced ? 0 : ANIM, ease: EASE.expoOut }}
        reducedMotion={reduced ? 'always' : 'user'}
      >
        <LayoutGroup>
          <motion.div layout className={styles.card}>
            <motion.div layout className={styles.story}>
              {dormRule.story.map((s) => (
                <div key={s.k} className={styles.line}>
                  <span className={cx(styles.k, s.k === 'Result' && styles.kRes)}>{s.k}</span>
                  <span className={cx(styles.v, s.k === 'Result' && styles.vRes)}>{s.v}</span>
                </div>
              ))}
            </motion.div>

            <motion.div layout className={styles.rule} />

            {/* Room type — the driver */}
            <motion.div layout className={styles.field}>
              <div className={styles.labelRow}>
                <span className={styles.label}>Room type</span>
                <AnimatePresence>
                  {nudgeActive && (
                    <motion.span
                      className={styles.hint}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: 0.4 }}
                    >
                      {dormRule.hint} →
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className={styles.seg}>
                {dormRule.roomTypes.map((o) => {
                  const active = o.value === roomType;
                  const nudge = nudgeActive && o.value === 'dorm';
                  return (
                    <button
                      key={o.value}
                      type="button"
                      className={cx(styles.segBtn, active && styles.segActive, nudge && styles.segNudge)}
                      onClick={() => {
                        setTouched(true);
                        setRoomType(o.value as RoomType);
                      }}
                    >
                      {active && (
                        <motion.span layoutId="dormRoomPill" className={styles.pill} transition={spring} />
                      )}
                      {nudge && <span className={styles.nudgeRing} aria-hidden />}
                      <span className={styles.segTxt}>{o.label}</span>
                      {nudge && (
                        <motion.span
                          className={styles.cursor}
                          aria-hidden
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 1, 1, 1, 1, 0],
                            x: [26, 6, 0, 0, 6, 26],
                            y: [22, 6, 0, 0, 6, 22],
                            scale: [1, 1, 0.86, 1, 1, 1],
                          }}
                          transition={{
                            duration: 2.6,
                            times: [0, 0.28, 0.42, 0.52, 0.7, 1],
                            repeat: Infinity,
                            repeatDelay: 0.5,
                            ease: 'easeInOut',
                          }}
                        >
                          <MousePointer2 size={20} />
                        </motion.span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Pricing type — the option that gets locked */}
            <motion.div layout className={styles.field}>
              <div className={styles.labelRow}>
                <span className={styles.label}>Pricing type</span>
                <AnimatePresence>
                  {corrected && (
                    <motion.span
                      className={styles.autoBadge}
                      initial={{ opacity: 0, y: -4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                    >
                      {dormRule.autoCorrectLabel}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className={styles.opts}>
                {dormRule.pricing.map((o) => {
                  const locked = isDorm && o.value === 'room';
                  const active = effective === o.value;
                  return (
                    <motion.button
                      layout
                      key={o.value}
                      type="button"
                      disabled={locked}
                      aria-disabled={locked}
                      className={cx(styles.opt, active && styles.optSelected, locked && styles.optLocked)}
                      onClick={() => !locked && setPricing(o.value as Pricing)}
                      animate={{ opacity: locked ? 0.42 : 1 }}
                      whileTap={locked ? undefined : { scale: 0.98 }}
                    >
                      {active && (
                        <motion.span
                          layoutId="dormPricingSel"
                          className={styles.optSel}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className={styles.optMain}>
                        <span className={styles.optCheck}>
                          <AnimatePresence initial={false}>
                            {active && (
                              <motion.span
                                key="ck"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 520, damping: 24 }}
                                style={{ display: 'inline-flex' }}
                              >
                                <Check size={13} />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                        <span className={cx(styles.optLabel, locked && styles.optStrike)}>{o.label}</span>
                      </span>

                      <AnimatePresence>
                        {locked && (
                          <motion.span
                            className={styles.lock}
                            initial={{ opacity: 0, scale: 0.3, rotate: -25 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.4 }}
                            transition={{ type: 'spring', stiffness: 480, damping: 22, delay: ANIM * 0.35 }}
                          >
                            <Lock />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Helper card */}
            <AnimatePresence>
              {isDorm && settled && (
                <motion.div
                  layout
                  className={styles.helper}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6, transition: { duration: 0.16 } }}
                  transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                >
                  <span className={styles.helperIcon}>
                    <Lock />
                  </span>
                  <span className={styles.helperText}>
                    <span className={styles.helperTitle}>{dormRule.helperTitle}</span>
                    <span className={styles.helperBody}>{dormRule.helperBody}</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Comparison */}
            <motion.div layout className={styles.cmp}>
              <div className={cx(styles.cmpCol, !isDorm && styles.cmpOn)}>
                <div className={styles.cmpHead}>{dormRule.compare.private.head}</div>
                {dormRule.compare.private.rows.map((r) => (
                  <CompareRow key={r.label} label={r.label} allowed={r.allowed} />
                ))}
              </div>
              <div className={cx(styles.cmpCol, isDorm && styles.cmpOn)}>
                <div className={styles.cmpHead}>{dormRule.compare.dorm.head}</div>
                {dormRule.compare.dorm.rows.map((r) => (
                  <CompareRow key={r.label} label={r.label} allowed={r.allowed} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </LayoutGroup>
      </MotionConfig>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { definingCards, type DefinitionCard } from './content';
import { cx } from './cx';
import styles from './DefiningDeck.module.scss';

/* -------------------------------------------------------------------------- */
/*  A deck of positioning calls, spread on a table.                            */
/*                                                                            */
/*  At rest the cards overlap heavily. Hovering any card creates space around  */
/*  it: everything to its left slides left, everything to its right slides     */
/*  right, and the hovered card itself barely moves. Offsets are derived from  */
/*  `index - hovered`, so the maths holds for any number of cards.             */
/* -------------------------------------------------------------------------- */

const SPRING = { type: 'spring' as const, stiffness: 220, damping: 24, mass: 0.8 };
const STAGGER = 0.03;
const MAX_LAG = 0.09;
const OUTER_STEP = 20;

export function DefiningDeck() {
  const [hovered, setHovered] = useState<number | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const [overlap, setOverlap] = useState(0);
  const reduced = usePrefersReducedMotion();

  const canExpand = useMediaQuery('(min-width: 768px) and (hover: hover)');
  const isPhone = useMediaQuery('(max-width: 767.98px)');

  useEffect(() => {
    const read = () => {
      const li = list.current?.children[1] as HTMLElement | undefined;
      if (!li) return;
      setOverlap(Math.max(0, -parseFloat(getComputedStyle(li).marginLeft) || 0));
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  const offsetFor = (i: number) => {
    if (hovered === null || !canExpand || overlap === 0) return 0;
    const d = i - hovered;
    if (d === 0) return 0;
    const magnitude = overlap + (Math.abs(d) - 1) * OUTER_STEP;
    return Math.sign(d) * magnitude;
  };

  const delayFor = (i: number) => {
    if (reduced || hovered === null || !canExpand) return 0;
    const d = Math.abs(i - hovered);
    return d <= 1 ? 0 : Math.min((d - 1) * STAGGER, MAX_LAG);
  };

  return (
    <>
      <DeckStack active={isPhone} reduced={reduced} />

      <div className={styles.rail}>
        <ul ref={list} onMouseLeave={() => setHovered(null)} className={styles.row}>
          {definingCards.map((card, i) => (
            <li
              key={card.id}
              style={{ marginLeft: i === 0 ? 0 : 'calc(-1 * var(--ov))' }}
              className={styles.rowItem}
            >
              <DeckCard
                card={card}
                index={i}
                isHovered={hovered === i}
                anyHovered={hovered !== null}
                x={offsetFor(i)}
                delay={delayFor(i)}
                onEnter={() => canExpand && setHovered(i)}
                onFocus={() => canExpand && setHovered(i)}
                onBlur={() => setHovered(null)}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

const HOLD = 3800;

function DeckStack({ active, reduced }: { active: boolean; reduced: boolean }) {
  const [front, setFront] = useState(0);
  const [nudged, setNudged] = useState(0);
  const n = definingCards.length;

  useEffect(() => {
    if (!active || reduced) return;
    const t = setInterval(() => setFront((f) => (f + 1) % n), HOLD);
    return () => clearInterval(t);
  }, [active, reduced, n, nudged]);

  const show = (i: number) => {
    setFront(((i % n) + n) % n);
    setNudged((v) => v + 1);
  };
  const advance = () => show(front + 1);

  if (reduced) {
    return (
      <div className={styles.stackFlat}>
        {definingCards.map((card, i) => (
          <StackCard key={card.id} card={card} index={i} depth={0} flat />
        ))}
      </div>
    );
  }

  return (
    <div data-deck="stack" className={styles.stackWrap}>
      <div className={styles.stackArena}>
        {definingCards.map((card, i) => {
          const depth = (i - front + n) % n;
          return (
            <StackCard key={card.id} card={card} index={i} depth={depth} total={n} onTap={advance} />
          );
        })}
      </div>

      <div className={styles.dots}>
        {definingCards.map((card, i) => (
          <button
            key={card.id}
            type="button"
            onClick={() => show(i)}
            aria-label={`Show call ${i + 1}: ${card.aspect}`}
            aria-current={i === front}
            className={i === front ? styles.dotOn : styles.dot}
          />
        ))}
      </div>
    </div>
  );
}

function StackCard({
  card,
  index,
  depth,
  total = 1,
  flat = false,
  onTap,
}: {
  card: DefinitionCard;
  index: number;
  depth: number;
  total?: number;
  flat?: boolean;
  onTap?: () => void;
}) {
  const Icon = card.icon;
  const behind = Math.min(depth, 3);

  const body = (
    <>
      <span className={styles.cardN}>{String(index + 1).padStart(2, '0')}</span>
      <p className={styles.cardStatement}>{card.statement}</p>
      <div className={styles.cardFoot}>
        <span className={styles.cardRule} />
        <div className={styles.cardMeta}>
          <span className={styles.cardIcon}>
            <Icon size={16} />
          </span>
          <span className={styles.cardMetaText}>
            <span className={styles.cardAspect}>{card.aspect}</span>
            <span className={styles.cardNote}>{card.note}</span>
          </span>
        </div>
      </div>
    </>
  );

  if (flat) {
    return (
      <article
        style={{ backgroundColor: card.tint, rotate: `${card.rot}deg` }}
        className={styles.stackCardFlat}
      >
        {body}
      </article>
    );
  }

  return (
    <motion.article
      onClick={onTap}
      animate={{
        y: behind * -9,
        x: behind * 7,
        scale: 1 - behind * 0.045,
        opacity: depth > 3 ? 0 : 1,
      }}
      transition={SPRING}
      style={{
        backgroundColor: card.tint,
        rotate: `${card.rot + behind * 1.4}deg`,
        zIndex: total - depth,
      }}
      className={cx(styles.stackCard, depth === 0 ? styles.stackCardFront : styles.stackCardBack)}
    >
      {body}
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */

function DeckCard({
  card,
  index,
  isHovered,
  anyHovered,
  x,
  delay,
  onEnter,
  onFocus,
  onBlur,
}: {
  card: DefinitionCard;
  index: number;
  isHovered: boolean;
  anyHovered: boolean;
  x: number;
  delay: number;
  onEnter: () => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const Icon = card.icon;

  return (
    <motion.article
      tabIndex={0}
      onMouseEnter={onEnter}
      onFocus={onFocus}
      onBlur={onBlur}
      animate={{ x, scale: isHovered ? 1.02 : 1 }}
      transition={{ ...SPRING, delay }}
      style={{
        backgroundColor: card.tint,
        rotate: `${card.rot}deg`,
        zIndex: isHovered ? 60 : 10 + index,
      }}
      className={cx(
        styles.deckCard,
        isHovered ? styles.deckCardHovered : styles.deckCardRest,
        anyHovered && !isHovered && styles.deckCardRecede,
      )}
    >
      <span className={styles.cardN}>{String(index + 1).padStart(2, '0')}</span>
      <p className={cx(styles.cardStatement, styles.cardStatementLg)}>{card.statement}</p>
      <div className={styles.cardFoot}>
        <span className={styles.cardRule} />
        <div className={styles.cardMeta}>
          <span className={styles.cardIcon}>
            <Icon size={16} />
          </span>
          <span className={styles.cardMetaText}>
            <span className={styles.cardAspect}>{card.aspect}</span>
            <span className={styles.cardNote}>{card.note}</span>
          </span>
        </div>
      </div>
    </motion.article>
  );
}

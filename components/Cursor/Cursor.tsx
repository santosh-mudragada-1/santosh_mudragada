'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './Cursor.module.scss';

type Mode =
  | 'default'
  | 'link'
  | 'view'
  | 'drag'
  | 'hi'
  | 'paint'
  | 'reveal'
  | 'menu';

const BASE = 96; // fixed DOM box; visual size is a transform scale
const SIZE: Record<Mode, number> = {
  default: 16,
  link: 46,
  view: 96,
  drag: 70,
  hi: 86,
  paint: 120,
  reveal: 60,
  menu: 22,
};
const LABEL: Partial<Record<Mode, string>> = {
  view: 'View',
  drag: 'Drag',
  hi: 'Say hi',
  paint: 'Paint',
};

const POS_SPRING = { damping: 26, stiffness: 500, mass: 0.4 };
const SHAPE_SPRING = { damping: 22, stiffness: 300, mass: 0.5 };

type RevealStyle = {
  font: string;
  letterSpacing: string;
  textTransform: string;
};

/**
 * One global custom cursor.
 *
 * `[data-cursor-sticky]` — while over the element the disc follows the pointer
 * but is clamped to the element's bounds (+ a small margin), so it clings to
 * the *button* (not its centre) and can't wander off. Released the instant the
 * pointer moves to something else — clicks always land.
 *
 * `[data-cursor-reveal]` (optional `data-cursor-reveal-text`) — the disc becomes
 * a mask: the element's text is drawn inside it in the paper tone, anchored to
 * the element, so you "see through" the cursor.
 */
export function Cursor() {
  const canHover = useMediaQuery('(hover: hover)');
  const reduced = usePrefersReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>('default');
  const [visible, setVisible] = useState(false);
  const [revealText, setRevealText] = useState('');
  const [revealStyle, setRevealStyle] = useState<RevealStyle | null>(null);
  const [revealDark, setRevealDark] = useState(false);
  const [revealIcon, setRevealIcon] = useState<'burger' | null>(null);
  const [revealOpen, setRevealOpen] = useState(false);
  const revealOpenRef = useRef(false);
  revealOpenRef.current = revealOpen;

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const firstMoveRef = useRef(true);
  const revealElRef = useRef<HTMLElement | null>(null);
  const revealRectRef = useRef<DOMRect | null>(null);
  const revealTextRef = useRef('');
  revealTextRef.current = revealText;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(SIZE.default / BASE);

  const sx = useSpring(x, POS_SPRING);
  const sy = useSpring(y, POS_SPRING);
  const sScale = useSpring(scale, SHAPE_SPRING);

  const revealSize = useTransform(sScale, (s) => BASE * s);
  const revealX = useTransform([sx, sScale], ([v, s]) => {
    const r = revealRectRef.current;
    return r ? r.left - (v as number) + (BASE * (s as number)) / 2 : 0;
  });
  const revealY = useTransform([sy, sScale], ([v, s]) => {
    const r = revealRectRef.current;
    return r ? r.top - (v as number) + (BASE * (s as number)) / 2 : 0;
  });
  // burger icon: anchored to the icon's own box (centred in the button), so
  // the disc reveals whatever part of the lines/X it is actually over.
  const iconW = useTransform(sx, () => {
    const r = revealRectRef.current;
    return r ? r.width * 0.42 : 26;
  });
  const iconX = useTransform([sx, sScale], ([v, s]) => {
    const r = revealRectRef.current;
    if (!r) return 0;
    const w = r.width * 0.42;
    return (
      r.left + r.width / 2 - w / 2 - (v as number) + (BASE * (s as number)) / 2
    );
  });
  const iconY = useTransform([sy, sScale], ([v, s]) => {
    const r = revealRectRef.current;
    if (!r) return 0;
    return (
      r.top + r.height / 2 - 4.5 - (v as number) + (BASE * (s as number)) / 2
    );
  });

  const enabled = mounted && canHover && !reduced;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    scale.set(SIZE[mode] / BASE);
  }, [mode, scale]);

  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    let stickyEl: HTMLElement | null = null;
    let revealMo: MutationObserver | null = null;

    const show = () => {
      if (!visibleRef.current) setVisible(true);
    };

    const syncRevealState = (el: HTMLElement) => {
      const icon = el.dataset.cursorRevealIcon === 'burger' ? 'burger' : null;
      setRevealOpen(el.dataset.cursorRevealOpen !== undefined);
      setRevealText(
        icon ? '' : el.dataset.cursorRevealText ?? el.textContent?.trim() ?? '',
      );
    };

    const captureReveal = (el: HTMLElement) => {
      revealElRef.current = el;
      revealRectRef.current = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const dark = el.dataset.cursorRevealDark !== undefined;
      const icon = el.dataset.cursorRevealIcon === 'burger' ? 'burger' : null;
      setRevealDark(dark);
      setRevealIcon(icon);
      syncRevealState(el);

      // the element's open/label state can change without the pointer moving
      // (e.g. clicking the burger) — watch for it
      revealMo?.disconnect();
      revealMo = new MutationObserver(() => syncRevealState(el));
      revealMo.observe(el, {
        attributes: true,
        attributeFilter: [
          'data-cursor-reveal-open',
          'data-cursor-reveal-text',
          'aria-expanded',
        ],
      });

      setRevealStyle({
        // always mirror the element's own type so the text seen THROUGH the
        // disc lines up exactly with the text behind it
        font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`,
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform,
      });
    };
    const clearReveal = () => {
      revealMo?.disconnect();
      revealMo = null;
      revealElRef.current = null;
      revealRectRef.current = null;
      setRevealText('');
      setRevealDark(false);
      setRevealIcon(null);
    };

    const onMove = (e: PointerEvent) => {
      show();

      if (firstMoveRef.current) {
        firstMoveRef.current = false;
        sx.jump(e.clientX);
        sy.jump(e.clientY);
      }

      if (revealElRef.current) {
        revealRectRef.current = revealElRef.current.getBoundingClientRect();
        const open = revealElRef.current.dataset.cursorRevealOpen !== undefined;
        if (open !== revealOpenRef.current) setRevealOpen(open);
      }

      if (stickyEl) {
        // follow the pointer, but clamp to the element so the cursor clings to
        // the button itself rather than snapping to its centre.
        const r = stickyEl.getBoundingClientRect();
        const pad = 10;
        x.set(Math.max(r.left - pad, Math.min(r.right + pad, e.clientX)));
        y.set(Math.max(r.top - pad, Math.min(r.bottom + pad, e.clientY)));
      } else {
        x.set(e.clientX);
        y.set(e.clientY);
      }
    };

    const onOver = (e: PointerEvent) => {
      show();
      const t = e.target as HTMLElement | null;

      const revealEl = t?.closest?.(
        '[data-cursor-reveal]',
      ) as HTMLElement | null;
      if (revealEl) {
        if (modeRef.current !== 'reveal') setMode('reveal');
        if (revealEl !== revealElRef.current) captureReveal(revealEl);
      } else {
        if (revealElRef.current) clearReveal();
        const modeEl = t?.closest?.('[data-cursor]') as HTMLElement | null;
        const next = (modeEl?.dataset.cursor as Mode) || 'default';
        if (next !== modeRef.current) setMode(next);
      }

      stickyEl = t?.closest?.('[data-cursor-sticky]') as HTMLElement | null;
    };

    const onWinLeave = () => setVisible(false);
    const onWinEnter = () => setVisible(true);

    const onTransitionDone = () => {
      stickyEl = null;
      clearReveal();
      if (modeRef.current !== 'default') setMode('default');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerenter', onWinEnter);
    document.addEventListener('pointerleave', onWinLeave);
    window.addEventListener('blur', onWinLeave);
    window.addEventListener('transition:complete', onTransitionDone);

    return () => {
      root.classList.remove('has-custom-cursor');
      revealMo?.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerenter', onWinEnter);
      document.removeEventListener('pointerleave', onWinLeave);
      window.removeEventListener('blur', onWinLeave);
      window.removeEventListener('transition:complete', onTransitionDone);
    };
  }, [enabled, x, y, sx, sy]);

  if (!enabled) return null;

  return (
    <div className={styles.root} aria-hidden data-visible={visible || undefined}>
      <motion.div className={styles.follow} style={{ x: sx, y: sy }}>
        <div className={styles.center}>
          <motion.div
            className={`${styles.blob} ${styles[mode]}`}
            data-dark={revealDark || undefined}
            style={{ scale: sScale }}
          >
            <div className={styles.stretch} />
          </motion.div>
          <span
            className={styles.label}
            data-show={LABEL[mode] ? true : undefined}
          >
            {LABEL[mode] ?? ''}
          </span>
        </div>

        {revealIcon === 'burger' && (
          <motion.div
            className={styles.mask}
            style={{ width: revealSize, height: revealSize }}
          >
            <motion.span
              className={styles.maskBurger}
              data-open={revealOpen || undefined}
              style={{ x: iconX, y: iconY, width: iconW }}
            >
              <span />
              <span />
            </motion.span>
          </motion.div>
        )}

        {revealText && revealStyle && (
          <motion.div
            className={styles.mask}
            style={{ width: revealSize, height: revealSize }}
          >
            <motion.span
              className={styles.maskInk}
              style={{
                x: revealX,
                y: revealY,
                font: revealStyle.font,
                letterSpacing: revealStyle.letterSpacing,
                textTransform:
                  revealStyle.textTransform as React.CSSProperties['textTransform'],
              }}
            >
              {revealText}
            </motion.span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

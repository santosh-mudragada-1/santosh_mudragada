'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import {
  Frame,
  MessageSquare,
  Minus,
  MousePointer2,
  PenLine,
  Play,
  Plus,
  Square,
  StickyNote,
  Type,
} from './icons';
import { cx } from './cx';
import styles from './DeckLiveBg.module.scss';

/* -------------------------------------------------------------------------- */
/*  Ambient life for the positioning-deck band — a decorative layer UNDER the  */
/*  deck that makes the band read as a live workspace file left open          */
/*  mid-workshop: faded chrome, hand-drawn marginalia that sketch themselves   */
/*  in, two collaborators drifting through the empty margins, and small        */
/*  "someone else is working" tells. Everything is transform/opacity,          */
/*  time-driven (never scrubbed), randomised so nothing visibly loops.        */
/* -------------------------------------------------------------------------- */

const rnd = (min: number, max: number) => min + Math.random() * (max - min);

const STROKES: Record<string, string> = {
  circle:
    'M12 3 C19 2.5 22 7 21.5 12 C21 18 16 21.5 11 21 C5.5 20.5 2.5 16 3 11 C3.5 6.5 7.5 3.4 13 3.2',
  star: 'M12 3 L14.4 9.2 L21 9.6 L15.8 13.8 L17.6 20.4 L12 16.6 L6.4 20.4 L8.2 13.8 L3 9.6 L9.6 9.2 Z',
  check: 'M4 13 L10 19 L20 5',
  arrow: 'M3 20 C8 16 13 13.5 19.5 6.5 M14.5 6.5 L20 6 L19.4 11.5',
  underline: 'M3 12 C8 10.4 16 10.6 21 12',
  qmark: 'M8 8.5 C8 4.5 16 4.5 16 8.5 C16 11.5 12 11.2 12 14.5 M12 18.5 L12 18.9',
  connector: 'M2 4 C10 8 13 15 21.5 19.5 M17.5 20.4 L22 20 L21.4 15.6',
  flow: 'M2 6 H10 V12 H2 Z M14 12 H22 V18 H14 Z M10 9 C13 9 12 15 14 15',
  mindmap:
    'M4 12 C8 6.5 10 5.5 14.5 4.5 M4 12 C9 12 12.5 12.6 17 12 M4 12 C8 17 11 18.6 15.5 19.6',
  scribble: 'M4 14 C7 8 9 8 10 12 C11 16 13 16 14.5 10 C15.5 6.5 18 7 20 9',
};

interface Doodle {
  id: string;
  x: string;
  y: string;
  stroke: keyof typeof STROKES;
  label?: string;
  cls?: string;
  accent?: boolean;
  size?: number;
  rot?: number;
}

const DOODLES: Doodle[] = [
  { id: 'do-star', x: '3.5%', y: '17%', stroke: 'star', label: 'Interesting', cls: styles.xl, rot: -8 },
  { id: 'do-why', x: '4.5%', y: '42%', stroke: 'circle', label: 'Why?', cls: styles.xl, accent: true, rot: 4 },
  { id: 'do-arrow', x: '4%', y: '66%', stroke: 'arrow', cls: styles.xl, rot: 6 },
  { id: 'do-good', x: '3.5%', y: '84%', stroke: 'check', label: 'Good point', cls: styles.xl, rot: -4 },
  { id: 'do-valid', x: '92.5%', y: '20%', stroke: 'qmark', label: 'Need validation', cls: styles.xl, accent: true, rot: 5 },
  { id: 'do-discuss', x: '92%', y: '50%', stroke: 'underline', label: 'Discuss', cls: styles.xl, rot: -3 },
  { id: 'do-mind', x: '91%', y: '72%', stroke: 'mindmap', cls: styles.xl, rot: 0, size: 40 },
  { id: 'do-flow', x: '44%', y: '4.5%', stroke: 'flow', cls: styles.md, rot: -2, size: 36 },
  { id: 'do-follow', x: '64%', y: '6%', stroke: 'scribble', label: 'Follow up', cls: styles.md, rot: 3 },
  { id: 'do-conn', x: '20%', y: '92%', stroke: 'connector', cls: styles.md, rot: 8, size: 34 },
  { id: 'do-maybe', x: '56%', y: '93%', stroke: 'underline', label: 'Maybe', cls: styles.md, rot: -2 },
  { id: 'do-later', x: '78%', y: '91.5%', stroke: 'circle', label: 'Check later', cls: styles.lg, accent: true, rot: -5 },
  { id: 'do-m-top', x: '78%', y: '5%', stroke: 'star', label: 'Research', cls: styles.mOnly, rot: 6 },
  { id: 'do-m-bot', x: '24%', y: '94%', stroke: 'check', label: 'Good point', cls: styles.mOnly, rot: -4 },
];

const CURSOR_PATHS: { x: number; y: number }[][] = [
  [
    { x: 6, y: 24 },
    { x: 10, y: 45 },
    { x: 5, y: 63 },
    { x: 16, y: 88 },
    { x: 8, y: 34 },
  ],
  [
    { x: 60, y: 8 },
    { x: 88, y: 18 },
    { x: 93, y: 44 },
    { x: 88, y: 68 },
    { x: 70, y: 90 },
  ],
];

export function DeckLiveBg() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!root.current) return;
      const q = gsap.utils.selector(root);
      const el = (sel: string) => q(sel)[0] as HTMLElement | undefined;

      const paths = q('[data-live-path]') as unknown as SVGPathElement[];
      paths.forEach((p) => {
        const len = p.getTotalLength() || 1;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: reduced ? 0 : len });
      });
      const labels = q('[data-live-label]') as HTMLElement[];
      if (reduced) {
        gsap.set(labels, { autoAlpha: 1 });
        gsap.set(q('[data-live-cursor]'), { autoAlpha: 0 });
        gsap.set(el(`[data-live="comment"]`) ?? {}, { autoAlpha: 0 });
        return;
      }

      const isMobile = window.matchMedia('(max-width: 767.98px)').matches;

      (q('[data-live-doodle]') as HTMLElement[]).forEach((d) => {
        const path = d.querySelector('[data-live-path]') as SVGPathElement | null;
        const label = d.querySelector('[data-live-label]') as HTMLElement | null;
        const at = rnd(1.5, isMobile ? 10 : 24);
        if (path) {
          gsap.to(path, { strokeDashoffset: 0, duration: rnd(0.9, 1.6), delay: at, ease: 'power2.inOut' });
        }
        if (label) {
          gsap.set(label, { autoAlpha: 0, y: 4 });
          gsap.to(label, { autoAlpha: 1, y: 0, duration: 0.5, delay: at + 0.8, ease: 'power2.out' });
        }
      });

      if (!isMobile) {
        const canvas = el(`[data-live="canvas"]`);
        if (canvas) {
          gsap.to(canvas, { x: 2, y: -1.5, duration: rnd(6, 8), ease: 'sine.inOut', repeat: -1, yoyo: true });
        }
      }

      (q('[data-live-avatar]') as HTMLElement[]).forEach((a, i) => {
        gsap.to(a, {
          scale: 1.12,
          duration: rnd(1.2, 1.8),
          delay: i * rnd(0.8, 1.6),
          repeat: -1,
          yoyo: true,
          repeatDelay: rnd(2.5, 5),
          ease: 'sine.inOut',
        });
      });
      (q('[data-live-dot]') as HTMLElement[]).forEach((d) => {
        const blink = () => {
          gsap.to(d, {
            autoAlpha: 0.25,
            duration: 0.18,
            yoyo: true,
            repeat: 1,
            onComplete: () => gsap.delayedCall(rnd(4, 11), blink),
          });
        };
        gsap.delayedCall(rnd(2, 8), blink);
      });

      const saved = el(`[data-live="saved"]`);
      const saving = el(`[data-live="saving"]`);
      if (saved && saving) {
        gsap.set(saving, { autoAlpha: 0 });
        const cycle = () => {
          const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(rnd(7, 14), cycle) });
          tl.to(saved, { autoAlpha: 0, duration: 0.25 })
            .to(saving, { autoAlpha: 1, duration: 0.25 }, '<')
            .to(saving, { autoAlpha: 0, duration: 0.25 }, '+=1.1')
            .to(saved, { autoAlpha: 1, duration: 0.25 }, '<');
        };
        gsap.delayedCall(rnd(4, 8), cycle);
      }

      const zoom = el(`[data-live="zoom"]`);
      if (zoom) {
        const tick = () => {
          zoom.textContent = zoom.textContent === '42%' ? '43%' : '42%';
          gsap.fromTo(zoom, { autoAlpha: 0.4 }, { autoAlpha: 1, duration: 0.3 });
          gsap.delayedCall(rnd(6, 15), tick);
        };
        gsap.delayedCall(rnd(5, 10), tick);
      }

      const hl = el(`[data-live="toolhl"]`);
      if (hl && !isMobile) {
        gsap.set(hl, { autoAlpha: 0 });
        const hover = () => {
          const slot = Math.floor(rnd(0, 7));
          gsap.set(hl, { y: slot * 30 });
          gsap
            .timeline({ onComplete: () => gsap.delayedCall(rnd(6, 13), hover) })
            .to(hl, { autoAlpha: 1, duration: 0.25 })
            .to(hl, { autoAlpha: 0, duration: 0.4 }, '+=0.9');
        };
        gsap.delayedCall(rnd(3, 7), hover);
      }

      const sel = el(`[data-live="sel"]`);
      if (sel && !isMobile) {
        gsap.set(sel, { autoAlpha: 0 });
        const flash = () => {
          gsap
            .timeline({ onComplete: () => gsap.delayedCall(rnd(9, 18), flash) })
            .to(sel, { autoAlpha: 1, duration: 0.2 })
            .to(sel, { autoAlpha: 0, duration: 0.35 }, '+=1.4');
        };
        gsap.delayedCall(rnd(6, 12), flash);
      }

      const comment = el(`[data-live="comment"]`);
      if (comment && !isMobile) {
        gsap.set(comment, { autoAlpha: 0, scale: 0.85, transformOrigin: 'top right' });
        const pop = () => {
          gsap
            .timeline({ onComplete: () => gsap.delayedCall(rnd(10, 20), pop) })
            .to(comment, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)' })
            .to(comment, { autoAlpha: 0, duration: 0.5 }, '+=2.4');
        };
        gsap.delayedCall(rnd(5, 9), pop);
      }

      const mini = el(`[data-live="minivp"]`);
      if (mini) {
        gsap.to(mini, { x: 3, duration: rnd(5, 8), repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }

      if (!isMobile) {
        (q('[data-live-cursor]') as HTMLElement[]).forEach((c, ci) => {
          const pts = CURSOR_PATHS[ci % CURSOR_PATHS.length] ?? [];
          const W = root.current!.clientWidth;
          const H = root.current!.clientHeight;
          gsap.set(c, { x: ((pts[0]?.x ?? 10) / 100) * W, y: ((pts[0]?.y ?? 10) / 100) * H });
          const tl = gsap.timeline({ repeat: -1, delay: ci * rnd(2, 4) });
          pts.forEach((p, i) => {
            tl.to(c, {
              x: (p.x / 100) * W,
              y: (p.y / 100) * H,
              duration: rnd(3.2, 5.4),
              ease: 'power1.inOut',
            });
            tl.to({}, { duration: rnd(0.8, 2.2) });
            if (ci === 0 && i === 1) {
              tl.call(() => {
                const p2 = el(`[data-live-doodle="do-why"]`)?.querySelector(
                  '[data-live-path]',
                ) as SVGPathElement | null;
                if (!p2) return;
                const len = p2.getTotalLength() || 1;
                gsap.fromTo(p2, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' });
              });
            }
          });
        });
      } else {
        gsap.set(q('[data-live-cursor]'), { autoAlpha: 0 });
      }
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div ref={root} aria-hidden className={styles.root}>
      {/* file chip */}
      <div className={styles.fileChip}>
        <span className={styles.fileChipC}>c</span>
        <span className={styles.fileChipName}>clearhost — positioning deck</span>
        <span className={styles.saveBox}>
          <span data-live="saved" className={styles.saveLine}>
            Saved · just now
          </span>
          <span data-live="saving" className={styles.saveLine}>
            Saving…
          </span>
          <span className={styles.saveReserve}>Saved · just now</span>
        </span>
      </div>

      {/* collaborators + actions */}
      <div className={styles.collab}>
        <div className={styles.avatars}>
          {(['SM', 'AR', 'D'] as const).map((a, i) => (
            <span key={a} className={styles.avatarWrap}>
              <span
                data-live-avatar
                className={cx(
                  styles.avatar,
                  i === 0 && styles.avatarMarker,
                  i === 1 && styles.avatarPop,
                  i === 2 && styles.avatarOk,
                )}
              >
                {a}
              </span>
              <span data-live-dot className={styles.onlineDot} />
            </span>
          ))}
        </div>
        <span className={cx(styles.chromeBtn, styles.chromeBtnMd)}>
          <MessageSquare size={14} />
        </span>
        <span className={styles.chromeBtn}>
          <Play size={14} />
        </span>
        <span className={styles.shareBtn}>Share</span>
      </div>

      {/* the comment that pops in */}
      <div data-live="comment" className={styles.comment}>
        <span className={styles.commentAvatar}>AR</span>
        what about pricing tiers?
      </div>

      {/* left toolbar */}
      <div className={styles.toolbarWrap}>
        <div className={styles.toolbar}>
          <span data-live="toolhl" className={styles.toolhl} />
          {[MousePointer2, StickyNote, Type, Square, PenLine, Frame, Plus].map((Ico, i) => (
            <span key={i} className={cx(styles.tool, i === 1 && styles.toolOn)}>
              <Ico size={14} />
            </span>
          ))}
        </div>
      </div>

      {/* zoom + minimap */}
      <div className={styles.zoom}>
        <Minus size={12} />
        <span data-live="zoom" className={styles.zoomVal}>
          42%
        </span>
        <Plus size={12} />
      </div>
      <div className={styles.minimap}>
        <span className={styles.minimapInner}>
          <span data-live="minivp" className={styles.minivp} />
        </span>
      </div>

      {/* blinking selection outline */}
      <span data-live="sel" className={styles.sel} />

      {/* drifting canvas: doodles + cursors */}
      <div data-live="canvas" className={styles.canvas}>
        {DOODLES.map((d) => (
          <span
            key={d.id}
            data-live-doodle={d.id}
            style={{ left: d.x, top: d.y, rotate: `${d.rot ?? 0}deg` }}
            className={cx(styles.doodle, d.cls)}
          >
            <svg
              viewBox="0 0 24 24"
              width={d.size ?? 30}
              height={d.size ?? 30}
              fill="none"
              className={d.accent ? styles.doodleAccent : styles.doodleInk}
            >
              <path
                data-live-path
                d={STROKES[d.stroke]}
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {d.label && (
              <span data-live-label className={styles.doodleLabel}>
                {d.label}
              </span>
            )}
          </span>
        ))}

        <span className={cx(styles.miniStick, styles.miniStick1)} />
        <span className={cx(styles.miniStick, styles.miniStick2)} />
        <span className={cx(styles.miniStick, styles.miniStick3)} />

        {['Santosh', 'PM Lead'].map((name, i) => (
          <div key={name} data-live-cursor={i} className={styles.cursor}>
            <MousePointer2 size={16} className={i === 0 ? styles.cursorPrimary : styles.cursorPop} />
            <span className={cx(styles.cursorTag, i === 0 ? styles.cursorTagPrimary : styles.cursorTagPop)}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap/gsap';
import {
  workflowCopy as copy,
  workflowLinks,
  workflowSteps,
  type WorkflowStep,
} from './content';
import { cx } from './cx';
import { ArtifactCard, Tape } from './WorkflowCards';
import styles from './ProductWorkflow.module.scss';

/* -------------------------------------------------------------------------- */
/*  Desktop: the board is a horizontal track. The section pins and the track   */
/*  slides sideways as you scroll, so the twelve artifacts read left to right  */
/*  like a real timeline. Below xl the same cards stack into an alternating    */
/*  vertical journey. Connectors are measured from the DOM in both layouts.    */
/* -------------------------------------------------------------------------- */

interface Slot {
  w: number;
  top: number;
  rot: number;
  tape?: string;
}

const SLOTS: Record<string, Slot> = {
  opportunity: { w: 268, top: 42, rot: -2.2, tape: styles.tapeA },
  interviews: { w: 300, top: 272, rot: 1.3 },
  jtbd: { w: 288, top: 8, rot: -1.1 },
  prioritisation: { w: 312, top: 252, rot: 1.8 },
  prd: { w: 296, top: 26, rot: -1.5 },
  flow: { w: 288, top: 282, rot: 1.6, tape: styles.tapeB },
  sprint: { w: 272, top: 36, rot: -2 },
  build: { w: 284, top: 264, rot: 1.2 },
  qa: { w: 264, top: 16, rot: -1.7 },
  launch: { w: 292, top: 256, rot: 2, tape: styles.tapeC },
  learn: { w: 284, top: 32, rot: -1.3 },
  iterate: { w: 292, top: 270, rot: 1.5 },
};

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  cx: number;
  cy: number;
}

interface Conn {
  key: string;
  from: string;
  to: string;
  d: string;
  mid: { x: number; y: number };
  labelAt: { x: number; y: number };
  labelW: number;
  label?: string;
}

const MARGIN_NOTES = [
  { id: 'parked', anchor: 'prioritisation', text: copy.margin.parked, rot: -6, gap: 30 },
  { id: 'reserved', anchor: 'sprint', text: copy.margin.reserved, rot: 3, gap: 78, below: true },
  { id: 'epic', anchor: 'build', text: copy.margin.epic, rot: -2, gap: 30, boxed: true },
] as const;

interface Note {
  id: string;
  anchor: string;
  text: string;
  rot: number;
  boxed: boolean;
  x: number;
  y: number;
}

function connect(a: Rect, b: Rect) {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  let p0: { x: number; y: number };
  let p3: { x: number; y: number };
  let p1: { x: number; y: number };
  let p2: { x: number; y: number };

  if (Math.abs(dx) >= Math.abs(dy)) {
    const right = dx > 0;
    p0 = { x: right ? a.right : a.left, y: a.cy };
    p3 = { x: right ? b.left : b.right, y: b.cy };
    const k = Math.max(30, Math.abs(p3.x - p0.x) * 0.5);
    p1 = { x: p0.x + (right ? k : -k), y: p0.y };
    p2 = { x: p3.x - (right ? k : -k), y: p3.y };
  } else {
    const down = dy > 0;
    p0 = { x: a.cx, y: down ? a.bottom : a.top };
    p3 = { x: b.cx, y: down ? b.top : b.bottom };
    const k = Math.max(30, Math.abs(p3.y - p0.y) * 0.5);
    p1 = { x: p0.x, y: p0.y + (down ? k : -k) };
    p2 = { x: p3.x, y: p3.y - (down ? k : -k) };
  }

  const mid = {
    x: (p0.x + 3 * p1.x + 3 * p2.x + p3.x) / 8,
    y: (p0.y + 3 * p1.y + 3 * p2.y + p3.y) / 8,
  };

  const corridor =
    a.bottom < b.top
      ? (a.bottom + b.top) / 2
      : b.bottom < a.top
        ? (b.bottom + a.top) / 2
        : null;
  const sideBySide = Math.abs(dx) >= Math.abs(dy);
  const labelW = sideBySide ? Math.max(78, Math.abs(p3.x - p0.x) - 18) : 150;

  return {
    d: `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`,
    mid,
    labelAt: corridor === null ? mid : { x: mid.x, y: corridor },
    labelW,
  };
}

/* -------------------------------------------------------------------------- */

export function ProductWorkflow() {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastSerialized = useRef('');

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [conns, setConns] = useState<Conn[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const measure = useCallback(() => {
    const trackEl = track.current;
    if (!trackEl) return;
    const tr = trackEl.getBoundingClientRect();
    if (tr.width === 0) return;

    const rects: Record<string, Rect> = {};
    for (const step of workflowSteps) {
      const el = slotRefs.current[step.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      rects[step.id] = {
        left: r.left - tr.left,
        top: r.top - tr.top,
        right: r.right - tr.left,
        bottom: r.bottom - tr.top,
        cx: r.left - tr.left + r.width / 2,
        cy: r.top - tr.top + r.height / 2,
      };
    }

    const next: Conn[] = [];
    for (const l of workflowLinks) {
      const a = rects[l.from];
      const b = rects[l.to];
      if (!a || !b) continue;
      const { d, mid, labelAt, labelW } = connect(a, b);
      next.push({ key: `${l.from}-${l.to}`, from: l.from, to: l.to, d, mid, labelAt, labelW, label: l.label });
    }

    const nextNotes: Note[] = [];
    for (const n of MARGIN_NOTES) {
      const r = rects[n.anchor];
      if (!r) continue;
      nextNotes.push({
        id: n.id,
        anchor: n.anchor,
        text: n.text,
        rot: n.rot,
        boxed: 'boxed' in n && !!n.boxed,
        x: r.cx,
        y: 'below' in n && n.below ? r.bottom + n.gap : r.top - n.gap,
      });
    }

    const serialized = `${Math.round(tr.width)}x${Math.round(tr.height)}|${next.map((c) => c.d).join('|')}`;
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;

    setSize({ w: tr.width, h: tr.height });
    setConns(next);
    setNotes(nextNotes);
  }, []);

  useEffect(() => {
    measure();
    const trackEl = track.current;
    if (!trackEl) return;

    let refreshTimer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      measure();
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(trackEl);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      clearTimeout(refreshTimer);
      ro.disconnect();
    };
  }, [measure]);

  useGSAP(
    () => {
      if (!root.current || !track.current || !viewport.current || conns.length === 0) return;
      const q = gsap.utils.selector(root);
      const slot = (id: string) => q(`[data-slot="${id}"]`)[0] as HTMLElement | undefined;
      const enter = (id: string) => q(`[data-enter="${id}"]`)[0] as HTMLElement | undefined;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isWide: '(min-width: 380px)',
          motionOK: '(prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const { isWide, motionOK } = ctx.conditions as { isWide: boolean; motionOK: boolean };

          const enters = workflowSteps
            .map((s) => enter(s.id))
            .filter((el): el is HTMLElement => !!el);
          const labels = q('[data-conn-label]') as HTMLElement[];
          const marks = q('[data-margin-note]') as HTMLElement[];

          if (!motionOK) {
            gsap.set([...enters, ...labels, ...marks], { autoAlpha: 1, y: 0, rotate: 0 });
            q('[data-conn]').forEach((p) => {
              const path = p as unknown as SVGPathElement;
              gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0, autoAlpha: 1 });
            });
            if (isWide && viewport.current) {
              gsap.set(viewport.current, { overflowX: 'auto' });
            }
            return;
          }

          let container: gsap.core.Tween | undefined;

          if (isWide) {
            gsap.set(viewport.current, { overflowX: 'hidden' });
            const distance = () =>
              Math.max(0, (track.current?.scrollWidth ?? 0) - (viewport.current?.clientWidth ?? 0));

            container = gsap.to(track.current, {
              x: () => -distance(),
              ease: 'none',
              scrollTrigger: {
                trigger: viewport.current,
                start: 'top top',
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                refreshPriority: -1,
                onUpdate: (self) => {
                  if (bar.current) gsap.set(bar.current, { scaleX: self.progress });
                },
              },
            });
          }

          const trig = (el: HTMLElement) => ({
            trigger: el,
            containerAnimation: container,
            start: isWide ? 'left 88%' : 'top 88%',
            toggleActions: 'play none none reverse' as const,
          });

          const vpW = viewport.current!.clientWidth;
          const introIndex = new Map<string, number>();
          if (isWide) {
            workflowSteps.forEach((step) => {
              const s = slot(step.id);
              if (s && s.offsetLeft < vpW * 0.86) introIndex.set(step.id, introIndex.size);
            });
          }
          const introTl =
            isWide && introIndex.size > 0
              ? gsap.timeline({
                  scrollTrigger: {
                    trigger: viewport.current,
                    start: 'top 70%',
                    toggleActions: 'play none none reverse',
                  },
                })
              : null;
          const introAt = (id: string) => (introIndex.get(id) ?? 0) * 0.18;

          workflowSteps.forEach((step) => {
            const el = enter(step.id);
            const anchor = slot(step.id);
            if (!el || !anchor) return;
            const vars = { autoAlpha: 0, y: 26, rotate: -2.5, duration: 0.7, ease: 'power3.out' };
            if (introTl && introIndex.has(step.id)) {
              introTl.from(el, vars, introAt(step.id));
            } else {
              gsap.from(el, { ...vars, scrollTrigger: trig(anchor) });
            }
          });

          const addConn = (tl: gsap.core.Timeline, c: Conn, at: number) => {
            const path = q(`[data-conn="${c.key}"]`)[0] as unknown as SVGPathElement | undefined;
            const pulse = q(`[data-pulse="${c.key}"]`)[0] as unknown as SVGPathElement | undefined;
            const label = q(`[data-conn-label="${c.key}"]`)[0] as HTMLElement | undefined;
            if (!path) return;

            const len = path.getTotalLength() || 1;
            gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 1 });

            tl.to(path, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.out' }, at);
            if (pulse) {
              gsap.set(pulse, { strokeDasharray: '16 99999', autoAlpha: 0 });
              tl.fromTo(
                pulse,
                { strokeDashoffset: 16, autoAlpha: 1 },
                { strokeDashoffset: -len, duration: 0.5, ease: 'power1.inOut' },
                at + 0.06,
              ).to(pulse, { autoAlpha: 0, duration: 0.14 }, at + 0.5);
            }
            if (label) tl.fromTo(label, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, at + 0.35);
          };

          conns.forEach((c) => {
            const anchor = slot(c.to);
            if (!anchor) return;
            if (introTl && introIndex.has(c.to)) {
              addConn(introTl, c, introAt(c.to) + 0.25);
            } else {
              addConn(gsap.timeline({ scrollTrigger: trig(anchor) }), c, 0);
            }
          });

          marks.forEach((m) => {
            const id = m.dataset.marginNote;
            const anchor = id ? slot(id) : undefined;
            if (!anchor) return;
            if (introTl && id && introIndex.has(id)) {
              introTl.fromTo(m, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, introAt(id) + 0.5);
            } else {
              gsap.fromTo(m, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, scrollTrigger: trig(anchor) });
            }
          });

          workflowSteps.forEach((step, i) => {
            const idle = q(`[data-idle="${step.id}"]`)[0] as HTMLElement | undefined;
            if (!idle) return;
            gsap.to(idle, {
              y: i % 2 === 0 ? 2.5 : -2.5,
              rotate: i % 3 === 0 ? 0.35 : -0.3,
              duration: 6 + (i % 5) * 0.8,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              delay: i * 0.35,
            });
          });

          if (isWide && window.matchMedia('(pointer: fine)').matches) {
            const movers = q('[data-parallax]') as HTMLElement[];
            const tos = movers.map((el, i) => ({
              x: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' }),
              y: gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' }),
              depth: 0.35 + ((i * 3) % 5) * 0.15,
            }));
            const onMove = (e: MouseEvent) => {
              const el = viewport.current;
              if (!el) return;
              const r = el.getBoundingClientRect();
              const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
              const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
              const cx = Math.max(-1, Math.min(1, dx));
              const cy = Math.max(-1, Math.min(1, dy));
              for (const t of tos) {
                t.x(cx * 6 * t.depth);
                t.y(cy * 6 * t.depth);
              }
            };
            window.addEventListener('mousemove', onMove, { passive: true });
            return () => window.removeEventListener('mousemove', onMove);
          }
        },
      );

      return () => mm.revert();
    },
    { scope: root, dependencies: [conns], revertOnUpdate: true },
  );

  return (
    <section id="how-i-build" className={cx(styles.section, styles.workflowSection)}>
      <div ref={root}>
        <div className={styles.container}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h2 className={styles.h2}>
              From idea <span className={styles.accent}>to production.</span>
            </h2>
            <p className={styles.sub}>{copy.sub}</p>
          </div>

          <p className="u-visually-hidden">{copy.summary}</p>
          <p className="u-visually-hidden">
            Decisions between steps:{' '}
            {workflowLinks
              .filter((l) => l.label)
              .map((l) => `${titleOf(l.from)} to ${titleOf(l.to)} — ${l.label}`)
              .join('; ')}
            .
          </p>
        </div>

        <div ref={viewport} className={styles.viewport}>
          <div className={styles.persistLabel}>
            <div className={styles.container}>
              <p className={styles.eyebrow}>
                {copy.eyebrow} <span className={styles.accent}>— scroll →</span>
              </p>
            </div>
          </div>

          <div ref={track} className={styles.track}>
            <svg
              aria-hidden
              viewBox={size.w ? `0 0 ${size.w} ${size.h}` : undefined}
              className={styles.connSvg}
            >
              {conns.map((c) => {
                const lit = active === c.from || active === c.to;
                return (
                  <g key={c.key}>
                    <path
                      data-conn={c.key}
                      d={c.d}
                      fill="none"
                      strokeLinecap="round"
                      strokeWidth={lit ? 2 : 1.25}
                      className={cx(styles.conn, lit ? styles.connLit : styles.connDim)}
                    />
                    <path
                      data-pulse={c.key}
                      d={c.d}
                      fill="none"
                      strokeLinecap="round"
                      strokeWidth={3}
                      className={styles.connPulse}
                    />
                  </g>
                );
              })}
            </svg>

            <div aria-hidden className={styles.connLabels}>
              {conns
                .filter((c) => c.label)
                .map((c) => (
                  <span
                    key={`${c.key}-label`}
                    data-conn-label={c.key}
                    style={{
                      left: c.labelAt.x,
                      top: c.labelAt.y,
                      maxWidth: c.labelW,
                      translate: '-50% -50%',
                    }}
                    className={styles.connLabel}
                  >
                    {c.label}
                  </span>
                ))}
            </div>

            {workflowSteps.map((step) => (
              <BoardCard
                key={step.id}
                step={step}
                active={active === step.id}
                onActive={setActive}
                register={(el) => {
                  slotRefs.current[step.id] = el;
                }}
              />
            ))}

            {notes.map((n) => (
              <span
                key={n.id}
                data-margin-note={n.anchor}
                aria-hidden
                style={{ left: n.x, top: n.y, translate: '-50% -50%', rotate: `${n.rot}deg` }}
                className={cx(styles.marginNote, n.boxed && styles.marginNoteBoxed)}
              >
                {n.text}
              </span>
            ))}
          </div>

          <div aria-hidden className={styles.progress}>
            <span ref={bar} className={styles.progressBar} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function BoardCard({
  step,
  active,
  onActive,
  register,
}: {
  step: WorkflowStep;
  active: boolean;
  onActive: (id: string | null) => void;
  register: (el: HTMLDivElement | null) => void;
}) {
  const slot = SLOTS[step.id] ?? { w: 288, top: 0, rot: 0 };

  return (
    <div
      ref={register}
      data-slot={step.id}
      style={
        {
          '--cw': `${slot.w}px`,
          '--top': `${slot.top}px`,
          '--rot': `${slot.rot}deg`,
        } as React.CSSProperties
      }
      className={styles.slot}
    >
      <div data-enter={step.id}>
        <div data-parallax>
          <div data-idle={step.id}>
            <div
              onMouseEnter={() => onActive(step.id)}
              onMouseLeave={() => onActive(null)}
              onClick={() => onActive(active ? null : step.id)}
              className={cx(styles.card, active && styles.cardActive)}
            >
              <div className={styles.scan}>
                <span className={styles.scanNum}>{step.n}</span>
                <span className={styles.scanTitle}>{step.title}</span>
              </div>

              <div className={styles.cardMedia}>
                {slot.tape && <Tape className={cx(styles.tapePos, slot.tape)} />}
                <ArtifactCard step={step} />
              </div>

              <div className={cx(styles.meta, active && styles.metaOn)}>
                {step.hover.map((h) => (
                  <span key={h} className={styles.metaChip}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function titleOf(id: string) {
  return workflowSteps.find((s) => s.id === id)?.title ?? id;
}

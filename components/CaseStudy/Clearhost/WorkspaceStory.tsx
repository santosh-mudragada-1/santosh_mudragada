'use client';

import { useRef } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import {
  clearhost,
  ecosystemModules,
  whiteboardCopy,
  workspaceAnnotations,
  workspaceCopy,
  workspaceNotes,
  type WsNote,
} from './content';
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
import { EcoLayer } from './EcoLayer';
import styles from './WorkspaceStory.module.scss';

/* -------------------------------------------------------------------------- */
/*  The discovery wall as a live workspace file.                               */
/*                                                                            */
/*  Four scroll-scrubbed phases: research rains onto an almost-empty board;    */
/*  it settles into three organic clusters — PMS, the gap, Channel Manager;    */
/*  the middle is named "The Missing Layer" and hand-circled; then all three   */
/*  clusters flow inward and resolve into ClearHost, which draws lines back    */
/*  out to all three. A fifth phase unfolds the whole ecosystem around it.     */
/* -------------------------------------------------------------------------- */

const TONES = ['#FFF9B1', '#A6CCF5', '#D5F692', '#FFCEE0', '#D5C8F7', '#FFD8A8'];
const INK = '#1F1F1F';

type Pt = { x: number; y: number; r?: number };
type Box = { x: number; y: number; w: number; h: number; rot: number; radius: string };

interface Layout {
  notes: WsNote[];
  pms: Box;
  mid: Box;
  cm: Box;
  titles: { pms: Pt; cm: Pt };
  missingLayer: Pt;
  annotations: Pt[];
  logo: Pt;
  cursorRegions: Pt[][];
  end: number;
}

const scatterOf = (i: number, mobile: boolean): Pt => ({
  x: mobile ? 10 + ((i * 53) % 76) : 7 + ((i * 53) % 82),
  y: mobile ? 10 + ((i * 41) % 74) : 13 + ((i * 37) % 66),
  r: ((i * 47) % 17) - 8,
});

function clusterTargets(box: Box, count: number, cols: number, stacked = false, spread = 1): Pt[] {
  const rows = Math.ceil(count / cols);
  const out: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    if (stacked) {
      out.push({
        x: box.x + box.w * (0.5 + (((i * 13) % 5) - 2) * 0.11 * spread),
        y: box.y + box.h * (0.5 + (((i * 7) % 6) - 2.5) * 0.112 * spread),
        r: (((i * 37) % 13) - 6) * 1.1,
      });
    } else {
      out.push({
        x: box.x + box.w * ((c + 0.5) / cols) + (((i * 7) % 5) - 2) * 1.1,
        y: box.y + box.h * ((r + 0.55) / (rows + 0.15)) + (((i * 11) % 5) - 2) * 0.9,
        r: (((i * 29) % 9) - 4) * 1.1,
      });
    }
  }
  return out;
}

function layoutFor(isDesktop: boolean): Layout {
  const notes = isDesktop ? workspaceNotes : workspaceNotes.filter((n) => n.m);
  if (isDesktop) {
    return {
      notes,
      pms: { x: 5.5, y: 28, w: 24, h: 45, rot: -0.7, radius: '34px 26px 30px 24px' },
      mid: { x: 37, y: 33, w: 26, h: 39, rot: -1.4, radius: '28px 34px 22px 30px' },
      cm: { x: 70.5, y: 26, w: 24, h: 47, rot: 0.9, radius: '26px 32px 26px 34px' },
      titles: { pms: { x: 17.5, y: 22 }, cm: { x: 82.5, y: 20 } },
      missingLayer: { x: 50, y: 24.5 },
      annotations: [
        { x: 21, y: 82 },
        { x: 50, y: 88 },
        { x: 79, y: 82 },
      ],
      logo: { x: 50, y: 44 },
      cursorRegions: [
        [
          { x: 8, y: 38 },
          { x: 15, y: 54 },
          { x: 9, y: 68 },
          { x: 17, y: 45 },
        ],
        [
          { x: 35, y: 28 },
          { x: 42, y: 34 },
          { x: 33, y: 31 },
          { x: 38, y: 27 },
        ],
        [
          { x: 93, y: 36 },
          { x: 86, y: 52 },
          { x: 94, y: 66 },
          { x: 88, y: 43 },
        ],
      ],
      end: 7600,
    };
  }
  return {
    notes,
    pms: { x: 4, y: 11, w: 92, h: 15, rot: -0.6, radius: '26px 20px 24px 18px' },
    mid: { x: 15, y: 36, w: 70, h: 13, rot: -1.2, radius: '22px 26px 18px 24px' },
    cm: { x: 4, y: 62, w: 92, h: 15, rot: 0.7, radius: '20px 26px 20px 26px' },
    titles: { pms: { x: 50, y: 7.5 }, cm: { x: 50, y: 58.5 } },
    missingLayer: { x: 50, y: 31.5 },
    annotations: [],
    logo: { x: 50, y: 44 },
    cursorRegions: [
      [
        { x: 12, y: 22 },
        { x: 20, y: 27 },
      ],
      [
        { x: 50, y: 46 },
        { x: 58, y: 49 },
      ],
      [
        { x: 88, y: 72 },
        { x: 82, y: 77 },
      ],
    ],
    end: 6200,
  };
}

export function WorkspaceStory() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!root.current || !stage.current || !camera.current) return;
      const q = gsap.utils.selector(root);
      const el = (sel: string) => q(sel)[0] as HTMLElement | undefined;
      const note = (id: string) => q(`[data-ws-note="${id}"]`)[0] as HTMLElement | undefined;
      const mark = (id: string) =>
        q(`[data-ws-mark="${id}"]`)[0] as unknown as SVGPathElement | undefined;

      let curW = 1;
      let curH = 1;
      let topSafe = 0;
      const mapY = (y: number) => topSafe + (y * (100 - topSafe)) / 100;
      const px = (p: Pt) => ({ x: (p.x / 100) * curW, y: (mapY(p.y) / 100) * curH });
      const box = () => {
        const r = stage.current!.getBoundingClientRect();
        curW = r.width || 1;
        curH = r.height || 1;
        // reserve the top band for the fixed site header + chapter nav + chrome
        topSafe = Math.min((176 / curH) * 100, 26);
        (q('[data-ws-svg]') as unknown as SVGSVGElement[]).forEach((s) =>
          s.setAttribute('viewBox', `0 0 ${curW} ${curH}`),
        );
      };

      const place = (elm: HTMLElement | undefined, p: Pt, extra: object = {}) => {
        if (!elm) return;
        const { x, y } = px(p);
        gsap.set(elm, { x, y, xPercent: -50, yPercent: -50, rotation: p.r ?? 0, ...extra });
      };

      const setFrame = (id: string, b: Box, visible: boolean) => {
        const elm = el(`[data-ws-frame="${id}"]`);
        if (!elm) return;
        gsap.set(elm, {
          left: `${b.x}%`,
          top: `${mapY(b.y)}%`,
          width: `${b.w}%`,
          height: `${(b.h * (100 - topSafe)) / 100}%`,
          rotation: b.rot,
          borderRadius: b.radius,
          autoAlpha: visible ? 1 : 0,
        });
      };

      const setPath = (id: string, d: string, drawn: boolean, sel?: string) => {
        const p = sel ? (q(sel)[0] as unknown as SVGPathElement | undefined) : mark(id);
        if (!p) return;
        p.setAttribute('d', d);
        const len = p.getTotalLength() || 1;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: drawn ? 0 : len, autoAlpha: 1 });
      };

      const ovalPx = (cx: number, cy: number, rx: number, ry: number) => {
        const k = 0.5523;
        const j = 1.08;
        return [
          `M ${cx} ${cy - ry}`,
          `C ${cx + rx * k * j} ${cy - ry} ${cx + rx} ${cy - ry * k} ${cx + rx} ${cy}`,
          `C ${cx + rx} ${cy + ry * k * j} ${cx + rx * k} ${cy + ry} ${cx} ${cy + ry}`,
          `C ${cx - rx * k * j} ${cy + ry} ${cx - rx} ${cy + ry * k} ${cx - rx} ${cy}`,
          `C ${cx - rx} ${cy - ry * k * j} ${cx - rx * k * 0.92} ${cy - ry * 1.04} ${cx + rx * 0.14} ${cy - ry * 0.97}`,
        ].join(' ');
      };
      // Shared control-point math for the quadratic-bezier connector: A/B are the
      // endpoints, C is the bow-offset control point.
      const curveCtrl = (a: Pt, b: Pt, bow: number) => {
        const A = px(a);
        const B = px(b);
        const mx = (A.x + B.x) / 2;
        const my = (A.y + B.y) / 2;
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const len = Math.hypot(dx, dy) || 1;
        const C = { x: mx + (-dy / len) * bow, y: my + (dx / len) * bow };
        return { A, B, C };
      };
      const curve = (a: Pt, b: Pt, bow: number) => {
        const { A, B, C } = curveCtrl(a, b, bow);
        return `M ${A.x} ${A.y} Q ${C.x} ${C.y} ${B.x} ${B.y}`;
      };
      const arrow = (a: Pt, b: Pt, bow: number) => {
        const { B, C } = curveCtrl(a, b, bow);
        // Point the head along the curve's own tangent at B (control point -> B),
        // not the straight A->B line — with a bowed curve those two diverge, which
        // is what made the drawn arrowhead look mis-angled against its own line.
        const ang = Math.atan2(B.y - C.y, B.x - C.x);
        const h = 10;
        return `${curve(a, b, bow)} M ${B.x - h * Math.cos(ang - 0.5)} ${B.y - h * Math.sin(ang - 0.5)} L ${B.x} ${B.y} L ${B.x - h * Math.cos(ang + 0.5)} ${B.y - h * Math.sin(ang + 0.5)}`;
      };

      const mm = gsap.matchMedia();
      mm.add({ isDesktop: '(min-width: 768px)', isMobile: '(max-width: 767.98px)' }, (ctx) => {
        const isDesktop = !!ctx.conditions?.isDesktop;
        const L = layoutFor(isDesktop);
        box();

        const scatter = L.notes.map((_, i) => scatterOf(i, !isDesktop));
        const pmsNotes = L.notes.filter((n) => n.group === 'pms');
        const cmNotes = L.notes.filter((n) => n.group === 'cm');
        const midNotes = L.notes.filter((n) => n.group === 'loose');
        const pmsT = clusterTargets(L.pms, pmsNotes.length, isDesktop ? 2 : 4);
        const cmT = clusterTargets(L.cm, cmNotes.length, isDesktop ? 2 : 4);
        const midT = clusterTargets(L.mid, midNotes.length, 2, true, isDesktop ? 1 : 0.62);
        const target = new Map<string, Pt>();
        pmsNotes.forEach((n, i) => target.set(n.id, pmsT[i] ?? { x: 15, y: 50 }));
        cmNotes.forEach((n, i) => target.set(n.id, cmT[i] ?? { x: 85, y: 50 }));
        midNotes.forEach((n, i) => target.set(n.id, midT[i] ?? { x: 50, y: 50 }));

        workspaceNotes.forEach((n) => {
          if (!L.notes.includes(n)) gsap.set(note(n.id) ?? {}, { autoAlpha: 0 });
        });

        setFrame('pms', L.pms, false);
        setFrame('mid', L.mid, false);
        setFrame('cm', L.cm, false);

        for (const [id, p] of [
          ['pms-title', L.titles.pms],
          ['cm-title', L.titles.cm],
        ] as [string, Pt][]) {
          const t = el(`[data-ws-label="${id}"]`);
          if (t)
            gsap.set(t, {
              left: `${p.x}%`,
              top: `${mapY(p.y)}%`,
              xPercent: -50,
              yPercent: -50,
              autoAlpha: 0,
            });
        }
        place(el(`[data-ws-label="missing"]`), L.missingLayer, { autoAlpha: 0 });
        L.annotations.forEach((p, i) => place(el(`[data-ws-ann="${i}"]`), p, { autoAlpha: 0 }));
        place(el(`[data-ws-logo]`), L.logo, { autoAlpha: 0, scale: 0.5, rotation: -6 });

        L.annotations.forEach((p, i) => {
          const lbl = el(`[data-ws-ann="${i}"]`);
          const w = lbl?.offsetWidth ?? 96;
          const h = lbl?.offsetHeight ?? 16;
          const c = px(p);
          setPath(
            `oval-${i}`,
            ovalPx(c.x, c.y, w / 2 + (isDesktop ? 18 : 12), h / 2 + (isDesktop ? 13 : 9)),
            false,
          );
        });

        if (isDesktop) {
          const midBottom: Pt = { x: L.mid.x + L.mid.w / 2, y: L.mid.y + L.mid.h + 2 };
          const a0 = L.annotations[0] ?? { x: 20, y: 89 };
          const a2 = L.annotations[2] ?? { x: 80, y: 89 };
          setPath(
            'arrow-a',
            arrow({ x: a0.x + 7, y: a0.y - 4 }, { x: midBottom.x - 7, y: midBottom.y }, 34),
            false,
          );
          setPath(
            'arrow-b',
            arrow({ x: a2.x - 7, y: a2.y - 4 }, { x: midBottom.x + 7, y: midBottom.y }, -34),
            false,
          );
        }

        /* ---- Reduced motion: the resolved final frame, no pin ----------- */
        if (reduced) {
          L.notes.forEach((n) =>
            place(note(n.id), target.get(n.id) ?? { x: 50, y: 50 }, { autoAlpha: 0, scale: 0.4 }),
          );
          place(el(`[data-ws-logo]`), L.logo, { autoAlpha: 1, scale: 1, rotation: 0 });
          gsap.set(q('[data-ws-logo-img]'), { autoAlpha: 1, scale: 1 });
          const chromeR = (topSafe / 100) * curH;
          gsap.set(el('[data-ws-logo]') ?? {}, {
            x: curW / 2,
            y: chromeR + 46,
            scale: 0.62,
            autoAlpha: 1,
          });
          gsap.set(el('[data-eco-ring]') ?? {}, { display: 'none' });
          gsap.set(el('[data-eco-stack]') ?? {}, { display: 'block', y: chromeR + 96 });
          gsap.set(q('[data-eco-row]'), { autoAlpha: 1, y: 0 });
          gsap.set(el('[data-eco-layer]') ?? {}, { autoAlpha: 1 });
          gsap.set(el('[data-ws-tagline]') ?? {}, {
            x: curW / 2,
            y: curH - 40,
            xPercent: -50,
            yPercent: -50,
            autoAlpha: 1,
          });
          gsap.set(q('[data-ws-tagline-mark]'), { backgroundSize: '100% 100%' });
          gsap.set(q('[data-ws-cursor]'), { autoAlpha: 0 });
          gsap.set(el(`[data-ws-comment]`) ?? {}, { autoAlpha: 0 });
          gsap.set(stage.current, { autoAlpha: 1 });
          return;
        }

        /* ---- Initial state ---------------------------------------------- */
        L.notes.forEach((n, i) => {
          const s = scatter[i] ?? { x: 50, y: 50, r: 0 };
          place(note(n.id), s, { autoAlpha: 0, scale: 0.7, y: px(s).y - 46 });
        });
        gsap.set(q('[data-ws-tagline]'), { autoAlpha: 0 });
        gsap.set(q('[data-ws-tagline-mark]'), {
          backgroundSize: '0% 100%',
          backgroundRepeat: 'no-repeat',
        });
        gsap.set(q('[data-ws-logo-img]'), { autoAlpha: 0, scale: 0.5 });
        gsap.set(el(`[data-ws-comment]`) ?? {}, { autoAlpha: 0, scale: 0.8 });
        gsap.set(stage.current, { autoAlpha: 1 });

        /* ---- Ambient life ------------------------------------------------ */
        (q('[data-ws-avatar]') as HTMLElement[]).forEach((a, i) =>
          gsap.to(a, {
            scale: 1.1,
            duration: 1.3 + i * 0.2,
            repeat: -1,
            yoyo: true,
            repeatDelay: 2.4 + i * 0.9,
            ease: 'sine.inOut',
          }),
        );

        if (isDesktop) {
          L.cursorRegions.forEach((pts, ci) => {
            const c = el(`[data-ws-cursor="${ci}"]`);
            const first = pts[0];
            if (!c || !first) return;
            const P0 = px(first);
            gsap.set(c, { x: P0.x, y: P0.y });
            const tl2 = gsap.timeline({ repeat: -1, delay: ci * 1.7 });
            pts.forEach((p, i) => {
              const P = px(p);
              tl2.to(c, { x: P.x, y: P.y, duration: 2.6 + (i % 3) * 0.5, ease: 'power2.inOut' });
              tl2.to({}, { duration: 1.5 + ((ci + i) % 3) * 0.7 });
            });
          });
        } else {
          gsap.set(q('[data-ws-cursor]'), { autoAlpha: 0 });
        }

        /* ---- The scrubbed story ---------------------------------------- */
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: stage.current,
            start: 'top top',
            end: `+=${L.end}`,
            scrub: 1,
            pin: stage.current,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        /* Phase 1 — research rains in. */
        tl.addLabel('p1');
        L.notes.forEach((n, i) => {
          const s = scatter[i] ?? { x: 50, y: 50, r: 0 };
          const P = px(s);
          tl.to(
            note(n.id) ?? {},
            {
              autoAlpha: 1,
              scale: 1,
              x: P.x,
              y: P.y,
              rotation: s.r ?? 0,
              duration: 0.32,
              ease: 'back.out(1.5)',
            },
            `p1+=${(i * 0.055).toFixed(3)}`,
          );
        });

        /* Phase 2 — three clusters settle. */
        tl.addLabel('p2', '>+0.15');
        const settleInto = (list: WsNote[], at: number, stagger: number) =>
          list.forEach((n, i) => {
            const t = target.get(n.id)!;
            const P = px(t);
            tl.to(
              note(n.id) ?? {},
              {
                x: P.x,
                y: P.y,
                rotation: t.r ?? 0,
                scale: n.group === 'loose' ? 0.95 : 0.9,
                duration: 0.95,
                ease: 'power3.inOut',
              },
              `p2+=${(at + i * stagger).toFixed(3)}`,
            );
          });
        settleInto(pmsNotes, 0, 0.04);
        settleInto(cmNotes, 0.12, 0.04);
        settleInto(midNotes, 0.3, 0.05);
        tl.to(
          [el(`[data-ws-frame="pms"]`) ?? {}, el(`[data-ws-frame="cm"]`) ?? {}],
          { autoAlpha: 1, duration: 0.4 },
          'p2+=0.55',
        );
        tl.to(el(`[data-ws-frame="mid"]`) ?? {}, { autoAlpha: 1, duration: 0.4 }, 'p2+=0.75');
        tl.to(
          [el(`[data-ws-label="pms-title"]`) ?? {}, el(`[data-ws-label="cm-title"]`) ?? {}],
          { autoAlpha: 1, duration: 0.35 },
          'p2+=0.65',
        );
        tl.to(
          el(`[data-ws-comment]`) ?? {},
          { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(1.6)' },
          'p2+=1.0',
        );

        /* Phase 3 — the middle gets named, and circled. */
        tl.addLabel('p3', '>+0.1');
        tl.to(camera.current, { scale: 1.035, duration: 1.1 }, 'p3');
        tl.to(
          [el(`[data-ws-frame="pms"]`) ?? {}, el(`[data-ws-frame="cm"]`) ?? {}],
          { autoAlpha: 0.4, duration: 0.6 },
          'p3',
        );
        tl.to(
          [...pmsNotes, ...cmNotes].map((n) => note(n.id) ?? {}),
          { autoAlpha: 0.5, duration: 0.6 },
          'p3',
        );
        tl.to(el(`[data-ws-comment]`) ?? {}, { autoAlpha: 0, duration: 0.3 }, 'p3');
        midNotes.forEach((n) => tl.to(note(n.id) ?? {}, { scale: 1.04, duration: 0.5 }, 'p3+=0.15'));
        tl.to(el(`[data-ws-label="missing"]`) ?? {}, { autoAlpha: 1, duration: 0.12 }, 'p3+=0.35');
        tl.fromTo(
          el(`[data-ws-missing-chip]`) ?? {},
          { clipPath: 'inset(0 100% -14% 0)' },
          { clipPath: 'inset(0 -4% -14% 0)', duration: 0.7, ease: 'power1.inOut' },
          'p3+=0.37',
        );
        L.annotations.forEach((_, i) => {
          tl.to(el(`[data-ws-ann="${i}"]`) ?? {}, { autoAlpha: 1, duration: 0.22 }, `p3+=${0.55 + i * 0.26}`);
          tl.to(
            mark(`oval-${i}`) ?? {},
            { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' },
            `p3+=${0.64 + i * 0.26}`,
          );
        });
        tl.to(mark('arrow-a') ?? {}, { strokeDashoffset: 0, duration: 0.5 }, 'p3+=1.5');
        tl.to(mark('arrow-b') ?? {}, { strokeDashoffset: 0, duration: 0.5 }, 'p3+=1.65');
        tl.to({}, { duration: 1.3 });

        /* Phase 4 — all three clusters converge into one system. */
        tl.addLabel('p4', '>');
        tl.to(camera.current, { scale: 1, duration: 1.2 }, 'p4');
        tl.to(
          [
            el(`[data-ws-label="missing"]`) ?? {},
            mark('arrow-a') ?? {},
            mark('arrow-b') ?? {},
            ...L.annotations.map((_, i) => el(`[data-ws-ann="${i}"]`) ?? {}),
            ...L.annotations.map((_, i) => mark(`oval-${i}`) ?? {}),
          ],
          { autoAlpha: 0, duration: 0.4 },
          'p4',
        );
        tl.to(
          [
            el(`[data-ws-frame="pms"]`) ?? {},
            el(`[data-ws-frame="mid"]`) ?? {},
            el(`[data-ws-frame="cm"]`) ?? {},
            el(`[data-ws-label="pms-title"]`) ?? {},
            el(`[data-ws-label="cm-title"]`) ?? {},
          ],
          { autoAlpha: 0, duration: 0.5 },
          'p4+=0.25',
        );
        const streams = [pmsNotes, midNotes, cmNotes];
        const maxLen = Math.max(...streams.map((s) => s.length));
        const C = px(L.logo);
        for (let i = 0; i < maxLen; i++) {
          streams.forEach((list, si) => {
            const n = list[i];
            if (!n) return;
            tl.to(
              note(n.id) ?? {},
              {
                x: C.x,
                y: C.y,
                scale: 0.28,
                autoAlpha: 0,
                rotation: 0,
                duration: 0.85,
                ease: 'power2.in',
              },
              `p4+=${(0.2 + i * 0.075 + si * 0.02).toFixed(3)}`,
            );
          });
        }
        tl.to(
          el(`[data-ws-logo]`) ?? {},
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.4)' },
          'p4+=0.8',
        );
        tl.to(
          q('[data-ws-logo-img]'),
          { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' },
          'p4+=1.15',
        );
        tl.to(
          el(`[data-ws-logo-paper]`) ?? {},
          { borderRadius: 26, backgroundColor: '#FFFFFF', duration: 0.5 },
          'p4+=1.15',
        );

        /* Phase 5 — the whole ecosystem unfolds around the logo. */
        const CC = px(L.logo);
        const chromeH = (topSafe / 100) * curH;
        const taglineBand = isDesktop ? 74 : 0;
        const floorY = curH - taglineBand;
        gsap.set(el('[data-ws-tagline]') ?? {}, {
          x: curW / 2,
          y: isDesktop ? floorY + taglineBand / 2 : chromeH + 96,
          xPercent: -50,
          yPercent: -50,
        });
        tl.to(q('[data-ws-tagline]'), { autoAlpha: 1, duration: 0.35 }, 'p4+=2.5');
        tl.to(
          q('[data-ws-tagline-mark]'),
          { backgroundSize: '100% 100%', duration: 0.7, ease: 'power2.out' },
          'p4+=2.75',
        );

        if (isDesktop) {
          const N = ecosystemModules.length;
          const R1 = 100;
          const fanMax = R1 * 1.5;
          const rx = Math.min(curW * 0.29, 430);
          const ry = Math.max(
            72,
            Math.min(curH * 0.17, CC.y - chromeH - fanMax - 18, floorY - CC.y - fanMax - 18),
          );

          const LUT = 720;
          const arc: number[] = [0];
          for (let i = 1; i <= LUT; i++) {
            const a0 = ((i - 1) / LUT) * 2 * Math.PI;
            const a1 = (i / LUT) * 2 * Math.PI;
            arc.push(
              (arc[i - 1] ?? 0) +
                Math.hypot(rx * (Math.cos(a1) - Math.cos(a0)), ry * (Math.sin(a1) - Math.sin(a0))),
            );
          }
          const total = arc[LUT] ?? 1;
          const angleAt = (f: number) => {
            const targetArc = ((((f % 1) + 1) % 1) * total);
            let lo = 0;
            let hi = LUT;
            while (lo < hi) {
              const mid = (lo + hi) >> 1;
              if ((arc[mid] ?? 0) < targetArc) lo = mid + 1;
              else hi = mid;
            }
            return (lo / LUT) * 2 * Math.PI;
          };
          const modPos = ecosystemModules.map((_, i) => {
            const a = angleAt(0.75 + i / N);
            return { x: CC.x + rx * Math.cos(a), y: CC.y + ry * Math.sin(a) };
          });

          const childPos = (mi: number, ci: number, n: number) => {
            const m = modPos[mi] ?? CC;
            const vx = m.x - CC.x;
            const vy = m.y - CC.y;
            const len = Math.hypot(vx, vy) || 1;
            const ox = vx / len;
            const oy = vy / len;
            const spread =
              ((n <= 2 ? 80 : n === 3 ? 110 : n === 4 ? 130 : 150) * Math.PI) / 180;
            const th = (n === 1 ? 0 : ci / (n - 1) - 0.5) * spread;
            const r = R1 * (ci % 2 === 0 ? 1.5 : 1);
            const c = Math.cos(th);
            const s2 = Math.sin(th);
            return { x: m.x + (ox * c - oy * s2) * r, y: m.y + (oy * c + ox * s2) * r };
          };

          (el('[data-eco-lines]') as unknown as SVGSVGElement | undefined)?.setAttribute(
            'viewBox',
            `0 0 ${curW} ${curH}`,
          );

          ecosystemModules.forEach((m, mi) => {
            const p0 = modPos[mi] ?? CC;
            gsap.set(el(`[data-eco-node="m|${m.id}"]`) ?? {}, {
              x: p0.x,
              y: p0.y,
              xPercent: -50,
              yPercent: -50,
              scale: 0,
              autoAlpha: 0,
            });
            setPath(
              `eco-link-${m.id}`,
              `M ${CC.x} ${CC.y} Q ${(CC.x + p0.x) / 2 - (p0.y - CC.y) * 0.14} ${(CC.y + p0.y) / 2 + (p0.x - CC.x) * 0.14} ${p0.x} ${p0.y}`,
              false,
              `[data-eco-link="${m.id}"]`,
            );
            m.children.forEach((c, ci) => {
              const p1 = childPos(mi, ci, m.children.length);
              gsap.set(el(`[data-eco-node="c|${m.id}|${c}"]`) ?? {}, {
                x: p0.x,
                y: p0.y,
                xPercent: -50,
                yPercent: -50,
                scale: 0.7,
                autoAlpha: 0,
              });
              setPath(
                `eco-twig-${m.id}-${ci}`,
                `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`,
                false,
                `[data-eco-twig="${m.id}|${c}"]`,
              );
            });
          });

          tl.to(el('[data-eco-layer]') ?? {}, { autoAlpha: 1, duration: 0.3 }, 'p4+=1.35');
          ecosystemModules.forEach((m, mi) => {
            tl.to(
              el(`[data-eco-node="m|${m.id}"]`) ?? {},
              { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.4)' },
              `p4+=${(1.45 + mi * 0.09).toFixed(2)}`,
            );
            tl.to(
              q(`[data-eco-link="${m.id}"]`),
              { strokeDashoffset: 0, opacity: 0.9, duration: 0.6 },
              `p4+=${(1.5 + mi * 0.09).toFixed(2)}`,
            );
          });
          const OPEN = 2.35;
          ecosystemModules.forEach((m, mi) => {
            m.children.forEach((c, ci) => {
              const p1 = childPos(mi, ci, m.children.length);
              const at = OPEN + ci * 0.07 + mi * 0.015;
              tl.to(
                el(`[data-eco-node="c|${m.id}|${c}"]`) ?? {},
                { x: p1.x, y: p1.y, scale: 1, autoAlpha: 1, duration: 0.75, ease: 'power3.out' },
                `p4+=${at.toFixed(3)}`,
              );
              tl.to(
                q(`[data-eco-twig="${m.id}|${c}"]`),
                { strokeDashoffset: 0, opacity: 0.8, duration: 0.5 },
                `p4+=${(at + 0.12).toFixed(3)}`,
              );
            });
          });
          tl.to({}, { duration: 0.7 });

          /* ---- Keeping it alive (time-driven, not scrubbed) ------------- */
          const orbit = el('[data-eco-orbit]');
          const lines = el('[data-eco-lines]');
          const origin = `${CC.x}px ${CC.y}px`;
          const DRIFT = 26;
          [orbit, lines].forEach((g) => {
            if (!g) return;
            gsap.set(g, { transformOrigin: origin, rotation: -1.8 });
            gsap.to(g, { rotation: 1.8, duration: DRIFT, repeat: -1, yoyo: true, ease: 'sine.inOut' });
          });
          (q('[data-eco-node]') as HTMLElement[]).forEach((n) => {
            gsap.set(n, { rotation: 1.8 });
            gsap.to(n, { rotation: -1.8, duration: DRIFT, repeat: -1, yoyo: true, ease: 'sine.inOut' });
          });
          (q('[data-eco-float]') as HTMLElement[]).forEach((f, i) =>
            gsap.to(f, {
              x: i % 2 ? 3 : -3,
              y: i % 3 ? -2.5 : 2.5,
              duration: 7 + (i % 5) * 1.1,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: i * 0.23,
            }),
          );
          ecosystemModules.forEach((m, mi) => {
            const path = q(`[data-eco-packet="${m.id}"]`)[0] as unknown as SVGPathElement | undefined;
            const src = q(`[data-eco-link="${m.id}"]`)[0] as unknown as SVGPathElement | undefined;
            if (!path || !src) return;
            const d = src.getAttribute('d');
            if (d) path.setAttribute('d', d);
            const plen = path.getTotalLength() || 1;
            gsap.set(path, { strokeDasharray: `14 ${plen}`, autoAlpha: 0 });
            const run = () => {
              gsap.fromTo(
                path,
                { strokeDashoffset: 14, autoAlpha: 1 },
                {
                  strokeDashoffset: -plen,
                  duration: 1.9,
                  ease: 'power1.inOut',
                  onComplete: () => {
                    gsap.set(path, { autoAlpha: 0 });
                    gsap.delayedCall(4.5 + mi * 1.4 + (mi % 3) * 2.1, run);
                  },
                },
              );
            };
            gsap.delayedCall(2.5 + mi * 1.7, run);
          });
        } else {
          const rows = q('[data-eco-row]') as HTMLElement[];
          const stackEl = el('[data-eco-stack]');
          const top = chromeH + 124;
          const avail = floorY - top;
          const stackH = stackEl?.getBoundingClientRect().height ?? 0;
          const fit = stackH > avail && stackH > 0 ? avail / stackH : 1;
          gsap.set(stackEl ?? {}, {
            y: top + Math.max(0, (avail - stackH * fit) / 2),
            scale: fit,
            transformOrigin: '50% 0%',
          });
          gsap.set(rows, { autoAlpha: 0, y: 16 });
          tl.to(el('[data-eco-layer]') ?? {}, { autoAlpha: 1, duration: 0.3 }, 'p4+=1.35');
          tl.to(
            el('[data-ws-logo]') ?? {},
            { x: curW / 2, y: chromeH + 46, scale: 0.62, duration: 0.7, ease: 'power2.inOut' },
            'p4+=1.45',
          );
          tl.to(
            rows,
            { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.08 },
            'p4+=1.95',
          );
          tl.to({}, { duration: 0.7 });
        }
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [reduced] },
  );

  useGSAP(
    () => {
      const t = setTimeout(() => ScrollTrigger.refresh(), 400);
      return () => clearTimeout(t);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div ref={root} className={styles.root}>
      <div ref={stage} aria-hidden className={styles.stage}>
        {/* ---- Workspace chrome ------------------------------------------- */}
        <div className={styles.fileChip}>
          <span className={styles.fileChipC}>c</span>
          <span className={styles.fileChipName}>{workspaceCopy.boardName}</span>
          <span className={styles.fileChipMeta}>· {workspaceCopy.meta}</span>
        </div>
        <div className={styles.collabRow}>
          <div className={styles.avatars}>
            {workspaceCopy.avatars.map((a, i) => (
              <span
                key={a}
                data-ws-avatar={i}
                className={cx(
                  styles.avatar,
                  i === 0 && styles.avatarMarker,
                  i === 1 && styles.avatarPop,
                  i === 2 && styles.avatarOk,
                )}
              >
                {a}
              </span>
            ))}
          </div>
          <span className={styles.chromeBtn}>
            <MessageSquare size={14} />
          </span>
          <span className={styles.chromeBtn}>
            <Play size={14} />
          </span>
          <span className={styles.shareBtn}>Share</span>
        </div>
        <div className={styles.toolbar}>
          {[MousePointer2, StickyNote, Type, Square, PenLine, Frame, Plus].map((Ico, i) => (
            <span key={i} className={cx(styles.tool, i === 1 && styles.toolOn)}>
              <Ico size={14} />
            </span>
          ))}
        </div>
        <div className={styles.zoom}>
          <Minus size={12} />
          <span>42%</span>
          <Plus size={12} />
        </div>

        {/* three collaborators, each working their own patch */}
        {workspaceCopy.cursors.map((name, i) => (
          <div key={name} data-ws-cursor={i} className={styles.cursor}>
            <MousePointer2
              size={16}
              className={cx(
                i === 0 && styles.cursorPrimary,
                i === 1 && styles.cursorPop,
                i === 2 && styles.cursorOk,
              )}
            />
            <span
              className={cx(
                styles.cursorTag,
                i === 0 && styles.cursorTagPrimary,
                i === 1 && styles.cursorTagPop,
                i === 2 && styles.cursorTagOk,
              )}
            >
              {name}
            </span>
          </div>
        ))}

        <div data-ws-comment style={{ opacity: 0 }} className={styles.comment}>
          <span className={styles.commentAvatar}>SM</span>
          {workspaceCopy.comment}
        </div>

        {/* ---- Camera layer ------------------------------------------------ */}
        <div ref={camera} className={styles.camera}>
          {(['pms', 'mid', 'cm'] as const).map((g) => (
            <div
              key={g}
              data-ws-frame={g}
              className={cx(styles.frame, g === 'mid' ? styles.frameMid : styles.frameSide)}
            />
          ))}

          <span data-ws-label="pms-title" className={styles.clusterTitle}>
            {workspaceCopy.clusters.pms}
          </span>
          <span data-ws-label="cm-title" className={styles.clusterTitle}>
            {workspaceCopy.clusters.cm}
          </span>

          <svg data-ws-svg preserveAspectRatio="none" className={styles.markerSvg} fill="none" aria-hidden>
            {[0, 1, 2].map((i) => (
              <path
                key={`oval-${i}`}
                data-ws-mark={`oval-${i}`}
                className={styles.strokePrimary}
                strokeWidth={2.2}
                strokeLinecap="round"
                style={{ opacity: 0 }}
              />
            ))}
            {['arrow-a', 'arrow-b'].map((id) => (
              <path
                key={id}
                data-ws-mark={id}
                className={styles.strokeInk}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0 }}
              />
            ))}
            {[0, 1, 2].map((i) => (
              <path
                key={`link-${i}`}
                data-ws-mark={`link-${i}`}
                className={styles.strokePrimary}
                strokeWidth={2}
                strokeLinecap="round"
                style={{ opacity: 0 }}
              />
            ))}
          </svg>

          {/* the research */}
          {workspaceNotes.map((n) => (
            <div
              key={n.id}
              data-ws-note={n.id}
              className={styles.note}
              style={{ backgroundColor: TONES[n.tone % TONES.length], color: INK, opacity: 0 }}
            >
              <span>{n.label}</span>
            </div>
          ))}

          <div data-ws-label="missing" className={styles.missing}>
            <span data-ws-missing-chip className={styles.missingChip}>
              {workspaceCopy.missingLayer}
            </span>
          </div>

          {workspaceAnnotations.map((a, i) => (
            <span key={a} data-ws-ann={i} className={styles.ann}>
              {a}
            </span>
          ))}

          <div data-ws-logo className={styles.wsLogo}>
            <div data-ws-logo-paper className={styles.wsLogoPaper} style={{ backgroundColor: TONES[5] }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-ws-logo-img
                src={clearhost.logo}
                alt=""
                width={128}
                height={128}
                className={styles.wsLogoImg}
                draggable={false}
              />
            </div>
          </div>

          <span data-ws-tagline className={styles.tagline}>
            <span data-ws-tagline-mark className={styles.taglineMark}>
              {workspaceCopy.finale}
            </span>
          </span>

          <EcoLayer />
        </div>
      </div>

      <p className="u-visually-hidden">{whiteboardCopy.summary}</p>
    </div>
  );
}

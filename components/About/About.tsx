'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { useIsomorphicLayoutEffect } from '@/lib/hooks/useIsomorphicLayoutEffect';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { ABOUT_LAYERS } from '@/lib/content/about';
import styles from './About.module.scss';

/**
 * A stack of warm colour panels, each with its own statement AND a few
 * illustrated stickers painted onto it. You ERASE the top panel — colour, text
 * and stickers together — to reveal the next panel underneath, then keep
 * erasing to go deeper. Loops after the last.
 *
 * The statement mixes two faces: Bricolage Grotesque for the body, Erica One
 * for the *highlighted* words (marked with `*asterisks*` in the source).
 *
 * Two stacked canvases: `top` (being erased) over `back` (the next panel).
 * Pointer / finger both scratch (a phone works like a scratch card); the brush
 * scales with the viewport. Reduced-motion: DOM panels cross-fade, no canvas.
 */

const RADIUS = 175; // brush at desktop widths; scaled down on small screens
const INK = '#2a1408';
const PALETTE = [
  '#ef6a37', // orange
  '#f2a63a', // amber
  '#e34f38', // coral
  '#d17742', // terracotta
  '#f0c04a', // gold
  '#c7402b', // brick red
];
const COVER_TARGET = 0.8;

const STICKER_SRCS = Array.from(
  new Set(ABOUT_LAYERS.flatMap((l) => l.stickers.map((s) => s.src))),
);

type Seg = { t: string; accent: boolean };
const parseSegs = (s: string): Seg[] =>
  s
    .split('*')
    .map((t, i) => ({ t, accent: i % 2 === 1 }))
    .filter((seg) => seg.t !== '');
const LAYER_SEGS = ABOUT_LAYERS.map((l) => parseSegs(l.text));

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
const mod = (n: number, m: number) => ((n % m) + m) % m;
const colorAt = (i: number) => PALETTE[mod(i, PALETTE.length)];
const layerAt = (i: number) => ABOUT_LAYERS[mod(i, ABOUT_LAYERS.length)];
const segsAt = (i: number) => LAYER_SEGS[mod(i, LAYER_SEGS.length)];
const stickersAt = (i: number) => layerAt(i).stickers;

export function About() {
  const topRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const [index, setIndex] = useState(0); // reduced-motion DOM text only

  useIsomorphicLayoutEffect(() => {
    if (!reduced) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % ABOUT_LAYERS.length),
      4200,
    );
    return () => window.clearInterval(id);
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    const top = topRef.current;
    const back = backRef.current;
    const stage = stageRef.current;
    if (!top || !back || !stage) return;
    const tctx = top.getContext('2d');
    const bctx = back.getContext('2d');
    if (!tctx || !bctx) return;

    let disposed = false;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let brush = RADIUS; // recomputed from the stage width in sizeCanvases()
    let coverTarget = COVER_TARGET; // lower on phones (smaller brush -> less scrubbing)
    let topIdx = 0;
    let phase: 'erasing' | 'completing' = 'erasing';
    let painted = false;
    let prev: { x: number; y: number } | null = null;
    let autoTween: gsap.core.Tween | null = null;

    let headingFont = 'sans-serif';
    let accentFont = 'sans-serif';
    try {
      const cs = getComputedStyle(document.documentElement);
      const h = cs.getPropertyValue('--font-heading').trim();
      const a = cs.getPropertyValue('--font-accent').trim();
      if (h) headingFont = h;
      if (a) accentFont = a;
    } catch {
      /* ignore */
    }

    // sticker images — loaded once; panels redraw when they arrive
    const stickerImages = new Map<string, HTMLImageElement>();

    // subtle paint grain, tiled over every panel
    const grain = document.createElement('canvas');
    grain.width = grain.height = 128;
    const gx = grain.getContext('2d');
    if (gx) {
      const g = gx.createImageData(128, 128);
      for (let p = 0; p < g.data.length; p += 4) {
        g.data[p] = g.data[p + 1] = g.data[p + 2] = 16;
        g.data[p + 3] = Math.random() < 0.35 ? 4 + Math.random() * 11 : 0;
      }
      gx.putImageData(g, 0, 0);
    }

    const sample = document.createElement('canvas');
    sample.width = 160;
    sample.height = 90;
    const sctx = sample.getContext('2d', { willReadFrequently: true })!;

    // centred, word-wrapped statement in two mixed faces
    const drawStatement = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      maxW: number,
      size: number,
      segs: Seg[],
    ) => {
      const fontFor = (accent: boolean) =>
        `${accent ? '400' : '600'} ${size}px ${accent ? accentFont : headingFont}`;

      type Tok = { s: string; accent: boolean; space: boolean };
      const toks: Tok[] = [];
      for (const seg of segs) {
        for (const piece of seg.t.split(/(\s+)/)) {
          if (!piece) continue;
          toks.push({
            s: piece,
            accent: seg.accent,
            space: /^\s+$/.test(piece),
          });
        }
      }
      const measure = (tk: Tok) => {
        ctx.font = fontFor(tk.accent);
        return ctx.measureText(tk.s).width;
      };

      const lines: Tok[][] = [];
      let line: Tok[] = [];
      let w = 0;
      for (const tk of toks) {
        const tw = measure(tk);
        if (!tk.space && w + tw > maxW && line.length) {
          while (line.length && line[line.length - 1].space) {
            w -= measure(line[line.length - 1]);
            line.pop();
          }
          lines.push(line);
          line = [];
          w = 0;
        }
        if (tk.space && line.length === 0) continue;
        line.push(tk);
        w += tw;
      }
      while (line.length && line[line.length - 1].space) line.pop();
      if (line.length) lines.push(line);

      const lh = size * 1.2;
      let y = cy - (lines.length * lh) / 2 + size * 0.74;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      for (const ln of lines) {
        const lineW = ln.reduce((acc, tk) => acc + measure(tk), 0);
        let x = cx - lineW / 2;
        for (const tk of ln) {
          const tw = measure(tk); // also sets ctx.font
          if (!tk.space) ctx.fillText(tk.s, x, y);
          x += tw;
        }
        y += lh;
      }
    };

    // draw a full opaque panel [colour + grain + stickers + statement]
    const drawPanel = (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      i: number,
    ) => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = colorAt(i);
      ctx.fillRect(0, 0, W, H);

      const pat = ctx.createPattern(grain, 'repeat');
      if (pat) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // stickers — flat cutouts, no shadow, drawn UNDER the text
      const base = Math.min(W, H);
      for (const s of stickersAt(i)) {
        const im = stickerImages.get(s.src);
        if (!im || !im.complete || !im.naturalWidth) continue;
        const sw = s.scale * base;
        const sh = sw * (im.naturalHeight / im.naturalWidth);
        ctx.save();
        ctx.translate(s.x * W, s.y * H);
        ctx.rotate((s.rot * Math.PI) / 180);
        ctx.drawImage(im, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();
      }

      // statement on top — one size per breakpoint (based on CSS px, not the
      // device buffer), wider column on narrow screens
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = INK;
      const cssW = W / dpr;
      const cssH = H / dpr;
      const size = dpr * Math.max(24, Math.min(cssH * 0.12, 24 + cssW * 0.033));
      const maxW = W * (cssW < 620 ? 0.9 : 0.78);
      drawStatement(ctx, W / 2, H / 2, maxW, size, segsAt(i));
    };

    const sizeCanvases = () => {
      const r = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // finger-sized on phones, full brush on desktop
      brush = Math.min(RADIUS, Math.max(52, r.width * 0.14));
      coverTarget = r.width < 640 ? 0.6 : r.width < 1024 ? 0.72 : COVER_TARGET;
      for (const c of [top, back]) {
        c.width = Math.max(1, Math.round(r.width * dpr));
        c.height = Math.max(1, Math.round(r.height * dpr));
        c.style.width = `${r.width}px`;
        c.style.height = `${r.height}px`;
      }
      drawPanel(bctx, back, topIdx + 1);
      drawPanel(tctx, top, topIdx);
      tctx.globalCompositeOperation = 'destination-out';
      prev = null;
      painted = false;
    };

    const stamp = (x: number, y: number, rad: number) => {
      tctx.beginPath();
      tctx.arc(x * dpr, y * dpr, rad * dpr, 0, Math.PI * 2);
      tctx.fill(); // destination-out -> erases colour + stickers + text together
    };
    const eraseTo = (x: number, y: number, rad = brush) => {
      if (prev) {
        for (let i = 1; i <= 10; i++) {
          stamp(lerp(prev.x, x, 0.1 * i), lerp(prev.y, y, 0.1 * i), rad);
        }
      }
      stamp(x, y, rad);
      prev = { x, y };
      painted = true;
    };

    const coverage = () => {
      sctx.clearRect(0, 0, 160, 90);
      sctx.drawImage(top, 0, 0, 160, 90);
      const d = sctx.getImageData(0, 0, 160, 90).data;
      let clear = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] < 8) clear++;
      return clear / (160 * 90);
    };

    // one-time anticipation: the first time this section scrolls into view,
    // auto-scratch a zig-zag from the top-left corner so it's obvious the panel
    // can be erased. Uses a thinner brush and stops the moment the visitor
    // grabs the real one.
    let hintDone = false;
    const zigZagHint = () => {
      if (disposed || hintDone || phase !== 'erasing') return;
      hintDone = true;
      const r = stage.getBoundingClientRect();
      // wide side-to-side sweeps — teaches a horizontal scratch (vertical
      // drags are left for the page scroll)
      const P: Array<[number, number]> = [
        [r.width * 0.06, r.height * 0.16],
        [r.width * 0.52, r.height * 0.12],
        [r.width * 0.12, r.height * 0.26],
        [r.width * 0.64, r.height * 0.22],
        [r.width * 0.2, r.height * 0.36],
        [r.width * 0.72, r.height * 0.3],
      ];
      prev = { x: P[0][0], y: P[0][1] };
      autoTween = gsap.to(
        { t: 0 },
        {
          t: 1,
          duration: 1.05,
          ease: 'power1.inOut',
          onUpdate() {
            const t = (this.targets()[0] as { t: number }).t;
            const seg = t * (P.length - 1);
            const i = Math.min(P.length - 2, Math.floor(seg));
            const f = seg - i;
            eraseTo(
              lerp(P[i][0], P[i + 1][0], f),
              lerp(P[i][1], P[i + 1][1], f),
              brush * 0.55,
            );
          },
        },
      );
    };

    // stack shifts down one — invisible: `top` becomes a pixel copy of `back`
    const restack = () => {
      topIdx = mod(topIdx + 1, ABOUT_LAYERS.length);
      tctx.globalCompositeOperation = 'source-over';
      tctx.globalAlpha = 1;
      tctx.clearRect(0, 0, top.width, top.height);
      tctx.drawImage(back, 0, 0);
      tctx.globalCompositeOperation = 'destination-out';
      drawPanel(bctx, back, topIdx + 1);
      prev = null;
      painted = false;
      phase = 'erasing';
      autoTween?.kill();
      autoTween = null;
    };

    // most of the panel is erased — dissolve the rest away, then restack
    const completeErase = () => {
      if (phase !== 'erasing') return;
      phase = 'completing';
      autoTween?.kill();
      const r = stage.getBoundingClientRect();
      const cx = (prev?.x ?? r.width / 2) * dpr;
      const cy = (prev?.y ?? r.height / 2) * dpr;
      const maxR = Math.hypot(top.width, top.height);
      autoTween = gsap.to(
        { rr: brush * dpr },
        {
          rr: maxR,
          duration: 0.3,
          ease: 'power2.in',
          onUpdate() {
            const rr = (this.targets()[0] as { rr: number }).rr;
            tctx.beginPath();
            tctx.arc(cx, cy, rr, 0, Math.PI * 2);
            tctx.fill();
          },
          onComplete: restack,
        },
      );
    };

    // touch gesture disambiguation: a finger drag either SCRATCHES this panel
    // or SCROLLS the page — never both. The first ~12px of travel decides:
    // mostly-horizontal => scratch, mostly-vertical => leave it to the scroll
    // (touch-action: pan-y). A mouse still erases on any move (wheel scrolls
    // independently, so there's nothing to fight).
    let gDown = false;
    let gDecided = false;
    let gErase = false;
    let gsx = 0;
    let gsy = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (phase !== 'erasing' || e.pointerType === 'mouse') return;
      gDown = true;
      gDecided = false;
      gErase = false;
      gsx = e.clientX;
      gsy = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (phase !== 'erasing') return;

      if (e.pointerType !== 'mouse') {
        if (!gDown) return;
        if (!gDecided) {
          const dx = e.clientX - gsx;
          const dy = e.clientY - gsy;
          if (Math.hypot(dx, dy) < 12) return;
          gDecided = true;
          gErase = Math.abs(dx) >= Math.abs(dy);
        }
        if (!gErase) return; // vertical swipe — that's a scroll, not a scratch
      }

      hintDone = true; // the visitor is erasing — no zig-zag hint needed
      if (autoTween) {
        autoTween.kill();
        autoTween = null;
      }
      const r = top.getBoundingClientRect();
      eraseTo(e.clientX - r.left, e.clientY - r.top);
    };
    const onPointerEnd = () => {
      prev = null;
      gDown = false;
      gDecided = false;
      gErase = false;
    };

    const check = () => {
      if (phase === 'erasing' && painted && coverage() >= coverTarget) {
        completeErase();
      }
    };
    const checkId = window.setInterval(check, 240);

    const ro = new ResizeObserver(() => sizeCanvases());
    ro.observe(stage);

    let hintTimer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          io.disconnect();
          hintTimer = window.setTimeout(zigZagHint, 350);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(stage);

    sizeCanvases();

    // load the sticker artwork, then redraw the panels (unless already erasing)
    let pending = STICKER_SRCS.length;
    const onImg = () => {
      pending -= 1;
      if (pending <= 0 && !disposed && !painted && phase === 'erasing') {
        sizeCanvases();
      }
    };
    STICKER_SRCS.forEach((src) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = onImg;
      im.onerror = onImg;
      im.src = src;
      stickerImages.set(src, im);
    });

    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (!disposed && !painted && phase === 'erasing') sizeCanvases();
        })
        .catch(() => {});
    }

    // one handler for mouse and finger: a mouse erases on move, a finger
    // erases while dragging (scratch card). pan-y on .stage keeps the page
    // scrollable through it.
    stage.addEventListener('pointerdown', onPointerDown, { passive: true });
    stage.addEventListener('pointermove', onPointerMove, { passive: true });
    stage.addEventListener('pointerleave', onPointerEnd, { passive: true });
    stage.addEventListener('pointerup', onPointerEnd, { passive: true });
    stage.addEventListener('pointercancel', onPointerEnd, { passive: true });

    return () => {
      disposed = true;
      window.clearInterval(checkId);
      window.clearTimeout(hintTimer);
      autoTween?.kill();
      ro.disconnect();
      io.disconnect();
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerleave', onPointerEnd);
      stage.removeEventListener('pointerup', onPointerEnd);
      stage.removeEventListener('pointercancel', onPointerEnd);
    };
  }, [reduced]);

  const stageStyle = reduced
    ? undefined
    : ({
        '--about-bg': PALETTE[index % PALETTE.length],
        '--about-ink': INK,
      } as CSSProperties);

  return (
    <section className={styles.section} aria-label="About">
      <div
        ref={stageRef}
        className={styles.stage}
        style={stageStyle}
        data-cursor={reduced ? undefined : 'paint'}
      >
        <ul className={styles.texts}>
          {ABOUT_LAYERS.map((l, i) => (
            <li
              key={i}
              className={styles.text}
              data-active={i === index || undefined}
            >
              {l.text.split('*').map((part, k) => (
                <span key={k} className={k % 2 ? styles.accent : undefined}>
                  {part}
                </span>
              ))}
            </li>
          ))}
        </ul>
        {!reduced && (
          <canvas ref={backRef} className={styles.canvasBack} aria-hidden />
        )}
        {!reduced && (
          <canvas ref={topRef} className={styles.canvasTop} aria-hidden />
        )}
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { getLenisInstance } from '@/lib/smooth-scroll';
import { WORK } from '@/lib/content/work';
import styles from './SelectedWork.module.scss';

/**
 * All three work cards on ONE WebGL context: a single canvas over the whole
 * `.canvas` composition, one plane per card, one shared spring, one draw pass.
 * Replaces three separate ogl contexts (each with its own rAF + spring).
 *
 * Each plane is a unit quad placed over its slot with `uScale` / `uOffset`
 * (NDC). The bow is a vertex displacement in unit space, so scaling by
 * `uScale` makes it proportional to each card automatically — one shared
 * `uAmp` bows all three:
 *
 *   p.y += A · MAX  (unit),  scaled by uScale.y = 2·cardH/glH  ->  px bow ≈ A·MAX·cardH
 *
 * The spring turns scroll velocity into A (−1..1). Tuning knobs:
 *   VEL_DIV  lower  = a gentle scroll already reaches a full bow
 *   STIFF    higher = A tracks the target faster (snappier pop)
 *   MAX      the bow's ceiling, as a fraction of each card's height
 *
 * Robustness: images load individually — a card whose image fails or taints is
 * simply skipped (its DOM card shows through). The layer only bails entirely
 * (onFail -> all DOM cards) when WebGL itself is unavailable.
 */
const MAX = 0.15; // unit-space bow amplitude (≈ 15% of card height at full tilt)
const VEL_DIV = 14; // scroll velocity (px/frame) that maps to a full bow
const STIFF = 0.12;
const DAMP = 0.86; // higher -> the jelly rings a little longer after you stop

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  uniform float uAmp;
  uniform vec2 uScale;
  uniform vec2 uOffset;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position; // unit plane: x,y in [-0.5, 0.5]
    float s = uAmp >= 0.0 ? 1.0 : -1.0;
    float f = 0.5 + s * (uv.y - 0.5);           // 0 trailing edge, 1 leading
    p.y += sin(uv.x * 3.14159265359) * f * uAmp;
    gl_Position = vec4(p.xy * uScale + uOffset, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vUv;
  void main() { gl_FragColor = texture2D(uTexture, vUv); }
`;

function fontStack(varName: string): string {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return v || 'sans-serif';
}

type Props = {
  /** the `.canvas` composition box */
  boxRef: RefObject<HTMLDivElement>;
  /** called only if WebGL can't run at all — SelectedWork drops the layer */
  onFail: () => void;
};

export function WorkGLLayer({ boxRef, onFail }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const box = boxRef.current;
    if (!canvasEl || !box) return;

    let disposed = false;
    let cleanup = () => {};

    const boot = async () => {
      try {
        const probe = document.createElement('canvas');
        if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
          onFail();
          return;
        }
      } catch {
        onFail();
        return;
      }

      let ogl: typeof import('ogl');
      try {
        ogl = await import('ogl');
      } catch {
        onFail();
        return;
      }
      if (disposed) return;

      const { Renderer, Program, Mesh, Plane, Texture, Transform } = ogl;

      // --- load each card image on its own; a failure just skips that card ---
      const loaded = await Promise.all(
        WORK.map(async (w) => {
          const im = new Image();
          im.crossOrigin = 'anonymous';
          im.decoding = 'async';
          im.src = w.src;
          // decode() settles once the load is final (ok or failed); by then
          // naturalWidth tells us which — no need to also wait on events, and
          // waiting on onload/onerror here can deadlock if they already fired.
          try {
            await im.decode();
          } catch {
            /* fall through to the naturalWidth check */
          }
          return { w, im, ok: im.naturalWidth > 0 };
        }),
      );
      if (disposed) return;

      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (disposed) return;

      const headingFont = fontStack('--font-heading');
      const uiFont = fontStack('--font-sans');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const renderer = new Renderer({
        canvas: canvasEl,
        alpha: true,
        antialias: true,
        dpr,
      });
      const gl = renderer.gl;
      const loseCtx = () =>
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      const scene = new Transform();

      // shared 1×1 scratch for the cross-origin taint probe
      const probe2d = document.createElement('canvas');
      probe2d.width = probe2d.height = 1;
      const pctx = probe2d.getContext('2d');

      type Card = {
        slot: string;
        program: InstanceType<typeof Program>;
        texture: InstanceType<typeof Texture>;
        bake: HTMLCanvasElement;
        bctx: CanvasRenderingContext2D;
        img: HTMLImageElement;
        w: (typeof WORK)[number];
      };
      const cards: Card[] = [];

      for (const { w, im, ok } of loaded) {
        if (!ok || !pctx) continue;
        // cross-origin taint? -> leave this slot to its DOM card
        try {
          pctx.clearRect(0, 0, 1, 1);
          pctx.drawImage(im, 0, 0, 1, 1);
          pctx.getImageData(0, 0, 1, 1);
        } catch {
          continue;
        }

        const bake = document.createElement('canvas');
        const bctx = bake.getContext('2d');
        if (!bctx) continue;

        const texture = new Texture(gl, {
          generateMipmaps: false,
          minFilter: gl.LINEAR,
          magFilter: gl.LINEAR,
          flipY: true,
        });
        const program = new Program(gl, {
          vertex,
          fragment,
          uniforms: {
            uTexture: { value: texture },
            uAmp: { value: 0 },
            uScale: { value: [1, 1] },
            uOffset: { value: [0, 0] },
          },
        });
        const geometry = new Plane(gl, {
          width: 1,
          height: 1,
          widthSegments: 40,
          heightSegments: 40,
        });
        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);
        cards.push({ slot: w.slot, program, texture, bake, bctx, img: im, w });
      }

      // no card survived -> hand the whole section back to the DOM
      if (!cards.length) {
        loseCtx();
        onFail();
        return;
      }

      // bake one card's picture + scrim + hairline + text at slot pixel size
      const paint = (c: Card, W: number, H: number) => {
        const { bake, bctx, img, w } = c;
        bake.width = W;
        bake.height = H;
        bctx.clearRect(0, 0, W, H);

        const ir = img.naturalWidth / img.naturalHeight;
        const cr = W / H;
        let dw: number;
        let dh: number;
        if (cr > ir) {
          dw = W;
          dh = W / ir;
        } else {
          dh = H;
          dw = H * ir;
        }
        bctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);

        const g = bctx.createLinearGradient(0, H, 0, H * 0.45);
        g.addColorStop(0, 'rgba(8, 7, 6, 0.82)');
        g.addColorStop(1, 'rgba(8, 7, 6, 0)');
        bctx.fillStyle = g;
        bctx.fillRect(0, 0, W, H);

        bctx.strokeStyle = 'rgba(244, 240, 233, 0.26)';
        bctx.lineWidth = Math.max(1, Math.round(H * 0.004));
        bctx.strokeRect(1, 1, W - 2, H - 2);

        const pad = Math.round(W * 0.055);
        bctx.textBaseline = 'alphabetic';

        bctx.fillStyle = '#ff4d1a';
        bctx.font = `600 ${Math.round(H * 0.031)}px ${uiFont}`;
        bctx.fillText(w.index, pad, H - pad - Math.round(H * 0.145));

        bctx.fillStyle = '#f4f0e9';
        bctx.font = `600 ${Math.round(H * 0.082)}px ${headingFont}`;
        bctx.fillText(w.title, pad, H - pad - Math.round(H * 0.05));

        bctx.fillStyle = 'rgba(244, 240, 233, 0.72)';
        bctx.font = `400 ${Math.round(H * 0.028)}px ${uiFont}`;
        bctx.fillText(`${w.discipline} · ${w.year}`, pad, H - pad);
      };

      const layout = () => {
        const lr = canvasEl.getBoundingClientRect();
        if (!lr.width || !lr.height) return;
        renderer.setSize(lr.width, lr.height);

        for (const c of cards) {
          const slot = box.querySelector<HTMLElement>(
            `[data-slot="${c.slot}"]`,
          );
          if (!slot) continue;
          const s = slot.getBoundingClientRect();
          if (!s.width || !s.height) continue;
          const sx = s.left - lr.left;
          const sy = s.top - lr.top;

          c.program.uniforms.uScale.value = [
            (s.width / lr.width) * 2,
            (s.height / lr.height) * 2,
          ];
          c.program.uniforms.uOffset.value = [
            ((sx + s.width / 2) / lr.width) * 2 - 1,
            1 - ((sy + s.height / 2) / lr.height) * 2,
          ];
          paint(c, Math.round(s.width * dpr), Math.round(s.height * dpr));
          c.texture.image = c.bake;
          c.texture.needsUpdate = true;
        }
        renderer.render({ scene });
      };
      const ro = new ResizeObserver(layout);
      ro.observe(box);
      layout();
      setReady(true);

      // --- one spring, shared across the cards ---
      let last = window.scrollY;
      let amp = 0;
      let vel = 0;
      let idle = 0;

      const update = () => {
        const lenis = getLenisInstance() as { velocity?: number } | null;
        // lenis.velocity is a per-frame pixel delta in this version; the raw
        // scrollY delta is the same unit and the fallback when it reads 0.
        let raw = window.scrollY - last;
        last = window.scrollY;
        if (lenis && typeof lenis.velocity === 'number' && lenis.velocity !== 0) {
          raw = lenis.velocity;
        }

        const target = Math.max(-1, Math.min(1, raw / VEL_DIV));
        vel += (target - amp) * STIFF;
        vel *= DAMP;
        amp += vel;

        // keep drawing until the jelly has visibly settled, then park flat
        const moving = Math.abs(vel) > 0.0015 || Math.abs(amp) > 0.0015;
        if (moving) {
          idle = 0;
        } else {
          idle += 1;
          if (idle > 3) {
            for (const c of cards) c.program.uniforms.uAmp.value = 0;
            renderer.render({ scene });
            return;
          }
        }

        const a = amp * MAX;
        for (const c of cards) c.program.uniforms.uAmp.value = a;
        renderer.render({ scene });
      };

      let ticking = false;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !ticking) {
            gsap.ticker.add(update);
            ticking = true;
          } else if (!entry.isIntersecting && ticking) {
            gsap.ticker.remove(update);
            ticking = false;
          }
        },
        { rootMargin: '200px 0px' },
      );
      io.observe(box);

      cleanup = () => {
        if (ticking) gsap.ticker.remove(update);
        io.disconnect();
        ro.disconnect();
        loseCtx();
      };
    };

    void boot();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [boxRef, onFail]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.glLayer}
      data-ready={ready || undefined}
      aria-hidden
    />
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { getLenisInstance } from '@/lib/smooth-scroll';
import styles from './WorkCard.module.scss';

type Props = {
  index: string;
  title: string;
  discipline: string;
  year: string;
  src: string;
  /** called if WebGL can't run — parent renders the DOM fallback instead */
  onFail: () => void;
};

/**
 * A single work card rendered on a WebGL plane so the whole card — picture,
 * scrim, index / title / meta (all baked into the texture) — can deform.
 *
 * The plane is exactly the card box, sitting inside a taller (OVERSCAN) canvas
 * that its parent (.outer) does not clip. Vertex displacement STRETCHES it
 * toward whichever edge is leading:
 *
 *   f(v) = 0.5 + sign(amp)·(v - 0.5)   -> 0 at the trailing edge, 1 at leading
 *   p.y += sin(u·π) · f(v) · amp
 *
 *   scroll down (amp>0): bottom edge PINNED (no gap), top edge bows OUT (unclipped)
 *   scroll up   (amp<0): top edge PINNED, bottom edge bows OUT
 * Left/right edges stay put (sin(u·π) = 0 there). Springs back to flat at rest.
 */

const OVERSCAN = 1.25; // canvas height / card box height (room for the bow-out)
const DPR_CAP = 1.5; // plenty for a baked photo + text; ~44% fewer pixels than 2

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  uniform float uAmp;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float s = uAmp >= 0.0 ? 1.0 : -1.0;
    float f = 0.5 + s * (uv.y - 0.5);          // 0 trailing edge, 1 leading edge
    p.y += sin(uv.x * 3.14159265359) * f * uAmp;
    gl_Position = vec4(p.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(uTexture, vUv);
  }
`;

function fontStack(varName: string): string {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return v || 'sans-serif';
}

export function WorkCardGL({
  index,
  title,
  discipline,
  year,
  src,
  onFail,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

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

      const { Renderer, Program, Mesh, Plane, Texture } = ogl;

      // --- load image + fonts, then bake the card to an offscreen canvas ---
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.src = src;
      try {
        await image.decode();
      } catch {
        await new Promise<void>((res) => {
          image.onload = () => res();
          image.onerror = () => res();
        });
      }
      if (disposed) return;
      if (!image.naturalWidth) {
        onFail();
        return;
      }
      // a cross-origin image that didn't grant CORS would taint the bake canvas
      // and make texImage2D throw — detect it now and use the DOM fallback.
      try {
        const probe = document.createElement('canvas');
        probe.width = 1;
        probe.height = 1;
        const pctx = probe.getContext('2d')!;
        pctx.drawImage(image, 0, 0, 1, 1);
        pctx.getImageData(0, 0, 1, 1);
      } catch {
        onFail();
        return;
      }
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (disposed) return;

      const headingFont = fontStack('--font-heading');
      const uiFont = fontStack('--font-sans');

      const bake = document.createElement('canvas');
      const bctx = bake.getContext('2d');
      if (!bctx) {
        onFail();
        return;
      }

      // bake the card at EXACT box size (W x H); the plane is box-sized inside
      // the taller canvas, so the overscan stays empty until the bow reaches it
      const paint = (W: number, H: number) => {
        bake.width = W;
        bake.height = H;
        bctx.clearRect(0, 0, W, H);

        // cover-fit image
        const ir = image.naturalWidth / image.naturalHeight;
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
        bctx.drawImage(image, (W - dw) / 2, (H - dh) / 2, dw, dh);

        // bottom scrim
        const g = bctx.createLinearGradient(0, H, 0, H * 0.45);
        g.addColorStop(0, 'rgba(8, 7, 6, 0.82)');
        g.addColorStop(1, 'rgba(8, 7, 6, 0)');
        bctx.fillStyle = g;
        bctx.fillRect(0, 0, W, H);

        // inset hairline
        bctx.strokeStyle = 'rgba(244, 240, 233, 0.26)';
        bctx.lineWidth = Math.max(1, Math.round(H * 0.004));
        bctx.strokeRect(1, 1, W - 2, H - 2);

        // text block
        const pad = Math.round(W * 0.055);
        bctx.textBaseline = 'alphabetic';

        bctx.fillStyle = '#ff4d1a';
        bctx.font = `600 ${Math.round(H * 0.031)}px ${uiFont}`;
        bctx.fillText(index, pad, H - pad - Math.round(H * 0.145));

        bctx.fillStyle = '#f4f0e9';
        bctx.font = `600 ${Math.round(H * 0.082)}px ${headingFont}`;
        bctx.fillText(title, pad, H - pad - Math.round(H * 0.05));

        bctx.fillStyle = 'rgba(244, 240, 233, 0.72)';
        bctx.font = `400 ${Math.round(H * 0.028)}px ${uiFont}`;
        bctx.fillText(`${discipline} · ${year}`, pad, H - pad);
      };

      // --- renderer / mesh ---
      const renderer = new Renderer({
        canvas,
        alpha: true, // overscan zones stay transparent until the bow reaches them
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, DPR_CAP),
      });
      const gl = renderer.gl;
      const loseCtx = () =>
        gl.getExtension('WEBGL_lose_context')?.loseContext();

      // plane == card box; canvas is OVERSCAN taller, so the leading edge has
      // room to bow out without being clipped
      // the bow is a half-sine across x and linear in y — 18x12 resolves both
      // smoothly (40x40 was ~7x the vertices for no visible gain)
      const geometry = new Plane(gl, {
        width: 2,
        height: 2 / OVERSCAN,
        widthSegments: 18,
        heightSegments: 12,
      });
      const texture = new Texture(gl, {
        generateMipmaps: false,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
        flipY: true,
      });
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: { uTexture: { value: texture }, uAmp: { value: 0 } },
      });
      const mesh = new Mesh(gl, { geometry, program });

      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const resize = () => {
        const rect = wrap.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        renderer.setSize(rect.width, rect.height * OVERSCAN); // canvas taller
        paint(Math.round(rect.width * dpr), Math.round(rect.height * dpr)); // box
        texture.image = bake;
        texture.needsUpdate = true;
        renderer.render({ scene: mesh });
      };
      const ro = new ResizeObserver(resize);
      ro.observe(wrap);
      resize();
      setReady(true);

      // --- spring-driven amp from scroll velocity ---
      let last = window.scrollY;
      let amp = 0;
      let vel = 0;
      let idle = 0;
      const STIFF = 0.07;
      const DAMP = 0.84; // higher -> the jelly rings longer after you stop
      const MAX = 0.07; // NDC — bow amplitude

      const update = () => {
        const lenis = getLenisInstance() as { velocity?: number } | null;
        let raw: number;
        if (lenis && typeof lenis.velocity === 'number') {
          raw = lenis.velocity;
        } else {
          raw = window.scrollY - last;
          last = window.scrollY;
        }
        // Lenis .velocity is small (~tens), not px/s — divide by ~40, not ~1000
        const target = Math.max(-1, Math.min(1, raw / 42));
        vel += (target - amp) * STIFF;
        vel *= DAMP;
        amp += vel;

        if (Math.abs(amp) < 0.0006 && Math.abs(vel) < 0.0006) {
          idle += 1;
          if (idle > 1) {
            program.uniforms.uAmp.value = 0;
            return;
          }
        } else {
          idle = 0;
        }
        program.uniforms.uAmp.value = amp * MAX;
        renderer.render({ scene: mesh });
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
      io.observe(wrap);

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
  }, [src, index, title, discipline, year, onFail]);

  return (
    <div ref={wrapRef} className={styles.glWrap} aria-hidden>
      <canvas
        ref={canvasRef}
        className={styles.glCanvas}
        data-ready={ready || undefined}
      />
    </div>
  );
}

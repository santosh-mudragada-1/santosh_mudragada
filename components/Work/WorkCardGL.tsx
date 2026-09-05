'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Mesh as OglMesh, Renderer as OglRenderer, Texture as OglTexture } from 'ogl';
import { gsap } from '@/lib/gsap/gsap';
import { getLenisInstance } from '@/lib/smooth-scroll';
import type { SceneAssets, SceneConfig } from './graphics/canvasScene';
import styles from './WorkCard.module.scss';

type Props = {
  index: string;
  title: string;
  discipline: string;
  year: string;
  /** A photo to bake + bow (the default). Ignored when `scene` is set. */
  src?: string;
  /** A bespoke canvas-2D "scene" to bake + bow instead of a photo — its
   *  hover state is driven by `setProgress` on the imperative handle. */
  scene?: SceneConfig;
  /** called if WebGL can't run — parent renders the DOM fallback instead */
  onFail: () => void;
  /** WebKit runs 3 of these at once — render a touch lighter there */
  webkit?: boolean;
};

export type WorkCardGLHandle = {
  /** 0 = rest state, 1 = fully "hovered" — repaints and re-uploads the bake
   *  immediately. No-op before boot finishes or outside scene mode. */
  setProgress: (p: number) => void;
};

/**
 * A single work card rendered on a WebGL plane so the whole card — picture
 * (or bespoke scene art), scrim, index / title / meta (all baked into the
 * texture) — can deform.
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

const OVERSCAN = 1.35; // canvas height / card box height (room for the bow-out)
const DPR_CAP = 1.5; // plenty for a baked photo + text; ~44% fewer pixels than 2
const WEBKIT_DPR_CAP = 1.3; // WebKit does 3 contexts at once — trim it there

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

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.decoding = 'async';
  img.src = src;
  return img
    .decode()
    .then(() => img)
    .catch(
      () =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`failed to load ${src}`));
        }),
    );
}

export const WorkCardGL = forwardRef<WorkCardGLHandle, Props>(function WorkCardGL(
  { index, title, discipline, year, src, scene, onFail, webkit = false },
  handleRef,
) {
  const dprCap = webkit ? WEBKIT_DPR_CAP : DPR_CAP;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const progressRef = useRef(0);
  const paintRef = useRef<((w: number, h: number) => void) | null>(null);
  const lastSizeRef = useRef({ w: 0, h: 0 });
  const glRef = useRef<{ texture: OglTexture; renderer: OglRenderer; mesh: OglMesh } | null>(null);

  useImperativeHandle(
    handleRef,
    () => ({
      setProgress(p: number) {
        progressRef.current = p;
        const st = glRef.current;
        const paint = paintRef.current;
        const { w, h } = lastSizeRef.current;
        if (!st || !paint || !w || !h) return;
        paint(w, h);
        st.texture.needsUpdate = true;
        st.renderer.render({ scene: st.mesh });
      },
    }),
    [],
  );

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

      // --- load either a photo to bake, or a scene's assets ---
      let image: HTMLImageElement | null = null;
      let sceneAssets: SceneAssets = {};

      if (scene) {
        try {
          const names = Object.keys(scene.assets ?? {});
          const loaded = await Promise.all(names.map((name) => loadImage(scene.assets![name])));
          sceneAssets = Object.fromEntries(names.map((name, i) => [name, loaded[i]]));
        } catch {
          onFail();
          return;
        }
      } else {
        if (!src) {
          onFail();
          return;
        }
        try {
          image = await loadImage(src);
        } catch {
          onFail();
          return;
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
      }
      if (disposed) return;

      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
      if (disposed) return;

      const headingFont = fontStack('--font-heading');
      const uiFont = fontStack('--font-sans');
      const accentFont = fontStack('--font-accent');

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

        if (scene) {
          scene.draw(bctx, W, H, progressRef.current, { headingFont, uiFont, accentFont, assets: sceneAssets });
        } else if (image) {
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
        }

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
      paintRef.current = paint;

      // --- renderer / mesh ---
      const renderer = new Renderer({
        canvas,
        alpha: true, // overscan zones stay transparent until the bow reaches them
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, dprCap),
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
        widthSegments: webkit ? 14 : 18,
        heightSegments: webkit ? 10 : 12,
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
      glRef.current = { texture, renderer, mesh };

      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const resize = () => {
        const rect = wrap.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        renderer.setSize(rect.width, rect.height * OVERSCAN); // canvas taller
        const W = Math.round(rect.width * dpr);
        const H = Math.round(rect.height * dpr);
        lastSizeRef.current = { w: W, h: H };
        paint(W, H); // box
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
      const STIFF = 0.085; // higher -> amp tracks the target faster (snappier)
      const DAMP = 0.84; // higher -> the jelly rings longer after you stop
      const MAX = 0.12; // NDC — bow amplitude (clears the 0.26 overscan headroom)

      const update = () => {
        const lenis = getLenisInstance() as { velocity?: number } | null;
        let raw: number;
        if (lenis && typeof lenis.velocity === 'number') {
          raw = lenis.velocity;
        } else {
          raw = window.scrollY - last;
          last = window.scrollY;
        }
        // Lenis .velocity is small (~tens), not px/s — divide by ~30, not ~1000
        const target = Math.max(-1, Math.min(1, raw / 30));
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
        glRef.current = null;
        paintRef.current = null;
      };
    };

    void boot();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [src, scene, index, title, discipline, year, onFail, webkit, dprCap]);

  return (
    <div ref={wrapRef} className={styles.glWrap} aria-hidden>
      <canvas
        ref={canvasRef}
        className={styles.glCanvas}
        data-ready={ready || undefined}
      />
    </div>
  );
});

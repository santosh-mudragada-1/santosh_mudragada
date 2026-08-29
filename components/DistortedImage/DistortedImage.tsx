'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap/gsap';
import { getLenisInstance } from '@/lib/smooth-scroll';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { fragment, vertex } from './shaders';
import styles from './DistortedImage.module.scss';

type DistortedImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Overall strength multiplier for the effect (0 disables distortion). */
  intensity?: number;
  /**
   * Multiplier on the scroll-velocity edge-bow term. ~0.9 on Work cards (the
   * primary effect there), lower elsewhere.
   */
  velocityResponse?: number;
  /** CSS aspect-ratio, e.g. "4 / 5". Omit if the parent sets height. */
  ratio?: string;
  priority?: boolean;
};

/**
 * Reusable distorted-image surface.
 *
 * WebGL (ogl) path: a fullscreen-triangle displacement shader whose amplitude
 * tracks smoothed scroll velocity + pointer hover. Rendered from the app's
 * single `gsap.ticker` rAF, only while on screen (IntersectionObserver). No
 * React state changes per frame — uniforms are mutated directly.
 *
 * Fallback path (touch, reduced-motion, no WebGL, decode failure): the plain
 * `<img>`, no animation. The `<img>` is always in the DOM for a11y / SEO.
 */
export function DistortedImage({
  src,
  alt,
  className,
  intensity = 1,
  velocityResponse = 1,
  ratio,
  priority,
}: DistortedImageProps) {
  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [glReady, setGlReady] = useState(false);
  const [glFailed, setGlFailed] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => setMounted(true), []);

  const useGL = mounted && !isTouch && !reduced && !glFailed;

  useEffect(() => {
    if (!useGL) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let disposed = false;
    let cleanup = () => {};

    const boot = async () => {
      try {
        const probe = document.createElement('canvas');
        const ctx =
          probe.getContext('webgl2') || probe.getContext('webgl');
        if (!ctx) {
          setGlFailed(true);
          return;
        }
      } catch {
        setGlFailed(true);
        return;
      }

      let ogl: typeof import('ogl');
      try {
        ogl = await import('ogl');
      } catch {
        setGlFailed(true);
        return;
      }
      if (disposed) return;

      const { Renderer, Program, Mesh, Triangle, Texture } = ogl;

      const renderer = new Renderer({
        canvas,
        alpha: false,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      const gl = renderer.gl;
      const loseCtx = () =>
        gl.getExtension('WEBGL_lose_context')?.loseContext();

      const geometry = new Triangle(gl);
      const texture = new Texture(gl, {
        generateMipmaps: false,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
      });
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTexture: { value: texture },
          uCanvasSize: { value: [1, 1] },
          uImageSize: { value: [1, 1] },
          uVelocity: { value: 0 },
          uVelocityResponse: { value: velocityResponse },
          uMouse: { value: [0.5, 0.5] },
          uHover: { value: 0 },
          uIntensity: { value: intensity },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      // --- texture load ---
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.src = src;
      try {
        await image.decode();
      } catch {
        await new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      }
      if (disposed) {
        loseCtx();
        return;
      }
      if (!image.naturalWidth) {
        loseCtx();
        setGlFailed(true);
        return;
      }
      texture.image = image;
      texture.needsUpdate = true;
      program.uniforms.uImageSize.value = [
        image.naturalWidth,
        image.naturalHeight,
      ];

      // --- sizing ---
      const resize = () => {
        const rect = wrap.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        renderer.setSize(rect.width, rect.height);
        program.uniforms.uCanvasSize.value = [rect.width, rect.height];
      };
      const ro = new ResizeObserver(resize);
      ro.observe(wrap);
      resize();
      setGlReady(true);

      // --- pointer targets (smoothed in the tick) ---
      const target = { mx: 0.5, my: 0.5, hover: 0 };
      const onPointerMove = (e: PointerEvent) => {
        const r = wrap.getBoundingClientRect();
        target.mx = (e.clientX - r.left) / r.width;
        target.my = 1 - (e.clientY - r.top) / r.height;
      };
      const onEnter = () => {
        target.hover = 1;
      };
      const onLeave = () => {
        target.hover = 0;
      };
      wrap.addEventListener('pointermove', onPointerMove, { passive: true });
      wrap.addEventListener('pointerenter', onEnter);
      wrap.addEventListener('pointerleave', onLeave);

      // --- render tick ---
      let lastScrollY = window.scrollY;
      let vel = 0;
      let idleFrames = 0;

      const update = () => {
        const lenis = getLenisInstance() as { velocity?: number } | null;
        let raw: number;
        if (lenis && typeof lenis.velocity === 'number') {
          raw = lenis.velocity;
        } else {
          raw = window.scrollY - lastScrollY;
          lastScrollY = window.scrollY;
        }
        const nv = Math.max(-1, Math.min(1, raw / 36));
        vel += (nv - vel) * 0.14;

        const u = program.uniforms;
        u.uVelocity.value = vel;
        u.uMouse.value[0] += (target.mx - u.uMouse.value[0]) * 0.09;
        u.uMouse.value[1] += (target.my - u.uMouse.value[1]) * 0.09;
        u.uHover.value += (target.hover - u.uHover.value) * 0.09;

        // Skip the draw call when the image is effectively flat and idle.
        const moving =
          Math.abs(vel) > 0.002 ||
          u.uHover.value > 0.002 ||
          Math.abs(target.mx - u.uMouse.value[0]) > 0.002 ||
          Math.abs(target.my - u.uMouse.value[1]) > 0.002;
        if (moving) idleFrames = 0;
        else idleFrames += 1;
        if (idleFrames > 2) return;

        renderer.render({ scene: mesh });
      };

      // --- run only while visible ---
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
        wrap.removeEventListener('pointermove', onPointerMove);
        wrap.removeEventListener('pointerenter', onEnter);
        wrap.removeEventListener('pointerleave', onLeave);
        loseCtx();
      };
    };

    void boot();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [useGL, src, intensity, velocityResponse]);

  return (
    <div
      ref={wrapRef}
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      data-cursor="view"
      data-gl={useGL || undefined}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={styles.img}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        data-dimmed={(useGL && glReady) || undefined}
      />
      {useGL && (
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          data-ready={glReady || undefined}
          aria-hidden
        />
      )}
    </div>
  );
}

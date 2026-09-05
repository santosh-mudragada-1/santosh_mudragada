// Shared helpers for the canvas-2D "scene" draw functions that WorkCardGL
// bakes onto its WebGL plane (so the scroll bow applies to bespoke card art,
// not just photos) and redraws on every hover-progress tick.

export type Pt = { x: number; y: number };

export type SceneFonts = {
  headingFont: string;
  uiFont: string;
  accentFont: string;
};

export type SceneAssets = Record<string, HTMLImageElement>;

export type SceneDraw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  /** 0 = rest state, 1 = fully "hovered". */
  progress: number,
  extra: SceneFonts & { assets: SceneAssets },
) => void;

export type SceneConfig = {
  draw: SceneDraw;
  /** name -> same-origin URL, preloaded (decoded) before the first paint. */
  assets?: Record<string, string>;
};

/** `preserveAspectRatio="xMidYMid slice"` for a canvas: uniform-scale + crop
 *  a designW×designH composition to cover a w×h box, centred. */
export function coverTransform(ctx: CanvasRenderingContext2D, w: number, h: number, designW: number, designH: number) {
  const scale = Math.max(w / designW, h / designH);
  ctx.translate((w - designW * scale) / 2, (h - designH * scale) / 2);
  ctx.scale(scale, scale);
}

export function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** Maps the overall 0..1 hover progress onto a 0..1 local progress for one
 *  sub-animation spanning [a, b] of that range — the canvas equivalent of a
 *  GSAP timeline's position parameter. */
export function remap(p: number, a: number, b: number): number {
  if (a === b) return p >= a ? 1 : 0;
  return clamp01((p - a) / (b - a));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function easeInCubic(t: number): number {
  return t ** 3;
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

export function easeOutBack(t: number, s = 1.70158): number {
  const t1 = t - 1;
  return 1 + (s + 1) * t1 ** 3 + s * t1 ** 2;
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Draws `fn` scaled about (px, py) — the canvas equivalent of a CSS
 *  transform-origin'd scale. */
export function scaleFrom(ctx: CanvasRenderingContext2D, px: number, py: number, s: number, fn: () => void) {
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(s, s);
  ctx.translate(-px, -py);
  fn();
  ctx.restore();
}

function lerpPt(a: Pt, b: Pt, t: number): Pt {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/** Point at parameter t (0..1) along a quadratic bezier. */
export function quadPointAt(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  return lerpPt(lerpPt(p0, p1, t), lerpPt(p1, p2, t), t);
}

/** De Casteljau split: the control points of the sub-curve from 0 to t —
 *  lets a quadratic bezier be "drawn in" progressively, the canvas
 *  equivalent of animating stroke-dashoffset on an SVG path. */
export function quadSplitLeft(p0: Pt, p1: Pt, p2: Pt, t: number): [Pt, Pt, Pt] {
  const q0 = lerpPt(p0, p1, t);
  const q1 = lerpPt(p1, p2, t);
  return [p0, q0, lerpPt(q0, q1, t)];
}

function polylineLength(pts: Pt[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i += 1) d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return d;
}

/** Strokes a polyline up to a 0..1 fraction of its total length — the
 *  canvas equivalent of stroke-dashoffset for a straight-segment path
 *  (used for the coach-bubble checkmark). */
export function strokePolylinePartial(ctx: CanvasRenderingContext2D, pts: Pt[], t: number) {
  const total = polylineLength(pts);
  let remaining = total * clamp01(t);
  if (remaining <= 0) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i += 1) {
    const segLen = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (remaining >= segLen) {
      ctx.lineTo(pts[i].x, pts[i].y);
      remaining -= segLen;
    } else {
      const f = segLen > 0 ? remaining / segLen : 0;
      ctx.lineTo(lerp(pts[i - 1].x, pts[i].x, f), lerp(pts[i - 1].y, pts[i].y, f));
      remaining = 0;
      break;
    }
  }
  ctx.stroke();
}

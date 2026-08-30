// Shared geometry for the orange/carbon curved wipes (preloader + page
// transition). One tall rectangle with quadratic curved top and bottom edges,
// animated purely by translate — the curved leading edge reads as a liquid
// sweep with no layout work.

export const OVERSCAN = 280;

export function curtainPath(w: number, h: number): string {
  const o = OVERSCAN;
  const topBulge = Math.min(140, w * 0.1); // convex — centre leads on the way in
  const botBulge = Math.min(200, w * 0.14); // convex — centre reveals last on the way out

  return [
    'M 0 0',
    `Q ${w / 2} ${-topBulge} ${w} 0`,
    `L ${w} ${h + o}`,
    `Q ${w / 2} ${h + o - botBulge} 0 ${h + o}`,
    'Z',
  ].join(' ');
}

// --- page transition: morphing curtain (references/page-transitions Curve) ---
// A full-viewport rectangle whose TOP edge holds a constant upward bulge while
// the BOTTOM edge morphs between flat (`belly` 0) and a deep downward belly
// (`belly` 1). Animated by translate + `d` interpolation, exactly like the
// reference's `initialPath`/`targetPath`. 300 is the reference's literal
// headroom above/below the viewport.
export const MORPH_OVERSCAN = 300;

export function curtainMorphPath(
  w: number,
  h: number,
  belly: number,
  depth = MORPH_OVERSCAN,
): string {
  const o = MORPH_OVERSCAN;
  const botEdge = h + belly * depth; // flat: h · bellied: h + depth
  const botCtrl = h + belly * depth * 2; // flat: h · bellied: h + 2·depth
  return [
    `M0 ${o}`,
    `Q${w / 2} 0 ${w} ${o}`,
    `L${w} ${botEdge}`,
    `Q${w / 2} ${botCtrl} 0 ${botEdge}`,
    `L0 0`,
  ].join(' ');
}

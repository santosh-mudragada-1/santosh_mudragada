// Geometry for the orange curved wipe.
// The shape is a viewport-sized rectangle (plus overscan) with quadratic
// curved top and bottom edges. It is animated purely by translateY, so the
// curved leading edge reads as an orange sweep with no layout work.

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

/** Translate offsets (px) for the wipe's start and end positions. */
export function curtainTravel(h: number) {
  return {
    below: h + OVERSCAN, // fully hidden under the fold
    gone: -(h + OVERSCAN + 240), // fully lifted past the top
  };
}

import {
  clamp01,
  coverTransform,
  easeInOutQuad,
  easeOutCubic,
  lerp,
  quadPointAt,
  quadSplitLeft,
  remap,
  roundRect,
  scaleFrom,
  type Pt,
  type SceneDraw,
} from './canvasScene';

const CARBON = '#0c0b0a';
const CARBON_2 = '#17150f';
const PAPER = '#f4f0e9';
const ACCENT = '#ff4d1a';
const LINE = 'rgba(244, 240, 233, 0.16)';
const LINE_STRONG = 'rgba(244, 240, 233, 0.32)';

const DW = 300;
const DH = 400;
const P0: Pt = { x: 78, y: 146 };
const P1: Pt = { x: 150, y: 182 };
const P2: Pt = { x: 222, y: 286 };

function drawReelCard(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = CARBON;
  ctx.strokeStyle = LINE_STRONG;
  ctx.lineWidth = 1;
  roundRect(ctx, 34, 34, 76, 122, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(52, 52, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = LINE_STRONG;
  roundRect(ctx, 64, 48, 34, 4, 2);
  ctx.fill();
  ctx.fillStyle = LINE;
  roundRect(ctx, 64, 57, 24, 4, 2);
  ctx.fill();

  ctx.fillStyle = CARBON_2;
  ctx.strokeStyle = LINE;
  roundRect(ctx, 44, 74, 52, 60, 6);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = PAPER;
  ctx.globalAlpha *= 0.75;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(52, 104);
  ctx.bezierCurveTo(52, 99, 59, 99, 60, 103);
  ctx.bezierCurveTo(61, 99, 68, 99, 68, 104);
  ctx.bezierCurveTo(68, 109, 60, 114, 60, 114);
  ctx.bezierCurveTo(60, 114, 52, 109, 52, 104);
  ctx.closePath();
  ctx.stroke();
}

function drawBoardingPass(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = CARBON;
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1;
  roundRect(ctx, 188, 252, 92, 60, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = ACCENT;
  roundRect(ctx, 188, 252, 8, 60, 8);
  ctx.fill();

  ctx.strokeStyle = LINE_STRONG;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(234, 260);
  ctx.lineTo(234, 304);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = LINE_STRONG;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(212, 270);
  ctx.lineTo(226, 270);
  ctx.moveTo(212, 278);
  ctx.lineTo(232, 278);
  ctx.moveTo(212, 286);
  ctx.lineTo(224, 286);
  ctx.stroke();

  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.moveTo(251, 272);
  ctx.lineTo(265, 278);
  ctx.lineTo(251, 284);
  ctx.lineTo(254, 278);
  ctx.closePath();
  ctx.fill();
}

/**
 * Nextrail card art: a saved reel, a route across the map, a boarding pass —
 * mirrors NextrailGraphic.tsx's Feed2Fly arc, but driven by a single
 * progress scalar (a quadratic bezier stands in for the SVG path — canvas
 * has no getPointAtLength, so the curve is walked with De Casteljau instead).
 */
export const drawNextrailScene: SceneDraw = (ctx, w, h, progress, { assets }) => {
  ctx.save();
  ctx.fillStyle = CARBON_2;
  ctx.fillRect(0, 0, w, h);
  coverTransform(ctx, w, h, DW, DH);

  const map = assets.worldmap;
  if (map) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.drawImage(map, -70, 130, 440, 344);
    ctx.restore();
  }

  // route
  const drawLocal = easeInOutQuad(remap(progress, 0.05, 0.75));
  if (drawLocal > 0.002) {
    const [a, b, c] = quadSplitLeft(P0, P1, P2, drawLocal);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(b.x, b.y, c.x, c.y);
    ctx.stroke();
  }
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(P0.x, P0.y, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(P2.x, P2.y, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // plane, travelling the same curve
  const flyLocal = remap(progress, 0.05, 0.73);
  const planeAlpha = clamp01(remap(progress, 0.05, 0.12)) * (1 - clamp01(remap(progress, 0.64, 0.82)));
  if (flyLocal > 0 && flyLocal < 1 && planeAlpha > 0.01) {
    const pt = quadPointAt(P0, P1, P2, flyLocal);
    const ahead = quadPointAt(P0, P1, P2, Math.min(1, flyLocal + 0.01));
    const angle = Math.atan2(ahead.y - pt.y, ahead.x - pt.x);
    ctx.save();
    ctx.globalAlpha = planeAlpha;
    ctx.translate(pt.x, pt.y);
    ctx.rotate(angle);
    ctx.fillStyle = PAPER;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(5, 4);
    ctx.lineTo(0, 1.5);
    ctx.lineTo(-5, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // saved reel, recedes slightly once sent
  const reelLocal = easeOutCubic(remap(progress, 0, 0.4));
  ctx.save();
  ctx.globalAlpha = lerp(1, 0.45, reelLocal);
  ctx.translate(0, lerp(0, -8, reelLocal));
  scaleFrom(ctx, 70, 95, lerp(1, 0.88, reelLocal), () => drawReelCard(ctx));
  ctx.restore();

  // boarding pass, resolves once the route lands
  const passLocal = clamp01(remap(progress, 0.58, 0.85));
  if (passLocal > 0.002) {
    ctx.save();
    ctx.globalAlpha = passLocal;
    scaleFrom(ctx, 234, 312, passLocal, () => drawBoardingPass(ctx));
    ctx.restore();
  }

  ctx.restore();
};

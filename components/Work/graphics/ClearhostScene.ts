import {
  clamp01,
  coverTransform,
  easeInCubic,
  easeOutCubic,
  lerp,
  remap,
  roundRect,
  type SceneDraw,
} from './canvasScene';

const CARBON = '#0c0b0a';
const CARBON_2 = '#17150f';
const PAPER = '#f4f0e9';
const ACCENT = '#ff4d1a';
const SMOKE = '#7c7568';
const LINE = 'rgba(244, 240, 233, 0.16)';
const LINE_STRONG = 'rgba(244, 240, 233, 0.32)';
const MARKER = '#ffd84d';
const MARKER_INK = '#2a2410';
const POP = '#3f6fd8';
const OK = '#3fa06b';

const DW = 400;
const DH = 300;
const BAR_HEIGHTS = [22, 40, 31, 52];
const BAR_X = [280, 300, 320, 340];

function drawPieIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.8, -Math.PI / 2, Math.PI * 0.55);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - r * 0.8);
  ctx.stroke();
  ctx.restore();
}

function drawUsersIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const r = size * 0.16;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x + size * 0.35, y + size * 0.32, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.68, y + size * 0.32, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.5, y + size * 0.85, size * 0.34, Math.PI, 0);
  ctx.stroke();
  ctx.restore();
}

function drawCompassIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.09;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.5);
  ctx.lineTo(cx + r * 0.25, cy);
  ctx.lineTo(cx, cy + r * 0.5);
  ctx.lineTo(cx - r * 0.25, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * ClearHost card art: the ops dashboard, still half-buried under a field
 * sticky note. Hover peels the note off and the dashboard boots up — bars
 * grow, occupancy/rooms counters roll — mirroring ClearhostGraphic.tsx (the
 * non-GL fallback) but as a pure function of progress, since this is what
 * gets baked onto the WebGL plane and re-baked every hover tick.
 */
export const drawClearhostScene: SceneDraw = (ctx, w, h, progress, { headingFont, uiFont, accentFont }) => {
  ctx.save();
  ctx.fillStyle = CARBON_2;
  ctx.fillRect(0, 0, w, h);
  coverTransform(ctx, w, h, DW, DH);
  ctx.textBaseline = 'alphabetic';

  // dashboard shell
  ctx.fillStyle = CARBON;
  ctx.strokeStyle = LINE_STRONG;
  ctx.lineWidth = 1;
  roundRect(ctx, 28, 26, 344, 210, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = LINE_STRONG;
  [44, 54, 64].forEach((dotX) => {
    ctx.beginPath();
    ctx.arc(dotX, 42, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = SMOKE;
  ctx.font = `9px ${uiFont}`;
  ctx.fillText('clearhost.in/ops', 80, 46);

  ctx.strokeStyle = LINE;
  ctx.beginPath();
  ctx.moveTo(28, 58);
  ctx.lineTo(372, 58);
  ctx.stroke();

  // occupancy tile
  ctx.fillStyle = CARBON_2;
  ctx.strokeStyle = LINE;
  roundRect(ctx, 44, 68, 104, 78, 8);
  ctx.fill();
  ctx.stroke();
  drawPieIcon(ctx, 56, 80, 16, ACCENT);
  const occLocal = easeOutCubic(remap(progress, 0.1, 0.7));
  ctx.fillStyle = PAPER;
  ctx.font = `700 22px ${headingFont}`;
  ctx.fillText(`${Math.round(lerp(0, 82, occLocal))}%`, 56, 122);
  ctx.fillStyle = SMOKE;
  ctx.font = `8px ${uiFont}`;
  ctx.fillText('Occupancy', 56, 136);

  // rooms-synced tile
  ctx.fillStyle = CARBON_2;
  ctx.strokeStyle = LINE;
  roundRect(ctx, 156, 68, 104, 78, 8);
  ctx.fill();
  ctx.stroke();
  drawUsersIcon(ctx, 168, 80, 16, POP);
  const roomsLocal = easeOutCubic(remap(progress, 0.14, 0.74));
  ctx.fillStyle = PAPER;
  ctx.font = `700 22px ${headingFont}`;
  ctx.fillText(`${Math.round(lerp(0, 128, roomsLocal))}`, 168, 122);
  ctx.fillStyle = SMOKE;
  ctx.font = `8px ${uiFont}`;
  ctx.fillText('Rooms synced', 168, 136);

  // mini bar chart
  ctx.fillStyle = CARBON_2;
  ctx.strokeStyle = LINE;
  roundRect(ctx, 268, 68, 104, 78, 8);
  ctx.fill();
  ctx.stroke();
  BAR_HEIGHTS.forEach((full, i) => {
    const local = easeOutCubic(remap(progress, 0.08 + i * 0.05, 0.5 + i * 0.05));
    const barH = full * local;
    if (barH <= 0) return;
    ctx.fillStyle = i === BAR_HEIGHTS.length - 1 ? ACCENT : OK;
    roundRect(ctx, BAR_X[i], 136 - barH, 12, barH, 2);
    ctx.fill();
  });

  // field-research sticky note, peeled off on hover
  const noteLocal = easeInCubic(remap(progress, 0, 0.6));
  const alpha = clamp01(lerp(1, 0, noteLocal));
  if (alpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(lerp(0, 168, noteLocal), lerp(0, -196, noteLocal));
    // rotate + scale about the note's centre (305, 213)
    ctx.translate(305, 213);
    ctx.rotate((lerp(-7, 24, noteLocal) * Math.PI) / 180);
    ctx.scale(lerp(1, 0.86, noteLocal), lerp(1, 0.86, noteLocal));
    ctx.translate(-305, -213);

    ctx.fillStyle = MARKER;
    roundRect(ctx, 252, 172, 106, 82, 3);
    ctx.fill();

    ctx.fillStyle = MARKER_INK;
    ctx.globalAlpha = alpha * 0.35;
    ctx.beginPath();
    ctx.arc(305, 180, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.font = `11px ${accentFont}`;
    ctx.fillText('"guests want', 264, 204);
    ctx.fillText('faster check-in"', 264, 220);
    drawCompassIcon(ctx, 324, 228, 14, MARKER_INK);
    ctx.restore();
  }

  ctx.restore();
};

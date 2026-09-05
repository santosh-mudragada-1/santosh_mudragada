import {
  clamp01,
  coverTransform,
  lerp,
  remap,
  scaleFrom,
  strokePolylinePartial,
  type Pt,
  type SceneDraw,
} from './canvasScene';

const LIGHT_SQ = '#eeeed2';
const DARK_SQ = '#769656';
const HIGHLIGHT = 'rgba(246, 246, 105, 0.55)';
const WRONG = 'rgba(225, 83, 83, 0.55)';
const EVAL_DARK = '#403d39';
const EVAL_LIGHT = '#f1f0e8';
const CARBON = '#0c0b0a';
const CARBON_2 = '#17150f';
const PAPER = '#f4f0e9';
const PIECE_FONT = "system-ui, 'Segoe UI Symbol', sans-serif";
const CONFETTI = ['#81b64c', '#e6912c', '#4a90d9', '#f0c15c'];

const DW = 300;
const DH = 200;
const BX = 24;
const BY = 30;
const SQ = 15;
const EVAL_X = 162;
const EVAL_Y = 30;
const EVAL_H = 120;

const FROM = { col: 4, row: 3 };
const TO = { col: 2, row: 2 };
const cx = (col: number) => BX + col * SQ + SQ / 2;
const cy = (row: number) => BY + row * SQ + SQ / 2;

const CHECK_PTS: Pt[] = [
  { x: 208, y: 37 },
  { x: 217, y: 46 },
  { x: 236, y: 27 },
];

function drawPiece(ctx: CanvasRenderingContext2D, glyph: string, x: number, y: number, fill: string, stroke: string, size = 14) {
  // save/restore so textAlign/textBaseline never leak into the shared
  // index/title text WorkCardGL bakes on top of this scene.
  ctx.save();
  ctx.font = `${size}px ${PIECE_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 0.6;
  ctx.strokeStyle = stroke;
  ctx.strokeText(glyph, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(glyph, x, y);
  ctx.restore();
}

/**
 * Chess.com card art: a hanging knight gets corrected, the eval bar swings
 * back, a coach checkmark and confetti land — mirrors ChessComGraphic.tsx
 * (real chess.com board/eval tones from Board.module.scss / EvalBar.tsx)
 * as a pure function of progress instead of a GSAP-driven DOM timeline.
 */
export const drawChessComScene: SceneDraw = (ctx, w, h, progress) => {
  ctx.save();
  ctx.fillStyle = CARBON_2;
  ctx.fillRect(0, 0, w, h);
  coverTransform(ctx, w, h, DW, DH);

  // board
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 1 ? DARK_SQ : LIGHT_SQ;
      ctx.fillRect(BX + col * SQ, BY + row * SQ, SQ, SQ);
    }
  }

  // the blunder square: a brief red flash, then it clears
  const wrongAlpha = Math.sin(clamp01(remap(progress, 0, 0.32)) * Math.PI) * 0.9;
  if (wrongAlpha > 0.01) {
    ctx.fillStyle = WRONG;
    ctx.globalAlpha = wrongAlpha;
    ctx.fillRect(BX + FROM.col * SQ, BY + FROM.row * SQ, SQ, SQ);
    ctx.globalAlpha = 1;
  }

  // the corrected square, highlighted once the move lands
  const targetAlpha = clamp01(remap(progress, 0.55, 0.8));
  if (targetAlpha > 0.01) {
    ctx.fillStyle = HIGHLIGHT;
    ctx.globalAlpha = targetAlpha;
    ctx.fillRect(BX + TO.col * SQ, BY + TO.row * SQ, SQ, SQ);
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = 'rgba(244, 240, 233, 0.32)';
  ctx.lineWidth = 1;
  ctx.strokeRect(BX, BY, SQ * 8, SQ * 8);

  // pieces — static context, plus the knight sliding to safety
  drawPiece(ctx, '♛', cx(6), cy(1), CARBON, PAPER, 15);
  drawPiece(ctx, '♔', cx(1), cy(6), PAPER, CARBON);
  const moveLocal = clamp01(remap(progress, 0.3, 0.7));
  const nx = lerp(cx(FROM.col), cx(TO.col), moveLocal);
  const ny = lerp(cy(FROM.row), cy(TO.row), moveLocal);
  drawPiece(ctx, '♘', nx, ny, PAPER, CARBON);

  // eval bar
  ctx.fillStyle = EVAL_DARK;
  ctx.fillRect(EVAL_X, EVAL_Y, 16, EVAL_H);
  const fillFrac = lerp(0.3, 0.65, clamp01(remap(progress, 0.3, 0.9)));
  ctx.fillStyle = EVAL_LIGHT;
  ctx.fillRect(EVAL_X, EVAL_Y + EVAL_H * (1 - fillFrac), 16, EVAL_H * fillFrac);
  ctx.strokeStyle = 'rgba(244, 240, 233, 0.32)';
  ctx.strokeRect(EVAL_X, EVAL_Y, 16, EVAL_H);

  // coach callout, once the move lands
  const bubbleLocal = clamp01(remap(progress, 0.55, 0.8));
  if (bubbleLocal > 0.002) {
    ctx.save();
    ctx.globalAlpha = bubbleLocal;
    scaleFrom(ctx, 188, 58, bubbleLocal, () => {
      ctx.fillStyle = CARBON;
      ctx.beginPath();
      ctx.moveTo(190, 58);
      ctx.lineTo(200, 72);
      ctx.lineTo(210, 58);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(244, 240, 233, 0.32)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(188, 16, 94, 42, 9) : ctx.rect(188, 16, 94, 42);
      ctx.fill();
      ctx.stroke();

      const checkLocal = clamp01(remap(progress, 0.72, 1));
      ctx.strokeStyle = '#81b64c';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      strokePolylinePartial(ctx, CHECK_PTS, checkLocal);

      const burst = clamp01(remap(progress, 0.78, 1));
      CONFETTI.forEach((color, i) => {
        const angle = (i / CONFETTI.length) * Math.PI * 2;
        const dist = 22 * burst;
        ctx.globalAlpha = bubbleLocal * (1 - burst);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(270 + Math.cos(angle) * dist, 24 + Math.sin(angle) * dist - 6 * burst, 2.4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    ctx.restore();
  }

  ctx.restore();
};

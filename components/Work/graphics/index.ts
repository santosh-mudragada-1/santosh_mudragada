import { ClearhostGraphic } from './ClearhostGraphic';
import { NextrailGraphic } from './NextrailGraphic';
import { ChessComGraphic } from './ChessComGraphic';
import { drawClearhostScene } from './ClearhostScene';
import { drawNextrailScene } from './NextrailScene';
import { drawChessComScene } from './ChessComScene';
import type { WorkGraphic } from './types';
import type { SceneConfig } from './canvasScene';

export const WORK_GRAPHICS: Record<string, WorkGraphic> = {
  clearhost: ClearhostGraphic,
  nextrail: NextrailGraphic,
  'chess-com': ChessComGraphic,
};

// The same per-project art, as a canvas-2D scene WorkCardGL bakes onto its
// WebGL plane — so the scroll bow still applies, and hover redraws the same
// texture instead of animating DOM. Falls back to WORK_GRAPHICS above
// wherever GL can't run (touch, reduced motion, WebGL failure).
export const WORK_SCENES: Record<string, SceneConfig> = {
  clearhost: { draw: drawClearhostScene },
  nextrail: { draw: drawNextrailScene, assets: { worldmap: '/nextrail_casestudy/worldmap.png' } },
  'chess-com': { draw: drawChessComScene },
};

export type { WorkGraphic, WorkGraphicProps } from './types';
export type { SceneConfig, SceneDraw } from './canvasScene';

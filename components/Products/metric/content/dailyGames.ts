import { ZipPreview } from '../previews/ZipPreview';
import { TangoPreview } from '../previews/TangoPreview';
import { QueensPreview } from '../previews/QueensPreview';
import { PatchesPreview } from '../previews/PatchesPreview';
import { HardwordPreview } from '../previews/HardwordPreview';
import type { GameEntry } from './games';

export const DAILY_GAMES: GameEntry[] = [
  { name: 'Zip', blurb: 'Draw one path through every cell, in order.', Preview: ZipPreview, accent: 'zip' },
  { name: 'Tango', blurb: 'Balance the sun and moons, no three in a row.', Preview: TangoPreview, accent: 'tango' },
  { name: 'Queens', blurb: 'One crown per row, column, and color.', Preview: QueensPreview, accent: 'queens' },
  {
    name: 'Patches',
    blurb: 'Carve the grid into rectangles that match their number.',
    Preview: PatchesPreview,
    accent: 'patches',
  },
  { name: 'Hardword', blurb: 'Guess the hidden word in eight tries.', Preview: HardwordPreview, accent: 'hardword' },
];

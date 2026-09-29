import type { ComponentType } from 'react';
import { DrawPreview } from '../previews/DrawPreview';
import { AvatarPreview } from '../previews/AvatarPreview';
import { ComboPreview } from '../previews/ComboPreview';
import { ConfettiPreview } from '../previews/ConfettiPreview';
import { PalettePreview } from '../previews/PalettePreview';
import { LobbyPreview } from '../previews/LobbyPreview';

export interface FeatureEntry {
  name: string;
  /** Lowercase, editorial fragment used as supporting copy. */
  blurb: string;
  Preview: ComponentType;
  accent: string;
}

export const FEATURES: FeatureEntry[] = [
  { name: 'Draw & Guess', blurb: 'Smoothed strokes on one shared canvas.', Preview: DrawPreview, accent: 'draw' },
  {
    name: 'Doodle Avatars',
    blurb: 'Shape, eyes, mouth and color — hats unlock by level.',
    Preview: AvatarPreview,
    accent: 'avatar',
  },
  {
    name: 'Combo Streak',
    blurb: 'Guess fast, chain combos, watch the score climb.',
    Preview: ComboPreview,
    accent: 'combo',
  },
  {
    name: 'Round Reveal',
    blurb: 'Confetti and screen shake for every round won.',
    Preview: ConfettiPreview,
    accent: 'confetti',
  },
  {
    name: 'Palette & Brushes',
    blurb: 'Twenty crayon colors, four brush weights.',
    Preview: PalettePreview,
    accent: 'palette',
  },
  {
    name: 'Lobby Wall',
    blurb: 'Everyone doodles together while the room fills up.',
    Preview: LobbyPreview,
    accent: 'lobby',
  },
];

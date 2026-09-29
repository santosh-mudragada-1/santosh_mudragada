import type { ComponentType } from 'react';
import { DrawPreview } from '../previews/DrawPreview';
import { AvatarPreview } from '../previews/AvatarPreview';
import { ComboPreview } from '../previews/ComboPreview';
import { ConfettiPreview } from '../previews/ConfettiPreview';
import { PalettePreview } from '../previews/PalettePreview';
import { LobbyPreview } from '../previews/LobbyPreview';

export interface FeatureEntry {
  name: string;
  Preview: ComponentType;
  accent: string;
}

export const FEATURES: FeatureEntry[] = [
  { name: 'Draw & Guess', Preview: DrawPreview, accent: 'draw' },
  { name: 'Doodle Avatars', Preview: AvatarPreview, accent: 'avatar' },
  { name: 'Combo Streak', Preview: ComboPreview, accent: 'combo' },
  { name: 'Round Reveal', Preview: ConfettiPreview, accent: 'confetti' },
  { name: 'Palette & Brushes', Preview: PalettePreview, accent: 'palette' },
  { name: 'Lobby Wall', Preview: LobbyPreview, accent: 'lobby' },
];

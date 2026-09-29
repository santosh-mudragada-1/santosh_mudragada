import type { ComponentType } from 'react';
import { ReactionPreview } from '../previews/ReactionPreview';
import { AimPreview } from '../previews/AimPreview';
import { SequencePreview } from '../previews/SequencePreview';
import { NumberPreview } from '../previews/NumberPreview';
import { ChimpPreview } from '../previews/ChimpPreview';
import { VisualPreview } from '../previews/VisualPreview';
import { VerbalPreview } from '../previews/VerbalPreview';
import { TypingPreview } from '../previews/TypingPreview';

export interface GameEntry {
  name: string;
  /** Lowercase, editorial fragment used as supporting copy. */
  blurb: string;
  Preview: ComponentType;
  accent: string;
}

export const BRAIN_TEST_GAMES: GameEntry[] = [
  { name: 'Reaction Time', blurb: 'Wait for green. Click.', Preview: ReactionPreview, accent: 'reaction' },
  { name: 'Aim Trainer', blurb: 'Hit all 30 targets.', Preview: AimPreview, accent: 'aim' },
  { name: 'Sequence Memory', blurb: 'Repeat the pattern.', Preview: SequencePreview, accent: 'sequence' },
  { name: 'Number Memory', blurb: 'Remember the number.', Preview: NumberPreview, accent: 'number' },
  { name: 'Chimp Test', blurb: 'Tap the numbers in order.', Preview: ChimpPreview, accent: 'chimp' },
  { name: 'Visual Memory', blurb: 'Recall the lit tiles.', Preview: VisualPreview, accent: 'visual' },
  { name: 'Verbal Memory', blurb: 'Spot the repeat word.', Preview: VerbalPreview, accent: 'verbal' },
  { name: 'Typing', blurb: 'Type the passage fast.', Preview: TypingPreview, accent: 'typing' },
];

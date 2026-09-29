import { audioEngine } from './AudioEngine';
import { blip, tone } from './synth';

function guarded(fn: () => void): void {
  if (audioEngine.isMuted()) return;
  try {
    fn();
  } catch {
    // audio is a non-blocking enhancement — never let it throw into game logic
  }
}

export function playHover(): void {
  guarded(() => tone({ freq: 720, type: 'sine', duration: 0.04, peakGain: 0.24, release: 0.03 }));
}

export function playClick(): void {
  guarded(() => blip(1000));
}

const CARD_BASE_FREQ = 520;
const CARD_SEMITONE = Math.pow(2, 1 / 12);
// Major pentatonic scale steps — keeps the card-to-card glide pleasant regardless of index.
const CARD_SCALE_STEPS = [0, 2, 4, 7, 9];

/** A showreel card's hover tick — steps up a pentatonic scale by index, so sweeping across
 *  a row of cards plays like running a finger across a small instrument. */
export function playCardHover(index: number): void {
  guarded(() => {
    const step = CARD_SCALE_STEPS[index % CARD_SCALE_STEPS.length];
    const octave = Math.floor(index / CARD_SCALE_STEPS.length) % 2;
    const freq = CARD_BASE_FREQ * Math.pow(CARD_SEMITONE, step + octave * 12);
    tone({ freq, type: 'sine', duration: 0.05, peakGain: 0.2, release: 0.07 });
  });
}

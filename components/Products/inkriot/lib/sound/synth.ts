import { audioEngine } from './AudioEngine';

interface ToneOptions {
  freq: number;
  type?: OscillatorType;
  duration?: number;
  attack?: number;
  release?: number;
  peakGain?: number;
  delay?: number;
  detune?: number;
}

export function tone({
  freq,
  type = 'sine',
  duration = 0.15,
  attack = 0.005,
  release = 0.08,
  peakGain = 0.6,
  delay = 0,
  detune = 0,
}: ToneOptions): void {
  const ctx = audioEngine.ctx;
  const out = audioEngine.output;
  if (!ctx || !out) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.detune.value = detune;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peakGain, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration + release);

  osc.connect(gain);
  gain.connect(out);
  osc.start(start);
  osc.stop(start + duration + release + 0.02);
}

export function blip(freq = 1200, delay = 0): void {
  tone({ freq, type: 'square', duration: 0.03, attack: 0.001, release: 0.02, peakGain: 0.25, delay });
}

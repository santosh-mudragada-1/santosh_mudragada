import { gsap } from '@/lib/gsap/gsap';
import { getLenisInstance } from '@/lib/smooth-scroll';

/**
 * Safari-only, lightweight stand-in for the WebGL card deformation
 * (WorkCardGL, which is Chromium-only — three live WebGL contexts froze
 * WebKit). One shared `gsap.ticker` callback runs a single scroll-velocity
 * spring; every subscribed card box gets a `skewY` proportional to its `max`,
 * so the cards "feel the pull" of the scroll and settle back at rest.
 *
 * Deliberately cheap on WebKit:
 *  - one ticker callback for ALL cards (no per-card rAF, no extra loops)
 *  - zero DOM reads / zero layout — velocity comes from the Lenis instance
 *  - GPU-composited transform only (`translateZ(0) skewY()`), never layout props
 *  - the DOM is touched only when the angle changes enough to see
 *  - clamped velocity -> rendering work is constant no matter how hard you flick
 *  - stops writing once the spring settles; the callback detaches entirely
 *    when the last card unsubscribes (i.e. all cards off-screen)
 */

type Sub = { el: HTMLElement; max: number; last: number };

const subs = new Set<Sub>();
let amp = 0;
let vel = 0;
let idle = 0;
let running = false;

const VEL_DIV = 36; // Lenis velocity that maps to a full-tilt skew
const STIFF = 0.11;
const DAMP = 0.8;
const REST_EPS = 0.001; // |amp| & |vel| below this = settled
const WRITE_EPS = 0.02; // deg — smallest change worth a style write

function tick() {
  const lenis = getLenisInstance() as { velocity?: number } | null;
  const raw =
    lenis && typeof lenis.velocity === 'number' ? lenis.velocity : 0;
  const target = Math.max(-1, Math.min(1, raw / VEL_DIV));

  vel += (target - amp) * STIFF;
  vel *= DAMP;
  amp += vel;

  const settled = Math.abs(amp) < REST_EPS && Math.abs(vel) < REST_EPS;
  idle = settled ? idle + 1 : 0;
  const a = settled && idle > 2 ? 0 : amp;

  for (const s of subs) {
    const skew = a * s.max;
    if (Math.abs(skew - s.last) < WRITE_EPS) continue;
    s.last = skew;
    s.el.style.transform = `translateZ(0) skewY(${skew.toFixed(2)}deg)`;
  }
}

/** Subscribe a card box. Returns an unsubscribe that also clears its transform. */
export function addCardSkew(el: HTMLElement, max: number): () => void {
  const sub: Sub = { el, max, last: 999 };
  subs.add(sub);
  el.style.willChange = 'transform';
  if (!running) {
    gsap.ticker.add(tick);
    running = true;
  }
  return () => {
    subs.delete(sub);
    el.style.transform = '';
    el.style.willChange = '';
    if (!subs.size && running) {
      gsap.ticker.remove(tick);
      running = false;
      amp = 0;
      vel = 0;
      idle = 0;
    }
  };
}

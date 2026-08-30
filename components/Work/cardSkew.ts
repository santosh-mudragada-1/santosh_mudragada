import { gsap } from '@/lib/gsap/gsap';

/**
 * Lightweight stand-in for the WebGL card deformation (WorkCardGL, which is
 * Chromium-desktop only). Used on Safari desktop as the GL fallback AND on
 * every touch device (mobile / tablet), where the GL bow is too heavy. One
 * shared `gsap.ticker` callback runs a single scroll-velocity spring; every
 * subscribed card box gets a `skewY` proportional to its `max`, so the cards
 * "feel the pull" of the scroll and settle back at rest.
 *
 * Deliberately cheap:
 *  - one ticker callback for ALL cards (no per-card rAF, no extra loops)
 *  - one DOM read/frame (`window.scrollY`) — works with or without Lenis, and
 *    on native touch scroll where Lenis doesn't report a velocity
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
let lastY = 0; // window.scrollY at the previous tick

const VEL_DIV = 36; // px/frame of scroll that maps to a full-tilt skew
const STIFF = 0.11;
const DAMP = 0.8;
const REST_EPS = 0.001; // |amp| & |vel| below this = settled
const WRITE_EPS = 0.02; // deg — smallest change worth a style write

function tick() {
  const y = window.scrollY || 0;
  const raw = y - lastY; // px scrolled since the last frame
  lastY = y;
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
    lastY = window.scrollY || 0; // avoid a spike from a stale delta
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

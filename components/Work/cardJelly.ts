import { gsap } from '@/lib/gsap/gsap';
import { getLenisInstance } from '@/lib/smooth-scroll';

/**
 * One shared gsap.ticker spring per card box (.outer). Two jelly inputs:
 *
 *  - scroll velocity -> skewY + a faint scaleY squash. Safari only (Chromium's
 *    scroll deformation is WorkCardGL). Pass `maxSkew: 0` to skip it.
 *  - pointer entry / exit direction -> a directional translate + scale bulge
 *    that springs back with a wobble. Both browsers. Call `poke(dx, dy)`.
 *
 * GPU-composited transform only, no DOM reads in the loop, writes only when the
 * transform actually changes, and the ticker callback detaches when the last
 * card unsubscribes.
 */

type Sub = {
  el: HTMLElement;
  maxSkew: number;
  sAmp: number; // scroll spring (1D)
  sVel: number;
  pxAmp: number; // poke spring (2D)
  pxVel: number;
  pyAmp: number;
  pyVel: number;
  idle: number;
  last: string;
};

const subs = new Set<Sub>();
let running = false;

// scroll reaction (Safari)
const VEL_DIV = 36;
const S_STIFF = 0.11;
const S_DAMP = 0.8;
const SQUASH = 0.012; // scaleY delta at full scroll tilt

// pointer reaction (both browsers) — impulse-driven, decays to rest
const P_STIFF = 0.14;
const P_DAMP = 0.76; // lower = more wobble
const P_IMPULSE = 0.75; // kick into the poke velocity on enter/leave
const P_MAX_T = 5; // px translate at amp 1
const P_MAX_S = 0.02; // scale delta at |amp| 1

const REST = 0.0016;

function tick() {
  const lenis = getLenisInstance() as { velocity?: number } | null;
  const raw = lenis && typeof lenis.velocity === 'number' ? lenis.velocity : 0;
  const sTarget = Math.max(-1, Math.min(1, raw / VEL_DIV));

  for (const s of subs) {
    if (s.maxSkew) {
      s.sVel += (sTarget - s.sAmp) * S_STIFF;
      s.sVel *= S_DAMP;
      s.sAmp += s.sVel;
    }
    s.pxVel += (0 - s.pxAmp) * P_STIFF;
    s.pxVel *= P_DAMP;
    s.pxAmp += s.pxVel;
    s.pyVel += (0 - s.pyAmp) * P_STIFF;
    s.pyVel *= P_DAMP;
    s.pyAmp += s.pyVel;

    const settled =
      Math.abs(s.pxAmp) < REST &&
      Math.abs(s.pxVel) < REST &&
      Math.abs(s.pyAmp) < REST &&
      Math.abs(s.pyVel) < REST &&
      (!s.maxSkew || (Math.abs(s.sAmp) < REST && Math.abs(s.sVel) < REST));

    s.idle = settled ? s.idle + 1 : 0;
    if (settled && s.idle > 2) {
      if (s.last !== '') {
        s.last = '';
        s.el.style.transform = '';
      }
      continue;
    }

    const tx = (s.pxAmp * P_MAX_T).toFixed(1);
    const ty = (s.pyAmp * P_MAX_T).toFixed(1);
    const psc = (
      1 +
      Math.min(1, Math.hypot(s.pxAmp, s.pyAmp)) * P_MAX_S
    ).toFixed(4);

    let t = `translate3d(${tx}px, ${ty}px, 0) scale(${psc})`;
    if (s.maxSkew) {
      t +=
        ` skewY(${(s.sAmp * s.maxSkew).toFixed(2)}deg)` +
        ` scaleY(${(1 + s.sAmp * SQUASH).toFixed(4)})`;
    }
    if (t !== s.last) {
      s.last = t;
      s.el.style.transform = t;
    }
  }
}

function ensureRunning() {
  if (!running) {
    gsap.ticker.add(tick);
    running = true;
  }
}

export type CardJelly = {
  /** Nudge the poke spring in a direction (unit-ish dx/dy). */
  poke: (dx: number, dy: number) => void;
  detach: () => void;
};

export function addCardJelly(
  el: HTMLElement,
  opts: { maxSkew: number },
): CardJelly {
  const sub: Sub = {
    el,
    maxSkew: opts.maxSkew,
    sAmp: 0,
    sVel: 0,
    pxAmp: 0,
    pxVel: 0,
    pyAmp: 0,
    pyVel: 0,
    idle: 0,
    last: '__',
  };
  subs.add(sub);
  el.style.willChange = 'transform';
  ensureRunning();

  return {
    poke(dx, dy) {
      sub.pxVel += dx * P_IMPULSE;
      sub.pyVel += dy * P_IMPULSE;
      sub.idle = 0;
    },
    detach() {
      subs.delete(sub);
      el.style.transform = '';
      el.style.willChange = '';
      if (!subs.size && running) {
        gsap.ticker.remove(tick);
        running = false;
      }
    },
  };
}

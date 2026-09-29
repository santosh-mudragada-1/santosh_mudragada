import gsap from 'gsap';
import { DURATION, EASE } from './gsapConfig';

type Target = gsap.TweenTarget;

export function pressDown(target: Target) {
  return gsap.to(target, { scale: 0.94, duration: DURATION.instant, ease: EASE.smooth });
}

export function pressUp(target: Target) {
  return gsap.to(target, { scale: 1, duration: DURATION.base, ease: EASE.out });
}

export function hoverIn(target: Target) {
  return gsap.to(target, { scale: 1.03, duration: DURATION.fast, ease: EASE.smooth });
}

export function hoverOut(target: Target) {
  return gsap.to(target, { scale: 1, duration: DURATION.fast, ease: EASE.smooth });
}

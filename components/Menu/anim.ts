import type { Variants } from 'framer-motion';
import { EASE } from '@/lib/motion/config';

// Adapted from references/dennis (Header/animation.js). Same timing feel,
// this project's identity.
export const menuSlide: Variants = {
  initial: { x: 'calc(100% + 130px)' },
  enter: { x: 0, transition: { duration: 0.8, ease: EASE.quartInOut } },
  exit: {
    x: 'calc(100% + 130px)',
    transition: { duration: 0.7, ease: EASE.quartInOut },
  },
};

export const linkSlide: Variants = {
  initial: { x: 92, opacity: 0 },
  enter: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: EASE.quartInOut, delay: 0.14 + i * 0.05 },
  }),
  exit: (i: number) => ({
    x: 92,
    opacity: 0,
    transition: { duration: 0.4, ease: EASE.quartInOut, delay: i * 0.03 },
  }),
};

export const fadeInLate: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.6, delay: 0.45 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const indicatorScale: Variants = {
  closed: { scale: 0 },
  open: { scale: 1, transition: { duration: 0.3, ease: EASE.quartInOut } },
};

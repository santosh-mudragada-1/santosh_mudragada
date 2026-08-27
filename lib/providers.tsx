'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { SmoothScrollProvider } from '@/lib/smooth-scroll';
import { EASE, DUR } from '@/lib/motion/config';

/**
 * Single client boundary for app-wide providers. Kept deliberately small —
 * add future providers (cursor state, menu state, page-transition) here so the
 * root layout stays a server component.
 *
 * `MotionConfig reducedMotion="user"` makes every Framer animation honour the
 * OS setting automatically; components still branch explicitly where the
 * static alternative is meaningfully different.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: DUR.base, ease: EASE.quartInOut }}
    >
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </MotionConfig>
  );
}

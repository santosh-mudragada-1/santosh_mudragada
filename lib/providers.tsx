'use client';

import { useEffect, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { SmoothScrollProvider } from '@/lib/smooth-scroll';
import { MenuProvider } from '@/lib/menu/MenuProvider';
import { detectWebKit } from '@/lib/hooks/useIsWebKit';
import { EASE, DUR } from '@/lib/motion/config';

/**
 * Single client boundary for app-wide providers. Kept deliberately small —
 * add future providers here so the root layout stays a server component.
 *
 * `MotionConfig reducedMotion="user"` makes every Framer animation honour the
 * OS setting automatically; components still branch explicitly where the
 * static alternative is meaningfully different.
 */
export function Providers({ children }: { children: ReactNode }) {
  // Tag WebKit so stylesheets can shed permanent `will-change` promotions that
  // only pay off on Blink — Safari holds those layers in GPU memory full-time.
  useEffect(() => {
    if (!detectWebKit()) return;
    const root = document.documentElement;
    root.classList.add('is-webkit');
    return () => root.classList.remove('is-webkit');
  }, []);

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: DUR.base, ease: EASE.quartInOut }}
    >
      <SmoothScrollProvider>
        <MenuProvider>{children}</MenuProvider>
      </SmoothScrollProvider>
    </MotionConfig>
  );
}

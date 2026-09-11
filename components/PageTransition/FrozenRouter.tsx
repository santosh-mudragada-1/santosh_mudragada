'use client';

import { useContext, useRef, type ReactNode } from 'react';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Freezes the App Router's `LayoutRouterContext` for this subtree.
 *
 * When `usePathname()` changes, Next has already swapped the RSC segment in
 * `LayoutRouterContext`. By capturing the context value the first time this
 * component mounts and never updating it, the wrapped `<LayoutRouter>` keeps
 * rendering the *previous* route's content until we deliberately remount this
 * component (bump its `key`) — which is what lets the outgoing page stay
 * visible under the transition curtain.
 *
 * Import path note: `LayoutRouterContext` is not part of Next's public API.
 * Pinned to next@14.2.x. If a Next upgrade moves it, this file breaks loudly
 * at build time rather than silently.
 */
export function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;

  if (!frozen) return <>{children}</>;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

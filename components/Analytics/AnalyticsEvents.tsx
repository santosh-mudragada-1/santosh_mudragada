'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics';

/**
 * Site-wide portfolio events, without touching individual components:
 *  - case_study_opened / product_opened when a /work/* or /products/* page is shown
 *  - external_link_clicked (host only), contact_clicked for mailto:/tel: links
 * Renders nothing.
 */
export function AnalyticsEvents() {
  const pathname = usePathname();

  useEffect(() => {
    const work = pathname.match(/^\/work\/([^/]+)/);
    if (work) track('case_study_opened', { case_study: work[1] });
    const product = pathname.match(/^\/products\/([^/]+)/);
    if (product) track('product_opened', { product: product[1] });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute('href') ?? '';
      if (href.startsWith('mailto:')) return track('contact_clicked', { method: 'email' });
      if (href.startsWith('tel:')) return track('contact_clicked', { method: 'phone' });
      try {
        const url = new URL(href, window.location.href);
        const bare = (host: string) => host.replace(/^www\./, '');
        if (/^https?:$/.test(url.protocol) && bare(url.hostname) !== bare(window.location.hostname)) {
          track('external_link_clicked', { host: url.hostname.replace(/^www\./, '') });
        }
      } catch {
        // malformed href — ignore
      }
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}

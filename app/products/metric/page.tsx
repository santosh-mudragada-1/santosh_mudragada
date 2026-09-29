import type { Metadata } from 'next';
import { MetricShowcase } from '@/components/Products/metric';
import '@/components/Products/metric/metric-theme.css';

export const metadata: Metadata = {
  title: 'Metric',
  description:
    'Metric — reflex and memory games, built for speed. A closer look at reaction time, aim training and the chimp test.',
  alternates: { canonical: '/products/metric' },
};

export default function MetricPage() {
  return (
    <>
      {/* Metric's own type system — vendored alongside its components rather
          than the site's Bricolage/Noto stack, so the showcase reads as the
          product, not the portfolio. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- the no-page-custom-font
          rule predates the App Router's support for hoisting <link> from anywhere in a
          Server Component's tree; this is the documented pattern for a third-party font
          scoped to one route, not the pages/_document.js case the rule is guarding against. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wdth,wght@6..144,75..100,100..1000&family=IBM+Plex+Mono:wght@500;600;700&display=swap"
      />
      <main>
        <MetricShowcase />
      </main>
    </>
  );
}

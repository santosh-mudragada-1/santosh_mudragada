import type { Metadata } from 'next';
import { InkriotShowcase } from '@/components/Products/inkriot';
import '@/components/Products/inkriot/inkriot-theme.css';

export const metadata: Metadata = {
  title: 'InkRiot',
  description:
    'InkRiot — draw, guess, chaos. A fast, social drawing-and-guessing party game with an original visual identity.',
  alternates: { canonical: '/products/inkriot' },
};

export default function InkriotPage() {
  return (
    <>
      {/* InkRiot's own type system — vendored alongside its components rather
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
        href="https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Gochi+Hand&family=Nunito:wght@500;600;700;800&display=swap"
      />
      <main>
        <InkriotShowcase />
      </main>
    </>
  );
}

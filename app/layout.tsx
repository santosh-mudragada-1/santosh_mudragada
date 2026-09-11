import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import {
  Bricolage_Grotesque,
  Erica_One,
  Noto_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from 'next/font/google';

import '@/styles/globals.scss';
import { Providers } from '@/lib/providers';
import { Preloader } from '@/components/Preloader';
import { ScrollProgress } from '@/components/ScrollProgress';
import { Navigation } from '@/components/Navigation';
import { Menu } from '@/components/Menu';
import { Cursor } from '@/components/Cursor';
import { PageTransition } from '@/components/PageTransition';
import { SITE } from '@/lib/constants/site';

// --- Type system -----------------------------------------------------------
// Latin renders from Noto Sans; each Indic script falls through to its own
// metric-matched Noto family (see styles/_typography.scss --font-ui stack).
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

// accent face — used only to highlight words in the About/paint section
const erica = Erica_One({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-erica',
});

const sans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-sans',
  fallback: ['system-ui', 'arial'],
});

const notoTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-te',
  preload: false,
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-hi',
  preload: false,
});

const notoKannada = Noto_Sans_Kannada({
  subsets: ['kannada'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-kn',
  preload: false,
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-ta',
  preload: false,
});

const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ['malayalam'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-ml',
  preload: false,
});

const fontVars = [
  display,
  erica,
  sans,
  notoTelugu,
  notoDevanagari,
  notoKannada,
  notoTamil,
  notoMalayalam,
]
  .map((f) => f.variable)
  .join(' ');

// Real family names (next/font-generated) aligned to GREETINGS order — passed
// to the preloader so it can force-load each script before rendering it.
const greetingFontFamilies = [
  sans.style.fontFamily,
  sans.style.fontFamily,
  notoTelugu.style.fontFamily,
  notoDevanagari.style.fontFamily,
  notoKannada.style.fontFamily,
  notoTamil.style.fontFamily,
  notoMalayalam.style.fontFamily,
];

// --- Metadata ------------------------------------------------------------
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s — ${SITE.fullName}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.fullName }],
  openGraph: {
    type: 'website',
    title: SITE.name,
    description: SITE.description,
    siteName: SITE.name,
    url: SITE.url,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f0e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0b0a' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body>
        {/* If JS is disabled the preloader would never lift — hide it. */}
        <noscript>
          <style>{`.js-preloader{display:none!important}`}</style>
        </noscript>

        <Providers>
          <Preloader fontFamilies={greetingFontFamilies} />
          <ScrollProgress />
          <Navigation />
          <Menu />
          <Cursor />
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}

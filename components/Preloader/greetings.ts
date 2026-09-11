export type Greeting = {
  /** The word, exactly as supplied. */
  text: string;
  /** BCP-47 tag for the `lang` attribute (helps shaping + a11y). */
  lang: string;
  /**
   * Per-script optical size multiplier. Indic scripts carry more vertical
   * mass than Latin at the same point size; these trim them back so the
   * apparent footprint stays constant and nothing jumps between words.
   * Tunable — verify against the real rendered size.
   */
  sizeScale: number;
};

// Order matters: the layout builds a matching array of next/font family names
// (greetingFontFamilies) index-for-index with this list.
export const GREETINGS: Greeting[] = [
  { text: 'Hello', lang: 'en', sizeScale: 1 },
  { text: 'Bonjour', lang: 'fr', sizeScale: 1 },
  { text: 'నమస్కారం', lang: 'te', sizeScale: 0.9 },
  { text: 'नमस्ते', lang: 'hi', sizeScale: 0.98 },
  { text: 'ನಮಸ್ಕಾರ', lang: 'kn', sizeScale: 0.9 },
  { text: 'வணக்கம்', lang: 'ta', sizeScale: 0.88 },
  { text: 'നമസ്കാരം', lang: 'ml', sizeScale: 0.88 },
];

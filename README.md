# Design with Santosh — portfolio

Personal portfolio for **Santosh Mudragada**, Product Designer & Builder.
Next.js App Router · TypeScript · Sass · GSAP · Framer Motion · Lenis.

> **Status: Stage 1 (foundation + preloader).** Hero, Work, Products, Gallery,
> About, Contact and Footer are not built yet. `/work`, `/about`, `/contact` are
> route scaffolds.

## Scripts

| command | what it does |
| --- | --- |
| `npm run dev` | dev server (http://localhost:3000) |
| `npm run build` | production build |
| `npm run start` | serve the production build |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` |

Node ≥ 18.17.

## Architecture

```
app/                     App Router. layout.tsx wires fonts + providers + preloader.
  page.tsx               Stage 1 scaffold landing (not the real hero).
  work|about|contact/    route scaffolds for Stage 2 page transitions.
components/
  Preloader/             greeting sequence + orange curved SVG wipe (Framer).
  ScrollProgress/        top progress bar — also the Lenis↔ScrollTrigger proof (GSAP).
lib/
  gsap/gsap.ts           single GSAP entry point — plugins registered once here.
  motion/config.ts       shared Framer eases / durations / variants.
  smooth-scroll/         Lenis provider + the ScrollTrigger bridge + useSmoothScroll().
  hooks/                 useMediaQuery, usePrefersReducedMotion, useIsomorphicLayoutEffect.
  providers.tsx          single client provider boundary.
  constants/site.ts      site metadata, nav links, socials.
styles/
  _variables.scss        Sass-only tokens (breakpoints, z-scale, easing). Safe to @use anywhere.
  _mixins.scss           mq(), hover(), reduced-motion(), container(), ...
  _reset.scss            modern minimal reset.
  _typography.scss       type scale + the multi-script font stack.
  globals.scss           :root design tokens (the orange identity), base, Lenis CSS.
references/               READ-ONLY. Study/adapt, never import.
```

`styles/` is on the Sass load path (`next.config.mjs`), so any module does
`@use 'mixins' as *;` / `@use 'variables' as *;` with no relative paths.

## Animation ownership (do not cross the streams)

- **GSAP + ScrollTrigger** — scroll-linked / scrubbed animation, SVG path
  drawing, parallax, image distortion, continuous motion. Scrubbed tweens use
  `scrub: true` (never a numeric lag) so they stay locked to scroll position.
- **Framer Motion** — menu transitions, page transitions, preloader states,
  small React UI transitions, presence/layout.
- One element has exactly one animation owner.
- No React state updates on pointer/scroll frames — write to refs / CSS vars /
  `gsap.set` / motion values.
- `prefers-reduced-motion` is respected in CSS (global damping) and branched in
  JS (`usePrefersReducedMotion`) — Lenis is not created at all in that mode.

## Smooth scroll ↔ ScrollTrigger

`lib/smooth-scroll/SmoothScrollProvider.tsx` owns the single Lenis instance:

1. `lenis.on('scroll', ScrollTrigger.update)` — every Lenis frame updates ST.
2. `gsap.ticker.add((t) => lenis.raf(t * 1000))` + `gsap.ticker.lagSmoothing(0)`
   — one rAF loop for the whole app, GSAP drives Lenis.
3. `ScrollTrigger.refresh()` on mount and on `window` load.
4. Full teardown on unmount (ticker callback removed, listeners off,
   `lenis.destroy()`).

Consume via `useSmoothScroll()` → `{ lenis, scrollTo, stop, start }`
(`scrollTo` falls back to native `window.scrollTo` when Lenis is absent).

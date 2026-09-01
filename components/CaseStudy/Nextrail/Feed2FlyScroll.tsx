'use client';

import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './Feed2FlyScroll.module.scss';

const V = '/nextrail_casestudy/video';
const U = '/nextrail_casestudy/ui';

type Media =
  | { kind: 'video'; src: string; poster: string }
  | { kind: 'image'; src: string };

type Step = {
  n: string;
  lines: [string, string];
  copy: string;
  media: Media;
  /** what the device HUD shows while this step is active */
  hud?: 'labels' | 'chain';
};

const STEPS: Step[] = [
  {
    n: '01',
    lines: ['See something', 'worth going to'],
    copy: 'You find a place, a stay, a viewpoint or a hidden spot while scrolling — a reel, a short, a clip from someone whose taste you trust.',
    media: { kind: 'video', src: `${V}/feed-home.mp4`, poster: `${V}/feed-home-poster.png` },
  },
  {
    n: '02',
    lines: ['Share what', 'inspires you'],
    copy: 'Instead of saving it somewhere you’ll forget, send it straight to Nextrail — from the same share sheet you already use.',
    media: { kind: 'video', src: `${V}/share-reel.mp4`, poster: `${V}/share-reel-poster.png` },
  },
  {
    n: '03',
    lines: ['We organise', 'the inspiration'],
    copy: 'Nextrail gathers everything you’ve sent and groups it by destination, so a scattered pile of links becomes one place you can work from.',
    media: { kind: 'image', src: `${U}/feed2fly-grid.png` },
    hud: 'labels',
  },
  {
    n: '04',
    lines: ['Turn it into', 'a trip'],
    copy: 'From there it’s a guided path — who’s going, when, and your budget — and the content you saved becomes a day-by-day plan.',
    media: { kind: 'image', src: `${U}/trip-summary.png` },
    hud: 'chain',
  },
];

// Grounded in what Feed2Fly actually does — group shared content by
// destination, vibe and source. Not invented AI extraction.
const LABELS: Array<[string, string]> = [
  ['Destination', 'Bali, Indonesia'],
  ['Vibe', 'Adventurous'],
  ['Source', 'Instagram reel'],
];

const CHAIN = ['Saved content', 'Destination', 'Places', 'Experiences', 'Your trip'];

function Hud({ kind, show }: { kind: 'labels' | 'chain'; show: boolean }) {
  return (
    <div className={styles.hud} data-kind={kind} data-show={show || undefined}>
      {kind === 'labels'
        ? LABELS.map(([k, v]) => (
            <div key={k} className={styles.hudRow}>
              <span className={styles.hudKey}>{k}</span>
              <span className={styles.hudVal}>{v}</span>
            </div>
          ))
        : CHAIN.map((c, i) => (
            <div key={c} className={styles.hudStep} data-last={i === CHAIN.length - 1 || undefined}>
              <i aria-hidden />
              {c}
            </div>
          ))}
    </div>
  );
}

function Frame({ media, active }: { media: Media; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) void v.play().catch(() => {});
    else v.pause();
  }, [active]);

  if (media.kind === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={styles.media}
        src={media.src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    );
  }

  return (
    <video
      ref={ref}
      className={styles.media}
      src={media.src}
      poster={media.poster}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

/**
 * "How Feed2Fly works" — four beats, one path.
 *
 * Desktop (≥lg): the copy scrolls past a sticky device; an IntersectionObserver
 * flips the active beat as each step crosses the viewport middle, and the device
 * cross-fades between screens. Steps 3–4 add a small HUD on the device.
 *
 * Below lg: no sticky. Each beat stacks with its own screen inline. Same
 * component, layout swapped purely by media query — nothing is scroll-hijacked.
 */
export function Feed2FlyScroll() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const wide = useMediaQuery('(min-width: 1024px)');
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
    if (!steps.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number((e.target as HTMLElement).dataset.step);
          if (!Number.isNaN(i)) setActive(i);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    steps.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.grid}>
        <div className={styles.copyCol}>
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={styles.step}
              data-step={i}
              data-active={active === i || undefined}
            >
              <div className={styles.stepText}>
                <p className={styles.stepN}>
                  <span>{s.n}</span> / 04
                </p>
                <h3 className={styles.stepTitle}>
                  {s.lines[0]}
                  <br />
                  {s.lines[1]}.
                </h3>
                <p className={styles.stepCopy}>{s.copy}</p>
              </div>

              {!wide && (
                <div className={styles.inlineMedia}>
                  <Frame media={s.media} active={!reduced && active === i} />
                  {s.hud && <Hud kind={s.hud} show />}
                </div>
              )}
            </div>
          ))}
        </div>

        {wide && (
          <div className={styles.deviceCol} aria-hidden>
            <div className={styles.device}>
              <div className={styles.stack}>
                {STEPS.map((s, i) => (
                  <div
                    key={s.n}
                    className={styles.layer}
                    data-active={active === i || undefined}
                  >
                    <Frame media={s.media} active={!reduced && active === i} />
                  </div>
                ))}
              </div>
              {STEPS.map(
                (s, i) =>
                  s.hud && (
                    <Hud key={s.n} kind={s.hud} show={active === i} />
                  ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import styles from './Feed2FlyScroll.module.scss';

const V = '/nextrail_casestudy/video';

type Media =
  | { kind: 'video'; src: string; poster: string }
  | { kind: 'image'; src: string };

type Step = {
  n: string;
  lines: [string, string];
  copy: string;
  media: Media;
};

// One clip per beat. Steps 3–4 currently reuse the nearest existing captures as
// placeholders — final videos get dropped in later; the shape and order stay.
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
    media: { kind: 'video', src: `${V}/share-organize.mp4`, poster: `${V}/share-organize-poster.png` },
  },
  {
    n: '04',
    lines: ['Turn it into', 'a trip'],
    copy: 'From there it’s a guided path — who’s going, when, and your budget — and the content you saved becomes a day-by-day plan.',
    media: { kind: 'video', src: `${V}/share-onboard.mp4`, poster: `${V}/share-onboard-poster.png` },
  },
];

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

function StepCopy({ step }: { step: Step }) {
  return (
    <>
      <p className={styles.stepN}>
        <span>{step.n}</span> / 04
      </p>
      <h3 className={styles.stepTitle}>
        {step.lines[0]}
        <br />
        {step.lines[1]}.
      </h3>
      <p className={styles.stepCopy}>{step.copy}</p>
    </>
  );
}

/**
 * "How Feed2Fly works" — four beats, one path.
 *
 * Desktop (≥lg): a sticky stage sits centred in the viewport with the step
 * copy above the phone and progress dots below. Invisible scroll-beats behind
 * it set the active step as their centre passes the viewport middle; the copy
 * and the phone clip cross-fade to match. Native scroll — nothing is pinned.
 *
 * Below lg: no sticky. Each beat stacks with its own copy and clip inline.
 */
export function Feed2FlyScroll() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const wide = useMediaQuery('(min-width: 1024px)');
  const [active, setActive] = useState(0);

  // whichever beat's centre is nearest the viewport centre wins — one
  // deterministic winner, no observer double-fires or skipped beats.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const beats = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
    if (!beats.length) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      beats.forEach((el) => {
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = Number(el.dataset.step) || 0;
        }
      });
      setActive((prev) => (prev === best ? prev : best));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [wide]);

  return (
    <div ref={rootRef} className={styles.root}>
      {wide ? (
        <div className={styles.grid}>
          <div className={styles.track} aria-hidden>
            {STEPS.map((s, i) => (
              <div key={s.n} className={styles.beat} data-step={i} />
            ))}
          </div>

          <div className={styles.stage}>
            <div className={styles.copy}>
              {STEPS.map((s, i) => (
                <div
                  key={s.n}
                  className={styles.copyItem}
                  data-active={active === i || undefined}
                >
                  <StepCopy step={s} />
                </div>
              ))}
            </div>

            <div className={styles.phone}>
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
            </div>

            <div className={styles.dots} aria-hidden>
              {STEPS.map((s, i) => (
                <span key={s.n} data-active={active === i || undefined} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {STEPS.map((s, i) => (
            <div key={s.n} className={styles.item} data-step={i}>
              <div className={styles.copyItem} data-active>
                <StepCopy step={s} />
              </div>
              <div className={styles.inlineMedia}>
                <Frame media={s.media} active={!reduced && active === i} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

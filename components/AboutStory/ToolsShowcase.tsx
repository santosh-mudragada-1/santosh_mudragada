'use client';

import { useMemo, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap/gsap';
import { Magnetic } from '@/components/Magnetic';
import { TOOLS, type ToolStage } from './story';
import aboutStyles from './AboutStory.module.scss';
import styles from './ToolsShowcase.module.scss';

type Tool = (typeof TOOLS.items)[number];

const STAGE_ORDER: ToolStage[] = ['THINK', 'DESIGN', 'MOVE', 'BUILD', 'SHIP'];

const byName = new Map(TOOLS.items.map((t) => [t.name, t]));

// rough half-width per size tier (px, at the tier's upper clamp bound plus
// hover scale) — just enough to keep the hover caption clear of the logo
// itself regardless of which tool is active.
const HALF_WIDTH: Record<Tool['size'], number> = { xl: 96, lg: 78, md: 62, sm: 46 };

/**
 * "From idea to interface." — the tools aren't a grid, they're one loose
 * composition: position + size stand in for the workflow (THINK → DESIGN →
 * MOVE → BUILD → SHIP), and hovering one quiets the rest instead of opening
 * a card. Desktop/large-screen only — see `.section` in the module for the
 * `lg`-breakpoint cutoff.
 *
 * The heading reuses the essay's own chapter/narration classes (from
 * AboutStory.module.scss) so it sits at chapter 09 exactly like every other
 * section — the composition below is the only bespoke part.
 *
 * Each tool is a positioned `.toolSlot` (GSAP owns its transform for the
 * one-time scroll assembly) wrapping a `.tool` button (CSS custom-property
 * driven rotate/scale/translate for hover) — kept as two elements on purpose:
 * GSAP consolidates any transform it touches into an inline `transform` and
 * zeroes the independent `translate`/`rotate`/`scale` properties afterwards,
 * which would otherwise permanently stomp the hover interaction.
 */
export function ToolsShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  const activeTool = active ? (byName.get(active) ?? null) : null;
  const isShipFlow = active === 'Vercel';
  const shipChain = TOOLS.shipChain;

  const activate = (name: string) => setActive(name);
  const deactivate = (name: string) => setActive((cur) => (cur === name ? null : cur));
  const toggle = (name: string) => setActive((cur) => (cur === name ? null : name));

  // direction-based nudge for every non-active tool, away from whichever
  // point is active — a few px, not a repel simulation
  const toolStyle = (t: Tool): React.CSSProperties => {
    const base = { '--rot': `${t.rotate}deg` } as React.CSSProperties;
    if (!activeTool || activeTool.name === t.name) return base;
    const dx = t.x - activeTool.x;
    const dy = t.y - activeTool.y;
    const dist = Math.hypot(dx, dy) || 1;
    const inChain = isShipFlow && shipChain.includes(t.name);
    return {
      ...base,
      '--push-x': `${(dx / dist) * 9}px`,
      '--push-y': `${(dy / dist) * 9}px`,
      '--rest-opacity': inChain ? 0.85 : 0.4,
    } as React.CSSProperties;
  };

  const lineOpacity = (a: string, b: string) => {
    if (!active) return undefined;
    if (active === a || active === b) return 0.4;
    if (isShipFlow) {
      const ia = shipChain.indexOf(a);
      const ib = shipChain.indexOf(b);
      if (ia !== -1 && ib !== -1 && Math.abs(ia - ib) === 1) return 0.3;
    }
    return 0.03;
  };

  const lineDelay = (a: string, b: string) => {
    if (!isShipFlow) return undefined;
    const ia = shipChain.indexOf(a);
    return ia === -1 ? undefined : `${ia * 70}ms`;
  };

  const infoStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!activeTool) return undefined;
    const clear = HALF_WIDTH[activeTool.size] + 16;
    const alignRight = activeTool.x < 58;
    const alignBottom = activeTool.y < 62;
    return {
      left: `${activeTool.x}%`,
      top: `${activeTool.y}%`,
      textAlign: alignRight ? 'left' : 'right',
      transform: `translate(${alignRight ? `${clear}px` : `calc(-100% - ${clear}px)`}, ${
        alignBottom ? '-10%' : '-90%'
      })`,
    };
  }, [activeTool]);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const grab = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, canvas);
        const groups = STAGE_ORDER.map((s) => grab(`[data-stage="${s}"]`));
        const lines = grab(`[data-line]`);

        gsap.set([...groups.flat(), lines].flat(), { autoAlpha: 0 });
        gsap.set(groups.flat(), { scale: 0.9 });
        gsap.set(groups[4], { y: 16, x: 10 }); // SHIP settles in from further out

        const tl = gsap.timeline({
          scrollTrigger: { trigger: canvas, start: 'top 78%', once: true },
          defaults: { ease: 'power3.out', duration: 0.9 },
        });

        tl.to(groups[1], { autoAlpha: 1, scale: 1, stagger: 0.1 }) // DESIGN
          .to(groups[0], { autoAlpha: 1, scale: 1, stagger: 0.08 }, '-=0.55') // THINK
          .to(groups[2], { autoAlpha: 1, scale: 1, stagger: 0.1 }, '-=0.55') // MOVE
          .to(groups[3], { autoAlpha: 1, scale: 1, stagger: 0.1 }, '-=0.55') // BUILD
          .to(groups[4], { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 1.1 }, '-=0.4') // SHIP
          .to(lines, { autoAlpha: 1, duration: 0.6 }, '-=0.6');

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: canvasRef },
  );

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="about-tools">
      <div className={aboutStyles.section}>
        <div id="about-tools">
          <header className={aboutStyles.chapter}>
            <span className={aboutStyles.chapterNo} data-reveal="">
              {TOOLS.chapter}
            </span>
            <h2 className={aboutStyles.chapterTitle}>
              {TOOLS.title.map((t, i) => (
                <span key={i} className={aboutStyles.chapterLine} data-reveal="">
                  {t}
                </span>
              ))}
            </h2>
          </header>
        </div>
        <div className={aboutStyles.narration}>
          {TOOLS.lines.map((l, i) => (
            <p key={i} className={aboutStyles.line} data-reveal="">
              {l}
            </p>
          ))}
        </div>
      </div>

      <div ref={canvasRef} className={styles.canvas}>
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {TOOLS.connections.map(([a, b]) => {
            const pa = byName.get(a)!;
            const pb = byName.get(b)!;
            return (
              <line
                key={`${a}-${b}`}
                data-line
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                style={{ opacity: lineOpacity(a, b), transitionDelay: lineDelay(a, b) }}
              />
            );
          })}
        </svg>

        {TOOLS.items.map((t) => (
          <div
            key={t.name}
            data-stage={t.stage}
            className={styles.toolSlot}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
          >
            <button
              type="button"
              className={styles.tool}
              data-size={t.size}
              style={toolStyle(t)}
              onMouseEnter={() => activate(t.name)}
              onMouseLeave={() => deactivate(t.name)}
              onFocus={() => activate(t.name)}
              onBlur={() => deactivate(t.name)}
              onClick={() => toggle(t.name)}
              aria-label={`${t.name} — ${t.stage.toLowerCase()}. ${t.blurb}`}
              aria-pressed={active === t.name}
            >
              <Magnetic strength={0.3} max={14} className={styles.magnet}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/tools/${t.logo}`}
                  alt=""
                  aria-hidden
                  className={styles.toolImg}
                  style={{ aspectRatio: String(t.ar) }}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </Magnetic>
            </button>
          </div>
        ))}

        {activeTool && (
          <div className={styles.info} style={infoStyle} aria-hidden>
            {activeTool.name === 'Vercel' && <span className={styles.infoStage}>SHIP</span>}
            <span className={styles.infoBlurb}>{activeTool.blurb}</span>
          </div>
        )}

        <p className={styles.detail}>{TOOLS.detail}</p>
      </div>
    </section>
  );
}

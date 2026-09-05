'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap/gsap';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { PersonaNotebookDesktop } from './PersonaNotebookDesktop';
import { PersonaNotebookMobile } from './PersonaNotebookMobile';
import styles from './PersonaNotebook.module.scss';

/* -------------------------------------------------------------------------- */
/*  The discovery notebook — the persona as the research artefact it came from. */
/*                                                                            */
/*  Layouts live next door (desktop spread, phone page); this owns the pen     */
/*  work they share. Nothing waits for a scroll trigger: the page is already   */
/*  written when you reach it. Everything is visible in CSS first, so a JS     */
/*  failure costs the animation and nothing else.                             */
/* -------------------------------------------------------------------------- */

export function PersonaNotebook() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!root.current || reduced) return;
      const q = gsap.utils.selector(root);

      const rules = q('[data-rule]') as unknown as SVGPathElement[];
      const lens = rules.map((p) => p.getTotalLength() || 1);
      rules.forEach((p, i) =>
        gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i] }),
      );

      const marks = q('[data-mark]') as HTMLElement[];
      gsap.set(marks, { backgroundSize: '55% 100%, 0% 100%' });

      const doodles = q('[data-doodle]') as HTMLElement[];
      gsap.set(doodles, { clipPath: 'inset(0 100% 0 0)' });

      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power2.out' } });
      tl.to(rules, { strokeDashoffset: 0, duration: 0.5, stagger: 0.03 })
        .to(doodles, { clipPath: 'inset(0 0% 0 0)', duration: 0.4, stagger: 0.04 }, '-=0.45')
        .to(
          marks,
          { backgroundSize: '55% 100%, 100% 100%', duration: 0.4, stagger: 0.03 },
          '-=0.3',
        );
    },
    { scope: root, dependencies: [reduced] },
  );

  /** One sheen across a highlight, the first time it's hovered. */
  const sheen = (e: React.PointerEvent<HTMLElement>) => {
    const t = (e.target as HTMLElement).closest?.('[data-mark]') as HTMLElement | null;
    if (!t || t.dataset.sheened) return;
    t.dataset.sheened = '1';
    t.classList.add(styles.sheen);
  };

  return (
    <div ref={root} onPointerOver={sheen} className={styles.wrap}>
      <PersonaNotebookDesktop />
      <PersonaNotebookMobile />
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap/gsap';
import { Magnetic } from '@/components/Magnetic';
import { useMenu } from '@/lib/menu/MenuProvider';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { Wordmark } from './Wordmark';
import { NavLinks } from './NavLinks';
import styles from './Navigation.module.scss';

export function Navigation() {
  const { isOpen, toggle } = useMenu();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  // below lg the inline links are hidden — the burger is the only nav
  const compact = useMediaQuery('(max-width: 1023.98px)');

  const linksRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLButtonElement>(null);

  // Dennis-style: at the top the primary links show; once past the first
  // section the links fade out and a round menu button scale-pops in (fast,
  // ~0.3s). Reversible on every crossing, tied to the real section boundary.
  useGSAP(
    () => {
      const links = linksRef.current;
      const circle = circleRef.current;
      if (!links || !circle) return;

      // compact: no inline links, burger always present — skip the scroll swap
      if (compact) {
        gsap.set(links, { autoAlpha: 0 }); // burger shown via CSS (!important)
        return;
      }

      const d = reduced ? 0.001 : undefined;
      const show = () => {
        gsap.to(links, { autoAlpha: 0, duration: d ?? 0.3, ease: 'power2.out' });
        gsap.to(circle, {
          scale: 1,
          duration: d ?? 0.32,
          ease: 'back.out(1.7)',
        });
      };
      const hide = () => {
        gsap.to(links, { autoAlpha: 1, duration: d ?? 0.3, ease: 'power2.out' });
        gsap.to(circle, { scale: 0, duration: d ?? 0.24, ease: 'power2.in' });
      };

      const boundary =
        document.querySelector<HTMLElement>('[data-nav-boundary]') ??
        document.documentElement;
      const isFallback = boundary === document.documentElement;

      const st = ScrollTrigger.create({
        trigger: boundary,
        start: isFallback
          ? () => `${Math.round(window.innerHeight * 0.85)} top`
          : 'bottom 80px',
        invalidateOnRefresh: true,
        onEnter: show,
        onLeaveBack: hide,
      });

      // Snap to whatever the CURRENT scroll dictates — never assume "links".
      // A page transition lands at the top, but ScrollTrigger's create-time
      // state has been unreliable right after a route change, so derive it
      // from the real scroll position vs the trigger start.
      const applyResting = () => {
        const past = window.scrollY >= st.start - 1;
        gsap.set(links, { autoAlpha: past ? 0 : 1 });
        gsap.set(circle, { scale: past ? 1 : 0 });
      };
      applyResting();

      // re-assert once the page transition has fully settled at scroll 0
      const onTransitionDone = () => {
        st.refresh();
        applyResting();
      };
      window.addEventListener('transition:complete', onTransitionDone);

      return () => {
        st.kill();
        window.removeEventListener('transition:complete', onTransitionDone);
        gsap.set([links, circle], { clearProps: 'all' });
      };
    },
    { dependencies: [pathname, reduced, compact] },
  );

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Wordmark />

        <div ref={linksRef} className={styles.linksSlot}>
          <NavLinks />
        </div>
      </div>

      <Magnetic strength={0.2} className={styles.circleMag}>
        <button
          ref={circleRef}
          type="button"
          className={styles.circle}
          data-cursor-sticky
          data-cursor-reveal
          data-cursor-reveal-dark
          data-cursor-reveal-icon="burger"
          data-cursor-reveal-open={isOpen || undefined}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          onClick={toggle}
        >
          <span
            className={styles.circleBurger}
            data-open={isOpen || undefined}
            aria-hidden
          >
            <span />
            <span />
          </span>
        </button>
      </Magnetic>
    </header>
  );
}

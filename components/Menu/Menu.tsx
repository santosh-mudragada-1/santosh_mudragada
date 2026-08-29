'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useMenu } from '@/lib/menu/MenuProvider';
import { useSmoothScroll } from '@/lib/smooth-scroll';
import { SOCIALS } from '@/lib/constants/site';
import { MenuCurve } from './MenuCurve';
import { MenuLink } from './MenuLink';
import { fadeInLate, menuSlide } from './anim';
import styles from './Menu.module.scss';

const LINKS = [
  { title: 'Home', href: '/' },
  { title: 'Work', href: '/work' },
  { title: 'About', href: '/about' },
  { title: 'Contact', href: '/contact' },
];

export function Menu() {
  const { isOpen, close } = useMenu();
  const { stop, start } = useSmoothScroll();
  const pathname = usePathname();
  const [active, setActive] = useState(pathname);

  // Close on route change — links also close on click; this is the backstop
  // for browser back/forward.
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Scroll lock + Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.classList.add('menu-open');
    stop();
    setActive(pathname);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.documentElement.classList.remove('menu-open');
      start();
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, pathname, close, start, stop]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="menu"
          className={styles.root}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={close}
          />

          <motion.aside
            className={styles.panel}
            variants={menuSlide}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <MenuCurve />

            <div className={styles.body}>
              <nav
                className={styles.nav}
                onMouseLeave={() => setActive(pathname)}
              >
                <p className={styles.heading}>Navigation</p>
                {LINKS.map((link, i) => (
                  <MenuLink
                    key={link.href}
                    {...link}
                    index={i}
                    active={active === link.href}
                    onHover={setActive}
                    onClick={close}
                  />
                ))}
              </nav>

              <motion.div
                className={styles.footer}
                variants={fadeInLate}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                <span className={styles.footerLabel}>Elsewhere</span>
                <div className={styles.socials}>
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      className={styles.social}
                      data-cursor="link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import Link from 'next/link';
import { Magnetic } from '@/components/Magnetic';
import { NAV_LINKS } from '@/lib/constants/site';
import styles from './Navigation.module.scss';

/** Top-of-page primary links. Cross-fades to the menu trigger on scroll. */
export function NavLinks() {
  return (
    <nav className={styles.navLinks} aria-label="Primary">
      {NAV_LINKS.map((link) => (
        <Magnetic key={link.href} strength={0.15}>
          <Link href={link.href} className={styles.navLink}>
            {link.label}
            <span className={styles.navDot} aria-hidden />
          </Link>
        </Magnetic>
      ))}
    </nav>
  );
}

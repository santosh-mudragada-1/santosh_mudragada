'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Magnetic } from '@/components/Magnetic';
import { useWorkNav } from '@/lib/hooks/useWorkNav';
import { NAV_LINKS } from '@/lib/constants/site';
import styles from './Navigation.module.scss';

/** Top-of-page primary links. Cross-fades to the menu trigger on scroll. */
export function NavLinks() {
  const onWorkNav = useWorkNav();
  const pathname = usePathname();

  return (
    <nav className={styles.navLinks} aria-label="Primary">
      {NAV_LINKS.map((link) => {
        const isHash = link.href.includes('#');
        // Hash links (e.g. "/#work") point at a section of the homepage
        // rather than a distinct page, so they never carry aria-current.
        const isCurrent = !isHash && pathname === link.href;
        return (
          <Magnetic key={link.href} strength={0.15}>
            <Link
              href={link.href}
              className={styles.navLink}
              scroll={!isHash}
              onClick={isHash ? onWorkNav : undefined}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {link.label}
              <span className={styles.navDot} aria-hidden />
            </Link>
          </Magnetic>
        );
      })}
    </nav>
  );
}

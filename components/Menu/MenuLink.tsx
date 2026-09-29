'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Magnetic } from '@/components/Magnetic';
import { useHashNav } from '@/lib/hooks/useHashNav';
import { linkSlide, indicatorScale } from './anim';
import styles from './Menu.module.scss';

type MenuLinkProps = {
  title: string;
  href: string;
  index: number;
  active: boolean;
  onHover: (href: string) => void;
  onClick: () => void;
};

export function MenuLink({
  title,
  href,
  index,
  active,
  onHover,
  onClick,
}: MenuLinkProps) {
  const onHashNav = useHashNav();
  const isHash = href.includes('#');

  return (
    <motion.div
      className={styles.linkRow}
      custom={index}
      variants={linkSlide}
      initial="initial"
      animate="enter"
      exit="exit"
      onMouseEnter={() => onHover(href)}
    >
      <motion.span
        className={styles.indicator}
        variants={indicatorScale}
        animate={active ? 'open' : 'closed'}
        aria-hidden
      />
      <Magnetic strength={0.2}>
        <Link
          href={href}
          className={styles.link}
          data-cursor="link"
          data-cursor-sticky
          scroll={!isHash}
          onClick={(e) => {
            if (isHash) onHashNav(e);
            onClick();
          }}
        >
          {title}
        </Link>
      </Magnetic>
    </motion.div>
  );
}

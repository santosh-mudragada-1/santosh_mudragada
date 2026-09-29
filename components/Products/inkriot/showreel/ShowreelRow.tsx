'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useIsTouch } from '@/lib/hooks/useIsTouch';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import '../lib/animation/gsapConfig';
import { FeatureCard } from './FeatureCard';
import type { FeatureEntry } from '../content/features';

interface ShowreelRowProps {
  eyebrow: string;
  title: string;
  description: string;
  features: FeatureEntry[];
}

// Tuned so the row's full loop takes roughly this many seconds per card.
const SECONDS_PER_CARD = 4.2;

export function ShowreelRow({ eyebrow, title, description, features }: ShowreelRowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      gsap.fromTo(
        sectionRef.current!.querySelectorAll('[data-reveal]'),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
        },
      );

      const track = trackRef.current;
      if (isTouch || reduced || !track) return () => {};

      const distance = track.scrollWidth / 2;
      const duration = features.length * SECONDS_PER_CARD;
      const tween = gsap.fromTo(track, { x: 0 }, { x: -distance, duration, ease: 'none', repeat: -1 });

      const pause = () => tween.pause();
      const resume = () => tween.play();
      track.addEventListener('mouseenter', pause);
      track.addEventListener('mouseleave', resume);

      return () => {
        track.removeEventListener('mouseenter', pause);
        track.removeEventListener('mouseleave', resume);
      };
    },
    { scope: sectionRef, dependencies: [isTouch, reduced, features] },
  );

  const items = isTouch || reduced ? features : [...features, ...features];

  return (
    <section ref={sectionRef} className="flex flex-col gap-6 py-4">
      <div data-reveal className="flex flex-col gap-2 px-[var(--gutter)]">
        <span className="font-sans text-xs font-bold tracking-[0.16em] text-ink-faint uppercase">{eyebrow}</span>
        <h2 className="font-display text-2xl text-ink lowercase sm:text-3xl">{title}</h2>
        <p className="max-w-md text-sm leading-relaxed text-ink-soft">{description}</p>
      </div>

      <div
        data-reveal
        className={`py-3 pl-[var(--gutter)] ${isTouch ? 'overflow-x-auto' : 'overflow-x-hidden'}`}
        style={isTouch ? { scrollSnapType: 'x proximity' } : undefined}
      >
        <div ref={trackRef} className="flex w-max gap-4 will-change-transform">
          {items.map((feature, i) => (
            <FeatureCard key={`${feature.name}-${i}`} feature={feature} index={i % features.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

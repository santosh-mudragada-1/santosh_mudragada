'use client';

import { type ButtonHTMLAttributes, type MouseEvent, type PointerEvent, forwardRef } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { useAnimation } from '../hooks/useAnimation';
import { hoverIn, hoverOut, pressDown, pressUp } from '../lib/animation/presets';
import { playClick, playHover } from '../lib/sound/sfx';

type Variant = 'primary' | 'ghost';
type Size = 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  silent?: boolean;
  /** Appends a trailing chevron, for "Play X ›" style action pills */
  chevron?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-tomato text-paper border-[3px] border-ink shadow-[var(--shadow-pop)] hover:brightness-105',
  ghost: 'bg-transparent text-ink border-[3px] border-ink hover:bg-[var(--color-bg-raised)]',
};

const SIZE_CLASSES: Record<Size, string> = {
  md: 'h-11 px-5 text-sm gap-1.5',
  lg: 'h-14 px-8 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    silent,
    chevron,
    className = '',
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onMouseEnter,
    onClick,
    children,
    ...props
  },
  forwardedRef,
) {
  const { scope, run } = useAnimation<HTMLButtonElement>();

  return (
    <button
      ref={(node) => {
        scope.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={`inline-flex items-center justify-center rounded-full font-display font-semibold
        transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none
        cursor-pointer select-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      onPointerDown={run((e: PointerEvent<HTMLButtonElement>) => {
        pressDown(scope.current);
        onPointerDown?.(e);
      })}
      onPointerUp={run((e: PointerEvent<HTMLButtonElement>) => {
        pressUp(scope.current);
        onPointerUp?.(e);
      })}
      onPointerLeave={run((e: PointerEvent<HTMLButtonElement>) => {
        pressUp(scope.current);
        onPointerLeave?.(e);
      })}
      onMouseEnter={run((e: MouseEvent<HTMLButtonElement>) => {
        hoverIn(scope.current);
        if (!silent) playHover();
        onMouseEnter?.(e);
      })}
      onMouseLeave={run(() => hoverOut(scope.current))}
      onClick={(e) => {
        if (!silent) playClick();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
      {chevron && <ChevronRightIcon className="-mr-1 h-4 w-4" />}
    </button>
  );
});

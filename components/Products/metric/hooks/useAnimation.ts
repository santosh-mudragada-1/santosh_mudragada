import { useRef } from 'react';
import { useGSAP } from '@gsap/react';

export function useAnimation<T extends HTMLElement = HTMLDivElement>() {
  const scope = useRef<T | null>(null);
  const { contextSafe } = useGSAP({ scope });
  return { scope, run: contextSafe };
}

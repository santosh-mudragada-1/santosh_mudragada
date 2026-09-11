import { useEffect, useState } from 'react';

/** Viewport size, updated on resize. `{ w: 0, h: 0 }` until mounted. */
export function useWindowSize() {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

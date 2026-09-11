import { WORK } from '@/lib/content/work';

const LABELS: Record<string, string> = {
  '/': 'Home',
  '/work': 'Selected Work',
  '/about': 'About',
  '/contact': 'Contact',
  '/resume': 'Resume',
};

export function routeLabel(pathname: string): string {
  if (LABELS[pathname]) return LABELS[pathname];

  // Case studies live at /work/<slug> — show the project's real title
  // ("ClearHost", "Nextrail", "Chess.com"), not the "Work" section fallback.
  const project = WORK.find((p) => p.href === pathname);
  if (project) return project.title;

  const seg = pathname.split('/').filter(Boolean)[0] ?? '';
  return seg ? seg[0].toUpperCase() + seg.slice(1) : 'Home';
}

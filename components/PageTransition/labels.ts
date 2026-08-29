const LABELS: Record<string, string> = {
  '/': 'Home',
  '/work': 'Selected Work',
  '/about': 'About',
  '/contact': 'Contact',
};

export function routeLabel(pathname: string): string {
  if (LABELS[pathname]) return LABELS[pathname];
  const seg = pathname.split('/').filter(Boolean)[0] ?? '';
  return seg ? seg[0].toUpperCase() + seg.slice(1) : 'Home';
}

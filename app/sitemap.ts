import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants/site';

const ROUTES = [
  '',
  '/about',
  '/contact',
  '/resume',
  '/work',
  '/work/clearhost',
  '/work/nextrail',
  '/work/chess-com',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
  }));
}

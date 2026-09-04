import type { Metadata } from 'next';
import { AboutEditorial } from '@/components/AboutEditorial';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About',
  description: 'A little about Santosh Mudragada — beyond the design work.',
};

export default function AboutPage() {
  return (
    <>
      <main>
        <AboutEditorial />
      </main>
      <Footer />
    </>
  );
}

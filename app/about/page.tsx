import type { Metadata } from 'next';
import { About } from '@/components/About';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About',
  description: 'A little about Santosh Mudragada — beyond the design work.',
};

export default function AboutPage() {
  return (
    <>
      <main>
        <About />
      </main>
      <Footer />
    </>
  );
}

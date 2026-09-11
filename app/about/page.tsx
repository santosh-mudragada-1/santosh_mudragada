import type { Metadata } from 'next';
import { AboutStory } from '@/components/AboutStory';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About',
  description:
    "There's more to Santosh Mudragada than the design work. A visual essay: an engineering start, the people, travel, photography, slow mornings and quiet ones.",
};

export default function AboutPage() {
  return (
    <>
      <main>
        <AboutStory />
      </main>
      <Footer />
    </>
  );
}

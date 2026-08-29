import type { Metadata } from 'next';
import { SelectedWork } from '@/components/Work';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Selected product design work by Santosh Mudragada.',
};

export default function WorkPage() {
  return (
    <>
      <main>
        <SelectedWork />
      </main>
      <Footer />
    </>
  );
}

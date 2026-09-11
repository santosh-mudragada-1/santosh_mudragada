import type { Metadata } from 'next';
import { WorkShowcaseV2 } from '@/components/WorkShowcaseV2';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Selected product design work by Santosh Mudragada.',
};

export default function WorkPage() {
  return (
    <>
      <main>
        <WorkShowcaseV2 />
      </main>
      <Footer />
    </>
  );
}

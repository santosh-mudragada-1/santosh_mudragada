import type { Metadata } from 'next';
import { Resume } from '@/components/Resume';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Resume',
  description:
    'A concise overview of Santosh Mudragada — experience, selected work, education and design background. Download the PDF.',
};

export default function ResumePage() {
  return (
    <>
      <main>
        <Resume />
      </main>
      <Footer />
    </>
  );
}

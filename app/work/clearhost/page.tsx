import type { Metadata } from 'next';
import { Clearhost } from '@/components/CaseStudy/Clearhost';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: "ClearHost — the OS for India's independent hosts",
  description:
    'A product-design story: taking ClearHost from field research with homestay owners to a Channex-certified platform — the opportunity, the decisions, the tradeoffs, and what I learned. Case study by Santosh Mudragada.',
};

export default function ClearhostCaseStudyPage() {
  return (
    <>
      <main>
        <Clearhost />
      </main>
      <Footer />
    </>
  );
}

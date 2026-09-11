import type { Metadata } from 'next';
import { Nextrail } from '@/components/CaseStudy/Nextrail';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Nextrail — Feed2Fly',
  description:
    'A group product-design project exploring how AI can turn saved travel inspiration into an actual trip. Feed2Fly takes the reels and videos you already save and organises them into a plan. Case study by Santosh Mudragada.',
};

export default function NextrailCaseStudyPage() {
  return (
    <>
      <main>
        <Nextrail />
      </main>
      <Footer />
    </>
  );
}

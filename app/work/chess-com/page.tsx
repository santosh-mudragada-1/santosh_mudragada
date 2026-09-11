import type { Metadata } from 'next';
import { ChessCom } from '@/components/CaseStudy/ChessCom';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Chess.com — Game-Based Puzzles',
  description:
    'An independent design concept for Chess.com: your own blunders, detected by the engine and handed back as fair, verified puzzles. Product design case study by Santosh Mudragada.',
};

export default function ChessComCaseStudyPage() {
  return (
    <>
      <main>
        <ChessCom />
      </main>
      <Footer />
    </>
  );
}

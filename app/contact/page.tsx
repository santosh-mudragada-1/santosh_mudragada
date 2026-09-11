import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Contact',
  description: "Let's make something — get in touch with Santosh Mudragada.",
};

// Contact lives in the footer now; this route just surfaces it full-screen.
export default function ContactPage() {
  return (
    <>
      <main>
        <h1
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            margin: -1,
            padding: 0,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Contact
        </h1>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import { Contact } from '@/components/Contact';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Santosh Mudragada, product designer and builder. Let’s make something.',
};

// Standalone — deliberately ends without the site <Footer>.
export default function ContactPage() {
  return (
    <main>
      <Contact />
    </main>
  );
}

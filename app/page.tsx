import { Hero } from '@/components/Hero';
import { SelectedWork } from '@/components/Work';
import { Gallery } from '@/components/Gallery';
import { About } from '@/components/About';
import { Footer } from '@/components/Footer';

// NOTE: <Products /> is hidden for now — bring it back here when it returns.
// import { Products } from '@/components/Products';

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <SelectedWork />
        <About />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}

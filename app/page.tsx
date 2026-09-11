import { Hero } from '@/components/Hero';
import { WorkShowcaseV2 } from '@/components/WorkShowcaseV2';
import { Gallery } from '@/components/Gallery';
import { About } from '@/components/About';
import { Footer } from '@/components/Footer';
import { HashScroll } from '@/components/HashScroll';

// NOTE: <Products /> is hidden for now — bring it back here when it returns.
// import { Products } from '@/components/Products';

export default function HomePage() {
  return (
    <>
      <HashScroll />
      <main>
        <Hero />
        <WorkShowcaseV2 />
        <About />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}

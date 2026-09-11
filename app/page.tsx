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
      {/* HeroReveal only renders the with-background photo (its heaviest
          asset) once `mounted` flips true post-hydration — the SVG <image>/
          <img> tag isn't in the server-rendered HTML for the browser's
          preload scanner to find. Hint it explicitly so the fetch starts
          alongside the JS bundle instead of after hydration completes.
          Skipped under ~640px: phones never render this layer at all
          (see HeroReveal's `mobile` gate) — no point fetching it there. */}
      <link
        rel="preload"
        as="image"
        href="/images/hero-bg.webp"
        fetchPriority="high"
        media="(min-width: 640px)"
      />
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

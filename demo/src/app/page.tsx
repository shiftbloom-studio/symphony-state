import Link from "next/link";

import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { LiveWidget } from "@/components/landing/LiveWidget";
import { OrchestraVisual } from "@/components/landing/OrchestraVisual";
import { Footer } from "@/components/shared/Footer";
import { Navigation } from "@/components/shared/Navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <OrchestraVisual />
        <div id="demo" className="scroll-mt-16">
          <LiveWidget />
        </div>
        <Features />

        <section className="bg-paper-warm" aria-labelledby="closing-title">
          <div className="mx-auto grid max-w-[100rem] gap-10 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28 lg:px-14 2xl:px-20">
            <p className="brand-label text-root-red md:col-span-3">Get started / 04</p>
            <div className="md:col-span-8 md:col-start-5">
              <h2
                id="closing-title"
                className="brand-display text-[clamp(2.4rem,4.5vw,4.5rem)] font-semibold leading-[0.95] text-ink"
              >
                Try it on a real screen before you add it to yours.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary">
                The inventory demo wires 24 products to a slow, sometimes wrong server, filters in the
                URL and a selection that survives reloads. Break it on purpose and watch how it recovers.
                The code is on GitHub, and issues and pull requests are welcome.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/demo/inventory" className="brand-button">
                  Open the inventory demo
                </Link>
                <Link href="/playground" className="brand-button-quiet">
                  Open the playground
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

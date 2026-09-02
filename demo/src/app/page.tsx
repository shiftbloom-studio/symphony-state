import Link from "next/link";

import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { LiveWidget } from "@/components/landing/LiveWidget";
import { OrchestraVisual } from "@/components/landing/OrchestraVisual";
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

        <section className="bg-root-red text-paper" aria-labelledby="closing-title">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28 lg:px-14">
            <p className="brand-label md:col-span-3">Open by default / 05</p>
            <div className="md:col-span-8 md:col-start-5">
              <h2
                id="closing-title"
                className="brand-display text-[clamp(2.8rem,6vw,6rem)] font-semibold leading-[0.92]"
              >
                We grow in public. We ship the work. We leave the door open.
              </h2>
              <div className="mt-9 flex flex-wrap items-center gap-7">
                <Link
                  href="/demo/inventory"
                  className="inline-flex min-h-11 items-center rounded-full bg-paper px-6 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-root-red transition-transform hover:-translate-y-0.5"
                >
                  Open the inventory demo
                </Link>
                <Link
                  href="/playground"
                  className="font-mono text-xs font-medium uppercase tracking-[0.14em] underline decoration-paper/50 underline-offset-4 hover:decoration-paper"
                >
                  Compose your own score →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-paper py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 text-xs text-text-muted md:grid-cols-12 md:px-10 lg:px-14">
          <div className="md:col-span-5">
            <p className="brand-display text-xl font-semibold text-ink">
              shiftbloom studio<span className="text-bloom-red">.</span>
            </p>
            <p className="mt-2 max-w-sm leading-5">
              An independent open digital studio in Hamburg. Public work, careful systems, room to grow.
            </p>
          </div>
          <p className="brand-label md:col-span-3 md:col-start-7">
            Symphony State · Apache-2.0
          </p>
          <div className="flex gap-5 md:col-span-3 md:justify-end">
            <Link href="/legal#impressum" className="brand-link">Impressum</Link>
            <Link href="/legal#datenschutz" className="brand-link">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

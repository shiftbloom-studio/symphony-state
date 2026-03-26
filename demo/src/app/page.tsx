import { Navigation } from "@/components/shared/Navigation";
import { Hero } from "@/components/landing/Hero";
import { OrchestraVisual } from "@/components/landing/OrchestraVisual";
import { LiveWidget } from "@/components/landing/LiveWidget";
import { Features } from "@/components/landing/Features";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <OrchestraVisual />
        <LiveWidget />
        <Features />

        {/* CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="mb-4 text-3xl font-bold text-text-primary">
              See it in action
            </h2>
            <p className="mb-8 text-lg text-text-secondary">
              An Inventory Dashboard that uses all four state sources, with a live Score panel showing every decision.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/demo/inventory"
                className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Open Inventory Demo
              </Link>
              <Link
                href="/playground"
                className="rounded-lg border border-border bg-surface-2 px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Open Playground
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

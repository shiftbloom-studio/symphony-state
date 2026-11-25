import Link from "next/link";

import { SourceBadge } from "@/components/shared/SourceBadge";
import type { SourceType } from "@/lib/types";

// Sprinkles: at most 7, only in the outer page margins, hidden below 1024px.
const sprinkles = [
  "left-[2.5%] top-[22%] h-1.5 w-1.5 rounded-full bg-root-red",
  "left-[1.5%] top-[68%] h-1 w-7 rotate-[-18deg] rounded-full bg-petal-pink",
  "right-[2.5%] top-[16%] h-2 w-2 rounded-full bg-bloom-red",
  "right-[1.5%] top-[52%] h-1 w-8 rotate-[62deg] rounded-full bg-root-red",
];

const code = `const filters = createUrlParamsAdapter(warehouseParams);
const stock = createQueryAdapter({ queryClient, queryKey: ["stock"] });
const selection = createAtomAdapter<string[]>([]);

const conductor = createConductor({
  sections: [
    defineSection({ key: "filters", source: filters }),
    defineSection({ key: "stock", source: stock }),
    defineSection({ key: "selection", source: selection }),
  ],
  derived: [
    defineDerivedSection({
      key: "lowStock",
      inputs: ["stock"],
      compute: (items) => items.filter((item) => item.qty < 20),
    }),
  ],
});`;

const score: { section: string; source: SourceType; value: string }[] = [
  { section: "filters", source: "url", value: "warehouse=hamburg" },
  { section: "stock", source: "server", value: "24 items, fetched 2s ago" },
  { section: "selection", source: "ui", value: "3 rows" },
  { section: "lowStock", source: "derived", value: "2 items" },
];

export const Hero = () => {
  return (
    <section
      className="relative isolate overflow-hidden border-b border-border bg-paper"
      aria-labelledby="hero-title"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {sprinkles.map((className, index) => (
          <span key={index} className={`sprinkle absolute ${className}`} />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-[100rem] grid-cols-1 items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-12 lg:gap-10 md:px-10 lg:px-14 2xl:px-20">
        <div className="relative z-10 lg:col-span-6">
          <p className="brand-label mb-6 text-root-red">Open-source React library</p>
          <h1
            id="hero-title"
            className="brand-display max-w-3xl text-[clamp(2.9rem,6.5vw,6.4rem)] font-semibold leading-[0.9] text-ink"
          >
            Every state source, <span className="whitespace-nowrap text-bloom-red">in concert.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-text-secondary">
            Most React apps keep state in four places at once: the server cache, component state,
            the URL and localStorage. Symphony State leaves each of them where it is and commits
            their updates together, so a screen never shows half of a change.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="#demo" className="brand-button">
              Try the live demo
            </Link>
            <a href="https://github.com/shiftbloom-studio/symphony-state" className="brand-button-quiet">
              Source on GitHub ↗
            </a>
          </div>
          <p className="mt-8 font-mono text-sm text-text-muted">
            npm install @shiftbloom-studio/symphony-state
          </p>
        </div>

        <figure className="lg:col-span-6" aria-label="Example: a conductor and the state it resolves">
          <div className="overflow-hidden rounded-2xl border border-ink/15 bg-ink text-paper">
            <div className="flex items-center justify-between border-b border-paper/15 px-5 py-3">
              <span className="font-mono text-xs text-paper/70">conductor.ts</span>
              <span className="font-mono text-xs text-paper/50">TypeScript</span>
            </div>
            <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-6 text-paper/90">
              <code>{code}</code>
            </pre>
          </div>
          <div className="-mt-px rounded-b-2xl border border-ink/15 bg-paper-warm px-5 py-4">
            <p className="mb-3 font-mono text-xs text-text-muted">What the conductor commits</p>
            <dl className="divide-y divide-ink/10">
              {score.map((row) => (
                <div key={row.section} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
                  <dt className="w-24 font-mono text-ink">{row.section}</dt>
                  <dd className="w-24">
                    <SourceBadge source={row.source} size="xs" />
                  </dd>
                  <dd className="min-w-0 flex-1 text-text-secondary">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figcaption className="mt-3 font-mono text-xs text-text-muted">
            React 19 · TypeScript · AGPL-3.0-or-later
          </figcaption>
        </figure>
      </div>
    </section>
  );
};

import Link from "next/link";

import { BloomMark } from "@/components/brand/BloomMark";

const sprinkles = [
  "left-[7%] top-[19%] h-1.5 w-1.5 rounded-full bg-root-red",
  "left-[17%] top-[73%] h-1 w-8 rotate-[-18deg] rounded-full bg-petal-pink",
  "left-[44%] top-[13%] h-1 w-5 rotate-[28deg] rounded-full bg-ink",
  "right-[8%] top-[17%] h-2 w-2 rounded-full bg-bloom-red",
  "right-[4%] top-[58%] h-1 w-9 rotate-[62deg] rounded-full bg-root-red",
  "bottom-[12%] right-[31%] h-1.5 w-1.5 rounded-full bg-petal-pink",
  "bottom-[8%] left-[49%] h-1 w-6 rotate-[-38deg] rounded-full bg-bloom-red",
];

export const Hero = () => {
  return (
    <section
      className="relative isolate overflow-hidden border-b border-border bg-paper"
      aria-labelledby="hero-title"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {sprinkles.map((className, index) => (
          <span key={index} className={`absolute ${className}`} />
        ))}
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-12 md:px-10 lg:gap-4 lg:px-14">
        <div className="relative z-10 md:col-span-7 lg:col-span-6">
          <p className="brand-label mb-7 text-root-red">
            Symphony State / Open source
          </p>
          <h1
            id="hero-title"
            className="brand-display max-w-3xl text-[clamp(3.35rem,8vw,7.8rem)] font-semibold leading-[0.86] text-ink"
          >
            Every state source,
            <span className="block text-bloom-red">in concert.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-text-secondary sm:text-xl">
            Compose server data, local UI, URL state, persistence, and optimistic updates with one predictable React hook.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link href="#demo" className="brand-button">
              Explore the live score
            </Link>
            <a
              href="https://github.com/shiftbloom-studio/symphony-state"
              className="brand-link font-mono text-xs font-medium uppercase tracking-[0.14em]"
            >
              Read the source ↗
            </a>
          </div>
        </div>

        <div className="relative flex items-center justify-center md:col-span-5 lg:col-span-6">
          <div className="relative aspect-square w-full max-w-[34rem]">
            <span
              className="brand-label absolute left-0 top-[7%] -rotate-6 text-text-muted"
              aria-hidden="true"
            >
              10 · 10 · 8 · 6
            </span>
            <BloomMark
              idPrefix="hero-bloom"
              title="The shiftbloom Bloom mark"
              className="bloom-unfurl h-full w-full"
            />
            <span
              className="brand-label absolute bottom-[4%] right-0 rotate-6 text-root-red"
              aria-hidden="true"
            >
              One source of truth
            </span>
          </div>
        </div>

        <p className="brand-label absolute bottom-5 left-6 text-text-muted md:left-10 lg:left-14">
          React 19 · TypeScript · Apache-2.0
        </p>
        <p
          className="brand-label absolute bottom-5 right-6 hidden text-text-muted [writing-mode:vertical-rl] md:block lg:right-8"
          aria-hidden="true"
        >
          Hamburg · 53.55° N, 9.99° E
        </p>
      </div>
    </section>
  );
};

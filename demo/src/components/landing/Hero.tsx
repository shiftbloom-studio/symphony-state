"use client";

import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-1.5 text-xs text-text-secondary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Coordination layer for modern fragmented state
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl">
            Symphony State orchestrates{" "}
            <span className="text-source-server">server cache</span>,{" "}
            <span className="text-source-ui">UI state</span>,{" "}
            <span className="text-source-url">URL params</span>, and{" "}
            <span className="text-source-persisted">browser persistence</span>
            <br />
            without forcing a monolithic global store.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
            Not another state library. A conductor that lets each source play its part,
            resolves conflicts with clear precedence, and makes every decision observable.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/demo/inventory"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Live Demo
            </Link>
            <Link
              href="/playground"
              className="rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary"
            >
              Playground
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

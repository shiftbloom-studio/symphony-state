"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createConductor,
  createAtomAdapter,
  defineSection,
  defineDerivedSection,
} from "@shiftbloom-studio/symphony-state";
import type { Conductor } from "@shiftbloom-studio/symphony-state";
import { SourceBadge } from "../shared/SourceBadge";

type EventEntry = {
  id: number;
  source: "server" | "ui" | "url" | "derived";
  label: string;
  time: number;
};

const ALL_ITEMS = [
  "Wireless Headphones",
  "USB-C Hub",
  "Mechanical Keyboard",
  "4K Webcam",
  "Portable SSD",
  "Smart Speaker",
  "Monitor Arm",
  "Standing Desk",
];

type GuideStep = {
  instruction: string;
  detail: string;
  check: (state: { filter: string; events: EventEntry[]; loading: boolean; delay: number }) => boolean;
};

const guideSteps: GuideStep[] = [
  {
    instruction: "Type 'usb' in the filter field",
    detail: "This updates URL state → derived list recomputes instantly. In a typical app, this would be two separate setState calls. Here it's one atomic transaction.",
    check: ({ filter }) => filter.toLowerCase().includes("usb"),
  },
  {
    instruction: "Now clear the filter and click 'Fetch Server Data'",
    detail: "This triggers an async server call. The derived list will recompute when the server responds — even though it's a different source. The conductor knows the dependency.",
    check: ({ events }) => events.some((e) => e.source === "server" && e.label.includes("items returned")),
  },
  {
    instruction: "Set the delay to 3s+ and click 'Fetch Server Data' again. While it's loading, type a filter.",
    detail: "This is the key insight: the filter works instantly on the current data while the server is still loading. When the server responds, the derived list re-evaluates with both the new server data AND the active filter — in one commit wave.",
    check: ({ events, filter }) =>
      filter.length > 0 && events.some((e) => e.source === "server" && e.label.includes("fetching")),
  },
  {
    instruction: "Type something in 'Local draft' and click Save",
    detail: "This is UI-local state — it doesn't affect the filter or the server. But it's still tracked by the conductor. In the Score panel you'll see the transaction, confirming that Symphony State orchestrates all sources, even purely local ones.",
    check: ({ events }) => events.some((e) => e.source === "ui" && e.label.includes("draft saved")),
  },
];

export const LiveWidget = () => {
  const conductorRef = useRef<Conductor | null>(null);
  const [filter, setFilter] = useState("");
  const [draft, setDraft] = useState("");
  const [, setServerItems] = useState<string[]>(ALL_ITEMS);
  const [filtered, setFiltered] = useState<string[]>(ALL_ITEMS);
  const [loading, setLoading] = useState(false);
  const [delay, setDelay] = useState(1500);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const eventIdRef = useRef(0);
  const [currentStep, setCurrentStep] = useState(0);

  const addEvent = useCallback((source: EventEntry["source"], label: string) => {
    setEvents((prev) => [
      { id: ++eventIdRef.current, source, label, time: Date.now() },
      ...prev.slice(0, 7),
    ]);
  }, []);

  // Auto-advance guide steps
  useEffect(() => {
    if (currentStep >= guideSteps.length) return;
    const step = guideSteps[currentStep];
    if (step.check({ filter, events, loading, delay })) {
      const timer = setTimeout(() => setCurrentStep((s) => s + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [filter, events, loading, delay, currentStep]);

  useEffect(() => {
    const filterSource = createAtomAdapter({ filter: "", draft: "" });
    const serverSource = createAtomAdapter({ items: ALL_ITEMS, loading: false });

    const conductor = createConductor({
      sections: [
        defineSection({ key: "filters", source: filterSource, debugLabel: "URL Filters" }),
        defineSection({ key: "server", source: serverSource, debugLabel: "Server Cache" }),
      ],
      derived: [
        defineDerivedSection<string[]>({
          key: "displayItems",
          inputs: ["filters", "server"],
          compute: (filters: { filter: string }, server: { items: string[] }) => {
            const q = filters.filter.toLowerCase();
            if (!q) return server.items;
            return server.items.filter((item) => item.toLowerCase().includes(q));
          },
          debugLabel: "Display Items (Derived)",
        }),
      ],
      scheduler: "sync",
    });

    conductorRef.current = conductor;

    conductor.subscribe("filters", () => {
      const val = conductor.getSectionValue<{ filter: string; draft: string }>("filters");
      setFilter(val.filter);
      setDraft(val.draft);
    });
    conductor.subscribe("server", () => {
      const val = conductor.getSectionValue<{ items: string[]; loading: boolean }>("server");
      setServerItems(val.items);
      setLoading(val.loading);
    });
    conductor.subscribe("displayItems", () => {
      setFiltered(conductor.getSectionValue<string[]>("displayItems"));
    });

    return () => conductor.destroy();
  }, []);

  const handleFilterChange = (value: string) => {
    const c = conductorRef.current;
    if (!c) return;
    c.transaction(() => {
      c.getSection<{ filter: string; draft: string }>("filters").patch({ filter: value });
    }, "filter-change");
    addEvent("url", `filter → "${value}"`);
  };

  const handleDraftSave = () => {
    const c = conductorRef.current;
    if (!c) return;
    c.transaction(() => {
      c.getSection<{ filter: string; draft: string }>("filters").patch({ draft });
    }, "draft-save");
    addEvent("ui", `draft saved: "${draft}"`);
  };

  const handleServerFetch = () => {
    const c = conductorRef.current;
    if (!c) return;

    c.transaction(() => {
      c.getSection<{ items: string[]; loading: boolean }>("server").patch({ loading: true });
    }, "fetch-start");
    setLoading(true);
    addEvent("server", `fetching... (${delay}ms delay)`);

    setTimeout(() => {
      const shuffled = [...ALL_ITEMS].sort(() => Math.random() - 0.5).slice(0, 5 + Math.floor(Math.random() * 3));
      c.transaction(() => {
        c.getSection<{ items: string[]; loading: boolean }>("server").set({ items: shuffled, loading: false });
      }, "fetch-complete");
      addEvent("server", `${shuffled.length} items returned`);
      addEvent("derived", "displayItems recomputed");
    }, delay);
  };

  const activeStep = currentStep < guideSteps.length ? guideSteps[currentStep] : null;

  return (
    <section className="border-b border-border bg-paper" aria-labelledby="live-demo-title">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28 lg:px-14">
        <div className="mb-10 grid gap-5 md:grid-cols-12">
          <p className="brand-label text-root-red md:col-span-3">Live score / 03</p>
          <div className="md:col-span-8 md:col-start-5">
            <h2
              id="live-demo-title"
              className="brand-display text-[clamp(2.8rem,5vw,5.3rem)] font-semibold leading-[0.94] text-ink"
            >
              Hear the state change.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary">
              Four short moves show URL, server, local, and derived state resolving through one conductor.
            </p>
          </div>
        </div>

        {/* Step-by-step guide */}
        <div className="mb-6 border border-root-red/25 bg-blush p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 sm:gap-3">
            {guideSteps.map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  aria-label={
                    i < currentStep
                      ? `Step ${i + 1} complete`
                      : i === currentStep
                        ? `Step ${i + 1} current`
                        : `Step ${i + 1} upcoming`
                  }
                  className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10px] font-semibold transition-colors ${
                    i < currentStep
                      ? "bg-root-red text-paper"
                      : i === currentStep
                        ? "bg-root-red text-paper"
                        : "bg-paper text-text-muted"
                  }`}
                >
                  {i < currentStep ? "✓" : String(i + 1).padStart(2, "0")}
                </span>
                {i < guideSteps.length - 1 && (
                  <div
                    className={`hidden h-px w-8 transition-colors sm:block ${
                      i < currentStep ? "bg-root-red/50" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
            {currentStep >= guideSteps.length && (
              <span className="ml-2 text-xs font-medium text-root-red">
                Score complete
              </span>
            )}
            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              className="ml-auto min-h-11 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted hover:text-root-red"
            >
              Restart
            </button>
          </div>

          <div aria-live="polite">
            {activeStep ? (
              <div className="animate-fade-in">
                <p className="text-sm font-medium text-ink">
                  {activeStep.instruction}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                {activeStep.detail}
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <p className="text-sm font-medium text-source-persisted">
                You&apos;ve seen the core idea.
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                Three different state sources — URL params, server cache, local UI — coordinated by a single conductor. Each change was an atomic transaction. The derived list always reflected the consistent merged state. No glue code, no intermediate renders, no race conditions.
              </p>
            </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* Main widget area */}
          <div className="border border-ink/20 bg-paper p-4 sm:p-6">
            {/* Filter input */}
            <div className="mb-6 grid gap-3 xl:grid-cols-2">
              <div className={`flex min-w-0 items-center gap-2 p-1 transition-colors ${currentStep === 0 ? "ring-1 ring-bloom-red/50" : ""}`}>
                <SourceBadge source="url" size="xs" />
                <label htmlFor="live-filter" className="sr-only">Filter inventory items</label>
                <input
                  id="live-filter"
                  type="text"
                  value={filter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  placeholder="Type to filter..."
                  className="min-h-11 min-w-0 flex-1 border border-border bg-paper-warm px-3 text-sm text-ink placeholder:text-text-muted focus:border-root-red focus:outline-none"
                />
              </div>

              {/* Draft input */}
              <div className={`flex min-w-0 items-center gap-2 p-1 transition-colors ${currentStep === 3 ? "ring-1 ring-bloom-red/50" : ""}`}>
                <SourceBadge source="ui" size="xs" />
                <label htmlFor="live-draft" className="sr-only">Local draft</label>
                <input
                  id="live-draft"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Local draft..."
                  className="min-h-11 min-w-0 flex-1 border border-border bg-paper-warm px-3 text-sm text-ink placeholder:text-text-muted focus:border-ink focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleDraftSave}
                  className="min-h-11 border border-ink/20 bg-paper px-3 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink hover:border-root-red hover:text-root-red"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Server fetch controls */}
            <div className={`mb-5 flex flex-wrap items-center gap-3 border-y border-ink/15 py-4 transition-colors ${currentStep === 1 || currentStep === 2 ? "ring-1 ring-bloom-red/50" : ""}`}>
              <SourceBadge source="server" size="xs" />
              <button
                type="button"
                onClick={handleServerFetch}
                disabled={loading}
                className="min-h-11 bg-root-red px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink disabled:cursor-wait disabled:opacity-55"
              >
                {loading ? "Fetching..." : "Fetch server data"}
              </button>
              <label htmlFor="live-delay" className="flex min-h-11 flex-1 items-center gap-2 text-xs text-text-muted">
                Delay
                <input
                  id="live-delay"
                  type="range"
                  min={200}
                  max={5000}
                  step={200}
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value))}
                  className="min-w-20 flex-1 accent-root-red"
                />
                <span className="font-mono text-ink">{delay}ms</span>
              </label>
            </div>

            {/* Results */}
            <div className="space-y-1.5">
              {loading && (
                <div className="flex items-center gap-2 rounded-md bg-surface-2 px-3 py-2 text-sm text-text-muted">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-source-server border-t-transparent" />
                  Loading from server...
                </div>
              )}
              {filtered.map((item) => (
                <div
                  key={item}
                  className="animate-fade-in flex min-h-10 items-center justify-between border-b border-ink/10 bg-paper-warm px-3 py-2 text-sm last:border-b-0"
                >
                  <span className="text-text-primary">{item}</span>
                  <SourceBadge source="derived" size="xs" />
                </div>
              ))}
              {!loading && filtered.length === 0 && (
                <div className="rounded-md bg-surface-2 px-3 py-4 text-center text-sm text-text-muted">
                  No items match filter
                </div>
              )}
            </div>
          </div>

          {/* Event log */}
          <div className="border border-ink/20 bg-ink p-4 text-paper">
            <div className="mb-4 flex items-center justify-between border-b border-paper/20 pb-3">
              <h3 className="brand-label text-paper">
                Score
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-paper/60">{events.length} events</span>
            </div>

            {events.length === 0 && (
              <div className="mb-3 border border-paper/15 p-3">
                <p className="text-[11px] leading-relaxed text-paper/65">
                  This panel shows the event log — every state transaction, every source change, every derived recomputation. In a real app, this is what you&apos;d see in the Symphony DevTools.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="animate-fade-in border-b border-paper/15 px-1 py-2 last:border-b-0"
                >
                  <div className="flex items-start gap-2">
                    <SourceBadge source={evt.source} size="xs" />
                    <span className="text-xs leading-5 text-paper/85">{evt.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

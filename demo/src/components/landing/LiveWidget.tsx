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
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-text-muted">
          Try it
        </h2>
        <p className="mb-6 text-center text-2xl font-semibold text-text-primary">
          15-second live demo
        </p>

        {/* Step-by-step guide */}
        <div className="mb-6 rounded-xl border border-accent/20 bg-accent/[0.03] p-4">
          <div className="flex items-center gap-3 mb-3">
            {guideSteps.map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                    i < currentStep
                      ? "bg-source-persisted/20 text-source-persisted"
                      : i === currentStep
                        ? "bg-accent text-white"
                        : "bg-surface-3 text-text-muted"
                  }`}
                >
                  {i < currentStep ? "✓" : i + 1}
                </span>
                {i < guideSteps.length - 1 && (
                  <div
                    className={`h-px w-8 transition-colors ${
                      i < currentStep ? "bg-source-persisted/40" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
            {currentStep >= guideSteps.length && (
              <span className="ml-2 text-xs font-medium text-source-persisted">
                All done!
              </span>
            )}
            <button
              onClick={() => setCurrentStep(0)}
              className="ml-auto text-[11px] text-text-muted hover:text-text-primary"
            >
              Restart
            </button>
          </div>

          {activeStep ? (
            <div className="animate-fade-in">
              <p className="text-sm font-medium text-text-primary">
                👉 {activeStep.instruction}
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

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main widget area */}
          <div className="rounded-xl border border-border bg-surface-1 p-6">
            {/* Filter input */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className={`flex flex-1 items-center gap-2 rounded-lg p-0.5 transition-colors ${currentStep === 0 ? "ring-1 ring-accent/40" : ""}`}>
                <SourceBadge source="url" size="xs" />
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  placeholder="Type to filter..."
                  className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-source-url focus:outline-none"
                />
              </div>

              {/* Draft input */}
              <div className={`flex items-center gap-2 rounded-lg p-0.5 transition-colors ${currentStep === 3 ? "ring-1 ring-accent/40" : ""}`}>
                <SourceBadge source="ui" size="xs" />
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Local draft..."
                  className="w-36 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-source-ui focus:outline-none"
                />
                <button
                  onClick={handleDraftSave}
                  className="rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Server fetch controls */}
            <div className={`mb-4 flex items-center gap-3 rounded-lg p-0.5 transition-colors ${currentStep === 1 || currentStep === 2 ? "ring-1 ring-accent/40" : ""}`}>
              <SourceBadge source="server" size="xs" />
              <button
                onClick={handleServerFetch}
                disabled={loading}
                className="rounded-md bg-source-server/15 px-3 py-1.5 text-xs font-medium text-source-server transition-colors hover:bg-source-server/25 disabled:opacity-50"
              >
                {loading ? "Fetching..." : "Fetch Server Data"}
              </button>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                Delay:
                <input
                  type="range"
                  min={200}
                  max={5000}
                  step={200}
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value))}
                  className="w-20 accent-source-server"
                />
                <span className="font-mono text-text-secondary">{delay}ms</span>
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
                  className="animate-fade-in flex items-center justify-between rounded-md bg-surface-2 px-3 py-2 text-sm"
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
          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Score
              </h3>
              <span className="text-[10px] text-text-muted">{events.length} events</span>
            </div>

            {events.length === 0 && (
              <div className="mb-3 rounded-lg border border-border-subtle bg-surface-2 p-3">
                <p className="text-[11px] text-text-muted leading-relaxed">
                  This panel shows the event log — every state transaction, every source change, every derived recomputation. In a real app, this is what you&apos;d see in the Symphony DevTools.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="animate-fade-in rounded-md border border-border-subtle bg-surface-2 px-2.5 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <SourceBadge source={evt.source} size="xs" />
                    <span className="text-xs text-text-primary">{evt.label}</span>
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

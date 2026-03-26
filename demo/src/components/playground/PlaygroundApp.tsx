"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createConductor,
  createAtomAdapter,
  createOrchestratedAdapter,
  defineSection,
  defineDerivedSection,
} from "@shiftbloom-studio/symphony-state";
import type { Conductor, ConductorSnapshot, OrchestratedAdapter } from "@shiftbloom-studio/symphony-state";
import { SourceBadge } from "../shared/SourceBadge";

type LogEntry = {
  id: number;
  source: "server" | "optimistic" | "url" | "ui" | "persisted" | "derived";
  action: string;
  timestamp: number;
};

export const PlaygroundApp = () => {
  const conductorRef = useRef<Conductor | null>(null);
  const orchestratorRef = useRef<OrchestratedAdapter<number> | null>(null);
  const [ready, setReady] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);
  const [snapshot, setSnapshot] = useState<ConductorSnapshot | null>(null);
  const [orchSnapshot, setOrchSnapshot] = useState<ReturnType<OrchestratedAdapter<number>["getSnapshot"]> | null>(null);

  // Chaos controls
  const [delay, setDelay] = useState(2000);
  const [staleResponse, setStaleResponse] = useState(false);
  const [offline, setOffline] = useState(false);

  const addLog = useCallback((source: LogEntry["source"], action: string) => {
    setLogs((prev) => [
      { id: ++logIdRef.current, source, action, timestamp: Date.now() },
      ...prev.slice(0, 29),
    ]);
  }, []);

  useEffect(() => {
    // Server source
    const serverSource = createAtomAdapter<number>(100);
    const optimisticSource = createAtomAdapter<number>(100);

    const orchestrator = createOrchestratedAdapter<number>({
      instruments: [
        { id: "server", source: serverSource, priority: 10, role: "server", staleAfterMs: 15000 },
        { id: "optimistic", source: optimisticSource, priority: 20, role: "optimistic", staleAfterMs: 5000 },
      ],
      writeTo: "optimistic",
    });
    orchestratorRef.current = orchestrator;

    // Other sources
    const urlSource = createAtomAdapter<string>("");
    const uiSource = createAtomAdapter<string>("");
    const persistedSource = createAtomAdapter<string>("");

    const conductor = createConductor({
      sections: [
        defineSection({ key: "stock", source: orchestrator, debugLabel: "Stock (Orchestrated)" }),
        defineSection({ key: "urlFilter", source: urlSource, debugLabel: "URL Filter" }),
        defineSection({ key: "uiDraft", source: uiSource, debugLabel: "UI Draft" }),
        defineSection({
          key: "persistedNote",
          source: persistedSource,
          debugLabel: "Persisted Note",
          persist: { key: "playground-note", throttleMs: 300 },
        }),
      ],
      derived: [
        defineDerivedSection<string>({
          key: "displayLabel",
          inputs: ["stock", "urlFilter"],
          compute: (stock: number, filter: string) => {
            const base = `Stock: ${stock}`;
            return filter ? `${base} (filtered: "${filter}")` : base;
          },
          debugLabel: "Display Label (Derived)",
        }),
      ],
      scheduler: "sync",
    });

    conductorRef.current = conductor;

    // Subscribe to snapshot updates
    const keys = ["stock", "urlFilter", "uiDraft", "persistedNote", "displayLabel"];
    const unsubs = keys.map((k) =>
      conductor.subscribe(k, () => {
        setSnapshot(conductor.getSnapshot());
        if (orchestratorRef.current) {
          setOrchSnapshot(orchestratorRef.current.getSnapshot());
        }
      })
    );

    setSnapshot(conductor.getSnapshot());
    setOrchSnapshot(orchestrator.getSnapshot());
    setReady(true);

    return () => {
      unsubs.forEach((u) => u());
      conductor.destroy();
    };
  }, []);

  // --- Actions ---
  const updateServerValue = (value: number) => {
    const c = conductorRef.current;
    if (!c || offline) {
      addLog("server", offline ? "BLOCKED — offline" : "No conductor");
      return;
    }
    addLog("server", `Fetching... (${delay}ms)`);
    setTimeout(() => {
      const finalValue = staleResponse ? value + Math.floor(Math.random() * 20) - 10 : value;
      c.transaction(() => {
        c.getSection<number>("stock").set(finalValue);
      }, "server-response");
      addLog("server", `Responded: ${finalValue}${staleResponse ? " (stale!)" : ""}`);
    }, delay);
  };

  const updateOptimistic = (value: number) => {
    const c = conductorRef.current;
    if (!c) return;
    c.transaction(() => {
      c.getSection<number>("stock").set(value);
    }, "optimistic-update");
    addLog("optimistic", `Set stock → ${value}`);
  };

  const updateUrlFilter = (value: string) => {
    const c = conductorRef.current;
    if (!c) return;
    c.transaction(() => {
      c.getSection<string>("urlFilter").set(value);
    }, "url-filter-change");
    addLog("url", `Filter → "${value}"`);
  };

  const updateUiDraft = (value: string) => {
    const c = conductorRef.current;
    if (!c) return;
    c.transaction(() => {
      c.getSection<string>("uiDraft").set(value);
    }, "ui-draft-change");
    addLog("ui", `Draft → "${value}"`);
  };

  const updatePersistedNote = (value: string) => {
    const c = conductorRef.current;
    if (!c) return;
    c.transaction(() => {
      c.getSection<string>("persistedNote").set(value);
    }, "persisted-note-change");
    addLog("persisted", `Note → "${value}"`);
  };

  const triggerAtomicWave = () => {
    const c = conductorRef.current;
    if (!c) return;
    c.transaction(() => {
      c.getSection<string>("urlFilter").set("electronics");
      c.getSection<string>("uiDraft").set("");
      c.getSection<number>("stock").set(42);
    }, "atomic-wave");
    addLog("derived", "Atomic transaction: 3 sections in 1 wave");
  };

  if (!ready) {
    return <div className="flex h-[60vh] items-center justify-center text-text-muted text-sm">Loading...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Left: Controls */}
      <div className="space-y-4">
        {/* Orchestrated Stock */}
        <div className="rounded-xl border border-border bg-surface-1 p-5">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">
              Orchestrated Stock Value
            </h3>
            {orchSnapshot && (
              <SourceBadge
                source={(orchSnapshot.driver as "server" | "optimistic") ?? "server"}
                size="xs"
              />
            )}
          </div>

          <div className="mb-4 text-center">
            <div className="font-mono text-4xl font-bold text-text-primary">
              {snapshot?.sections.stock as number ?? "–"}
            </div>
            <div className="mt-1 text-xs text-text-muted">
              Driven by: {orchSnapshot?.driver ?? "unknown"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <SourceBadge source="optimistic" size="xs" />
                <span className="text-xs text-text-muted">Optimistic Update</span>
              </div>
              <div className="flex gap-2">
                {[50, 75, 100, 150].map((v) => (
                  <button
                    key={v}
                    onClick={() => updateOptimistic(v)}
                    className="rounded-md bg-source-optimistic/10 px-3 py-1.5 font-mono text-xs text-source-optimistic hover:bg-source-optimistic/20"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <SourceBadge source="server" size="xs" />
                <span className="text-xs text-text-muted">Server Response</span>
              </div>
              <div className="flex gap-2">
                {[80, 100, 120, 200].map((v) => (
                  <button
                    key={v}
                    onClick={() => updateServerValue(v)}
                    className="rounded-md bg-source-server/10 px-3 py-1.5 font-mono text-xs text-source-server hover:bg-source-server/20"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {orchSnapshot && (
            <div className="mt-4 rounded-lg bg-surface-2 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                Source Resolution
              </div>
              {Object.entries(orchSnapshot.sources).map(([id, src]) => (
                <div key={id} className="flex items-center justify-between py-1 text-xs">
                  <div className="flex items-center gap-2">
                    <SourceBadge source={src.role as "server" | "optimistic"} size="xs" />
                    <span className="text-text-secondary">{id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-text-primary">{String(src.value)}</span>
                    <span className={`text-[10px] ${src.stale ? "text-source-optimistic" : "text-source-persisted"}`}>
                      {src.stale ? "stale" : "fresh"}
                    </span>
                    <span className="text-[10px] text-text-muted">p:{src.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Other sources */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <SourceBadge source="url" size="xs" />
              <span className="text-xs font-medium text-text-primary">URL Filter</span>
            </div>
            <input
              type="text"
              value={(snapshot?.sections.urlFilter as string) ?? ""}
              onChange={(e) => updateUrlFilter(e.target.value)}
              placeholder="Type a filter..."
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-source-url focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <SourceBadge source="ui" size="xs" />
              <span className="text-xs font-medium text-text-primary">UI Draft</span>
            </div>
            <input
              type="text"
              value={(snapshot?.sections.uiDraft as string) ?? ""}
              onChange={(e) => updateUiDraft(e.target.value)}
              placeholder="Local draft..."
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-source-ui focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-border bg-surface-1 p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <SourceBadge source="persisted" size="xs" />
              <span className="text-xs font-medium text-text-primary">Persisted Note</span>
            </div>
            <input
              type="text"
              value={(snapshot?.sections.persistedNote as string) ?? ""}
              onChange={(e) => updatePersistedNote(e.target.value)}
              placeholder="Saved to localStorage..."
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-source-persisted focus:outline-none"
            />
          </div>
        </div>

        {/* Derived output */}
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <SourceBadge source="derived" size="xs" />
            <span className="text-xs font-medium text-text-primary">Display Label (Derived)</span>
          </div>
          <div className="rounded-lg bg-surface-2 px-4 py-3 font-mono text-sm text-text-primary">
            {(snapshot?.sections.displayLabel as string) ?? "–"}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={triggerAtomicWave}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover"
          >
            Atomic Transaction (3 sections, 1 wave)
          </button>
          <button
            onClick={() => {
              updateOptimistic(42);
              setTimeout(() => updateServerValue(99), delay);
            }}
            className="rounded-lg border border-source-optimistic/30 bg-source-optimistic/10 px-4 py-2 text-xs font-medium text-source-optimistic hover:bg-source-optimistic/20"
          >
            Optimistic → Server Conflict
          </button>
        </div>

        {/* Chaos controls */}
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            <span>🌪</span> Chaos Controls
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs text-text-secondary">Network Delay</span>
              <input
                type="range"
                min={0}
                max={5000}
                step={250}
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="w-full accent-source-optimistic"
              />
              <span className="block font-mono text-[11px] text-text-muted">{delay}ms</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={staleResponse}
                onChange={(e) => setStaleResponse(e.target.checked)}
                className="accent-source-optimistic"
              />
              <span className="text-xs text-text-secondary">Stale Responses</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={offline}
                onChange={(e) => setOffline(e.target.checked)}
                className="accent-source-optimistic"
              />
              <span className="text-xs text-text-secondary">Offline Mode</span>
            </label>
          </div>
        </div>
      </div>

      {/* Right: Log + State Inspector */}
      <div className="space-y-4">
        {/* State snapshot */}
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            <span>🎼</span> State Snapshot
          </h3>
          <div className="space-y-2">
            {snapshot && Object.entries(snapshot.sections).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-surface-2 p-2.5">
                <div className="mb-1 text-xs font-medium text-text-primary">{key}</div>
                <pre className="text-[11px] text-text-muted overflow-x-auto">
                  {JSON.stringify(value, null, 2).slice(0, 200)}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction history */}
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Transaction Wave
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {snapshot?.transactions.slice(0, 15).map((tx, i) => (
              <div key={`${tx.timestamp}-${i}`} className="animate-fade-in rounded-md bg-surface-2 px-2.5 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-accent">{tx.label ?? "tx"}</span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(tx.timestamp).toLocaleTimeString("de-DE")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {tx.touched.map((s) => (
                    <span key={s} className="text-[10px] bg-surface-3 rounded px-1 py-0.5 text-text-muted">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event log */}
        <div className="rounded-xl border border-border bg-surface-1 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Event Log
          </h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {logs.map((entry) => (
              <div key={entry.id} className="animate-fade-in flex items-center gap-2 rounded-md bg-surface-2 px-2.5 py-1.5">
                <SourceBadge source={entry.source} size="xs" />
                <span className="flex-1 text-xs text-text-secondary">{entry.action}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="py-6 text-center text-xs text-text-muted">
                Interact with the controls to see events
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

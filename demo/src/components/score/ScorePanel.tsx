"use client";

import { useState, useSyncExternalStore, useCallback, useRef } from "react";
import type { Conductor, ConductorSnapshot, TransactionInfo } from "@shiftbloom-studio/symphony-state";
import { getScoreLog, subscribeScore } from "@/lib/symphony-setup";
import type { ScoreEvent, SourceType } from "@/lib/types";
import { SourceBadge } from "../shared/SourceBadge";

type Tab = "state" | "changes" | "conflicts";

const tabConfig: Record<Tab, { label: string; hint: string }> = {
  state: {
    label: "Current State",
    hint: "Shows the current value of each state section and where it comes from.",
  },
  changes: {
    label: "What Changed",
    hint: "Every time you do something, a transaction commits changes to one or more sections. This is the log.",
  },
  conflicts: {
    label: "Conflicts",
    hint: "When the server and your UI disagree about a value, this shows how it was resolved.",
  },
};

const timeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 1000) return "just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  return `${Math.floor(diff / 60000)}m ago`;
};

const sectionLabels: Record<string, { label: string; source: SourceType }> = {
  products: { label: "Products", source: "server" },
  filters: { label: "Filters", source: "url" },
  ui: { label: "UI State", source: "ui" },
  prefs: { label: "Preferences", source: "persisted" },
  chaos: { label: "Chaos Config", source: "ui" },
  filteredProducts: { label: "Filtered Products", source: "derived" },
  summary: { label: "Summary KPIs", source: "derived" },
};

function StateTab({ snapshot }: { snapshot: ConductorSnapshot }) {
  const entries = Object.entries(snapshot.sections);

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => {
        const meta = sectionLabels[key] ?? { label: key, source: "ui" as SourceType };
        const display = Array.isArray(value)
          ? `${value.length} items`
          : typeof value === "object" && value !== null
            ? Object.entries(value as Record<string, unknown>)
                .slice(0, 4)
                .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                .join("\n")
            : JSON.stringify(value);

        return (
          <div key={key} className="rounded-lg border border-border-subtle bg-surface-2 p-2.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-text-primary">{meta.label}</span>
              <SourceBadge source={meta.source} size="xs" />
            </div>
            <pre className="max-h-16 overflow-auto text-[10px] leading-relaxed text-text-muted whitespace-pre-wrap">
              {display}
            </pre>
          </div>
        );
      })}
    </div>
  );
}

function ChangesTab({ transactions }: { transactions: TransactionInfo[] }) {
  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-text-muted">
        Interact with the dashboard to see changes here.
        <br />
        <span className="text-text-muted/60">Every button click, filter change, or edit creates a transaction.</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {transactions.slice(0, 20).map((tx, i) => {
        // Make the label human-readable
        const label = (tx.label ?? "update")
          .replace(/-/g, " ")
          .replace(/:/g, " → ")
          .replace("server fetch complete", "Server data loaded")
          .replace("filter change", "Filter updated")
          .replace("chaos config change", "Simulation changed")
          .replace("toggle selection", "Row selected");

        return (
          <div
            key={`${tx.timestamp}-${i}`}
            className="animate-fade-in rounded-lg border border-border-subtle bg-surface-2 p-2.5"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-text-primary">
                {label}
              </span>
              <span className="text-[10px] text-text-muted">{timeAgo(tx.timestamp)}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-text-muted">
              <span>Touched:</span>
              {tx.touched.map((key) => (
                <span
                  key={key}
                  className="rounded bg-surface-3 px-1.5 py-0.5 font-mono"
                >
                  {sectionLabels[key]?.label ?? key}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ConflictsTab() {
  const events = useSyncExternalStore(subscribeScore, getScoreLog, getScoreLog);
  const conflictEvents = events.filter(
    (e) => e.type === "reconciliation" || e.type === "source-change"
  );

  if (conflictEvents.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-text-muted">
        No conflicts yet.
        <br />
        <span className="text-text-muted/60">
          Try editing a stock number with &quot;Server Conflicts&quot; enabled in Simulate Problems.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {conflictEvents.slice(0, 15).map((evt) => (
        <div
          key={evt.id}
          className="animate-fade-in rounded-lg border border-border-subtle bg-surface-2 p-2.5"
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-text-primary">
              {evt.label}
            </span>
          </div>
          {evt.driver && (
            <div className="mb-1 flex items-center gap-1.5 text-[10px]">
              <span className="text-text-muted">Winner:</span>
              <SourceBadge source={evt.driver as SourceType} size="xs" />
              <span className="text-text-muted">
                {evt.driver === "server" ? "(server data takes over)" : "(your edit stays)"}
              </span>
            </div>
          )}
          {evt.detail && (
            <p className="text-[10px] leading-relaxed text-text-muted">{evt.detail}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export const ScorePanel = ({ conductor }: { conductor: Conductor }) => {
  const [activeTab, setActiveTab] = useState<Tab>("changes");
  const [collapsed, setCollapsed] = useState(false);

  const snapshotRef = useRef<ConductorSnapshot>(conductor.getSnapshot());

  const subscribe = useCallback(
    (cb: () => void) => {
      const keys = Object.keys(conductor.getSnapshot().sections);
      const unsubs = keys.map((k) =>
        conductor.subscribe(k, () => {
          snapshotRef.current = conductor.getSnapshot();
          cb();
        })
      );
      return () => unsubs.forEach((u) => u());
    },
    [conductor]
  );

  const getSnapshot = useCallback(() => snapshotRef.current, []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-4 top-18 z-40 rounded-lg border border-border bg-surface-1 px-3 py-2 text-xs font-medium text-text-secondary shadow-lg hover:text-text-primary"
      >
        🎼 Score ▸
      </button>
    );
  }

  const tab = tabConfig[activeTab];

  return (
    <div className="flex h-full w-80 flex-shrink-0 flex-col border-l border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🎼</span>
            <h2 className="text-sm font-semibold text-text-primary">Score</h2>
          </div>
          <p className="mt-0.5 text-[10px] text-text-muted">
            See what&apos;s happening inside Symphony State
          </p>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-xs text-text-muted hover:text-text-primary"
        >
          ◂ Hide
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(Object.keys(tabConfig) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 px-2 py-2.5 text-[11px] font-medium transition-colors ${
              activeTab === t
                ? "border-b-2 border-accent text-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tabConfig[t].label}
          </button>
        ))}
      </div>

      {/* Tab hint */}
      <div className="border-b border-border-subtle bg-surface-2/50 px-3 py-2">
        <p className="text-[10px] leading-relaxed text-text-muted">
          {tab.hint}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "state" && <StateTab snapshot={snapshot} />}
        {activeTab === "changes" && <ChangesTab transactions={snapshot.transactions} />}
        {activeTab === "conflicts" && <ConflictsTab />}
      </div>
    </div>
  );
};

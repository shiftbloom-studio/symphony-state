"use client";

import { useState } from "react";
import type { Conductor } from "@shiftbloom-studio/symphony-state";
import type { ChaosConfig } from "@/lib/types";
import { SourceBadge } from "../shared/SourceBadge";

type TryCard = {
  id: string;
  emoji: string;
  title: string;
  what: string;
  howTo: string;
  watch: string;
  setup?: (conductor: Conductor) => void;
};

const tryCards: TryCard[] = [
  {
    id: "edit-stock",
    emoji: "①",
    title: "Edit a stock number",
    what: "When you change stock, the UI updates instantly — before the server confirms. This is called an optimistic update. If the server disagrees, Symphony State resolves the conflict automatically.",
    howTo: "Click any number in the Stock column, change it, press Save.",
    watch: "The summary bar recalculates immediately. Check 'What Changed' in the Score panel to see which parts of the state were touched.",
  },
  {
    id: "switch-warehouse",
    emoji: "②",
    title: "Switch the warehouse",
    what: "Switching context normally causes a chain of separate updates: URL changes, selections reset, preferences save, summaries recalculate. With Symphony State, all of that happens as one atomic transaction — no flickering, no intermediate states.",
    howTo: "Click one of the warehouse buttons above (e.g. 'Berlin-Central').",
    watch: "In the Score panel, you'll see a single transaction labeled 'warehouse-switch' that touched 3 sections at once.",
  },
  {
    id: "slow-network",
    emoji: "③",
    title: "Simulate a slow network",
    what: "Real users have slow connections. When you edit stock and the server takes 3 seconds to respond, most apps either freeze the UI or show wrong data briefly. Symphony State keeps the UI responsive with optimistic data, then cleanly reconciles when the server answers.",
    howTo: "In 'Simulate Problems' below, set the delay to 3s and enable 'Server Conflicts'. Then edit a stock number.",
    watch: "The Score panel → 'Conflicts' tab shows exactly when the server responded and which source won.",
    setup: (conductor) => {
      conductor.transaction(() => {
        conductor.getSection<ChaosConfig>("chaos").patch({
          networkDelay: 3000,
          conflictMode: true,
        });
      }, "setup:slow-network");
    },
  },
];

export const GuidedFlows = ({ conductor }: { conductor: Conductor }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex w-full items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-4 py-2.5 text-left text-xs text-accent hover:bg-accent/10 transition-colors"
      >
        <span>💡</span>
        <span className="font-medium">Show guide</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] overflow-hidden">
      {/* Intro */}
      <div className="border-b border-accent/10 px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-1.5">
              💡 What am I looking at?
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary max-w-2xl">
              This is a product inventory where state comes from <strong>4 different places</strong> at the same time.
              Normally, keeping them in sync is a mess — updates flicker, data conflicts, and components show stale values.
              Symphony State coordinates all of them like a conductor coordinates an orchestra.
            </p>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="ml-4 shrink-0 rounded-md px-2 py-1 text-xs text-text-muted hover:text-text-primary"
          >
            Hide
          </button>
        </div>

        {/* Source legend */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="text-[10px] text-text-muted font-medium">Sources:</span>
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <SourceBadge source="server" size="xs" /> Data from the backend
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <SourceBadge source="url" size="xs" /> Filters in the URL
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <SourceBadge source="ui" size="xs" /> Local UI state (selections, edits)
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <SourceBadge source="persisted" size="xs" /> Saved in your browser
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <SourceBadge source="derived" size="xs" /> Computed from other sources
          </span>
        </div>
      </div>

      {/* Try cards */}
      <div className="p-3 space-y-2">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Try these 3 things
        </p>
        {tryCards.map((card) => {
          const isExpanded = expandedCard === card.id;
          return (
            <div
              key={card.id}
              className={`rounded-lg border transition-colors ${
                isExpanded ? "border-accent/30 bg-surface-1" : "border-border-subtle bg-surface-1/50"
              }`}
            >
              <button
                onClick={() => {
                  setExpandedCard(isExpanded ? null : card.id);
                  if (!isExpanded && card.setup) card.setup(conductor);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
              >
                <span className={`text-sm font-bold ${isExpanded ? "text-accent" : "text-text-muted"}`}>
                  {card.emoji}
                </span>
                <span className="flex-1 text-sm font-medium text-text-primary">
                  {card.title}
                </span>
                <span className="text-xs text-text-muted">{isExpanded ? "▾" : "▸"}</span>
              </button>

              {isExpanded && (
                <div className="border-t border-border-subtle px-4 pb-4 pt-3 space-y-3 animate-fade-in">
                  {/* Why it matters */}
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {card.what}
                  </p>

                  {/* How to */}
                  <div className="rounded-lg bg-surface-2 px-3 py-2.5">
                    <p className="text-[11px] font-medium text-text-primary mb-0.5">
                      👉 How to try it
                    </p>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {card.howTo}
                    </p>
                  </div>

                  {/* What to watch */}
                  <div className="rounded-lg bg-accent/5 border border-accent/10 px-3 py-2.5">
                    <p className="text-[11px] font-medium text-accent mb-0.5">
                      🎼 What happens in the Score panel
                    </p>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {card.watch}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

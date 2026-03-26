"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Conductor } from "@shiftbloom-studio/symphony-state";
import type { InventorySummary } from "@/lib/types";
import { SourceBadge } from "../shared/SourceBadge";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

export const SummaryBar = ({ conductor }: { conductor: Conductor }) => {
  const getSnapshot = useCallback(
    () => conductor.getSectionValue<InventorySummary>("summary"),
    [conductor]
  );
  const subscribe = useCallback(
    (cb: () => void) => conductor.subscribe("summary", cb),
    [conductor]
  );
  const summary = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const cards = [
    { label: "Products", value: summary.totalProducts, color: "text-text-primary" },
    { label: "Total Stock", value: summary.totalStock.toLocaleString("de-DE"), color: "text-text-primary" },
    { label: "Total Value", value: formatCurrency(summary.totalValue), color: "text-source-server" },
    { label: "Low Stock", value: summary.lowStockCount, color: "text-source-url" },
    { label: "Out of Stock", value: summary.outOfStockCount, color: "text-source-optimistic" },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Summary
        </h3>
        <SourceBadge source="derived" size="xs" />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label}>
            <div className={`text-lg font-bold font-mono ${card.color}`}>{card.value}</div>
            <div className="text-[11px] text-text-muted">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

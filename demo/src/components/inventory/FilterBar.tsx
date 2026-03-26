"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Conductor } from "@shiftbloom-studio/symphony-state";
import type { InventoryFilters } from "@/lib/types";
import { SourceBadge } from "../shared/SourceBadge";

const categories = ["", "electronics", "apparel", "food", "furniture"];
const warehouses = ["", "Berlin-Central", "Hamburg-Nord", "Munich-Ost"];
const statuses = ["", "in-stock", "low-stock", "out-of-stock"];

export const FilterBar = ({ conductor }: { conductor: Conductor }) => {
  const getSnapshot = useCallback(
    () => conductor.getSectionValue<InventoryFilters>("filters"),
    [conductor]
  );
  const subscribe = useCallback(
    (cb: () => void) => conductor.subscribe("filters", cb),
    [conductor]
  );
  const filters = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const update = (partial: Partial<InventoryFilters>) => {
    conductor.transaction(() => {
      conductor.getSection<InventoryFilters>("filters").patch(partial);
    }, "filter-change");
  };

  const selectClass =
    "rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-text-primary focus:border-source-url focus:outline-none";

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Filters
        </h3>
        <SourceBadge source="url" size="xs" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search products..."
          className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-source-url focus:outline-none"
        />

        <select
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
          className={selectClass}
        >
          <option value="">All Categories</option>
          {categories.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.warehouse}
          onChange={(e) => update({ warehouse: e.target.value })}
          className={selectClass}
        >
          <option value="">All Warehouses</option>
          {warehouses.filter(Boolean).map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          {statuses.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => update({ sortBy: e.target.value })}
          className={selectClass}
        >
          <option value="name">Sort: Name</option>
          <option value="stock">Sort: Stock</option>
          <option value="price">Sort: Price</option>
          <option value="category">Sort: Category</option>
        </select>

        <button
          onClick={() => update({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })}
          className="rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary"
        >
          {filters.sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>
    </div>
  );
};

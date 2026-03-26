"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Conductor } from "@shiftbloom-studio/symphony-state";
import type { InventoryFilters, UIState, PersistedPrefs } from "@/lib/types";

const warehouses = [
  { id: "", label: "All Warehouses" },
  { id: "Berlin-Central", label: "Berlin-Central" },
  { id: "Hamburg-Nord", label: "Hamburg-Nord" },
  { id: "Munich-Ost", label: "Munich-Ost" },
];

export const WarehouseSelector = ({ conductor }: { conductor: Conductor }) => {
  const getFilters = useCallback(
    () => conductor.getSectionValue<InventoryFilters>("filters"),
    [conductor]
  );
  const subFilters = useCallback(
    (cb: () => void) => conductor.subscribe("filters", cb),
    [conductor]
  );
  const filters = useSyncExternalStore(subFilters, getFilters, getFilters);

  const switchWarehouse = (warehouseId: string) => {
    // Atomic transaction: URL + filters + UI reset + persist preference
    conductor.transaction(() => {
      conductor.getSection<InventoryFilters>("filters").patch({
        warehouse: warehouseId,
        search: "",
      });
      conductor.getSection<UIState>("ui").patch({
        selectedIds: [],
        editingId: null,
      });
      conductor.getSection<PersistedPrefs>("prefs").patch({
        lastWarehouse: warehouseId,
      });
    }, `warehouse-switch:${warehouseId || "all"}`);
  };

  return (
    <div className="flex items-center gap-1.5">
      {warehouses.map((wh) => (
        <button
          key={wh.id}
          onClick={() => switchWarehouse(wh.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            filters.warehouse === wh.id
              ? "bg-accent text-white"
              : "bg-surface-2 text-text-secondary hover:text-text-primary"
          }`}
        >
          {wh.label}
        </button>
      ))}
    </div>
  );
};

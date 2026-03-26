"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import type { Conductor } from "@shiftbloom-studio/symphony-state";
import type { Product, UIState } from "@/lib/types";
import { optimisticStockUpdate, simulateServerFetch } from "@/lib/symphony-setup";
import { SourceBadge } from "../shared/SourceBadge";

const statusColors: Record<string, string> = {
  "in-stock": "text-source-persisted bg-source-persisted/10 border-source-persisted/30",
  "low-stock": "text-source-url bg-source-url/10 border-source-url/30",
  "out-of-stock": "text-source-optimistic bg-source-optimistic/10 border-source-optimistic/30",
};

export const InventoryTable = ({ conductor }: { conductor: Conductor }) => {
  const [editingStock, setEditingStock] = useState<{ id: string; value: string } | null>(null);

  const getProducts = useCallback(
    () => conductor.getSectionValue<Product[]>("filteredProducts"),
    [conductor]
  );
  const subProducts = useCallback(
    (cb: () => void) => conductor.subscribe("filteredProducts", cb),
    [conductor]
  );
  const products = useSyncExternalStore(subProducts, getProducts, getProducts);

  const getUI = useCallback(
    () => conductor.getSectionValue<UIState>("ui"),
    [conductor]
  );
  const subUI = useCallback(
    (cb: () => void) => conductor.subscribe("ui", cb),
    [conductor]
  );
  const ui = useSyncExternalStore(subUI, getUI, getUI);

  const toggleSelect = (id: string) => {
    const next = ui.selectedIds.includes(id)
      ? ui.selectedIds.filter((x) => x !== id)
      : [...ui.selectedIds, id];
    conductor.transaction(() => {
      conductor.getSection<UIState>("ui").patch({ selectedIds: next });
    }, "toggle-selection");
  };

  const handleStockEdit = (product: Product) => {
    setEditingStock({ id: product.id, value: String(product.stock) });
  };

  const handleStockSave = async () => {
    if (!editingStock) return;
    const newStock = parseInt(editingStock.value, 10);
    if (isNaN(newStock) || newStock < 0) return;

    // Optimistic update
    optimisticStockUpdate(conductor, editingStock.id, newStock);
    setEditingStock(null);

    // Simulated server reconciliation after delay
    const chaos = conductor.getSectionValue<{ conflictMode: boolean; networkDelay: number }>("chaos");
    if (chaos.conflictMode) {
      setTimeout(() => {
        simulateServerFetch(conductor);
      }, chaos.networkDelay || 2000);
    }
  };

  const handleStockCancel = () => setEditingStock(null);

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Inventory
          </h3>
          <SourceBadge source="server" size="xs" />
          <span className="text-[10px] text-text-muted">{products.length} items</span>
        </div>
        {ui.selectedIds.length > 0 && (
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-medium text-accent">
            {ui.selectedIds.length} selected
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
              <th className="px-4 py-2.5 w-8" />
              <th className="px-4 py-2.5">Product</th>
              <th className="px-4 py-2.5">SKU</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Stock</th>
              <th className="px-4 py-2.5">Price</th>
              <th className="px-4 py-2.5">Warehouse</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const selected = ui.selectedIds.includes(product.id);
              const isEditing = editingStock?.id === product.id;

              return (
                <tr
                  key={product.id}
                  className={`border-b border-border-subtle transition-colors hover:bg-surface-2 ${
                    selected ? "bg-accent/5" : ""
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelect(product.id)}
                      className="h-3.5 w-3.5 rounded border-border accent-accent"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-medium text-text-primary">
                    {product.name}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-text-muted">
                    {product.sku}
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">{product.category}</td>
                  <td className="px-4 py-2.5">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={editingStock.value}
                          onChange={(e) =>
                            setEditingStock({ ...editingStock, value: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleStockSave();
                            if (e.key === "Escape") handleStockCancel();
                          }}
                          className="w-16 rounded border border-source-optimistic bg-surface-2 px-2 py-0.5 text-xs text-text-primary focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleStockSave}
                          className="text-[10px] text-source-persisted hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleStockCancel}
                          className="text-[10px] text-text-muted hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStockEdit(product)}
                        className="group flex items-center gap-1.5 font-mono text-text-primary"
                        title="Click to edit (optimistic update)"
                      >
                        {product.stock}
                        <span className="text-[10px] text-text-muted opacity-0 group-hover:opacity-100">
                          edit
                        </span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-text-secondary">
                    {product.price.toFixed(2)}€
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">{product.warehouse}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        statusColors[product.status]
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="py-12 text-center text-sm text-text-muted">
          No products match the current filters
        </div>
      )}
    </div>
  );
};

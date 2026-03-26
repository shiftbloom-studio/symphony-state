import {
  createConductor,
  createAtomAdapter,
  createOrchestratedAdapter,
  defineSection,
  defineDerivedSection,
} from "@shiftbloom-studio/symphony-state";
import type {
  Conductor,
  OrchestratedAdapter,
} from "@shiftbloom-studio/symphony-state";
import type {
  Product,
  InventoryFilters,
  UIState,
  PersistedPrefs,
  InventorySummary,
  ChaosConfig,
  ScoreEvent,
} from "./types";
import {
  INITIAL_PRODUCTS,
  DEFAULT_FILTERS,
  DEFAULT_UI,
  DEFAULT_PREFS,
} from "./fake-data";

export type DemoSections = {
  products: Product[];
  filters: InventoryFilters;
  ui: UIState;
  prefs: PersistedPrefs;
  chaos: ChaosConfig;
  summary: InventorySummary;
  filteredProducts: Product[];
};

let _conductor: Conductor | null = null;
let _orchestrator: OrchestratedAdapter<Product[]> | null = null;
let _scoreLog: ScoreEvent[] = [];
let _scoreListeners: Set<() => void> = new Set();

export const getScoreLog = () => _scoreLog;
export const subscribeScore = (cb: () => void) => {
  _scoreListeners.add(cb);
  return () => { _scoreListeners.delete(cb); };
};

const pushScoreEvent = (event: Omit<ScoreEvent, "id" | "timestamp">) => {
  _scoreLog = [
    { ...event, id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: Date.now() },
    ..._scoreLog.slice(0, 99),
  ];
  _scoreListeners.forEach((cb) => cb());
};

export const getOrchestrator = () => _orchestrator;

export const createDemoConductor = (): Conductor => {
  if (_conductor) return _conductor;

  _scoreLog = [];

  // --- Server source (orchestrated with optimistic) ---
  const serverSource = createAtomAdapter<Product[]>([...INITIAL_PRODUCTS]);
  const optimisticSource = createAtomAdapter<Product[]>([...INITIAL_PRODUCTS]);

  _orchestrator = createOrchestratedAdapter<Product[]>({
    instruments: [
      {
        id: "server",
        source: serverSource,
        priority: 10,
        role: "server",
        staleAfterMs: 30000,
      },
      {
        id: "optimistic",
        source: optimisticSource,
        priority: 20,
        role: "optimistic",
        staleAfterMs: 5000,
      },
    ],
    writeTo: "optimistic",
  });

  // --- URL filters source ---
  const filtersSource = createAtomAdapter<InventoryFilters>({ ...DEFAULT_FILTERS });

  // --- UI state source ---
  const uiSource = createAtomAdapter<UIState>({ ...DEFAULT_UI });

  // --- Persisted preferences ---
  const prefsSource = createAtomAdapter<PersistedPrefs>({ ...DEFAULT_PREFS });

  // --- Chaos config ---
  const chaosSource = createAtomAdapter<ChaosConfig>({
    networkDelay: 0,
    offline: false,
    staleResponses: false,
    refetchStorm: false,
    conflictMode: false,
  });

  const conductor = createConductor({
    sections: [
      defineSection({
        key: "products",
        source: _orchestrator,
        debugLabel: "Inventory Products (Orchestrated)",
      }),
      defineSection({
        key: "filters",
        source: filtersSource,
        debugLabel: "Filters (URL-synced)",
      }),
      defineSection({
        key: "ui",
        source: uiSource,
        debugLabel: "UI State",
      }),
      defineSection({
        key: "prefs",
        source: prefsSource,
        debugLabel: "Persisted Preferences",
        persist: {
          key: "symphony-demo-prefs",
          throttleMs: 500,
        },
      }),
      defineSection({
        key: "chaos",
        source: chaosSource,
        debugLabel: "Chaos Controls",
      }),
    ],
    derived: [
      defineDerivedSection<Product[]>({
        key: "filteredProducts",
        inputs: ["products", "filters"],
        compute: (products: Product[], filters: InventoryFilters) => {
          let result = [...products];
          if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q)
            );
          }
          if (filters.category) {
            result = result.filter((p) => p.category === filters.category);
          }
          if (filters.warehouse) {
            result = result.filter((p) => p.warehouse === filters.warehouse);
          }
          if (filters.status) {
            result = result.filter((p) => p.status === filters.status);
          }
          const dir = filters.sortDir === "desc" ? -1 : 1;
          result.sort((a, b) => {
            const aVal = a[filters.sortBy as keyof Product];
            const bVal = b[filters.sortBy as keyof Product];
            if (typeof aVal === "string" && typeof bVal === "string") return aVal.localeCompare(bVal) * dir;
            if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * dir;
            return 0;
          });
          return result;
        },
        debugLabel: "Filtered Products (Derived)",
      }),
      defineDerivedSection<InventorySummary>({
        key: "summary",
        inputs: ["filteredProducts"],
        compute: (products: Product[]) => ({
          totalProducts: products.length,
          totalStock: products.reduce((sum, p) => sum + p.stock, 0),
          totalValue: Math.round(products.reduce((sum, p) => sum + p.stock * p.price, 0) * 100) / 100,
          lowStockCount: products.filter((p) => p.status === "low-stock").length,
          outOfStockCount: products.filter((p) => p.status === "out-of-stock").length,
        }),
        debugLabel: "Inventory Summary (Derived)",
      }),
    ],
    scheduler: "sync",
    transactionHistoryLimit: 50,
  });

  // --- Track events for Score panel ---
  const trackedSections = ["products", "filters", "ui", "prefs", "filteredProducts", "summary"];
  for (const key of trackedSections) {
    conductor.subscribe(key, () => {
      pushScoreEvent({
        type: "subscriber-notify",
        label: `${key} updated`,
        sections: [key],
        detail: `Subscribers for "${key}" notified`,
      });
    });
  }

  _conductor = conductor;
  return conductor;
};

// --- Simulated server fetch ---
export const simulateServerFetch = async (
  conductor: Conductor,
  overrideProducts?: Product[]
) => {
  // Guard: if conductor was destroyed (e.g. React Strict Mode cleanup), bail out
  if (!_conductor || _conductor !== conductor) return;

  let chaos: ChaosConfig;
  try {
    chaos = conductor.getSectionValue<ChaosConfig>("chaos");
  } catch {
    // Conductor was destroyed between the check and the call
    return;
  }

  if (chaos.offline) {
    pushScoreEvent({
      type: "reconciliation",
      label: "Fetch blocked (offline)",
      sections: ["products"],
      detail: "Network is offline — using cached data",
    });
    return;
  }

  pushScoreEvent({
    type: "source-change",
    label: "Server fetch started",
    sections: ["products"],
    detail: `Delay: ${chaos.networkDelay}ms`,
  });

  const delay = chaos.networkDelay || 200;
  await new Promise((r) => setTimeout(r, delay));

  // Re-check after the await — conductor may have been destroyed during the delay
  if (!_conductor || _conductor !== conductor) return;

  const serverProducts = overrideProducts ?? [...INITIAL_PRODUCTS].map((p) => ({
    ...p,
    stock: chaos.staleResponses
      ? p.stock + Math.floor(Math.random() * 10) - 5
      : p.stock,
    lastUpdated: Date.now(),
  }));

  try {
    conductor.transaction(() => {
      conductor.getSection<Product[]>("products").set(serverProducts);
    }, "server-fetch-complete");
  } catch {
    // Conductor destroyed during fetch — safe to ignore
    return;
  }

  pushScoreEvent({
    type: "reconciliation",
    label: chaos.staleResponses ? "Stale server response reconciled" : "Server data refreshed",
    sections: ["products", "filteredProducts", "summary"],
    driver: "server",
    detail: chaos.staleResponses
      ? "Server returned modified stock values — reconciling with optimistic"
      : `${serverProducts.length} products loaded`,
  });
};

// --- Optimistic update helper ---
export const optimisticStockUpdate = (
  conductor: Conductor,
  productId: string,
  newStock: number
) => {
  if (!_conductor || _conductor !== conductor) return;

  const products = conductor.getSectionValue<Product[]>("products");
  const updated = products.map((p) =>
    p.id === productId
      ? {
          ...p,
          stock: newStock,
          status: (newStock === 0 ? "out-of-stock" : newStock < 20 ? "low-stock" : "in-stock") as Product["status"],
          lastUpdated: Date.now(),
        }
      : p
  );

  conductor.transaction(() => {
    conductor.getSection<Product[]>("products").set(updated);
  }, `optimistic-stock-update:${productId}`);

  pushScoreEvent({
    type: "transaction",
    label: `Optimistic: stock → ${newStock}`,
    sections: ["products", "filteredProducts", "summary"],
    driver: "optimistic",
    detail: `Product ${productId} stock changed to ${newStock}`,
  });
};

export const destroyDemoConductor = () => {
  _conductor?.destroy();
  _conductor = null;
  _orchestrator = null;
  _scoreLog = [];
};

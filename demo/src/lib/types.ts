export type Product = {
  id: string;
  name: string;
  sku: string;
  category: "electronics" | "apparel" | "food" | "furniture";
  stock: number;
  price: number;
  warehouse: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: number;
};

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

export type Order = {
  id: string;
  productId: string;
  quantity: number;
  status: OrderStatus;
  createdAt: number;
};

export type InventoryFilters = {
  search: string;
  category: string;
  warehouse: string;
  status: string;
  sortBy: string;
  sortDir: "asc" | "desc";
};

export type UIState = {
  selectedIds: string[];
  editingId: string | null;
  drawerOpen: boolean;
  activeTab: "inventory" | "orders" | "analytics";
};

export type PersistedPrefs = {
  columns: string[];
  pageSize: number;
  lastWarehouse: string;
  draftFilters: Partial<InventoryFilters> | null;
};

export type InventorySummary = {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
};

export type SourceType = "server" | "ui" | "url" | "persisted" | "optimistic" | "derived";

export type ScoreEvent = {
  id: string;
  type: "transaction" | "reconciliation" | "source-change" | "subscriber-notify";
  label: string;
  sections: string[];
  driver?: string;
  timestamp: number;
  detail?: string;
};

export type ChaosConfig = {
  networkDelay: number;
  offline: boolean;
  staleResponses: boolean;
  refetchStorm: boolean;
  conflictMode: boolean;
};

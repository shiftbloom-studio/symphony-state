import type { Product, Order } from "./types";

const warehouses = ["Berlin-Central", "Hamburg-Nord", "Munich-Ost"];

const productNames: Record<string, string[]> = {
  electronics: [
    "Wireless Headphones Pro",
    "USB-C Hub 7-Port",
    "Mechanical Keyboard MX",
    "4K Webcam Ultra",
    "Portable SSD 2TB",
    "Smart Speaker Mini",
  ],
  apparel: [
    "Merino Wool Sweater",
    "Running Jacket Lite",
    "Canvas Backpack XL",
    "Leather Belt Classic",
    "Wool Beanie Winter",
    "Cotton T-Shirt Pack",
  ],
  food: [
    "Organic Coffee Beans 1kg",
    "Dark Chocolate 85%",
    "Matcha Powder Premium",
    "Olive Oil Extra Virgin",
    "Protein Bars Box/24",
    "Dried Mango Slices",
  ],
  furniture: [
    "Standing Desk Frame",
    "Ergonomic Chair Pro",
    "Monitor Arm Dual",
    "Cable Management Kit",
    "Desk Lamp LED",
    "Filing Cabinet 3-Drawer",
  ],
};

let idCounter = 0;
const nextId = () => `prod_${String(++idCounter).padStart(4, "0")}`;

export const generateProducts = (): Product[] => {
  idCounter = 0;
  const products: Product[] = [];

  for (const [category, names] of Object.entries(productNames)) {
    for (const name of names) {
      const stock = Math.floor(Math.random() * 150);
      products.push({
        id: nextId(),
        name,
        sku: `SKU-${category.slice(0, 3).toUpperCase()}-${String(products.length + 1).padStart(3, "0")}`,
        category: category as Product["category"],
        stock,
        price: Math.round((Math.random() * 200 + 10) * 100) / 100,
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
        status: stock === 0 ? "out-of-stock" : stock < 20 ? "low-stock" : "in-stock",
        lastUpdated: Date.now() - Math.floor(Math.random() * 86400000),
      });
    }
  }

  return products;
};

export const generateOrders = (products: Product[]): Order[] => {
  const statuses: Order["status"][] = ["pending", "processing", "shipped", "delivered"];
  return Array.from({ length: 12 }, (_, i) => ({
    id: `ord_${String(i + 1).padStart(4, "0")}`,
    productId: products[Math.floor(Math.random() * products.length)].id,
    quantity: Math.floor(Math.random() * 10) + 1,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: Date.now() - Math.floor(Math.random() * 604800000),
  }));
};

export const INITIAL_PRODUCTS = generateProducts();
export const INITIAL_ORDERS = generateOrders(INITIAL_PRODUCTS);

export const DEFAULT_FILTERS = {
  search: "",
  category: "",
  warehouse: "",
  status: "",
  sortBy: "name",
  sortDir: "asc" as const,
};

export const DEFAULT_UI: {
  selectedIds: string[];
  editingId: string | null;
  drawerOpen: boolean;
  activeTab: "inventory" | "orders" | "analytics";
} = {
  selectedIds: [],
  editingId: null,
  drawerOpen: false,
  activeTab: "inventory",
};

export const DEFAULT_PREFS = {
  columns: ["name", "sku", "category", "stock", "price", "warehouse", "status"],
  pageSize: 20,
  lastWarehouse: "",
  draftFilters: null,
};

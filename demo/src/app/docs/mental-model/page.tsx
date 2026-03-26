import { Navigation } from "@/components/shared/Navigation";
import Link from "next/link";

const concepts = [
  {
    id: "orchestration",
    title: "Orchestration, not ownership",
    content: `Symphony State does not replace your existing stores. It sits between them.

Your server cache (TanStack Query, SWR) stays. Your URL params stay. Your local component state stays. Your localStorage stays. Symphony State acts as the conductor — coordinating reads, writes, and conflict resolution across all of them.

Each source adapter wraps an existing store with a uniform interface: get, set, subscribe. The conductor manages the flow.`,
    code: `// Each source remains independent
const serverSource = createAtomAdapter(initialData);
const urlSource = createUrlParamsAdapter({ parse, serialize });
const uiSource = createAtomAdapter(initialUI);

// The conductor orchestrates them
const conductor = createConductor({
  sections: [
    defineSection({ key: "products", source: serverSource }),
    defineSection({ key: "filters", source: urlSource }),
    defineSection({ key: "ui", source: uiSource }),
  ],
});`,
  },
  {
    id: "staged-commits",
    title: "Staged commits",
    content: `All updates within a transaction are staged, not applied immediately. When the transaction ends, changes are committed in dependency order — derived sections recompute, subscribers are notified once.

This prevents cascading re-renders and stale intermediate states. A single transaction can touch multiple sections, and the UI sees a single, consistent snapshot.`,
    code: `// All three changes commit as one wave
conductor.transaction(() => {
  conductor.getSection("filters").patch({ warehouse: "Berlin" });
  conductor.getSection("ui").patch({ selectedIds: [] });
  conductor.getSection("prefs").patch({ lastWarehouse: "Berlin" });
}, "warehouse-switch");

// Subscribers see: one notification, all values consistent`,
  },
  {
    id: "dependency-flow",
    title: "Dependency-driven flow",
    content: `Sections can depend on other sections. Derived sections are computed from their inputs. The conductor builds a dependency graph and topologically sorts it.

When a source section changes, only its dependents are recomputed — and only if their inputs actually changed. This is deterministic and efficient.`,
    code: `defineDerivedSection({
  key: "filteredProducts",
  inputs: ["products", "filters"],
  compute: (products, filters) => {
    // Only recomputes when products or filters change
    return products.filter(p => matchesFilters(p, filters));
  },
});

defineDerivedSection({
  key: "summary",
  inputs: ["filteredProducts"],
  compute: (filtered) => ({
    total: filtered.length,
    value: filtered.reduce((s, p) => s + p.price, 0),
  }),
});`,
  },
  {
    id: "reconciliation",
    title: "Reconciliation precedence",
    content: `When multiple sources provide the same value — say, an optimistic UI update and a server response — who wins?

The OrchestratedAdapter resolves this deterministically:

1. Filter out stale sources (configurable staleness threshold)
2. Sort by priority (higher wins)
3. Break ties by freshness (most recently updated wins)

You can override the default logic with a custom reconcile function for domain-specific rules.`,
    code: `createOrchestratedAdapter({
  instruments: [
    { id: "server", source: serverStore, priority: 10, role: "server" },
    { id: "optimistic", source: localStore, priority: 20, role: "optimistic",
      staleAfterMs: 5000 },
  ],
  writeTo: "optimistic",
});

// User edits → optimistic wins (higher priority)
// Server responds → optimistic becomes stale → server wins
// Conflict visible in Score panel`,
  },
  {
    id: "observable",
    title: "Observable sections",
    content: `Every value in Symphony State carries its provenance. The conductor snapshot shows which sections exist, their current values, and the full transaction history.

The orchestrator snapshot shows which source is currently driving the resolved value, the individual source values, their staleness, and their priority.

This makes debugging trivial: you don't just see state — you see why it's that way.`,
    code: `// Conductor snapshot
conductor.getSnapshot();
// → { sections: { products: [...], filters: {...} },
//     transactions: [{ label: "warehouse-switch",
//                      touched: ["filters", "ui", "prefs"],
//                      timestamp: 1711... }] }

// Orchestrator snapshot
orchestrator.getSnapshot();
// → { value: [...], driver: "server",
//     sources: {
//       server:     { value: [...], priority: 10, stale: false },
//       optimistic: { value: [...], priority: 20, stale: true }
//     } }`,
  },
];

export default function MentalModelPage() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-text-primary">Mental Model</h1>
          <p className="mt-2 text-lg text-text-secondary">
            Five concepts that explain how Symphony State works — and why.
          </p>
        </div>

        <nav className="mb-12 flex flex-wrap gap-2">
          {concepts.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="rounded-md border border-border bg-surface-1 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
            >
              {c.title}
            </a>
          ))}
        </nav>

        <div className="space-y-16">
          {concepts.map((concept, i) => (
            <section key={concept.id} id={concept.id} className="scroll-mt-20">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 font-mono text-sm font-bold text-accent">
                  {i + 1}
                </span>
                <h2 className="text-xl font-semibold text-text-primary">
                  {concept.title}
                </h2>
              </div>

              <div className="mb-6 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {concept.content}
              </div>

              <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
                <div className="border-b border-border bg-surface-2 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-text-muted">
                  Example
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-text-primary">
                  {concept.code}
                </pre>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 rounded-xl border border-border bg-surface-1 p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            See it in action
          </h2>
          <p className="mb-6 text-sm text-text-secondary">
            The Inventory Demo shows all five concepts working together in a real dashboard.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/demo/inventory"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Open Demo
            </Link>
            <Link
              href="/playground"
              className="rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              Open Playground
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

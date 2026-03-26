"use client";

const features = [
  {
    icon: "🎼",
    title: "Orchestration, not ownership",
    description:
      "Each source keeps its store. Symphony State coordinates reads, writes, and conflict resolution across all of them.",
  },
  {
    icon: "⚡",
    title: "Single-wave commits",
    description:
      "Updates are staged, dependency-ordered, and committed atomically. No cascading re-renders, no stale intermediate states.",
  },
  {
    icon: "🔬",
    title: "Observable state",
    description:
      "Every value carries its provenance. The Score panel shows which source is driving, what was reconciled, and why.",
  },
  {
    icon: "🧩",
    title: "Composable adapters",
    description:
      "Atom, Zustand, Redux, TanStack Query, URL params — plug in what you use. No migration required.",
  },
  {
    icon: "🛡",
    title: "Reconciliation precedence",
    description:
      "Server vs. optimistic vs. persisted? Priority, staleness, and custom rules decide deterministically.",
  },
  {
    icon: "📊",
    title: "Minimal re-renders",
    description:
      "Subscribers are notified only for touched sections. Unchanged components stay untouched.",
  },
];

export const Features = () => {
  return (
    <section className="border-b border-border py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-text-muted">
          Key concepts
        </h2>
        <p className="mb-12 text-center text-2xl font-semibold text-text-primary">
          What makes it different
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-surface-1 p-6 transition-colors hover:border-border/80"
            >
              <div className="mb-4 text-2xl">{feature.icon}</div>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

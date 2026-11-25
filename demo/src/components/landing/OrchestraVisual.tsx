const sources = [
  { label: "Server cache", role: "TanStack Query / SWR" },
  { label: "UI state", role: "Local component state" },
  { label: "URL params", role: "Search params / routing" },
  { label: "Persistence", role: "localStorage / IndexedDB" },
];

export const OrchestraVisual = () => {
  return (
    <section className="border-b border-border bg-paper-warm" aria-labelledby="architecture-title">
      <div className="mx-auto grid max-w-[100rem] gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28 lg:px-14 2xl:px-20">
        <div className="md:col-span-4">
          <p className="brand-label text-root-red">Architecture / 01</p>
          <h2
            id="architecture-title"
            className="brand-display mt-5 text-[clamp(2.8rem,5vw,5.3rem)] font-semibold leading-[0.94] text-ink"
          >
            Your stores stay where they are.
          </h2>
          <p className="mt-6 max-w-sm text-base leading-7 text-text-secondary">
            You keep TanStack Query, your component state and your URL params. Symphony State only sits between them: it collects their updates, applies them in dependency order and hands React one consistent snapshot.
          </p>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <div className="grid border-y border-ink/20 sm:grid-cols-[1fr_0.72fr]">
            <ol aria-label="State sources" className="divide-y divide-ink/15 border-ink/20 sm:border-r">
              {sources.map((source, index) => (
                <li key={source.label} className="grid grid-cols-[3rem_1fr] gap-4 py-5 pr-5">
                  <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-root-red">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong className="block font-medium text-ink">{source.label}</strong>
                    <span className="mt-1 block text-sm text-text-muted">{source.role}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="flex min-h-72 flex-col justify-between bg-ink p-6 text-paper sm:min-h-full">
              <p className="brand-label">Conductor</p>
              <div>
                <span className="mb-5 block h-3 w-3 rounded-full bg-bloom-red" aria-hidden="true" />
                <p className="brand-display text-4xl font-semibold leading-none">Symphony State</p>
                <p className="mt-4 text-sm leading-6 text-paper">
                  Stage, reconcile, derive, commit
                </p>
              </div>
              <p className="font-mono text-xs text-paper/70">
                Given the same updates, it commits the same result.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/20 py-4 font-mono text-xs text-text-muted">
            <span>Four independent inputs</span>
            <span className="text-root-red">One commit per change</span>
          </div>
        </div>
      </div>
    </section>
  );
};

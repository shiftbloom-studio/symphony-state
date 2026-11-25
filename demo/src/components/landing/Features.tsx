const features = [
  {
    title: "Orchestration, not ownership",
    description:
      "Each source keeps its store. Symphony State coordinates reads, writes, and conflict resolution across all of them.",
  },
  {
    title: "Single-wave commits",
    description:
      "Updates are staged, dependency-ordered, and committed atomically. Components never see a state that is only half updated.",
  },
  {
    title: "Observable state",
    description:
      "Every value remembers where it came from. The DevTools panel shows which source won a conflict and why.",
  },
  {
    title: "Composable adapters",
    description:
      "Atom, Zustand, Redux, TanStack Query, and URL params plug into the stores you already use. You don't have to migrate anything first.",
  },
  {
    title: "Explicit precedence",
    description:
      "Priority, freshness, staleness, and custom rules resolve conflicts between server, optimistic, and persisted state.",
  },
  {
    title: "Quiet rendering",
    description:
      "Subscribers are notified only for touched sections. Components whose state did not change stay untouched.",
  },
];

export const Features = () => {
  return (
    <section className="border-b border-border bg-paper" aria-labelledby="principles-title">
      <div className="mx-auto grid max-w-[100rem] gap-12 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28 lg:px-14 2xl:px-20">
        <div className="md:col-span-4">
          <p className="brand-label text-root-red">Guarantees / 03</p>
          <h2
            id="principles-title"
            className="brand-display mt-5 text-[clamp(2.8rem,5vw,5.3rem)] font-semibold leading-[0.94] text-ink"
          >
            What you can rely on
          </h2>
        </div>

        <ol className="border-t border-ink/20 md:col-span-7 md:col-start-6">
          {features.map((feature, index) => (
            <li
              key={feature.title}
              className="grid gap-3 border-b border-ink/20 py-6 sm:grid-cols-[3rem_0.9fr_1.25fr] sm:gap-5"
            >
              <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-root-red">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-medium leading-6 text-ink">{feature.title}</h3>
              <p className="text-sm leading-6 text-text-secondary">{feature.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

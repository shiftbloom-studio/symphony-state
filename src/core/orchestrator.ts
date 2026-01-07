import type {
  InstrumentDefinition,
  OrchestratedAdapter,
  OrchestratorConfig,
  OrchestratorSnapshot,
  ReconcileContext,
  ReconcileFn,
  ResolutionState,
  SourceAdapter,
  Subscriber
} from "./types";

type InstrumentState<T> = {
  id: string;
  source?: SourceAdapter<T>;
  value: T;
  updatedAt: number;
  priority: number;
  staleAfterMs?: number;
  kind: string;
  role?: InstrumentDefinition<T>["role"];
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const defaultReconcile = <T,>(context: ReconcileContext<T>): ResolutionState<T> => {
  const entries = Object.entries(context.meta)
    .filter(([, meta]) => !meta.stale)
    .map(([id, meta]) => ({
      id,
      meta,
      value: context.values[id]
    }));

  if (entries.length === 0 && context.lastResolved) {
    return context.lastResolved;
  }

  const sorted = entries.sort((a, b) => {
    if (a.meta.priority !== b.meta.priority) {
      return b.meta.priority - a.meta.priority;
    }
    return b.meta.updatedAt - a.meta.updatedAt;
  });

  const winner = sorted[0];
  if (!winner) {
    const fallbackId = Object.keys(context.values)[0];
    return {
      value: context.values[fallbackId],
      sourceId: fallbackId,
      updatedAt: Date.now()
    };
  }

  return {
    value: winner.value,
    sourceId: winner.id,
    updatedAt: winner.meta.updatedAt
  };
};

const buildSnapshot = <T,>(
  state: Map<string, InstrumentState<T>>,
  resolved: ResolutionState<T> | undefined
): OrchestratorSnapshot<T> => {
  const sources: OrchestratorSnapshot<T>["sources"] = {};
  state.forEach((instrument) => {
    sources[instrument.id] = {
      value: instrument.value,
      priority: instrument.priority,
      updatedAt: instrument.updatedAt,
      stale: false,
      kind: instrument.kind,
      role: instrument.role
    };
  });

  if (!resolved) {
    const fallbackId = Object.keys(sources)[0];
    const fallback = sources[fallbackId];
    return {
      value: fallback?.value as T,
      driver: fallbackId ?? null,
      sources
    };
  }

  return {
    value: resolved.value,
    driver: resolved.sourceId,
    sources
  };
};

const resolveInstrumentPriority = <T,>(
  instruments: InstrumentDefinition<T>[],
  optimisticPriority?: number
) => {
  const priorities = instruments.map((instrument) => instrument.priority ?? 0);
  const max = priorities.length > 0 ? Math.max(...priorities) : 0;
  return optimisticPriority ?? max + 1;
};

export const createOrchestratedAdapter = <T,>(
  config: OrchestratorConfig<T>
): OrchestratedAdapter<T> => {
  if (config.instruments.length === 0) {
    throw new Error("createOrchestratedAdapter requires at least one instrument.");
  }

  const now = config.now ?? (() => Date.now());
  const instruments = new Map<string, InstrumentState<T>>();
  const subscribers = new Set<Subscriber>();
  const subscriptions: Array<() => void> = [];
  const reconcile: ReconcileFn<T> = config.reconcile ?? defaultReconcile;
  const optimisticId = config.optimisticSourceId ?? "optimistic";

  for (const instrument of config.instruments) {
    if (instruments.has(instrument.id)) {
      throw new Error(`Duplicate instrument id "${instrument.id}".`);
    }
    const value = instrument.source.get();
    const state: InstrumentState<T> = {
      id: instrument.id,
      source: instrument.source,
      value,
      updatedAt: now(),
      priority: instrument.priority ?? 0,
      staleAfterMs: instrument.staleAfterMs,
      kind: instrument.source.kind,
      role: instrument.role
    };
    instruments.set(instrument.id, state);
  }

  if (config.optimistic) {
    const optimisticPriority = resolveInstrumentPriority(
      config.instruments,
      config.optimisticPriority
    );
    instruments.set(optimisticId, {
      id: optimisticId,
      value: instruments.values().next().value.value,
      updatedAt: 0,
      priority: optimisticPriority,
      kind: "optimistic",
      role: "optimistic"
    });
  }

  let resolved: ResolutionState<T> | undefined;

  const computeResolved = (reason: ReconcileContext<T>["reason"]) => {
    const values: Record<string, T> = {};
    const meta: Record<string, ReconcileContext<T>["meta"][string]> = {};
    instruments.forEach((instrument) => {
      const stale =
        typeof instrument.staleAfterMs === "number" &&
        now() - instrument.updatedAt > instrument.staleAfterMs;
      values[instrument.id] = instrument.value;
      meta[instrument.id] = {
        priority: instrument.priority,
        updatedAt: instrument.updatedAt,
        stale,
        kind: instrument.kind,
        role: instrument.role
      };
    });

    resolved = reconcile({
      values,
      meta,
      lastResolved: resolved,
      reason
    });
  };

  computeResolved("init");

  const notifyIfChanged = (previous: T | undefined) => {
    if (!resolved) {
      return;
    }
    if (previous !== undefined && Object.is(previous, resolved.value)) {
      return;
    }
    subscribers.forEach((subscriber) => subscriber());
  };

  const updateFromSource = (id: string, value: T) => {
    const state = instruments.get(id);
    if (!state) {
      return;
    }
    const previous = resolved?.value;
    state.value = value;
    state.updatedAt = now();
    computeResolved("source-update");
    notifyIfChanged(previous);
  };

  instruments.forEach((instrument) => {
    if (!instrument.source) {
      return;
    }
    const unsubscribe = instrument.source.subscribe(() => {
      updateFromSource(instrument.id, instrument.source?.get() as T);
    });
    subscriptions.push(unsubscribe);
  });

  const set = (next: T) => {
    const previous = resolved?.value;
    if (config.optimistic) {
      const optimistic = instruments.get(optimisticId);
      if (optimistic) {
        optimistic.value = next;
        optimistic.updatedAt = now();
      }
    }

    if (config.writeTo) {
      const target = instruments.get(config.writeTo);
      if (!target?.source) {
        throw new Error(`Unknown write target "${config.writeTo}".`);
      }
      target.source.set(next);
    }

    computeResolved("set");
    notifyIfChanged(previous);
  };

  const patch = (partial: Partial<T>) => {
    if (isObject(partial)) {
      const base = resolved?.value;
      if (isObject(base)) {
        const next = { ...base, ...partial } as T;
        set(next);
        return;
      }
    }
    throw new Error("Orchestrated adapter patch requires object values.");
  };

  const get = () => {
    if (!resolved) {
      computeResolved("init");
    }
    return resolved?.value as T;
  };

  const subscribe = (cb: Subscriber) => {
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  };

  const getSnapshot = (): OrchestratorSnapshot<T> => {
    const snapshot = buildSnapshot(instruments, resolved);
    const nowValue = now();
    Object.keys(snapshot.sources).forEach((key) => {
      const instrument = instruments.get(key);
      if (!instrument) {
        return;
      }
      snapshot.sources[key].stale =
        typeof instrument.staleAfterMs === "number" &&
        nowValue - instrument.updatedAt > instrument.staleAfterMs;
    });
    return snapshot;
  };

  const destroy = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
    instruments.forEach((instrument) => instrument.source?.destroy?.());
    subscribers.clear();
  };

  return {
    get,
    set,
    patch,
    subscribe,
    kind: "orchestrated",
    getSnapshot,
    destroy
  };
};

import { createScheduler } from "./scheduler";
import type {
  Conductor,
  ConductorSnapshot,
  DerivedSectionDefinition,
  EffectDefinition,
  PersistConfig,
  Scheduler,
  SectionDefinition,
  SectionHandle,
  SourceAdapter,
  Subscriber,
  TransactionInfo
} from "./types";

const defaultPersist = <T,>(value: T, config: PersistConfig<T>) => {
  if (!config.storage) {
    return;
  }
  const serialize = config.serialize ?? JSON.stringify;
  config.storage.setItem(config.key, serialize(value));
};

const readPersist = <T,>(config: PersistConfig<T>): T | undefined => {
  if (!config.storage) {
    return undefined;
  }
  const raw = config.storage.getItem(config.key);
  if (!raw) {
    return undefined;
  }
  const deserialize = config.deserialize ?? JSON.parse;
  return deserialize(raw) as T;
};

type SectionState<T> = {
  key: string;
  adapter?: SourceAdapter<T>;
  subscribers: Set<Subscriber>;
  dependsOn: string[];
  persist?: PersistConfig<T>;
  persistTimer?: ReturnType<typeof setTimeout>;
  value: T;
  derived?: {
    inputs: string[];
    compute: (...values: unknown[]) => T;
    lastInputs?: unknown[];
  };
};

type Update =
  | { type: "set"; value: unknown }
  | { type: "patch"; value: Partial<unknown> };

const now = () => Date.now();

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const createDependencyOrder = (dependencies: Map<string, string[]>) => {
  const indegree = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  dependencies.forEach((deps, key) => {
    indegree.set(key, deps.length);
    deps.forEach((dep) => {
      if (!outgoing.has(dep)) {
        outgoing.set(dep, []);
      }
      outgoing.get(dep)?.push(key);
    });
  });

  const queue: string[] = [];
  indegree.forEach((count, key) => {
    if (count === 0) {
      queue.push(key);
    }
  });

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    order.push(current);
    const children = outgoing.get(current) ?? [];
    for (const child of children) {
      const next = (indegree.get(child) ?? 0) - 1;
      indegree.set(child, next);
      if (next === 0) {
        queue.push(child);
      }
    }
  }

  if (order.length !== dependencies.size) {
    const cycle = [...dependencies.keys()].filter((key) => !order.includes(key));
    throw new Error(
      `Dependency cycle detected in sections: ${cycle.join(", ")}`
    );
  }

  return order;
};

const resolveStorage = <T,>(persist?: PersistConfig<T>): PersistConfig<T> | undefined => {
  if (!persist) {
    return undefined;
  }
  if (persist.storage) {
    return persist;
  }
  if (typeof window === "undefined") {
    return { ...persist, storage: null };
  }
  return { ...persist, storage: window.localStorage };
};

export type ConductorConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sections: SectionDefinition<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  derived?: DerivedSectionDefinition<any>[];
  scheduler?: Scheduler;
  bootstrap?: Record<string, unknown> | (() => Record<string, unknown> | undefined);
  transactionHistoryLimit?: number;
};

export const createConductor = (config: ConductorConfig): Conductor => {
  const sections = new Map<string, SectionState<unknown>>();
  const updates = new Map<string, Update>();
  const effects = new Set<EffectDefinition>();
  const dependencies = new Map<string, string[]>();
  const scheduler = createScheduler(config.scheduler);
  const transactionHistory: TransactionInfo[] = [];
  const transactionHistoryLimit = config.transactionHistoryLimit ?? 20;

  const persistValue = <T,>(state: SectionState<T>, value: T) => {
    if (!state.persist) {
      return;
    }
    const persist = resolveStorage(state.persist);
    if (!persist?.storage) {
      return;
    }
    if (persist.throttleMs && persist.throttleMs > 0) {
      if (state.persistTimer) {
        clearTimeout(state.persistTimer);
      }
      state.persistTimer = setTimeout(() => {
        defaultPersist(value, persist);
      }, persist.throttleMs);
      return;
    }
    defaultPersist(value, persist);
  };

  const hydrateValue = <T,>(state: SectionState<T>) => {
    const persist = resolveStorage(state.persist);
    if (!persist?.storage) {
      return;
    }
    const stored = readPersist<T>(persist);
    if (stored !== undefined) {
      state.value = stored;
      state.adapter?.set(stored);
    }
  };

  const bootstrapValues = (() => {
    if (!config.bootstrap) {
      return undefined;
    }
    if (typeof config.bootstrap === "function") {
      return config.bootstrap();
    }
    return config.bootstrap;
  })();

  for (const definition of config.sections) {
    if (sections.has(definition.key)) {
      throw new Error(`Section with key "${definition.key}" already exists.`);
    }
    const dependsOn = definition.dependsOn ?? [];
    const state: SectionState<unknown> = {
      key: definition.key,
      adapter: definition.source,
      subscribers: new Set(),
      dependsOn,
      persist: definition.persist,
      value: definition.source.get()
    };
    sections.set(definition.key, state);
    dependencies.set(definition.key, dependsOn);
  }

  const derivedDefinitions = config.derived ?? [];
  for (const definition of derivedDefinitions) {
    if (sections.has(definition.key)) {
      throw new Error(`Section with key "${definition.key}" already exists.`);
    }
    const state: SectionState<unknown> = {
      key: definition.key,
      subscribers: new Set(),
      dependsOn: definition.inputs,
      value: undefined,
      derived: {
        inputs: definition.inputs,
        compute: definition.compute,
        lastInputs: undefined
      }
    };
    sections.set(definition.key, state);
    dependencies.set(definition.key, definition.inputs);
  }

  const order = createDependencyOrder(dependencies);

  for (const [key, state] of sections) {
    if (bootstrapValues && key in bootstrapValues) {
      const value = bootstrapValues[key] as typeof state.value;
      state.value = value;
      state.adapter?.set(value);
      continue;
    }
    if (state.persist) {
      hydrateValue(state);
    }
  }

  const stagedChanges = new Set<string>();
  const pendingNotifications = new Set<string>();
  let scheduled = false;
  let transactionDepth = 0;
  let lastTransactionLabel: string | undefined;

  const notifySubscribers = () => {
    scheduled = false;
    for (const key of pendingNotifications) {
      const state = sections.get(key);
      if (!state) {
        continue;
      }
      for (const subscriber of state.subscribers) {
        subscriber();
      }
    }
    pendingNotifications.clear();
  };

  const scheduleNotify = (keys: string[]) => {
    for (const key of keys) {
      pendingNotifications.add(key);
    }
    if (scheduled) {
      return;
    }
    scheduled = true;
    scheduler(notifySubscribers);
  };

  const markChanged = (key: string) => {
    stagedChanges.add(key);
  };

  const applyUpdate = (state: SectionState<unknown>, update: Update): boolean => {
    if (update.type === "set") {
      if (Object.is(state.value, update.value)) {
        return false;
      }
      state.adapter?.set(update.value);
      state.value = update.value;
      return true;
    }

    if (state.adapter?.patch) {
      if (isObject(state.value) && isObject(update.value)) {
        const next = { ...state.value, ...update.value };
        const changed = Object.keys(update.value).some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (k) => !Object.is((state.value as any)[k], (update.value as any)[k])
        );

        if (!changed) {
          return false;
        }

        state.adapter.patch(update.value as Partial<unknown>);
        state.value = next;
        return true;
      }

      state.adapter.patch(update.value as Partial<unknown>);
      state.value = update.value;
      return true;
    }

    if (isObject(state.value) && isObject(update.value)) {
      const next = { ...state.value, ...update.value };
      const changed = Object.keys(update.value).some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (k) => !Object.is((state.value as any)[k], (update.value as any)[k])
      );

      if (!changed) {
        return false;
      }

      state.adapter?.set(next);
      state.value = next;
      return true;
    }

    throw new Error(`Section "${state.key}" does not support patch updates.`);
  };

  const computeDerived = (state: SectionState<unknown>) => {
    if (!state.derived) {
      return false;
    }
    const inputs = state.derived.inputs.map((key) => {
      const inputState = sections.get(key);
      if (!inputState) {
        throw new Error(`Missing input section "${key}".`);
      }
      return inputState.value;
    });
    if (
      state.derived.lastInputs &&
      inputs.every((value, index) => Object.is(value, state.derived?.lastInputs?.[index]))
    ) {
      return false;
    }
    const next = state.derived.compute(...inputs);
    const changed = !Object.is(state.value, next);
    state.value = next;
    state.derived.lastInputs = inputs;
    return changed;
  };

  for (const key of order) {
    const state = sections.get(key);
    if (!state?.derived) {
      continue;
    }
    computeDerived(state);
  }

  const runEffects = (changedKeys: string[]) => {
    if (effects.size === 0) {
      return;
    }
    const api = {
      get: <T,>(key: string) => getSectionValue<T>(key),
      set: <T,>(key: string, value: T) => setSectionValue(key, value),
      patch: <T extends object>(key: string, value: Partial<T>) =>
        patchSectionValue(key, value),
      transaction: (fn: () => void, label?: string) =>
        transaction(fn, label)
    };

    for (const effect of effects) {
      if (!effect.when.some((key) => changedKeys.includes(key))) {
        continue;
      }
      const limit = effect.maxDepth ?? 5;
      if (transactionDepth > limit) {
        throw new Error(
          `Effect depth exceeded while running effect for sections: ${effect.when.join(", ")}`
        );
      }
      effect.run(api);
    }
  };

  const commit = () => {
    if (updates.size === 0 && stagedChanges.size === 0) {
      return;
    }
    const changedKeys: string[] = [];

    for (const key of order) {
      const state = sections.get(key);
      if (!state) {
        continue;
      }
      const update = updates.get(key);
      if (update && !state.derived) {
        const changed = applyUpdate(state, update);
        if (changed) {
          persistValue(state, state.value);
          changedKeys.push(key);
        }
        updates.delete(key);
      }
      if (state.derived) {
        const derivedChanged = computeDerived(state);
        if (derivedChanged) {
          changedKeys.push(key);
        }
      }
    }

    if (changedKeys.length > 0) {
      scheduleNotify(changedKeys);
      transactionHistory.unshift({
        label: lastTransactionLabel,
        touched: [...new Set(changedKeys)],
        timestamp: now()
      });
      if (transactionHistory.length > transactionHistoryLimit) {
        transactionHistory.length = transactionHistoryLimit;
      }
    }

    stagedChanges.clear();
    lastTransactionLabel = undefined;
    runEffects(changedKeys);
  };

  const beginTransaction = (label?: string) => {
    transactionDepth += 1;
    if (label) {
      lastTransactionLabel = label;
    }
  };

  const endTransaction = () => {
    transactionDepth -= 1;
    if (transactionDepth === 0) {
      commit();
    }
  };

  const transaction = (fn: () => void, label?: string) => {
    beginTransaction(label);
    try {
      fn();
    } finally {
      endTransaction();
    }
  };

  const setSectionValue = (key: string, value: unknown) => {
    if (!sections.has(key)) {
      throw new Error(`Unknown section "${key}".`);
    }
    if (transactionDepth === 0) {
      return transaction(() => setSectionValue(key, value));
    }
    const state = sections.get(key);
    if (state?.derived) {
      throw new Error(`Cannot set derived section "${key}".`);
    }
    updates.set(key, { type: "set", value });
    markChanged(key);
  };

  const patchSectionValue = (key: string, value: Partial<unknown>) => {
    if (!sections.has(key)) {
      throw new Error(`Unknown section "${key}".`);
    }
    if (transactionDepth === 0) {
      return transaction(() => patchSectionValue(key, value));
    }
    const state = sections.get(key);
    if (state?.derived) {
      throw new Error(`Cannot patch derived section "${key}".`);
    }
    updates.set(key, { type: "patch", value });
    markChanged(key);
  };

  const getSectionValue = <T,>(key: string): T => {
    const state = sections.get(key);
    if (!state) {
      throw new Error(`Unknown section "${key}".`);
    }
    return state.value as T;
  };

  const subscribe = (key: string, cb: Subscriber) => {
    const state = sections.get(key);
    if (!state) {
      throw new Error(`Unknown section "${key}".`);
    }
    state.subscribers.add(cb);
    return () => {
      state.subscribers.delete(cb);
    };
  };

  const getSection = <T,>(key: string): SectionHandle<T> => {
    return {
      get: () => getSectionValue<T>(key),
      set: (next) => setSectionValue(key, next),
      patch: (next) => patchSectionValue(key, next as Partial<unknown>),
      subscribe: (cb) => subscribe(key, cb)
    };
  };

  const effect = (definition: EffectDefinition) => {
    effects.add(definition);
    return () => effects.delete(definition);
  };

  const getSnapshot = (): ConductorSnapshot => {
    const snapshot: ConductorSnapshot = { sections: {}, transactions: [] };
    for (const [key, state] of sections) {
      snapshot.sections[key] = state.value;
    }
    snapshot.transactions = [...transactionHistory];
    return snapshot;
  };

  const destroy = () => {
    sections.forEach((state) => {
      state.adapter?.destroy?.();
      if (state.persistTimer) {
        clearTimeout(state.persistTimer);
      }
      state.subscribers.clear();
    });
    sections.clear();
    updates.clear();
    effects.clear();
  };

  return {
    getSection,
    getSectionValue,
    subscribe,
    transaction,
    effect,
    getSnapshot,
    destroy
  };
};

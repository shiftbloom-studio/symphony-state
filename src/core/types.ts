export type Unsubscribe = () => void;
export type Subscriber = () => void;

export type SourceAdapter<T> = {
  get: () => T;
  set: (next: T) => void;
  patch?: (partial: Partial<T>) => void;
  subscribe: (cb: Subscriber) => Unsubscribe;
  kind: string;
  destroy?: () => void;
};

export type PersistConfig<T> = {
  key: string;
  storage?: Storage | null;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  throttleMs?: number;
};

export type SectionDefinition<T> = {
  key: string;
  source: SourceAdapter<T>;
  dependsOn?: string[];
  persist?: PersistConfig<T>;
  debugLabel?: string;
};

export type DerivedSectionDefinition<T> = {
  key: string;
  inputs: string[];
  compute: (...values: unknown[]) => T;
  debugLabel?: string;
};

export type Scheduler = "sync" | "microtask" | "raf" | ((flush: () => void) => void);

export type EffectDefinition = {
  when: string[];
  run: (api: {
    get: <T>(key: string) => T;
    set: <T>(key: string, value: T) => void;
    patch: <T extends object>(key: string, value: Partial<T>) => void;
    transaction: (fn: () => void, label?: string) => void;
  }) => void;
  maxDepth?: number;
};

export type SectionHandle<T> = {
  get: () => T;
  set: (next: T) => void;
  patch: (partial: Partial<T>) => void;
  subscribe: (cb: Subscriber) => Unsubscribe;
};

export type TransactionInfo = {
  label?: string;
  touched: string[];
  timestamp: number;
};

export type ConductorSnapshot = {
  sections: Record<string, unknown>;
  transactions: TransactionInfo[];
};

export type Conductor = {
  getSection: <T>(key: string) => SectionHandle<T>;
  getSectionValue: <T>(key: string) => T;
  subscribe: (key: string, cb: Subscriber) => Unsubscribe;
  transaction: (fn: () => void, label?: string) => void;
  effect: (definition: EffectDefinition) => Unsubscribe;
  getSnapshot: () => ConductorSnapshot;
  destroy: () => void;
};

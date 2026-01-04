import type { SourceAdapter, Subscriber, Unsubscribe } from "../core/types";

export type ExternalStore<T> = {
  get: () => T;
  set: (next: T) => void;
  subscribe: (cb: Subscriber) => Unsubscribe;
};

export const createExternalStoreAdapter = <T>(
  store: ExternalStore<T>,
  options?: { kind?: string; patch?: (partial: Partial<T>) => void }
): SourceAdapter<T> => {
  return {
    kind: options?.kind ?? "external",
    get: store.get,
    set: store.set,
    patch: options?.patch,
    subscribe: store.subscribe
  };
};

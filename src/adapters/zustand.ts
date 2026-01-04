import type { SourceAdapter, Subscriber, Unsubscribe } from "../core/types";

export type ZustandStore<T> = {
  getState: () => T;
  setState: (next: T | Partial<T>, replace?: boolean) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => Unsubscribe;
};

export const createZustandAdapter = <T>(store: ZustandStore<T>): SourceAdapter<T> => {
  return {
    kind: "zustand",
    get: store.getState,
    set: (next) => store.setState(next, true),
    patch: (partial) => store.setState(partial, false),
    subscribe: (cb: Subscriber) => store.subscribe(() => cb())
  };
};

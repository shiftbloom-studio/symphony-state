import type { SourceAdapter, Subscriber, Unsubscribe } from "../core/types";

export type AtomAdapter<T> = SourceAdapter<T> & {
  patch: (partial: Partial<T>) => void;
};

export const createAtomAdapter = <T>(initial: T): AtomAdapter<T> => {
  let current = initial;
  const subscribers = new Set<Subscriber>();

  const notify = () => {
    subscribers.forEach((cb) => cb());
  };

  return {
    kind: "atom",
    get: () => current,
    set: (next) => {
      if (Object.is(current, next)) {
        return;
      }
      current = next;
      notify();
    },
    patch: (partial) => {
      if (typeof current !== "object" || current === null) {
        throw new Error("AtomAdapter patch requires object state.");
      }
      current = { ...(current as Record<string, unknown>), ...partial } as T;
      notify();
    },
    subscribe: (cb: Subscriber): Unsubscribe => {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    }
  };
};

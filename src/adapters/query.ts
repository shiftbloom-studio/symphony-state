import type { SourceAdapter, Subscriber, Unsubscribe } from "../core/types";

export type QueryClientLike = {
  getQueryData: (key: unknown) => unknown;
  setQueryData: (key: unknown, updater: unknown) => void;
  getQueryCache: () => { subscribe: (listener: () => void) => Unsubscribe };
};

export type QueryAdapterOptions = {
  queryClient: QueryClientLike;
  queryKey: unknown;
};

export const createQueryAdapter = <T>(options: QueryAdapterOptions): SourceAdapter<T> => {
  return {
    kind: "query",
    get: () => options.queryClient.getQueryData(options.queryKey) as T,
    set: (next) => {
      options.queryClient.setQueryData(options.queryKey, next);
    },
    subscribe: (cb: Subscriber) => options.queryClient.getQueryCache().subscribe(cb)
  };
};

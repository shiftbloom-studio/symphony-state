import type { SourceAdapter, Subscriber, Unsubscribe } from "../core/types";

export type ReduxStore<State> = {
  getState: () => State;
  dispatch: (action: unknown) => unknown;
  subscribe: (listener: () => void) => Unsubscribe;
};

export type ReduxAdapterOptions<State, Slice> = {
  select: (state: State) => Slice;
  update: (next: Slice) => unknown;
  patch?: (partial: Partial<Slice>) => unknown;
};

export const createReduxAdapter = <State, Slice>(
  store: ReduxStore<State>,
  options: ReduxAdapterOptions<State, Slice>
): SourceAdapter<Slice> => {
  return {
    kind: "redux",
    get: () => options.select(store.getState()),
    set: (next) => {
      store.dispatch(options.update(next));
    },
    patch: options.patch
      ? (partial) => {
          store.dispatch(options.patch?.(partial));
        }
      : undefined,
    subscribe: (cb: Subscriber) => store.subscribe(cb)
  };
};

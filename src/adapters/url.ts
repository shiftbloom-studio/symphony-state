import type { SourceAdapter, Subscriber, Unsubscribe } from "../core/types";

export type UrlAdapterOptions<T> = {
  parse: (params: URLSearchParams) => T;
  serialize: (value: T) => URLSearchParams;
  getSearchParams?: () => URLSearchParams;
  setSearchParams?: (params: URLSearchParams) => void;
  subscribe?: (cb: Subscriber) => Unsubscribe;
  kind?: string;
};

const defaultGetParams = () => {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
};

const defaultSetParams = (params: URLSearchParams) => {
  if (typeof window === "undefined") {
    return;
  }
  const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.replaceState({}, "", url);
};

const defaultSubscribe = (cb: Subscriber): Unsubscribe => {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const handler = () => cb();
  window.addEventListener("popstate", handler);
  return () => window.removeEventListener("popstate", handler);
};

export const createUrlParamsAdapter = <T>(
  options: UrlAdapterOptions<T>
): SourceAdapter<T> => {
  const getParams = options.getSearchParams ?? defaultGetParams;
  const setParams = options.setSearchParams ?? defaultSetParams;
  const subscribe = options.subscribe ?? defaultSubscribe;

  return {
    kind: options.kind ?? "url",
    get: () => options.parse(getParams()),
    set: (next) => setParams(options.serialize(next)),
    subscribe
  };
};

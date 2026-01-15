import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import type { SectionHandle } from "../core/types";
import { useConductor } from "./SymphonyProvider";

export const useSection = <T,>(key: string): SectionHandle<T> & { value: T } => {
  const conductor = useConductor();

  const getSnapshot = useCallback(() => conductor.getSectionValue<T>(key), [
    conductor,
    key
  ]);

  const subscribe = useCallback(
    (cb: () => void) => conductor.subscribe(key, cb),
    [conductor, key]
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const handle = useMemo(
    () => ({
      value,
      get: () => value,
      set: (next: T) => conductor.getSection<T>(key).set(next),
      patch: (partial: Partial<T>) =>
        conductor.getSection<T>(key).patch(partial),
      subscribe: (cb: () => void) => conductor.subscribe(key, cb)
    }),
    [conductor, key, value, subscribe]
  );

  return handle;
};

export const useSelector = <T, S>(
  key: string,
  selector: (value: T) => S,
  equality: (a: S, b: S) => boolean = Object.is
) => {
  const conductor = useConductor();
  const selectedRef = useRef<S | undefined>(undefined);

  const getSnapshot = useCallback(() => {
    const value = conductor.getSectionValue<T>(key);
    const nextSelected = selector(value);
    if (
      selectedRef.current !== undefined &&
      equality(selectedRef.current, nextSelected)
    ) {
      return selectedRef.current;
    }
    selectedRef.current = nextSelected;
    return nextSelected;
  }, [conductor, key, selector, equality]);

  const subscribe = useCallback(
    (cb: () => void) => conductor.subscribe(key, cb),
    [conductor, key]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

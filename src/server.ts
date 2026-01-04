/**
 * Optional secondary entrypoint (exported as `./server`).
 *
 * Replace/remove as needed.
 */
export function isServerRuntime() {
  return typeof window === "undefined";
}


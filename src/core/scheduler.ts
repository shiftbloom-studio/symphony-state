import type { Scheduler } from "./types";

const scheduleMicrotask = (flush: () => void) => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(flush);
    return;
  }
  Promise.resolve().then(flush);
};

export const createScheduler = (scheduler?: Scheduler) => {
  if (!scheduler || scheduler === "microtask") {
    return scheduleMicrotask;
  }
  if (scheduler === "sync") {
    return (flush: () => void) => flush();
  }
  if (scheduler === "raf") {
    return (flush: () => void) => {
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => flush());
        return;
      }
      scheduleMicrotask(flush);
    };
  }
  return scheduler;
};

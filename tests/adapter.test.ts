import { createAtomAdapter } from "../src/adapters/atom";

describe("AtomAdapter", () => {
  it("supports get, set, patch, subscribe", () => {
    const adapter = createAtomAdapter({ count: 0 });
    const events: number[] = [];
    const unsubscribe = adapter.subscribe(() => events.push(adapter.get().count));

    adapter.set({ count: 1 });
    adapter.patch({ count: 2 });
    unsubscribe();
    adapter.set({ count: 3 });

    expect(events).toEqual([1, 2]);
    expect(adapter.get().count).toBe(3);
  });
});

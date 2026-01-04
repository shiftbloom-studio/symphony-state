import { createConductor } from "../src/core/conductor";
import { defineDerivedSection, defineSection } from "../src/core/section";
import { createAtomAdapter } from "../src/adapters/atom";

const createSection = <T,>(key: string, value: T) =>
  defineSection({ key, source: createAtomAdapter(value) });

describe("core conductor", () => {
  it("runs atomic transactions and notifies once", () => {
    const auth = createSection("auth", { userId: null as string | null });
    const cart = createSection("cart", { items: 0 });
    const conductor = createConductor({ sections: [auth, cart], scheduler: "sync" });

    const authNotifications: string[] = [];
    const cartNotifications: string[] = [];

    conductor.subscribe("auth", () => authNotifications.push("auth"));
    conductor.subscribe("cart", () => cartNotifications.push("cart"));

    conductor.transaction(() => {
      conductor.getSection("auth").set({ userId: "42" });
      conductor.getSection("cart").patch({ items: 3 });
    });

    expect(authNotifications).toHaveLength(1);
    expect(cartNotifications).toHaveLength(1);
  });

  it("resolves derived sections after inputs", () => {
    const cart = createSection("cart", { items: 1 });
    const pricing = defineDerivedSection({
      key: "pricing",
      inputs: ["cart"],
      compute: (cartState: { items: number }) => cartState.items * 2
    });
    const conductor = createConductor({
      sections: [cart],
      derived: [pricing],
      scheduler: "sync"
    });

    conductor.transaction(() => {
      conductor.getSection("cart").patch({ items: 4 });
    });

    expect(conductor.getSectionValue("pricing")).toBe(8);
  });

  it("memoizes derived recomputations", () => {
    const cart = createSection("cart", { items: 1 });
    const calls: number[] = [];
    const derived = defineDerivedSection({
      key: "total",
      inputs: ["cart"],
      compute: (cartState: { items: number }) => {
        calls.push(cartState.items);
        return cartState.items;
      }
    });
    const conductor = createConductor({
      sections: [cart],
      derived: [derived],
      scheduler: "sync"
    });

    conductor.transaction(() => {
      conductor.getSection("cart").patch({ items: 1 });
    });

    conductor.transaction(() => {
      conductor.getSection("cart").patch({ items: 2 });
    });

    expect(calls).toEqual([1, 2]);
  });

  it("detects dependency cycles", () => {
    const a = defineSection({
      key: "a",
      source: createAtomAdapter(1),
      dependsOn: ["b"]
    });
    const b = defineSection({
      key: "b",
      source: createAtomAdapter(2),
      dependsOn: ["a"]
    });

    expect(() => createConductor({ sections: [a, b] })).toThrow(
      /Dependency cycle/gi
    );
  });
});

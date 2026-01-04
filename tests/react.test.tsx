import React, { useRef } from "react";
import { render, act } from "@testing-library/react";
import { SymphonyProvider } from "../src/react/SymphonyProvider";
import { useSection, useSelector } from "../src/react/hooks";
import { createConductor } from "../src/core/conductor";
import { defineSection } from "../src/core/section";
import { createAtomAdapter } from "../src/adapters/atom";

const createSection = <T,>(key: string, value: T) =>
  defineSection({ key, source: createAtomAdapter(value) });

describe("React bindings", () => {
  it("only re-renders when section changes", () => {
    const auth = createSection("auth", { userId: null as string | null });
    const cart = createSection("cart", { items: 0 });
    const conductor = createConductor({
      sections: [auth, cart],
      scheduler: "sync"
    });

    const renders: number[] = [];

    const AuthPanel = () => {
      const section = useSection<{ userId: string | null }>("auth");
      const renderCount = useRef(0);
      renderCount.current += 1;
      renders.push(renderCount.current);
      return <div>{section.value.userId ?? "none"}</div>;
    };

    const { getByText } = render(
      <SymphonyProvider conductor={conductor}>
        <AuthPanel />
      </SymphonyProvider>
    );

    expect(getByText("none")).toBeInTheDocument();

    act(() => {
      conductor.getSection("cart").patch({ items: 3 });
    });

    act(() => {
      conductor.getSection("auth").set({ userId: "42" });
    });

    expect(renders).toHaveLength(2);
  });

  it("respects selector equality", () => {
    const counter = createSection("counter", { value: 0 });
    const conductor = createConductor({ sections: [counter], scheduler: "sync" });

    const renders: number[] = [];

    const CounterView = () => {
      const value = useSelector(
        "counter",
        (state: { value: number }) => state.value % 2,
        (a, b) => a === b
      );
      const renderCount = useRef(0);
      renderCount.current += 1;
      renders.push(renderCount.current);
      return <div>{value}</div>;
    };

    render(
      <SymphonyProvider conductor={conductor}>
        <CounterView />
      </SymphonyProvider>
    );

    act(() => {
      conductor.getSection("counter").set({ value: 1 });
    });

    act(() => {
      conductor.getSection("counter").set({ value: 3 });
    });

    expect(renders).toHaveLength(2);
  });
});

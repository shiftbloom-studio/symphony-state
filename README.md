# Symphony State

[![npm](https://img.shields.io/npm/v/@shiftbloom-studio/symphony-state)](https://www.npmjs.com/package/@shiftbloom-studio/symphony-state)
[![CI](https://img.shields.io/github/actions/workflow/status/shiftbloom-studio/symphony-state/ci.yml)](https://github.com/shiftbloom-studio/symphony-state/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@shiftbloom-studio/symphony-state)](LICENSE)

**Orchestrate multiple state sources without a monolithic global store.**

Symphony State coordinates local state, React Context, external stores (Zustand/Redux), server state libraries (TanStack Query/SWR), URL params, and browser persistence without taking ownership of those sources. It focuses on deterministic, dependency-driven propagation and atomic transactions so you can keep cross-domain state consistent.

## Why Symphony State?

- **Mixed sources drift**: local state, URL params, and external stores can diverge.
- **Update storms**: independent updates trigger multiple re-renders.
- **Cross-domain dependencies**: cart state depends on auth/pricing, etc.

Symphony State provides an orchestration layer that schedules updates in a single wave and keeps dependencies consistent.

## Installation

```bash
npm install @shiftbloom-studio/symphony-state
```

## Quickstart (AtomAdapter)

```tsx
import {
  createConductor,
  defineSection,
  createAtomAdapter
} from "@shiftbloom-studio/symphony-state";
import { SymphonyProvider, useSection } from "@shiftbloom-studio/symphony-state/react";

const auth = defineSection({
  key: "auth",
  source: createAtomAdapter({ userId: null as string | null })
});

const conductor = createConductor({ sections: [auth] });

function AuthPanel() {
  const authSection = useSection<{ userId: string | null }>("auth");
  return (
    <button onClick={() => authSection.set({ userId: "42" })}>
      {authSection.value.userId ?? "Login"}
    </button>
  );
}

export function App() {
  return (
    <SymphonyProvider conductor={conductor}>
      <AuthPanel />
    </SymphonyProvider>
  );
}
```

## Quickstart (Zustand + Redux adapters)

```ts
import { createZustandAdapter } from "@shiftbloom-studio/symphony-state/adapters/zustand";
import { createReduxAdapter } from "@shiftbloom-studio/symphony-state/adapters/redux";

const zustandSection = defineSection({
  key: "filters",
  source: createZustandAdapter(zustandStore)
});

const reduxSection = defineSection({
  key: "cart",
  source: createReduxAdapter(reduxStore, {
    select: (state) => state.cart,
    update: (next) => ({ type: "cart/replace", payload: next }),
    patch: (partial) => ({ type: "cart/patch", payload: partial })
  })
});
```

## Transactions

```ts
conductor.transaction(() => {
  conductor.getSection("auth").set({ userId: "42" });
  conductor.getSection("cart").patch({ ownerId: "42" });
}, "login");
```

All section updates are staged, resolved in dependency order, committed atomically, and only then are subscribers notified.

## Derived sections

```ts
import { defineDerivedSection } from "@shiftbloom-studio/symphony-state";

const pricing = defineDerivedSection({
  key: "pricing",
  inputs: ["cart", "auth"],
  compute: (cart, auth) => ({
    total: cart.items.length * (auth.isPremium ? 0.8 : 1)
  })
});
```

Derived sections are read-only and recompute only when their inputs change.

## Next.js patterns

### App Router

```tsx
// app/layout.tsx
"use client";
import { SymphonyProvider } from "@shiftbloom-studio/symphony-state/react";
import { conductor } from "./symphony";

export default function RootLayout({ children }) {
  return <SymphonyProvider conductor={conductor}>{children}</SymphonyProvider>;
}
```

### Pages Router

```tsx
// pages/_app.tsx
import { SymphonyProvider } from "@shiftbloom-studio/symphony-state/react";
import { conductor } from "../symphony";

export default function App({ Component, pageProps }) {
  return (
    <SymphonyProvider conductor={conductor}>
      <Component {...pageProps} />
    </SymphonyProvider>
  );
}
```

### Hydration helper

```tsx
import { SymphonyScript } from "@shiftbloom-studio/symphony-state/react";

<SymphonyScript state={{ auth: { userId: "42" } }} />;
```

## Persistence

```ts
import { createStorageSink } from "@shiftbloom-studio/symphony-state";

const auth = defineSection({
  key: "auth",
  source: createAtomAdapter({ userId: null }),
  persist: createStorageSink({
    key: "symphony-auth",
    throttleMs: 200
  })
});
```

## DevTools (optional)

```tsx
import { SymphonyDevTools } from "@shiftbloom-studio/symphony-state/devtools";

<SymphonyDevTools maxTransactions={10} />;
```

DevTools are dev-only, tree-shakeable, and unstyled apart from minimal CSS variables.

## API Reference

| API                                 | Description                                    |
| ----------------------------------- | ---------------------------------------------- |
| `createConductor(config)`           | Create a conductor instance.                   |
| `defineSection(def)`                | Define a section backed by a source adapter.   |
| `defineDerivedSection(def)`         | Define a derived, read-only section.           |
| `createAtomAdapter(initial)`        | Built-in minimal store.                        |
| `createExternalStoreAdapter(store)` | Wrap an external get/set/subscribe store.      |
| `createUrlParamsAdapter(options)`   | Sync with URL search params.                   |
| `createStorageSink(options)`        | Persist section values to storage.             |
| `SymphonyProvider`                  | React context provider.                        |
| `useSection(key)`                   | React hook for section read/write.             |
| `useSelector(key, selector)`        | Selector hook with equality.                   |
| `createSymphony(config)`            | Typed helper that wires a conductor and hooks. |
| `SymphonyDevTools`                  | Optional devtools panel.                       |

## Design principles

- **Orchestration, not ownership**: Symphony State coordinates existing stores.
- **Predictable updates**: deterministic, dependency-ordered commit waves.
- **Tree-shakeable**: optional adapters and devtools ship as separate entrypoints.
- **SSR-safe**: no unguarded `window` usage in core.

## License

MIT

# Symphony State

[![npm](https://img.shields.io/npm/v/@shiftbloom-studio/symphony-state)](https://www.npmjs.com/package/@shiftbloom-studio/symphony-state)
[![CI](https://img.shields.io/github/actions/workflow/status/shiftbloom-studio/symphony-state/ci.yml)](https://github.com/shiftbloom-studio/symphony-state/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@shiftbloom-studio/symphony-state)](LICENSE)

**Orchestrate multiple state sources without a monolithic global store.**

Symphony State is a lightweight orchestration layer that keeps server caches, UI state, and browser persistence in tempo. It does not replace your existing stores. Instead, it composes them into predictable, dependency-driven flows with atomic transactions, derived sections, and observable reconciliation.

---

## Why Symphony State?

Modern apps blend server state (SWR/TanStack Query), local UI state, URL params, and client caches. Those sources drift, and race conditions appear.

Symphony State focuses on **coordination**:

- **Orchestration, not ownership**: keep each state source independent.
- **Deterministic updates**: staged commits resolve dependencies in a single wave.
- **Smart reconciliation**: establish precedence between server, cache, and optimistic UI.
- **Observability**: inspect which source is driving your UI at any time.
- **Performance**: local updates notify only subscribers for touched sections.

---

## Install

```bash
npm install @shiftbloom-studio/symphony-state
```

---

## Quickstart (AtomAdapter + React)

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

---

## The Conductor Pattern (multi-source orchestration)

The **Conductor** stitches independent sources together. Use the orchestrated adapter to define a "symphony" of sources that resolves into a single view.

```ts
import {
  createOrchestratedAdapter,
  defineSection,
  createAtomAdapter,
  createExternalStoreAdapter
} from "@shiftbloom-studio/symphony-state";

const serverCache = createExternalStoreAdapter(serverCacheStore);
const localDraft = createAtomAdapter({ title: "", body: "" });

const postSection = defineSection({
  key: "post",
  source: createOrchestratedAdapter({
    instruments: [
      { id: "server", source: serverCache, priority: 1, role: "server" },
      { id: "draft", source: localDraft, priority: 2, role: "optimistic" }
    ],
    writeTo: "draft",
    optimistic: true,
    staleAfterMs: 30_000
  })
});
```

**Precedence** is decided by `priority` and `updatedAt`, with staleness protection. By default, the highest priority, freshest instrument wins. You can override reconciliation with a custom `reconcile` function.

---

## Smart Reconciliation

When the server says **X** but the client says **Y**, Symphony State provides reconciliation hooks:

- **Optimistic updates**: immediately update UI, then reconcile once server responds.
- **Eventual consistency**: keep local drafts until authoritative data catches up.
- **Custom policies**: write your own resolver to merge, prefer, or weight sources.

```ts
import type { ReconcileContext } from "@shiftbloom-studio/symphony-state";

const reconcile = <T extends { version: number }>(ctx: ReconcileContext<T>) => {
  const entries = Object.entries(ctx.values).map(([id, value]) => ({ id, value }));
  const winner = entries.sort((a, b) => b.value.version - a.value.version)[0];
  return {
    value: winner.value,
    sourceId: winner.id,
    updatedAt: ctx.meta[winner.id].updatedAt
  };
};
```

---

## Derived Sections

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

---

## Transactions

```ts
conductor.transaction(() => {
  conductor.getSection("auth").set({ userId: "42" });
  conductor.getSection("cart").patch({ ownerId: "42" });
}, "login");
```

All updates are staged, resolved in dependency order, and committed atomically.

---

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

---

## DevTools & Observability

Use the built-in devtools panel or access orchestration snapshots programmatically.

```tsx
import { SymphonyDevTools } from "@shiftbloom-studio/symphony-state/devtools";

<SymphonyDevTools maxTransactions={10} />;
```

```ts
const postAdapter = createOrchestratedAdapter({ /* instruments */ });
const snapshot = postAdapter.getSnapshot();
```

`getSnapshot()` reports the active **driver** plus all instrument values, priorities, and staleness flags so you can see which source is in control.

---

## Next.js integration

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

---

## API Reference

| API                                 | Description                                    |
| ----------------------------------- | ---------------------------------------------- |
| `createConductor(config)`           | Create a conductor instance.                   |
| `defineSection(def)`                | Define a section backed by a source adapter.   |
| `defineDerivedSection(def)`         | Define a derived, read-only section.           |
| `createOrchestratedAdapter(config)` | Orchestrate multiple sources with precedence.  |
| `createAtomAdapter(initial)`        | Built-in minimal store.                        |
| `createExternalStoreAdapter(store)` | Wrap an external get/set/subscribe store.      |
| `createUrlParamsAdapter(options)`   | Sync with URL search params.                   |
| `createStorageSink(options)`        | Persist section values to storage.             |
| `SymphonyProvider`                  | React context provider.                        |
| `useSection(key)`                   | React hook for section read/write.             |
| `useSelector(key, selector)`        | Selector hook with equality.                   |
| `createSymphony(config)`            | Typed helper that wires a conductor and hooks. |
| `SymphonyDevTools`                  | Optional devtools panel.                       |

---

## Design Principles

- **Orchestration, not monolith**: state sources remain independent.
- **Deterministic propagation**: dependency-ordered commit waves.
- **Composable adapters**: plug in external stores without boilerplate.
- **SSR-safe**: no unguarded `window` usage in core.

---

## License

MIT

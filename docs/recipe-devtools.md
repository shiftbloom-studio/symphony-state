# DevTools recipe

This recipe shows how to add `SymphonyDevTools` next to your `SymphonyProvider`, name transactions so they are easier to inspect, and keep the panel out of production builds.

## Add the panel

Import the provider and DevTools panel from their public entry points. Render the panel inside the provider so it can observe the same conductor used by the application.

```tsx
import { SymphonyProvider } from "@shiftbloom-studio/symphony-state/react";
import { SymphonyDevTools } from "@shiftbloom-studio/symphony-state/devtools";
import { conductor } from "./symphony";
import { AppRoutes } from "./app-routes";

export function App() {
  return (
    <SymphonyProvider conductor={conductor}>
      <AppRoutes />
      <SymphonyDevTools maxTransactions={10} />
    </SymphonyProvider>
  );
}
```

`maxTransactions={10}` keeps the panel focused on the most recent activity while you are developing or debugging an interaction.

## Name transactions

The second argument to `conductor.transaction` becomes the transaction name shown in DevTools. Use a short name that explains the user or system action.

```ts
conductor.transaction(() => {
  conductor.getSection("cart").patch({ coupon: "WELCOME10" });
  conductor.getSection("checkout").patch({ discountApplied: true });
}, "checkout:apply-coupon");
```

A name such as `checkout:apply-coupon` makes it easier to distinguish related updates while reading the transaction history.

## Turn the panel off

Render DevTools only when your application is running in a development environment. The exact environment flag depends on your application framework.

```tsx
const showDevTools = isDevelopment;

export function App() {
  return (
    <SymphonyProvider conductor={conductor}>
      <AppRoutes />
      {showDevTools ? <SymphonyDevTools maxTransactions={10} /> : null}
    </SymphonyProvider>
  );
}
```

Replace `isDevelopment` with the development flag provided by your build tool or application framework. Keeping the panel conditional avoids exposing debugging controls in a production interface.

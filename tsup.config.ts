import { defineConfig } from "tsup";

const shared = {
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  minify: false
} as const;

export default defineConfig([
  {
    ...shared,
    entry: {
      index: "src/index.ts",
      react: "src/react/index.ts",
      devtools: "src/devtools/index.ts",
      "adapters/atom": "src/adapters/atom.ts",
      "adapters/external": "src/adapters/external.ts",
      "adapters/url": "src/adapters/url.ts",
      "adapters/zustand": "src/adapters/zustand.ts",
      "adapters/redux": "src/adapters/redux.ts",
      "adapters/query": "src/adapters/query.ts"
    },
    clean: true
  }
]);

## Contributing

### First evening

You do not need to be good. Finish the small thing. English or German is fine.

Pick a ticket labeled `good first issue`, leave a comment, and open a focused PR. If you want a pointer first, start here: https://github.com/shiftbloom-studio/symphony-state/issues/49

Clone, install, then run the tests (or the demo — either is enough for a first evening):

```bash
git clone https://github.com/shiftbloom-studio/symphony-state.git
cd symphony-state
npm ci
npm test
```

The Next.js demo and in-app docs live in `demo/` (inventory, playground, `/docs/mental-model`):

```bash
cd demo
npm ci
npm run dev
```

That serves on port 3030. The demo builds the library if `dist/` is missing.

Recipes are short copy-paste guides. They belong in `docs/` as `docs/recipe-*.md`, with a link from the README. The README also has the compact examples.

Library code is in `src/`. Tests are in `tests/`.

### Setup

```bash
npm ci
```

### Common scripts

- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

### Releasing

Add a changeset for user-facing changes:

```bash
npm run changeset
```


## Contributing

### First evening

You do not need to be good. Finish the small thing. English or German is fine.

Pick a ticket labeled `good first issue`, leave a comment, and open a focused PR. If you want a pointer first, start here: https://github.com/shiftbloom-studio/symphony-state/issues/49

Clone, install, then run the tests (or the demo - either is enough for a first evening):

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

The demo is a static export (`npm run build` writes `demo/out`) served by Cloudflare Workers static assets, configured in `demo/wrangler.jsonc`. `npm run preview` builds it and serves it locally with Wrangler. The imprint and privacy pages read the operator details from build variables; copy `demo/.env.example` to `demo/.env.local` to fill them in locally. Never commit real values.

To host your own copy, connect the repository in Workers Builds with root directory `demo`, build command `npm run build`, deploy command `npx wrangler deploy`, and set the `OPERATOR_*` variables as build variables.

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


## Working on an issue

Issues labeled `good first issue` or `help wanted` are open to anyone. Before you write code:

1. Comment on the issue and say how you plan to approach it: the files you expect to touch, and anything you would do differently from what the issue suggests. A few sentences are enough.
2. Wait until a maintainer assigns the issue to you. That way two people don't build the same thing, and we can point out a dead end before you spend an evening on it.
3. Open the pull request and link the issue (`Closes #123`).

Typo fixes and other small, obvious changes can go straight to a pull request.

If an assigned issue sees no activity for 14 days, we'll check in and may hand it to someone else. You're welcome to pick it up again later.

## Using AI tools

You're welcome to use AI assistants, the same way you'd use an editor or a linter. We only ask that a person stands behind every contribution:

- You have read and understood every line you submit, and you ran the checks yourself.
- You answer review questions in your own words and can change the code when we ask.
- The pull request description explains what you decided and why. The diff already shows what changed.

Issues, comments and pull requests that an agent wrote and posted on its own, with nobody actually involved, will be closed. This isn't about the tool. We'd like to get to know the people who work on this project.

## License

By contributing, you agree that your contributions are licensed under the [AGPL-3.0-or-later](./LICENSE).

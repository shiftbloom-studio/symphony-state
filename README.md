# @npm-package-template

Template repository for an npm package (TypeScript + tsup + Jest + ESLint + Changesets + GitHub Actions).

## Quick start

```bash
npm ci
npm test
npm run build
```

## Customize

Update:

- `package.json`: `name`, `description`, `repository`, `homepage`, `bugs`, `license`, `exports`
- `.changeset/config.json`: `repo`

## Release (Changesets)

- Add a changeset: `npm run changeset`
- On push to `main`, the Release workflow will create a version PR or publish after merge (requires repo secret `NPM_TOKEN` or `NODE_AUTH_TOKEN`).


## Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

- Add a changeset for changes you want to release:
  - `npm run changeset`
- The Release workflow will either:
  - create a version PR, or
  - publish to npm after that PR is merged (depending on whether there are unpublished changesets)


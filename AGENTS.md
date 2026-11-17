# Agent notes

## Layout

- `index.js`: Host plugin (`card-board` row): config, the three `/api/card-board/*` Fetch routes, presses.
- `src/schema.js`: the file format, shared by the server, the CLI and producers (`@soffits/dsh-card-board/schema`). Pure, no dependencies.
- `src/store.js`: reading boards and cards from the data folder (ids, real paths inside the folder, size limits, ETags from stat).
- `src/access.js`: single-owner vs per-person mode, the people mapping, `viewers` checks.
- `src/routes.js`: the routes; every answer is decided per request from `requestIdentity`.
- `src/presses.js`: action presses: log, publish, pending/done/unhandled.
- `client.js`: the Web UI page (DSH Client module format, no build). `client.actions.js`: the shared action buttons, loaded as a package-local client chunk with `require.async('./client.actions.js')`; other plugins copy it.
- `bin/dsh-card-board.js`: the CLI.

## Rules

- The plugin displays only: no outbound requests, no credentials, no running commands. Presses become events; handlers live elsewhere.
- Access is checked on the server for every request. Never hide things in the browser as the control.
- Data routes are exact Fetch routes under `/api` (`ctx.connection.fetch.register`) so DSH admits the browser first and a `requestIdentity` provider sees the request; routes on `ctx.webServer` would not.
- Colours only through DSH theme tokens (`--dsw-alias-*`), tones in the data.
- Schema changes: change `src/schema.js`, the README section, the examples and the tests together.

## Checks

`npm run check` (syntax, example board against the schema) and `npm test` (node --test, includes a run behind DSH's real Connection and web server). CI runs both on Node 22 and 24.

## Git

- Conventional Commits, one-line subjects. Squash merges. PR titles are Conventional Commit subjects.
- Versions follow semver from the commit types since the last tag (below 1.0: feat or breaking → minor, fix → patch); `.github/scripts/release-bump-check.py` checks a tag.
- Releases: bump `package.json` and `CHANGELOG.md`, merge, tag `vX.Y.Z`, `npm publish --access public`, then a GitHub release with the changelog section.

# Agent notes

## Layout

- `index.js`: Host plugin (`card-board` row): config, the `/api/card-board/*` Fetch routes, presses.
- `src/schema.js`: the file format, shared by the server, the CLI and producers (`@soffits/dsh-card-board/schema`). Pure, no dependencies.
- `src/store.js`: reading boards and cards from the data folder (ids, real paths inside the folder, size limits, ETags from stat).
- `src/access.js`: single-owner vs per-person mode, the people mapping, `viewers` checks.
- `src/routes.js`: the routes; every answer is decided per request from `requestIdentity`.
- `src/presses.js`: action presses: log, publish, pending/done/unhandled.
- `src/messages.js` and `locale/<tag>.json`: the page's own words, one file per language (`ui`, next to DSH's `meta`), merged exact tag → primary language → `en` and served by `/api/card-board/locale`.
- `client.js`: the Web UI page (DSH Client module format, no build). `client.actions.js`: the shared action buttons, loaded as a package-local client chunk with `require.async('./client.actions.js')`. It is meant to be replaced by the shared `@soffits/dsh-ui-actions` package, so keep it as it is.
- `bin/dsh-card-board.js`: the CLI.

## Rules

- The plugin displays only: no outbound requests, no credentials, no running commands. Presses become events; handlers live elsewhere.
- Access is checked on the server for every request. Never hide things in the browser as the control.
- Data routes are exact Fetch routes under `/api` (`ctx.connection.fetch.register`) so DSH admits the browser first and a `requestIdentity` provider sees the request; routes on `ctx.webServer` would not.
- Colours only through DSH theme tokens (`--dsw-alias-*`), tones in the data.
- Schema changes: change `src/schema.js`, the README section, the examples and the tests together.
- Words: no string a person reads in code. Components take them from the language files (`t('key')`), card text from the card (`string | { en, … }`), numbers and dates from `Intl` in the active locale. No language is named anywhere in code or config; a language is a file. `test/client.test.js` fails on a literal in a rendered child or text prop.
- Client scripts run as classic scripts in one global scope: no top-level declarations (wrap in a function), and a chunk registers as `{ id: <package>, chunk: 'client.<name>.js' }`.
- Phone first: tap targets at least 40 px at 768 px and below or on touch, no horizontal scroll, long text shortens with the full text on hover and tap. Look at the real page at 360, 390, 768, 1280 and 1920 px in two languages before a release.

## Checks

`npm run check` (syntax, example board against the schema) and `npm test` (node --test, includes a run behind DSH's real Connection and web server). CI runs both on Node 22 and 24.

## Git

- Conventional Commits, one-line subjects. Squash merges. PR titles are Conventional Commit subjects.
- Versions follow semver from the commit types since the last tag (below 1.0: feat or breaking → minor, fix → patch); `.github/scripts/release-bump-check.py` checks a tag.
- Releases: bump `package.json` and `CHANGELOG.md`, merge, tag `vX.Y.Z`, `npm publish --access public`, then a GitHub release with the changelog section.

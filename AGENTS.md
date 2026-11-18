# Agent notes

## Layout

- `index.js`: Host plugin (`card-board` row): config, the `/api/card-board/*` Fetch routes, presses.
- `src/schema.js`: the file format, shared by the server, the CLI and producers (`@soffits/dsh-card-board/schema`). Pure, no dependencies.
- `src/store.js`: reading boards and cards from the data folder (ids, real paths inside the folder, size limits, ETags from stat).
- `src/access.js`: single-owner vs per-person mode, the people mapping, `viewers` checks.
- `src/routes.js`: the routes; every answer is decided per request from `requestIdentity`.
- `src/seen.js`: content versions of cards and keyed rows, and what each person has seen (`<dataDir>/.seen/`).
- `src/person-store.js`: the one-file-per-person store both `seen.js` and `arrange-store.js` use. `src/arrange.js` (pure, shared with the page): a person's pins and order, the moves, and the `raise` windows; `src/arrange-store.js`: `<dataDir>/.arrange/`. Why: `docs/decisions/card-order.md`.
- `src/watch.js`: one shared watch per board folder (fs.watch plus a stat poll) for the events route.
- `src/presses.js`: action presses: log, publish, pending/done/unhandled.
- `src/messages.js` and `locale/<tag>.json`: the page's own words, one file per language (`ui`, next to DSH's `meta`), merged exact tag → primary language → `en` and served by `/api/card-board/locale`.
- `src/client/`: the Web UI page, built into `client.js` by `npm run build` (esbuild; committed, `npm run check` fails when it is stale). `page.js` loads boards, follows the events stream and falls back to polling; `live-state.js` (pure) decides what washes and what is new; `raise.js`, `drag.js`, `flip.js` and `arrange-ui.js` are the page's order: what is raised now (one timer), dragging, the glide, and the card's menu; `card.js` is the card frame, `cards.js` the non-chart bodies, `charts.js` the SVG charts. DSH's own components come from `@deepseek-ai/dsh-client-ui-primitives` (the shared module table); icons, tiles, ticking time, rings, sparklines, the live line and change cues from `@soffits/dsh-ui-kit` (`ctx.uiKit`, required); the buttons from `@soffits/dsh-ui-actions` (`ctx.uiActions`, used when present).
- `bin/dsh-card-board.js`: the CLI.

## Rules

- The plugin displays only: no outbound requests, no credentials, no running commands. Presses become events; handlers live elsewhere.
- Access is checked on the server for every request. Never hide things in the browser as the control.
- Data routes are exact Fetch routes under `/api` (`ctx.connection.fetch.register`) so DSH admits the browser first and a `requestIdentity` provider sees the request; routes on `ctx.webServer` would not.
- Use DSH's own components first, then the kit; a piece two plugins need belongs in the kit, not here. Colours only through DSH theme tokens (`--dsw-alias-*`), tones in the data.
- Schema changes: change `src/schema.js`, the README section, the examples and the tests together.
- Words: no string a person reads in code. Components take them from the language files (`t('key')`), card text from the card (`string | { en, … }`), numbers and dates from `Intl` in the active locale. No language is named anywhere in code or config; a language is a file. `test/client.test.js` fails on a literal in a rendered child or text prop.
- Client scripts run as classic scripts in one global scope: the build wraps everything in the loader factory.
- Phone first: tap targets at least 40 px at 768 px and below or on touch, no horizontal scroll, long text shortens with the full text on hover and tap. Look at the real page at 360, 390, 768, 1280 and 1920 px in two languages before a release.

## Checks

`npm run check` (client.js current, syntax, example board against the schema) and `npm test` (node --test, includes a run behind DSH's real Connection and web server). CI runs both on Node 22 and 24.

## Git

- Conventional Commits, one-line subjects. Squash merges. PR titles are Conventional Commit subjects.
- Versions follow semver from the commit types since the last tag (below 1.0: feat or breaking → minor, fix → patch); `.github/scripts/release-bump-check.py` checks a tag.
- Releases: bump `package.json` and `CHANGELOG.md`, merge, then push the tag `vX.Y.Z`. `.github/workflows/publish.yml` publishes to npm by trusted publishing (OIDC, with provenance, no stored token; the package's trusted publisher on npmjs.com names this repo and `publish.yml`, so renaming either breaks it) and creates the GitHub release from the changelog section. Don't publish by hand.

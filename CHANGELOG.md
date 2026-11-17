# Changelog

## 0.4.0

- Languages: any text on a card or board can be a string or a map of language id to text (`{ "en": "Today", "fr": "Aujourd’hui" }`, `en` required), and the page shows the one for DSH's active language, falling back from the exact tag to its primary language to `en`. Numbers, dates, ages and units are formatted with `Intl` in that language.
- The page's own words are one `locale/<tag>.json` per language (English, French and Chinese ship), served by a new `GET /api/card-board/locale` route and picked by DSH's active language, live. A new language is a new file; nothing in the code names one.
- `board.json` takes an optional `assistant` name; the chat buttons then say "Ask <name>".
- Phones: one column with moderate chart heights, tap targets of at least 40 px (at 768 px and below, or on touch), list and status row buttons wrap under the row text on narrow cards, tabs wrap instead of scrolling, long titles, labels, chips and legend entries shorten with the full text on hover and tap, chart and timeline labels fit their space (marker labels no longer collide with the goal label, bar labels stay inside the card), the snooze picker is a bottom sheet. Four columns on very wide screens.
- Fix: the buttons chunk registers as a chunk of the package (`{ id, chunk }`) and no longer declares anything at the top level, so two plugins that ship it no longer break each other (the second one failed to register); a failed load is retried.
- Fix: the default chat button's label was missing from the page's words.

## 0.3.1

- Line charts: a goal drawn as points, and markers, no longer run past the plot when they reach beyond the series; x labels that would repeat or overlap are left out.

## 0.3.0

- Remove `ownerPerson` again. Who a request is, including one that reaches DSH without passing the sign-in, is for the `requestIdentity` provider to say; the board only maps the id it gets.

## 0.2.0

- Add `ownerPerson`: with a people mapping, requests DSH lets in with its own login (launch link or API token) rather than through the sign-in plugin count as that person instead of seeing nothing. Without an identity provider the routes still answer 503.

## 0.1.0

- First release: boards of `stat`, `line`, `bar`, `donut`, `list`, `timeline` and `status` cards read from a data folder, with per-person access through any `requestIdentity` provider (or everything for a single-person DSH), ETag polling while the page is visible, stale and error cards, light and dark, and phone widths.
- Actions on cards and rows: chat (a prefilled draft in a new conversation), done, snooze, event and link. Presses are checked on the server, logged, emitted as `card-board/action` and published as `ui.action.<kind>` through dsh-cron-jobs when it runs.
- The `dsh-card-board` CLI: validate, write atomically, remove, check a whole folder.

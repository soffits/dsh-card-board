# Changelog

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

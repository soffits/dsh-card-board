# Changelog

## 0.1.0

- First release: boards of `stat`, `line`, `bar`, `donut`, `list`, `timeline` and `status` cards read from a data folder, with per-person access through any `requestIdentity` provider (or everything for a single-person DSH), ETag polling while the page is visible, stale and error cards, light and dark, and phone widths.
- Actions on cards and rows: chat (a prefilled draft in a new conversation), done, snooze, event and link. Presses are checked on the server, logged, emitted as `card-board/action` and published as `ui.action.<kind>` through dsh-cron-jobs when it runs.
- The `dsh-card-board` CLI: validate, write atomically, remove, check a whole folder.

# Changelog

## 0.9.0

- A card opens: tap it (or its open button) and it shows in DSH's own dialog with the whole list, a taller chart, all its buttons and its optional `detail` (`text`, `facts`, `chart`, `history`). Keyed rows with a `detail` open the same way. The URL follows (`?board=…&card=…&row=…`), so a link opens the page with the card open, and Back closes it.
- Rows and stat items take a `link`: tapping goes there (an http(s) URL in a new tab, a path of this app in place).
- Charts show the value and date of the point under the pointer, on hover and on tap.
- Cards and rows answer hover and press in DSH's colours; a row's buttons show on hover with a mouse and stay visible on touch. A changed card settles, numbers ease to new values, rows a list opens fade in; nothing moves with reduced motion.
- A list row shows a checkbox only when it has a `done` action, and ticking it presses that action; decorative checkboxes are gone. A row's steps sit with its other buttons.
- A step press counts as done once recorded, since sending it is the whole job.
- Chrome (heads, tags, axes, legends, strips, buttons) isn't selectable; titles, notes and numbers are.

## 0.8.0

- Cards keep their own height: the board packs them like masonry (no card stretches to match a neighbour), and fills gaps with shorter cards.
- Breaking: a board's `layout` gives each card a `size` (`small`, `medium`, `large`, `wide`) instead of `w` and `h`. Without it, a card takes its type's default (summary and timeline wide, countdown large, stat small, the rest medium).
- A list longer than six rows shows six, then "N more", which opens the rest in place; rows that are new or just changed stay visible.

## 0.7.1

- A countdown step in another zone shows the wall-clock time of its own offset (`…T14:20:00-07:00` reads 14:20), and the zone's short name only when the browser's zone data agrees; otherwise it shows the offset ("GMT−7"). A browser with older zone rules no longer moves a ticket's time by an hour.

## 0.7.0

- The board is live: changes arrive over a Server-Sent Events route (`/api/card-board/events`), the page fetches only the card that changed, and a card or row that changes in front of you gets a short wash and "just now". Polling stays as the fallback while the stream is down.
- "New since you last looked": a dot on cards and keyed rows that changed since your last visit, remembered per person on the server, so it holds across devices.
- New card types: `summary` (a sentence and chips at the top of a board) and `countdown` (a ticking number and the stops on the way, hiding itself after `expiresAt`).
- Cards may carry an `icon` and a `tone`; list and status rows an `icon`, `tone`, `key` and an `active` window ("now" while it lasts); a row's `date` reads relative to today. Stat items may add a `spark`, a `progress` bar and a `strip` of small values with icons. New tone `violet`.
- Breaking: a stat item's `delta` is now words, `{ text, tone?, dir? }`, instead of `{ value, unit?, tone? }`.
- The page is drawn with DSH's own components (tabs, tags, status dots) and @soffits/dsh-ui-kit, which it now needs; it is built from `src/client/` into `client.js`.

## 0.6.0

- Suggested next steps: cards and rows can carry `step` actions, concrete next steps whoever writes the card knows ("Renew the books online"). A tap records the press like done and snooze (the event `ui.action.step`, with who pressed it), then the step is sent with the card or row to the assistant as the person, and the button links to the conversation. At most 3 per card or row, a label of up to 80 characters is required. Needs @soffits/dsh-ui-actions 0.2.0.
- A row's steps sit on their own line under it; its other buttons stay beside the title.

## 0.5.0

- The action buttons come from the shared [`@soffits/dsh-ui-actions`](https://github.com/soffits/dsh-ui-actions) plugin (`ctx.uiActions`) instead of a copy of `client.actions.js` in this package, which is gone. Install that plugin to get buttons; the page works without it, just without buttons. A chat button opens a conversation with the card or row attached to the message box as a small card, and the sent message shows it with the board's icon and name. The board names itself to it once, so cards from other pages read the same.
- Status rows with buttons stack (label and value above, sub-line and buttons beneath) on cards narrower than 520 px, so the value no longer gets squeezed in a two-column board.
- The buttons' own words (ask, done, snooze, pick a time, errors) now live in that plugin's language files; this package keeps only "Ask <name>".

## 0.4.2

- List rows on narrow cards (a phone) keep their buttons beside the title, with the date and chip underneath, instead of putting the buttons on a line of their own: a long list takes about a third less height.

## 0.4.1

- A chat button's `payload.prompt` can be text in several languages like any other text; the other payload fields stay as written.

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

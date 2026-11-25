# Changelog

## 0.19.0

Boards can come from a command. Set `command` (an argument list, for the companion practice `[companion, cards]`) and the plugin asks it for the boards' own fields (`boards`), a board's cards (`board <id>`) and hands it presses (`press <id>`), instead of reading files that something has to keep in step with the data. An answer is reused until the files it names (`watch`) change or the time it names (`refreshAt`) comes, open pages are told which cards changed, `updatedAt` may be left out of a card (stamped as a producer's writes used to be: when the content changed, and again at half of `staleAfter`), and a card that couldn't be built is `{ "error": … }`. Press states follow the command: pending while it runs, not handled if it fails, done once the board was read after it. `dsh-card-board check-command <command...>` checks a command's answers against the schema. Folder boards work as before, next to command boards; the plugin's own state (seen marks, arrangements, press log) stays in `dataDir` and is keyed the same, so a board that moves to a command keeps it. The plugin now runs one program, the configured command, with an argument list and a timeout, never a shell ([docs/decisions/board-command.md](docs/decisions/board-command.md)).

## 0.18.1

A broken language file is skipped with a warning instead of failing the page's words in every language. The people mapping, the words, the live stream and the client build come from the shared `@soffits/dsh-host-kit` instead of copies kept here.

## 0.18.0

A press names its row by the row's `key` (`source.row` in the event is now that key), so it lands on the row the person tapped even when the card was rewritten in between. Before, it named the row by its place: after a handled row dropped out, or a quick second tick, a press could answer or tick the row below it, since rows often share button ids. A row without a key still goes by its place; an index that points at a keyed row is refused. Rows ticked this visit are kept apart by key too, so ticking a second one no longer hides the first.

Open live streams now end when the plugin is unloaded or reloaded, so pages reconnect instead of waiting on a stream that will never send again (the cleanup was registered on an event Cordis doesn't send, so file watches leaked too). A card that can be found but not read shows as a broken card instead of failing the whole board, an unreadable action log no longer blocks every board, and a failing change listener is logged instead of escaping.

## 0.17.4

The opened view wraps a long unbroken word (an id, a key, a path) in its heading and text instead of growing wider than a phone screen and scrolling sideways, and an opened row's tick box flows in one row with its other buttons.

## 0.17.3

An opened row reads well on a phone. The sheet used to draw it as a list row, so on a narrow screen its title was squeezed into a column a word wide beside its chip and buttons, under a heading that already said the same. Now the heading is the title, and under it come the row's facts on one wrapping line (chip, sub, day), its detail, and every button with its label on a wrapping row: the detail's, the row's own (an unlabelled done as a labelled box), then Ask. List rows on a card keep their layout, but their words no longer shrink below a readable width: what doesn't fit beside them wraps underneath, and in a narrow card the buttons take at most half the row.

## 0.17.2

An opened row's detail buttons show their labels (a chat button said nothing but its icon).

## 0.17.1

Tapping a row that has a `detail` opens it again. The row is itself a button (`role=button`), and the check that keeps a tap on one of a row's own buttons from opening it counted the row too, so no row ever opened.

## 0.17.0

A `detail` can carry `actions`: buttons shown only when its card or row is opened, below the detail, and pressed like any other (the server finds them by id on that card or row). They let a row stay short on the board, a chip and a snooze, while its answers sit under the note that asks the question. View-only viewers get none of them, as with the row's own buttons. Why: `docs/decisions/detail-actions.md`.

## 0.16.1

Someone who may see a board but isn't an actor no longer gets its declared chat buttons. Those are the board owner's buttons, often a prompt in the owner's own words ("My answer to …:"), so a view-only viewer could still speak for the owner through a conversation. Now only plain `link` buttons survive the filter, plus the page's own "Chat about this" and "Ask", which ask about what the viewer sees in their own new conversation. A row whose chat button is taken away gets the built-in "Ask" back.

## 0.16.0

A board can say who may act on it: `actors` in `board.json` lists the viewers who may press its buttons, and without it every viewer may, so existing boards behave as before. Someone who may see a board but isn't an actor gets it with its `done`, `snooze`, `step` and `event` buttons left out (chat and link stay, and a chat button never names someone else's session), a "View only" note beside the title (English, French and Chinese) and a 403 on any press or undo. All decided on the server. Why: `docs/decisions/board-actors.md`.

## 0.15.1

A labelled `done` on a row is a choice, not a tick: it stays a button of its own, so a row can offer several answers (an ask's options). Only an unlabelled done becomes the row's checkbox; before, the first done of any kind did and the others vanished.

## 0.15.0

A shared board can keep a card for only some of its viewers: `cardViewers` in `board.json` maps a card id to the people who may see it. Everyone else gets the board without it; its route answers 404, the events stream leaves it out and its buttons refuse a press, all decided on the server.

## 0.14.2

An opened card or row that is taller than the window scrolls inside its sheet instead of running off the screen. `@deepseek-ai/schemastery` is a peer dependency, so an update never moves a private copy out from under the plugin.

## 0.14.1

The page's words are read from the locale files on each request instead of once, so a page updated in place gets its new words right away instead of showing raw keys until it is reloaded.

## 0.14.0

A countdown can carry up to 24 steps (was 8), enough for a whole travel day from waking up to landing. The next step is still marked and the passed ones dimmed.

## 0.13.0

A stat item can carry an `icon`: a big tinted tile beside its label and number, like a Home Assistant tile, coloured with `iconTone`, the item's `tone` or the card's. A stat block with icons lays its numbers out in an even grid, and on a phone, where two numbers share a row, each tile sits above its words so the numbers keep their width. A countdown's `data.icon` sits the same way before the big number. The tile is 48 px (44 above a chart or rows, 40–42 on a phone). Needs dsh-ui-kit 0.5.0 for `trophy`, `medal`, `weight` and the high and low thermometers.

## 0.12.0

- Every list and status row now has an Ask button without declaring one, the way every card has its chat button: it opens a new conversation with that row and its card attached ("Ask Robin" when the board names an `assistant`). A row that declares its own `chat` action keeps it, and a row with all six buttons taken gets none. Rows without a `key` get it too: the chat names the row by its place in the card.
- New `ask` field, a boolean on a card (all its rows) or on a row: `false` leaves the default button out. The card's corner button is unchanged.

## 0.11.0

- Each person can arrange a board for themselves: drag a card (mouse: by the handle on hover; touch: press and hold the head), or use its menu (Pin to top, Move up, Move down; Alt+↑/↓ on the menu button). Pinned cards come first, and **Reset order** goes back to the board's `order`, which stays the default. The arrangement is stored once by the plugin per person (`<dataDir>/.arrange/`, the same identity as who sees what), follows them across devices and reaches their other open pages through the events stream (`{ "type": "arrange" }`). A card the person never placed goes where the board's order puts it.
- New card field `raise: { from?, until?, label? }`: during that window the card floats above everything, pins included, with a small tag saying why (`label`, or "Up for now"). The page decides from its own clock with one timer for the next window edge, so no polling and no card rewrite at the moment. New route `POST /api/card-board/arrange`; the board answer carries `arrangement` when the person has one.
- Why it is built this way: `docs/decisions/card-order.md`. English, French and Chinese words included.

## 0.10.1

- Fix: a row ticked done blanked the page when the card was rewritten without it (the kept row asked for buttons of a row the card no longer has). It now stays in place, struck through, as intended.

## 0.10.0

- Undo: an action can declare an `inverse` (`{ "kind", "payload"? }`, on `done`, `snooze` and `event`). Pressing one shows an Undo in DSH's own toast for about 8 seconds, in English, French and Chinese; tapping it sends an `undo` press (channel `ui.action.undo`) that carries the inverse the card offered, so the owner of the item can reverse it (done and reopen, snooze and unsnooze) even after the card was rewritten.
- A row ticked done stays in place, struck through and ticked, until the board is refreshed or left. Unticking its box is the same undo.
- Every undo is its own record in the action log (who, when, which press it takes back); a press that was taken back shows as `undone`.
- Fix: a press only bridges the gap until the card is written again. After that the card's own `checked` decides whether a row's box is ticked, so an item reopened somewhere else shows unticked instead of staying ticked for a day because of its old press.
- Touch targets: the checkbox and the toast's Undo are at least 40 px on touch and narrow screens, and not selectable.

## 0.9.1

- Select-all on a board no longer picks up chrome: summary chips, the day line, tiles, icons, new and just-now marks join the non-selectable parts; titles, notes and numbers still copy.

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

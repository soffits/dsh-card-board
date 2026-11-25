# Boards read from a command

Status: decided for 0.19.0.

## The need

A board made of files means a producer for every card: a job that rebuilds each file when its data changes, plus a press handler for each button, plus a timer wherever the clock changes the view. When the data already has an owner with its own command line (a to-do store, a ledger, a work board), the files are a second copy of it, and keeping the copy current is the only reason the jobs exist. `dsh-work` already shows the other way: ask the owner's command each time and keep nothing.

## What others do

- **Grafana** panels query their data source when the dashboard is opened or refreshed and keep no copy of it; the data source plugin is the one place that knows the store.
- **Home Assistant** dashboards render from the state the integrations hold and subscribe to its changes, so a card never has its own file.
- **dsh-work** (this plugin family) runs `kith board` with an argument list, caches the answer until the board's folder changes, and has no timer behind the page.

## Decisions

1. **One command, three subcommands.** `command` is an argument list; the plugin appends `boards` (each board's own fields: title, viewers, actors, order, layout), `board <id>` (its cards) and `press <id>` (a press event on stdin). Splitting the fields from the cards keeps the question "who may see this board" cheap, since it is asked on every request, while the cards, which cost a real read of the data, are asked only when needed. Rejected: one command per board listed in the profile (a profile edit for every new board, and the people who own the data would repeat their board list there), and a command per card (one process per card, and the plugin would have to know which cards a board has).
2. **The answer says what it was built from.** `watch` lists the files a board's answer depends on, and the plugin keeps the answer until their stat fingerprint changes, with no timer. Only the command knows its sources, so it names them; the plugin does not guess and a home does not repeat the list in the profile. A name a writer leaves behind while it works (`-wal`, editor temporaries) is not a change, so reading a store never invalidates its own answer. While a page has a board open, the same paths are watched (`fs.watch` plus a slow fingerprint check) so a change reaches it as a card event. A command that names no paths is asked again after a few seconds, which is the whole of the polling there is.
3. **Time is a source too.** `refreshAt` is the moment the answer changes by itself (midnight for a card that says "today", half a card's `staleAfter`), and the plugin asks again then. It is not a safety-net poll: a command that cannot name one has none.
4. **The plugin stamps `updatedAt`.** A command is asked on demand, so "when was this written" has no meaning for it. A card without `updatedAt` gets the time of the run that made its current content; a card with `staleAfter` gets a new one once it is half that old, which is what a producer that rewrote cards on a timer used to do, so a card that is still right never shows as stale. A card that fails to build is `{ "error": "text" }`: the page shows the small error card with that text instead of the card vanishing.
5. **A press goes to the command.** The plugin still records the press in its log, still publishes `ui.action.<kind>` for anything that listens, and still decides who may press. On a board that comes from a command it then runs `press <id>` with the event; exit 0 means handled, anything else shows the press as not handled with the last line of stderr in the log. Handled presses ask for a fresh answer, so the button settles when the data has changed and no job has to rewrite a file. Folder boards are unchanged: their presses are only published.
6. **Folder boards stay.** The package is published and other people write files into folders, so both kinds of source work side by side; a board id offered by the command wins over a folder of the same name. The data folder keeps the plugin's own state either way (what each person has seen, how they arranged a board, the press log), keyed by board and card ids, so a board that moves from files to a command keeps its seen marks and arrangements.
7. **The plugin runs one program, the owner's.** It no longer "never runs anything": the configured command is run with `execFile` and an argument list, never a shell, so nothing from a page reaches a shell; the page's text only ever arrives as JSON on stdin or inside the event. The command has a timeout and an output cap. There is still no outbound request and no credential in the plugin.

## Not done

- Partial answers (one card per ask). A run rebuilds a whole board; a card event tells the page which cards actually changed, and the plugin keeps only the last answer.
- Pushing from the command. A command that wants to say "now" can only change a path it watched. Anything with a stream of changes can write a small file the answer lists.

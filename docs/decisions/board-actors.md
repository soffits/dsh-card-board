# Seeing a board and acting on it

Status: decided for 0.16.0.

## The need

`viewers` says who sees a board, and until now whoever saw it could press everything on it. That is right for a household board everyone works from, and wrong the moment someone is let in only to look: a tap on `done` marks the item for the person it belongs to, a snooze moves it, a step starts work in their name. People want to say "you can see my board" without also saying "you can tick my things".

## What others do

- **Grafana** separates the two with roles and per-dashboard permissions: View, Edit, Admin. A viewer can be raised to edit one dashboard, and an editor held back to view on another ([roles](https://grafana.com/docs/grafana/latest/administration/roles-and-permissions/), [dashboard permissions](https://grafana.com/docs/grafana/latest/administration/user-management/manage-dashboard-permissions/)).
- **Notion** shares a page at a level: can view, can comment, can edit, full access. A level includes the ones below it ([sharing](https://www.notion.com/help/sharing-and-permissions)).
- **Home Assistant** has dashboards for everyone signed in and only an admin can edit them; a view can be restricted to named users ([views](https://www.home-assistant.io/dashboards/views/)).

All three keep one list of people per level and make the stronger level include the weaker. The viewer's page is the same page with the editing taken away.

## Decisions

1. **Two lists, the second defaulting to the first.** `viewers` stays; a new optional `actors` names who may press. Without `actors` every viewer may, so no existing board changes behaviour and nothing has to be migrated. A full role ladder (view / comment / edit / admin) would be more than there is to guard: a board has one thing a viewer can do to someone else's data, which is press a button.
2. **Acting needs seeing.** A person is an actor only if they are also a viewer. The other way (an actor who is made a viewer implicitly, as in Notion) would let a mistake in `actors` widen who can read a board; this way the new field can only narrow what the old one allowed. An empty `actors: []` makes a board nobody presses.
3. **The server decides, and takes the buttons away.** A press from a non-actor answers 403 (undo too), whatever the page showed. The board and card routes also send the card without its `done`, `snooze`, `step` and `event` buttons, so the page has nothing to hide, nothing to grey out wrongly, and a phone or another client sees the same truth. The response carries `readOnly: true` and the page says "View only" beside the title, so a missing button is explained. The ETag includes it, and press states are not sent to viewers.
4. **Which buttons.** The kinds a press records on the server (`PRESS_KINDS`: step, done, snooze, event). `step` is one of them although it only starts a conversation: its press is logged under the card owner's item and the step is the owner's go-ahead to the assistant. `link` and `chat` stay: they open a page or a draft in the viewer's own browser and change nothing of the owner's. A chat button that names `payload.session` loses that session for a viewer, so a draft never lands in a conversation that belongs to the card's owner.
5. **What a viewer still does.** Marking cards seen and arranging the board (pins, order) are stored per viewer and touch only their own view, so they stay open to every viewer.
6. **Nothing new in the page's trust.** The data is read at request time like `viewers`; the file changing takes effect on the next request and the events stream, which already re-checks the board's access on every `board.json` change, ends for someone no longer a viewer.

## Not done

- A per-card `cardActors`. A card a viewer must not press can already be kept from them with `cardViewers` or by splitting boards; add it when a real board needs the finer cut.
- Disabled (greyed) buttons instead of none. The viewer can't use them, and a greyed button asks the question the "View only" note already answers.

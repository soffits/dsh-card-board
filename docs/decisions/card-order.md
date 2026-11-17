# Card order: each person's own, and cards that raise themselves

Status: decided for 0.11.0.

## The need

A board's `order` is one list for everyone. Two things it can't say: that a person likes their cards in a different order (or wants one pinned where they always see it), and that some card matters more at a certain time (a trip's countdown on the day of departure, a bill on its due date) and should come up by itself and fall back after.

## What others do

- **Home Assistant** keeps one shared dashboard config. Cards are reordered by dragging in an edit mode, and the order is the dashboard's, for everyone. What can differ per person is which views show (`visible` takes a user list) and which dashboard opens first; people keep asking for more per-user control, and the thread's main point is that it should follow the user, not the device ([frontend discussion 11278](https://github.com/home-assistant/frontend/discussions/11278), [views](https://www.home-assistant.io/dashboards/views/)).
- **Grafana** has preferences at server, organisation, team and user level, but they are about theme, home dashboard, time zone and the like. A dashboard's panel layout is the dashboard's; whether each person could rearrange and save their own is an open request ([discussion 58027](https://github.com/grafana/grafana/discussions/58027), [preferences](https://grafana.com/docs/grafana/latest/administration/organization-preferences/)).
- **iOS Smart Stack** is the closest to the second need. The person arranges and pins; a widget gives the system relevance for a stretch of time (`TimelineEntryRelevance`: a score, and a duration after the entry's date), and the system rotates it to the top for that time ("Smart Rotate"). Pinning a widget keeps it where the person put it ([WWDC21](https://developer.apple.com/videos/play/wwdc2021/10049/), [TimelineEntryRelevance](https://developer.apple.com/documentation/widgetkit/timelineentryrelevance)). Users also report that rotation they can't read or predict makes a stack disorienting, so the reason has to be visible.

## Decisions

1. **The arrangement is the person's, stored once, on the server.** Not in the browser (it would not follow them to a phone) and not in the board (it would change everyone's). The plugin keeps `{ pinned, order }` per person and board in `<dataDir>/.arrange/`, next to the "seen" marks, keyed the same way (the verified identity from `requestIdentity`, mapped to a person). It is the only thing the plugin stores about cards. The board's `order` stays the default for anyone who never arranged it, and "Reset order" deletes the person's arrangement.
2. **A card the arrangement doesn't know goes where the default order puts it** (right after the card that precedes it by default), so a new card doesn't vanish at the bottom of an old arrangement.
3. **The page computes the order, from data the server sends as it is.** The server sends the cards in default order plus the person's arrangement; one pure module (`src/arrange.js`) turns that into what is shown. A change from another device reaches an open page through the same events stream as card changes.
4. **Raising is the producer's statement about time, and the page's decision about now.** A card may carry `raise: { from, until, label }` (ISO times, either end optional, at least one). The page checks it against its own clock and sets one timer for the next time any window opens or closes: no polling, and nothing has to rewrite the card at that moment. Like iOS's relevance duration, the producer gives the window and the viewer's device decides.
5. **Raised cards sit above the pins.** A pin is a standing preference, a raise is an urgent exception that ends by itself, and a card the producer says matters now should not be buried because something else was pinned. Pins keep their order right below, and everything returns to the person's order when the window closes. Among raised cards, the person's own order decides. The cost is that a person can't keep a raised card down; that is on purpose, for urgency.
6. **The reason is visible.** A raised card has a quiet outline and a small tag, the card's `raise.label` or "Up for now", with the explanation on hover.
7. **Moving has more than one route.** Mouse: drag the card by its handle. Touch: press and hold the card's head, then drag (a quick swipe still scrolls). Keyboard and phones' fiddly cases: the card's menu (Pin to top / Unpin, Move up, Move down), or Alt+↑ / Alt+↓ on the menu button. Drops among the pins pin the card; drops after them unpin it. Changes are announced to screen readers, and the cards glide to their places (nothing moves with reduced motion).

## Not done

- Hiding or muting a raised card for a person. Wait for someone to want it.

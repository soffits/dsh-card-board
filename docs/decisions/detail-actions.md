# Buttons in a detail

A question shown as a row needs its note (who asks, what, the links) to be answered well, and its answer buttons are only useful next to it. On the row they crowd a list that is read at a glance: three answers plus a chat and a snooze is a full row of buttons on every question, and on a phone they are always visible.

- **Chosen: `detail.actions`.** The detail already is "what opening shows", so its buttons are part of it. The opened view draws them under the detail with the same buttons component and press route as the row's own; a press names the row and the button id, and the server looks the id up among the row's buttons and its detail's. Ids must differ between the two lists so a press is never ambiguous.
- **Not chosen: a flag per button** (`"where": "open"`). It would put a layout choice into every action and make the actions list mean two things; a list in the detail says it once.
- **Not chosen: hiding buttons past a count.** Which buttons matter on the row is the producer's call, not a number.
- View-only viewers lose the detail's buttons the same way as the row's (only `link` stays), on the server.
- The row's own built-in "Ask" stays on the row; a declared chat in the detail does not replace it, since it asks about the row as the viewer sees it.

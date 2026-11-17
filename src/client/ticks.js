/**
 * Rows ticked done during this visit stay where they were, struck through, until the board is refreshed or left (the
 * way the inbox keeps a handled message in place), so a mistaken tick can be seen and taken back. Pure, so it is
 * tested directly.
 */

/** The action that ticks a row: its `done` action. */
export const doneOf = row => row?.actions?.find(action => action.kind === 'done')

/**
 * What to keep of a row that was just ticked: the row as it was, with only its done action left (the other buttons
 * would press a row the card no longer has), and where it stood.
 */
export function keepOf(row, index) {
  const done = doneOf(row)
  return done === undefined ? undefined : { id: done.id, index, row: { ...row, checked: true, actions: [done] } }
}

/** A list with the kept rows put back where they were, unless the card still has them. */
export function keepTicked(rows, kept = []) {
  const present = new Set(rows.map(row => doneOf(row)?.id))
  const missing = kept.filter(entry => !present.has(entry.id)).sort((a, b) => a.index - b.index)
  if (missing.length === 0) return rows
  const merged = [...rows]
  for (const entry of missing) merged.splice(Math.min(entry.index, merged.length), 0, entry.row)
  return merged
}

/**
 * Whether a row's box is ticked, and which press ticking it again would take back. `latest` is the newest press of the
 * done action on this row as the server reports it (`{ press, state, undoable }`). The item's owner is the one source:
 * a press only bridges the gap until the owner writes the card again (`pending`), after which the card's own
 * `checked` decides, so an item reopened elsewhere shows unticked.
 */
export function doneState(row, latest) {
  const state = latest?.state
  const checked = state === 'undone' ? false : state === 'pending' || row.checked === true
  return { checked, undo: checked && latest?.undoable ? latest.press : undefined }
}

/** The kept rows after one more: a row ticked again replaces its earlier entry. */
export const withKept = (kept = [], entry) => [...kept.filter(other => other.id !== entry.id), entry]

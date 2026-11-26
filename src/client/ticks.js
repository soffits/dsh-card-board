/**
 * Rows ticked done during this visit stay where they were, struck through, until the board is refreshed or left (the
 * way the inbox keeps a handled message in place), so a mistaken tick can be seen and taken back. Pure, so it is
 * tested directly.
 */

/**
 * The action that ticks a row: its unlabelled `done` action. A labelled done is a choice (one answer among several)
 * and stays a button of its own.
 */
export const doneOf = row => row?.actions?.find(action => action.kind === 'done' && action.label === undefined)

/**
 * How a press names a row: its key, so the press still finds it after the card is rewritten; a row without one goes by
 * its place (`index`, -1 for a kept row the card no longer has).
 */
export const rowRef = (row, index) => row?.key ?? index

/** Which row a kept entry stands for: its key, or for a row without one its done action's id. */
const keptId = row => row.key ?? doneOf(row)?.id

/**
 * What to keep of a row that was just ticked: the row as it was, with only its done action left (the other buttons
 * would press a row the card no longer has), and where it stood.
 */
export function keepOf(row, index) {
  const done = doneOf(row)
  return done === undefined ? undefined : { id: keptId(row), index, row: { ...row, checked: true, actions: [done] } }
}

/** A list with the kept rows put back where they were, unless the card still has them. */
export function keepTicked(rows, kept = []) {
  const present = new Set(rows.map(keptId))
  const missing = kept.filter(entry => !present.has(entry.id)).sort((a, b) => a.index - b.index)
  if (missing.length === 0) return rows
  const merged = [...rows]
  for (const entry of missing) merged.splice(Math.min(entry.index, merged.length), 0, entry.row)
  return merged
}

/**
 * Whether a row's box is ticked, and which press ticking it again would take back. `latest` is the newest press of the
 * done action on this row as the server reports it (`{ press, state, undoable }`). The item's owner is the one source:
 * a press only bridges the gap until its handler answers it (`pending`), after which the card's own
 * `checked` decides, so an item reopened elsewhere shows unticked.
 */
export function doneState(row, latest) {
  const state = latest?.state
  const checked = state === 'undone' ? false : state === 'pending' || row.checked === true
  return { checked, undo: checked && latest?.undoable ? latest.press : undefined }
}

/** The kept rows after one more: a row ticked again replaces its earlier entry. */
export const withKept = (kept = [], entry) => [...kept.filter(other => other.id !== entry.id), entry]

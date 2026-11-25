/**
 * Who may see which board.
 *
 * Who is asking comes from the shared people mapping (`viewerOf` in
 * `@soffits/dsh-plugin-sdk/host`), and a board lists the person ids that may see it
 * in `viewers`. A board can also say who may act on it (use the buttons it declares) in `actors`;
 * without `actors` the viewers may, so a board that never heard of the field behaves as before.
 * Acting needs seeing: a name in `actors` that isn't in `viewers` gets nothing extra.
 *
 * Two modes:
 * - people: a mapping is configured. A request needs a verified identity that
 *   maps to a person, and sees only boards that list that person. Without an
 *   identity provider nothing is shown.
 * - owner: no mapping. Everyone DSH lets in is its owner and sees every board,
 *   which is what a single-person DSH wants.
 */
import { personKey } from '@soffits/dsh-plugin-sdk/host'

/**
 * Whether a viewer who may see `board` may also see its card `card`: a card listed in the board's `cardViewers`
 * shows only to the people named there, so a shared board can carry cards about one person.
 */
export function maySeeCard(viewer, board, card) {
  if (viewer.mode === 'owner') return true
  const only = board?.cardViewers?.[card]
  if (only === undefined) return true
  return viewer.person !== undefined && only.some(person => personKey(person) === viewer.person)
}

/** Whether a viewer may see a board (its board.json already validated). */
export function maySee(viewer, board) {
  if (viewer.mode === 'owner') return true
  if (viewer.person === undefined || board === undefined) return false
  return (board.viewers ?? []).some(person => personKey(person) === viewer.person)
}

/** Whether a viewer who may see `board` may also act on it: be named in `actors`, or in `viewers` when there are no `actors`. */
export function mayAct(viewer, board) {
  if (viewer.mode === 'owner') return true
  if (!maySee(viewer, board)) return false
  return (board.actors ?? board.viewers ?? []).some(person => personKey(person) === viewer.person)
}

/**
 * A card as someone who may see but not act gets it: every button it declares is left out except plain links. Buttons
 * belong to the people who may act on the board, and a declared chat button is one of them (it asks in the owner's
 * words, for the owner), only routed through a conversation. The page's own "Chat about this" and "Ask" are not on
 * the card, so they stay: they ask about what the viewer sees, in the viewer's own new conversation.
 */
export function withoutActions(card) {
  /** `holder` without its `actions` key, then with the links if any. */
  const trimmed = holder => {
    const { actions, ...rest } = holder
    const kept = (actions ?? []).filter(action => action.kind === 'link')
    if (Array.isArray(rest.detail?.actions)) rest.detail = trimmed(rest.detail)
    return kept.length > 0 ? { ...rest, actions: kept } : rest
  }
  const rows = card.data?.rows
  const result = trimmed(card)
  return Array.isArray(rows) ? { ...result, data: { ...card.data, rows: rows.map(trimmed) } } : result
}

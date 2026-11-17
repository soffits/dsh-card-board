/**
 * What the page remembers about each card while it is open: how often it (or each of its keyed rows) changed in
 * front of the person, which drives the short wash, and what is new since they last looked, which drives the dots.
 * Pure, so it is tested without a browser.
 *
 *   live[cardId] = { wash: number, rows: { [key]: number }, fresh: boolean, freshRows: Set<string> }
 */

const EMPTY = Object.freeze({ wash: 0, rows: Object.freeze({}), fresh: false, freshRows: new Set() })

export const liveOf = (live, id) => live[id] ?? EMPTY

/**
 * The live state after a new version of the board arrived. A card whose content changed washes as a whole, unless
 * the change is in keyed rows: then only those rows wash. A card that appears while the page is open washes too.
 * The first load washes nothing. Dots only gather during a visit: what was new stays marked until the page closes,
 * even after the server has recorded it as seen.
 * @param {object | null} before - the board as last shown (null on the first load)
 * @param {object} after - the board just received
 * @param {Record<string, object>} live
 */
export function nextLive(before, after, live) {
  const old = new Map((before?.cards ?? []).map(entry => [entry.id, entry]))
  const next = {}
  for (const entry of after.cards) {
    const was = old.get(entry.id)
    const state = liveOf(live, entry.id)
    let { wash, rows } = state
    if (before !== null && entry.version !== undefined && was?.version !== entry.version) {
      const changed = was === undefined ? [] : Object.keys(entry.rows ?? {}).filter(key => was.rows?.[key] !== entry.rows[key])
      if (changed.length > 0) rows = { ...rows, ...Object.fromEntries(changed.map(key => [key, (rows[key] ?? 0) + 1])) }
      else wash += 1
    }
    const freshRows = entry.fresh?.rows?.length ? new Set([...state.freshRows, ...entry.fresh.rows]) : state.freshRows
    next[entry.id] = { wash, rows, fresh: state.fresh || entry.fresh?.card === true, freshRows }
  }
  return next
}

/** The board with one card replaced, added at the end or (when `entry` is null) removed. */
export function withCard(board, id, entry) {
  if (entry === null) return { ...board, cards: board.cards.filter(card => card.id !== id) }
  const present = board.cards.some(card => card.id === id)
  return { ...board, cards: present ? board.cards.map(card => (card.id === id ? entry : card)) : [...board.cards, entry] }
}

/** What to tell the server the person has now seen: every card's version and its keyed rows' versions. */
export function seenReport(board) {
  const cards = {}
  for (const entry of board.cards) if (entry.version !== undefined) cards[entry.id] = entry.rows ? { v: entry.version, rows: entry.rows } : { v: entry.version }
  return { board: board.id, cards }
}

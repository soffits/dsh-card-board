/** How cards sit on the board, and how much of a long list shows. Pure, so it is tested directly. */

/** A card's width when the board doesn't set one: the full-width kinds wide, a trip large, numbers small. */
export const DEFAULT_SIZE = { summary: 'wide', countdown: 'large', timeline: 'wide', stat: 'small' }
/** Tracks a size spans, by how many tracks the board has (6 on a wide screen, 2 on a tablet, 1 on a phone). */
const SPAN = { 6: { small: 2, medium: 3, large: 4, wide: 6 }, 2: { small: 1, medium: 1, large: 2, wide: 2 }, 1: {} }
/** The board packs cards like masonry: rows of ROW px, a card spans as many as its own height (plus the gap) needs,
 * so a long card never stretches its neighbours and short ones fill in beside it. */
export const ROW = 4
export const GAP = 14

export function spanOf(type, size, tracks) {
  const chosen = type === 'summary' ? 'wide' : size ?? DEFAULT_SIZE[type] ?? 'medium'
  return SPAN[tracks]?.[chosen] ?? 1
}

/** A long list shows this many rows, then "N more", which opens the rest in place. */
export const LIST_ROWS = 6

/** The rows shown: the first `limit`, plus any later row that is new or just changed, so a change is never hidden. */
export function shownRows(rows, open, limit, live) {
  if (open || rows.length <= limit + 1) return rows
  return rows.filter((row, i) => i < limit || (row.key !== undefined && (live?.freshRows?.has(row.key) || live?.rows?.[row.key] > 0)))
}


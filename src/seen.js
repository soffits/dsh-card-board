/**
 * "New since you last looked", kept per person on the server so it holds
 * across devices.
 *
 * Each card has a content version (a hash of the card without `updatedAt`, so
 * a producer rewriting the same data changes nothing), and each list or status
 * row with a `key` has its own. The page tells the server which versions the
 * person has seen; a later version is new for them. A person who never looked
 * at a board sees nothing marked new there.
 *
 *   <dataDir>/.seen/<hash of the person>.json
 *     { "boards": { "<board>": { "<card>": { "v": "…", "rows": { "<key>": "…" } } } } }
 */
import { createPersonStore, hash } from './person-store.js'
import { ID_PATTERN, KEY_PATTERN } from './schema.js'

const VERSION = /^[A-Za-z0-9_-]{1,32}$/
const MAX_ROWS = 100

/** The content version of a card, and of each of its keyed rows. */
export function cardVersions(card) {
  const { updatedAt, handled, ...content } = card
  const rows = {}
  if (card.type === 'list' || card.type === 'status') for (const row of card.data?.rows ?? []) if (typeof row.key === 'string') rows[row.key] = hash(row)
  return Object.keys(rows).length > 0 ? { version: hash(content), rows } : { version: hash(content) }
}

/**
 * What is new for a person in one card: `{ card: true }` when its version differs from the one they saw (or they
 * never saw the card), with `rows` listing keyed rows that are new or changed. Undefined when nothing is new, or
 * when they have never looked at the board at all.
 */
export function freshness(seenBoard, versions) {
  if (seenBoard === undefined) return undefined
  const seen = seenBoard[versions.id]
  if (seen === undefined) return { card: true, rows: [] }
  if (seen.v === versions.version) return undefined
  const rows = Object.entries(versions.rows ?? {}).filter(([key, v]) => seen.rows?.[key] !== v).map(([key]) => key)
  return { card: true, rows }
}

/** The body of a "seen" report from the page, checked: `{ board, cards: { <id>: { v, rows? } } }`; undefined when malformed. */
export function parseSeen(body) {
  if (typeof body !== 'object' || body === null || typeof body.board !== 'string' || !ID_PATTERN.test(body.board)) return undefined
  const cards = body.cards
  if (typeof cards !== 'object' || cards === null || Array.isArray(cards) || Object.keys(cards).length > 100) return undefined
  const clean = {}
  for (const [id, seen] of Object.entries(cards)) {
    if (!ID_PATTERN.test(id) || typeof seen?.v !== 'string' || !VERSION.test(seen.v)) return undefined
    const rows = {}
    const given = seen.rows ?? {}
    if (typeof given !== 'object' || given === null || Object.keys(given).length > MAX_ROWS) return undefined
    for (const [key, v] of Object.entries(given)) {
      if (!KEY_PATTERN.test(key) || typeof v !== 'string' || !VERSION.test(v)) return undefined
      rows[key] = v
    }
    clean[id] = Object.keys(rows).length > 0 ? { v: seen.v, rows } : { v: seen.v }
  }
  return { board: body.board, cards: clean }
}

/** The seen marks of every person, one small file each. */
export function createSeenStore(dir) {
  const store = createPersonStore(dir, () => ({ boards: {} }), value => (typeof value?.boards === 'object' && value.boards !== null ? value : undefined))
  return {
    /** What a person has seen on a board, by card id; undefined when they never looked at it. */
    async board(person, board) {
      return (await store.read(person)).boards[board]
    },

    tag: store.tag,

    /** Record cards a person has seen on a board, keeping only cards that still exist (`present`). */
    record(person, board, cards, present) {
      return store.update(person, value => {
        const kept = Object.fromEntries(Object.entries({ ...value.boards[board], ...cards }).filter(([id]) => present.has(id)))
        return { ...value, boards: { ...value.boards, [board]: kept } }
      })
    },
  }
}

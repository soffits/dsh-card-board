/**
 * Who may see which board.
 *
 * The caller comes from a `requestIdentity` service, if one is installed: any
 * plugin that verifies the person behind an `/api` request can provide it
 * (`current()` returns `{ id, ... }` or null). The verified user id maps to a
 * person id through the configured mapping, and a board lists the person ids
 * that may see it in `viewers`. A board can also say who may act on it (press its done, snooze, step and event
 * buttons) in `actors`; without `actors` the viewers may, so a board that never heard of the field behaves as before.
 * Acting needs seeing: a name in `actors` that isn't in `viewers` gets nothing extra.
 *
 * Two modes:
 * - people: a mapping is configured. A request needs a verified identity that
 *   maps to a person, and sees only boards that list that person. Without an
 *   identity provider nothing is shown.
 * - owner: no mapping. Everyone DSH lets in is its owner and sees every board,
 *   which is what a single-person DSH wants.
 */
import { readFile, stat } from 'node:fs/promises'
import { PRESS_KINDS } from './schema.js'

/** Person ids compare without regard to case or surrounding space. */
export function personKey(value) {
  return typeof value === 'string' ? value.trim().normalize('NFKC').toLowerCase() : ''
}

/** Expand a leading `~/` to the home folder. */
export function expandHome(path, home) {
  return typeof path === 'string' && (path === '~' || path.startsWith('~/')) ? home + path.slice(1) : path
}

/**
 * The configured user id → person id mapping, re-read from `peopleFile`
 * whenever that file changes. A file that can't be read or parsed maps nobody
 * (and is reported once per change), so a broken file never widens access.
 */
export function createPeople({ people = {}, peopleFile = '', peopleKey = '' }, { warn = () => {} } = {}) {
  const inline = Object.entries(people)
  const enabled = inline.length > 0 || peopleFile !== ''
  let cached = { tag: undefined, entries: [] }

  async function fromFile() {
    if (peopleFile === '') return []
    let tag
    try {
      const info = await stat(peopleFile)
      tag = `${info.size}:${info.mtimeMs}`
    } catch (error) {
      tag = `error:${error.code}`
    }
    if (tag === cached.tag) return cached.entries
    let entries = []
    try {
      let value = JSON.parse(await readFile(peopleFile, 'utf8'))
      if (peopleKey !== '') value = value?.[peopleKey]
      if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(peopleKey ? `no object at key ${peopleKey}` : 'not a JSON object')
      entries = Object.entries(value).filter(([, person]) => typeof person === 'string')
    } catch (error) {
      warn(`people file ${peopleFile}: ${error.message}; nobody is mapped from it`)
    }
    cached = { tag, entries }
    return entries
  }

  return {
    enabled,
    /** The person id for a verified user id, or undefined. Inline entries win over the file. */
    async personFor(userId) {
      if (typeof userId !== 'string' || userId === '') return undefined
      const map = new Map([...(await fromFile()), ...inline])
      const person = map.get(userId)
      return person === undefined ? undefined : personKey(person)
    },
  }
}

/**
 * Decide who the current request is. Returns `{ mode: 'owner' }`,
 * `{ mode: 'people', person }` (person may be undefined: sees nothing) or
 * `{ mode: 'people', unavailable: true }` when a mapping is configured but no
 * identity provider is installed.
 */
export async function viewerOf(people, identityService) {
  if (!people.enabled) return { mode: 'owner' }
  if (identityService === undefined || typeof identityService?.current !== 'function') return { mode: 'people', unavailable: true }
  const identity = identityService.current()
  return { mode: 'people', person: await people.personFor(identity?.id) }
}

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
 * A card as someone who may see but not act gets it: the buttons that press something on the server (done, snooze,
 * step, event) are left out, so nothing on it can change another person's item. Chat and link buttons stay; a chat
 * button names no session, so its draft opens in the viewer's own conversation and never in one the card's owner has.
 */
export function withoutPresses(card) {
  const own = action => {
    if (action.kind !== 'chat' || action.payload?.session === undefined) return action
    const { session: _theirs, ...payload } = action.payload
    return { ...action, payload }
  }
  /** `holder` without its `actions` key, then with the ones that stay if any. */
  const trimmed = holder => {
    const { actions, ...rest } = holder
    const kept = (actions ?? []).filter(action => !PRESS_KINDS.includes(action.kind)).map(own)
    return kept.length > 0 ? { ...rest, actions: kept } : rest
  }
  const rows = card.data?.rows
  const result = trimmed(card)
  return Array.isArray(rows) ? { ...result, data: { ...card.data, rows: rows.map(trimmed) } } : result
}

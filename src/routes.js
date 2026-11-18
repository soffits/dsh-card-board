/**
 * The page's routes. They are exact Fetch routes under DSH's `/api`, so DSH
 * admits the browser first and a `requestIdentity` provider sees the request;
 * every answer is decided here, per request, from the server's own view of who
 * is asking.
 *
 *   GET  /api/card-board/boards                 the boards this viewer may see
 *   GET  /api/card-board/board?id=<id>          one board with its cards (ETag, 304)
 *   GET  /api/card-board/card?board=<id>&id=<card>   one card (ETag, 304)
 *   GET  /api/card-board/events?board=<id>      Server-Sent Events: which card or board.json changed
 *   POST /api/card-board/seen                   the card versions the viewer has seen
 *   POST /api/card-board/arrange                the viewer's own pins and order for a board, or `reset` back to the board's
 *   GET  /api/card-board/locale?tag=fr          the page's own words for a language (from locale/*.json)
 *   POST /api/card-board/action                 press a step, done, snooze or event action, or take a press back (`undo`)
 *
 * Every card entry carries its content `version` (and `rows`, the versions of its keyed rows) and, when something
 * in it is new since the viewer last looked, `fresh: { card: true, rows: [keys] }`.
 */
import { join } from 'node:path'
import { maySee, maySeeCard, viewerOf } from './access.js'
import { parseArrangement } from './arrange.js'
import { LANGUAGE_ID } from './messages.js'
import { ID_PATTERN, PRESS_KINDS, findAction } from './schema.js'
import { cardVersions, freshness, parseSeen } from './seen.js'
import { boardTag, cardPath, cardTag, listBoards, readBoard, readCard, readCards, resolveDataDir } from './store.js'

export const BOARDS_PATH = '/api/card-board/boards'
export const BOARD_PATH = '/api/card-board/board'
export const CARD_PATH = '/api/card-board/card'
export const EVENTS_PATH = '/api/card-board/events'
export const SEEN_PATH = '/api/card-board/seen'
export const ARRANGE_PATH = '/api/card-board/arrange'
export const ACTION_PATH = '/api/card-board/action'
export const LOCALE_PATH = '/api/card-board/locale'
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/
/** A comment line now and then keeps proxies from closing a quiet stream. */
export const HEARTBEAT_MS = 25_000

const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'private, no-cache',
  'x-content-type-options': 'nosniff',
}

function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...extra } })
}

const NO_PROVIDER = 'This board needs a sign-in plugin that provides requestIdentity, and none is running.'

/**
 * @param {object} options
 * @param {string} options.dataDir - the data folder (absolute)
 * @param {ReturnType<import('./access.js').createPeople>} options.people
 * @param {() => object | undefined} options.identity - the requestIdentity service right now, if any
 * @param {number} options.pollSeconds
 * @param {ReturnType<import('./presses.js').createPresses>} options.presses
 * @param {ReturnType<import('./seen.js').createSeenStore>} options.seen
 * @param {ReturnType<import('./arrange-store.js').createArrangeStore>} options.arrange
 * @param {ReturnType<import('./watch.js').createWatches>} options.watches
 * @param {(tag: string) => Promise<object>} options.messages - the page's words for a language
 * @param {string} [options.version] - mixed into ETags, so a plugin update refreshes open pages
 * @param {number} [options.heartbeatMs]
 */
export function createRoutes({ dataDir, people, identity, pollSeconds, presses, seen, arrange, watches, messages, version = '', heartbeatMs = HEARTBEAT_MS }) {
  /** The viewer and their board, or the Response that refuses them. */
  async function access(board) {
    const viewer = await viewerOf(people, identity())
    if (viewer.unavailable) return { refused: json(503, { error: NO_PROVIDER }) }
    const root = await resolveDataDir(dataDir)
    const entry = root === undefined ? undefined : await readBoard(root, board)
    // In people mode a missing board and a forbidden one answer the same, so ids don't leak.
    if (viewer.mode === 'people' && !maySee(viewer, entry?.board)) return { refused: json(403, { error: 'You can’t see this board.' }) }
    if (entry === undefined) return { refused: json(404, { error: 'No such board.' }) }
    return { viewer, root, entry, person: viewer.mode === 'owner' ? 'owner' : viewer.person }
  }

  /** A card entry with its versions, its press states and what is new in it for this viewer. */
  function decorate(card, states, seenBoard) {
    let entry = states[card.id] ? { ...card, presses: states[card.id] } : card
    if (card.card === undefined) return entry
    const versions = cardVersions(card.card)
    entry = { ...entry, ...versions }
    const fresh = freshness(seenBoard, { id: card.id, ...versions })
    return fresh ? { ...entry, fresh } : entry
  }

  async function locale(request) {
    const tag = new URL(request.url).searchParams.get('tag') ?? 'en'
    if (!LANGUAGE_ID.test(tag)) return json(400, { error: 'Not a language id.' })
    return json(200, await messages(tag))
  }

  async function boards() {
    const viewer = await viewerOf(people, identity())
    if (viewer.unavailable) return json(503, { error: NO_PROVIDER })
    const root = await resolveDataDir(dataDir)
    const visible = root === undefined ? [] : (await listBoards(root)).filter(entry => viewer.mode === 'owner' || maySee(viewer, entry.board))
    return json(200, {
      mode: viewer.mode,
      pollSeconds,
      boards: visible.map(entry => ({ id: entry.id, title: entry.board?.title ?? entry.id })),
    })
  }

  async function board(request) {
    const id = new URL(request.url).searchParams.get('id') ?? ''
    if (!ID_PATTERN.test(id)) return json(400, { error: 'Not a board id.' })
    const found = await access(id)
    if (found.refused) return found.refused
    const { viewer, root, entry, person } = found
    const states = await pressStates(root, id)
    const tag = await boardTag(root, id, `${version}\0${viewer.mode}\0${person ?? ''}\0${await seen.tag(person)}\0${await arrange.tag(person)}\0${JSON.stringify(states)}`)
    if (request.headers.get('if-none-match') === tag) return new Response(null, { status: 304, headers: { ...HEADERS, etag: tag } })
    const seenBoard = await seen.board(person, id)
    const cards = (await readCards(root, id, entry.board))
      .filter(card => maySeeCard(viewer, entry.board, card.id))
      .map(card => decorate(card, states, seenBoard))
    const arrangement = await arrange.get(person, id)
    return json(200, { id, title: entry.board?.title ?? id, ...(entry.board?.assistant ? { assistant: entry.board.assistant } : {}), ...(arrangement ? { arrangement } : {}), problems: entry.problems, cards }, { etag: tag })
  }

  async function card(request) {
    const params = new URL(request.url).searchParams
    const boardId = params.get('board') ?? ''
    const id = params.get('id') ?? ''
    if (!ID_PATTERN.test(boardId) || !ID_PATTERN.test(id)) return json(400, { error: 'Say which board and card.' })
    const found = await access(boardId)
    if (found.refused) return found.refused
    const { viewer, root, entry, person } = found
    // A card someone may not see answers like one that isn't there.
    if (!maySeeCard(viewer, entry.board, id)) return json(404, { error: 'No such card.' })
    const states = await pressStates(root, boardId)
    const tag = await cardTag(root, boardId, id, `${version}\0${viewer.mode}\0${person ?? ''}\0${await seen.tag(person)}\0${JSON.stringify(states[id] ?? null)}`)
    if (request.headers.get('if-none-match') === tag) return new Response(null, { status: 304, headers: { ...HEADERS, etag: tag } })
    const one = (await readCards(root, boardId, entry.board, id))[0]
    if (one === undefined) return json(404, { error: 'No such card.' })
    return json(200, decorate(one, states, await seen.board(person, boardId)), { etag: tag })
  }

  async function events(request) {
    const id = new URL(request.url).searchParams.get('board') ?? ''
    if (!ID_PATTERN.test(id)) return json(400, { error: 'Not a board id.' })
    const found = await access(id)
    if (found.refused) return found.refused
    const encoder = new TextEncoder()
    let finish = () => {}
    const body = new ReadableStream({
      async start(controller) {
        let open = true
        const send = text => { if (open) controller.enqueue(encoder.encode(text)) }
        const data = value => send(`data: ${JSON.stringify(value)}\n\n`)
        let unwatch = () => {}
        let unarrange = () => {}
        const heartbeat = setInterval(() => send(': ping\n\n'), heartbeatMs)
        finish = () => {
          if (!open) return
          open = false
          clearInterval(heartbeat)
          unwatch()
          unarrange()
          request.signal?.removeEventListener?.('abort', finish)
        }
        request.signal?.addEventListener?.('abort', finish)
        send(': connected\n\n')
        // The viewer's own arrangement changing elsewhere (another device) reaches this page too.
        unarrange = arrange.subscribe((who, board) => { if (who === found.person && board === id) data({ type: 'arrange' }) })
        unwatch = await watches.watch(join(found.root, id), async change => {
          if (change.type === 'board') {
            // Viewers may have changed: someone who may no longer see the board hears that and nothing else.
            const again = await access(id)
            if (again.refused) {
              data({ type: 'gone' })
              finish()
              try { controller.close() } catch { /* already closed */ }
              return
            }
          }
          if (change.type === 'card') {
            const now = await readBoard(found.root, id)
            if (!maySeeCard(found.viewer, now?.board, change.id)) return
          }
          data(change)
        })
        if (!open) unwatch()
        else data({ type: 'hello' })
      },
      cancel() { finish() },
    })
    return new Response(body, {
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform', 'x-accel-buffering': 'no', 'x-content-type-options': 'nosniff' },
    })
  }

  async function seenRoute(request) {
    let body
    try {
      body = parseSeen(await request.json())
    } catch {
      body = undefined
    }
    if (body === undefined) return json(400, { error: 'The body must be { board, cards: { <id>: { v, rows? } } }.' })
    const found = await access(body.board)
    if (found.refused) return found.refused
    const present = new Set((await readCards(found.root, body.board, found.entry.board))
      .filter(entry => maySeeCard(found.viewer, found.entry.board, entry.id)).map(entry => entry.id))
    await seen.record(found.person, body.board, body.cards, present)
    return json(200, { ok: true })
  }

  /** Press states of every card on a board that has recent presses, by card id. */
  async function pressStates(root, board) {
    const cards = new Set((await presses.list()).filter(event => event.source.board === board).map(event => event.source.card))
    const states = {}
    for (const card of [...cards].sort()) {
      if (!ID_PATTERN.test(card)) continue
      states[card] = await presses.statesFor(board, card, cardPath(root, board, card))
    }
    return states
  }

  /** The viewer's own pins and order for a board (`{ board, pinned, order }`), or back to the board's (`{ board, reset: true }`). */
  async function arrangeRoute(request) {
    let body
    try {
      body = await request.json()
    } catch {
      return json(400, { error: 'The body must be JSON.' })
    }
    const board = body?.board
    const arrangement = body?.reset === true ? null : parseArrangement(body)
    if (typeof board !== 'string' || !ID_PATTERN.test(board) || arrangement === undefined) return json(400, { error: 'The body must be { board, pinned: [card], order: [card] } or { board, reset: true }.' })
    const found = await access(board)
    if (found.refused) return found.refused
    if (arrangement === null) await arrange.reset(found.person, board)
    else await arrange.set(found.person, board, arrangement)
    return json(200, { ok: true })
  }

  async function action(request) {
    let body
    try {
      body = await request.json()
    } catch {
      return json(400, { error: 'The body must be JSON.' })
    }
    const { board, card, row, id, until, undo } = body ?? {}
    if (undo !== undefined) return undoPress({ board, card, undo })
    if (typeof board !== 'string' || !ID_PATTERN.test(board) || typeof card !== 'string' || !ID_PATTERN.test(card) || typeof id !== 'string')
      return json(400, { error: 'Say which board, card and action.' })
    if (row !== undefined && !(Number.isInteger(row) && row >= 0)) return json(400, { error: 'row must be a row index.' })
    if (until !== undefined && (typeof until !== 'string' || !DATE_TIME.test(until) || Number.isNaN(Date.parse(until))))
      return json(400, { error: 'until must be an ISO date-time with a zone.' })
    const viewer = await viewerOf(people, identity())
    if (viewer.unavailable) return json(503, { error: NO_PROVIDER })
    const root = await resolveDataDir(dataDir)
    const entry = root === undefined ? undefined : await readBoard(root, board)
    if (!maySee(viewer, entry?.board) || entry === undefined || !maySeeCard(viewer, entry.board, card)) return json(403, { error: 'You can’t act on this board.' })
    const found = findAction(await readCard(root, board, card), id, row)
    if (found === undefined || !PRESS_KINDS.includes(found.kind)) return json(409, { error: 'This action isn’t on the card any more.' })
    const payload = { ...(found.payload ?? {}), ...(found.kind === 'snooze' && until !== undefined && found.payload?.until === undefined ? { until } : {}) }
    const event = await presses.press({
      action: found,
      person: viewer.mode === 'owner' ? 'owner' : viewer.person,
      user: identity()?.current?.()?.id,
      board,
      card,
      row,
      payload,
    })
    return json(200, { press: event.press, state: 'pending', at: event.at, ...(event.inverse ? { undoable: true } : {}) })
  }

  /** Take back a press: the body names the press, and the board and card it was made on. */
  async function undoPress({ board, card, undo }) {
    if (typeof board !== 'string' || !ID_PATTERN.test(board) || typeof card !== 'string' || !ID_PATTERN.test(card) || typeof undo !== 'string' || undo.length > 100)
      return json(400, { error: 'Say which board, card and press.' })
    const viewer = await viewerOf(people, identity())
    if (viewer.unavailable) return json(503, { error: NO_PROVIDER })
    const root = await resolveDataDir(dataDir)
    const entry = root === undefined ? undefined : await readBoard(root, board)
    if (!maySee(viewer, entry?.board) || entry === undefined || !maySeeCard(viewer, entry.board, card)) return json(403, { error: 'You can’t act on this board.' })
    const result = await presses.undo({ press: undo, person: viewer.mode === 'owner' ? 'owner' : viewer.person, user: identity()?.current?.()?.id, board, card })
    if (result.problem === 'forbidden') return json(403, { error: 'You can’t act on this board.' })
    if (result.problem) return json(409, { error: 'This action can’t be undone.' })
    return json(200, { press: result.event.press, state: 'pending', at: result.event.at, undoes: result.event.undoes })
  }

  return [
    { path: BOARDS_PATH, methods: ['GET'], requestBody: 'buffered', fetch: boards },
    { path: BOARD_PATH, methods: ['GET'], requestBody: 'buffered', fetch: board },
    { path: CARD_PATH, methods: ['GET'], requestBody: 'buffered', fetch: card },
    { path: EVENTS_PATH, methods: ['GET'], requestBody: 'buffered', fetch: events },
    { path: SEEN_PATH, methods: ['POST'], requestBody: 'buffered', fetch: seenRoute },
    { path: ARRANGE_PATH, methods: ['POST'], requestBody: 'buffered', fetch: arrangeRoute },
    { path: LOCALE_PATH, methods: ['GET'], requestBody: 'buffered', fetch: locale },
    { path: ACTION_PATH, methods: ['POST'], requestBody: 'buffered', fetch: action },
  ]
}

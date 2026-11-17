/**
 * The two read-only routes the page polls. They are exact Fetch routes under
 * DSH's `/api`, so DSH admits the browser first and a `requestIdentity`
 * provider sees the request; every answer is decided here, per request, from
 * the server's own view of who is asking.
 *
 *   GET /api/card-board/boards          the boards this viewer may see
 *   GET /api/card-board/board?id=<id>   one board with its cards (ETag, 304)
 *   POST /api/card-board/action         press a done, snooze or event action
 */
import { maySee, viewerOf } from './access.js'
import { ID_PATTERN, PRESS_KINDS, findAction } from './schema.js'
import { boardTag, cardPath, listBoards, readBoard, readCard, readCards, resolveDataDir } from './store.js'

export const BOARDS_PATH = '/api/card-board/boards'
export const BOARD_PATH = '/api/card-board/board'
export const ACTION_PATH = '/api/card-board/action'
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/

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
 * @param {string} [options.ownerPerson] - the person for requests DSH admits without a sign-in identity
 * @param {string} [options.version] - mixed into ETags, so a plugin update refreshes open pages
 */
export function createRoutes({ dataDir, people, identity, pollSeconds, presses, ownerPerson = '', version = '' }) {
  async function boards() {
    const viewer = await viewerOf(people, identity(), ownerPerson)
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
    const viewer = await viewerOf(people, identity(), ownerPerson)
    if (viewer.unavailable) return json(503, { error: NO_PROVIDER })
    const root = await resolveDataDir(dataDir)
    const entry = root === undefined ? undefined : await readBoard(root, id)
    // In people mode a missing board and a forbidden one answer the same, so ids don't leak.
    if (viewer.mode === 'people' && !maySee(viewer, entry?.board)) return json(403, { error: 'You can’t see this board.' })
    if (entry === undefined) return json(404, { error: 'No such board.' })
    const states = await pressStates(root, id)
    const tag = await boardTag(root, id, `${version}\0${viewer.mode}\0${viewer.person ?? ''}\0${JSON.stringify(states)}`)
    if (request.headers.get('if-none-match') === tag) return new Response(null, { status: 304, headers: { ...HEADERS, etag: tag } })
    const cards = (await readCards(root, id, entry.board)).map(card => (states[card.id] ? { ...card, presses: states[card.id] } : card))
    return json(200, { id, title: entry.board?.title ?? id, problems: entry.problems, cards }, { etag: tag })
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

  async function action(request) {
    let body
    try {
      body = await request.json()
    } catch {
      return json(400, { error: 'The body must be JSON.' })
    }
    const { board, card, row, id, until } = body ?? {}
    if (typeof board !== 'string' || !ID_PATTERN.test(board) || typeof card !== 'string' || !ID_PATTERN.test(card) || typeof id !== 'string')
      return json(400, { error: 'Say which board, card and action.' })
    if (row !== undefined && !(Number.isInteger(row) && row >= 0)) return json(400, { error: 'row must be a row index.' })
    if (until !== undefined && (typeof until !== 'string' || !DATE_TIME.test(until) || Number.isNaN(Date.parse(until))))
      return json(400, { error: 'until must be an ISO date-time with a zone.' })
    const viewer = await viewerOf(people, identity(), ownerPerson)
    if (viewer.unavailable) return json(503, { error: NO_PROVIDER })
    const root = await resolveDataDir(dataDir)
    const entry = root === undefined ? undefined : await readBoard(root, board)
    if (!maySee(viewer, entry?.board) || entry === undefined) return json(403, { error: 'You can’t act on this board.' })
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
    return json(200, { press: event.press, state: 'pending', at: event.at })
  }

  return [
    { path: BOARDS_PATH, methods: ['GET'], requestBody: 'buffered', fetch: boards },
    { path: BOARD_PATH, methods: ['GET'], requestBody: 'buffered', fetch: board },
    { path: ACTION_PATH, methods: ['POST'], requestBody: 'buffered', fetch: action },
  ]
}

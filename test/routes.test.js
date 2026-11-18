import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import * as connectionPlugin from '@deepseek-ai/dsh-client-connection'
import { WebServer } from '@deepseek-ai/dsh-host-webserver'
import * as cardBoard from '../index.js'
import { createPeople, mayAct, maySee, personKey, viewerOf, withoutActions } from '../src/access.js'
import { createMessages } from '../src/messages.js'
import { createPresses } from '../src/presses.js'
import { createRoutes } from '../src/routes.js'
import { createSeenStore } from '../src/seen.js'
import { createArrangeStore } from '../src/arrange-store.js'
import { createWatches } from '../src/watch.js'

let dir
let outside
before(async () => {
  dir = await mkdtemp(join(tmpdir(), 'card-board-routes-'))
  await cp(new URL('../examples/boards/home', import.meta.url).pathname, join(dir, 'home'), { recursive: true })
  await mkdir(join(dir, 'garden', 'cards'), { recursive: true })
  await writeFile(join(dir, 'garden', 'board.json'), JSON.stringify({ title: 'Garden', viewers: ['Robin'] }))
  await writeFile(join(dir, 'garden', 'cards', 'broken.json'), '{ "type": "pie"')
  await writeFile(join(dir, 'garden', 'cards', 'wrong.json'), JSON.stringify({ type: 'stat', title: 'x', updatedAt: '2026-03-02T00:00:00Z', data: { items: [] } }))
  outside = await mkdtemp(join(tmpdir(), 'card-board-outside-'))
  await writeFile(join(outside, 'secret.json'), '{"type":"list"}')
  await symlink(join(outside, 'secret.json'), join(dir, 'garden', 'cards', 'escape.json'))
  await mkdir(join(dir, 'Not-An-Id'))
})
after(async () => {
  await rm(dir, { recursive: true, force: true })
  await rm(outside, { recursive: true, force: true })
})

/** The example board names itself in two languages. */
const HOME_TITLE = { en: 'Home', zh: '家' }
const PEOPLE = { 'sub-alex': 'Alex', 'sub-robin': 'robin' }
/** A stand-in identity provider whose current caller the test sets. */
function identityFor(state) {
  return { current: () => (state.id ? { provider: 'test', issuer: 'https://id.example', id: state.id } : null) }
}

let logCount = 0
const watches = createWatches({ pollMs: 200, settleMs: 20 })
after(() => watches.close())
function routes({ people = PEOPLE, provider = true, state = {}, published = [], now = Date.now, publisher, heartbeatMs = 25_000 } = {}) {
  const presses = createPresses({
    logPath: join(dir, `.actions-${++logCount}.jsonl`),
    publisher: publisher ?? (() => ({ emit: event => { published.push(event); return { matched: [] } } })),
    timeoutSeconds: 300,
    now,
  })
  const list = createRoutes({
    dataDir: dir,
    people: createPeople({ people }),
    identity: () => (provider ? identityFor(state) : undefined),
    pollSeconds: 30,
    presses,
    seen: createSeenStore(join(dir, `.seen-${logCount}`)),
    arrange: createArrangeStore(join(dir, `.arrange-${logCount}`)),
    watches,
    messages: createMessages(new URL('../locale', import.meta.url).pathname),
    version: 'test',
    heartbeatMs,
  })
  const call = async (path, headers = {}, body) => {
    const route = list.find(r => path.split('?')[0] === r.path)
    const init = body === undefined ? { headers } : { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }
    const response = await route.fetch(new Request(`http://dsh.internal${path}`, init))
    const text = await response.text()
    return { status: response.status, etag: response.headers.get('etag'), body: text ? JSON.parse(text) : null }
  }
  return { call, state, presses, published }
}

describe('access', () => {
  it('compares person ids without case', () => {
    assert.equal(personKey(' Alex '), 'alex')
    assert.equal(maySee({ mode: 'people', person: 'robin' }, { viewers: ['Robin'] }), true)
    assert.equal(maySee({ mode: 'people', person: undefined }, { viewers: ['robin'] }), false)
    assert.equal(maySee({ mode: 'owner' }, undefined), true)
  })

  it('lets the viewers act unless the board names its actors; acting needs seeing', () => {
    const alex = { mode: 'people', person: 'alex' }
    assert.equal(mayAct(alex, { viewers: ['Alex'] }), true)
    assert.equal(mayAct(alex, { viewers: ['alex', 'robin'], actors: ['Robin'] }), false)
    assert.equal(mayAct(alex, { viewers: ['alex', 'robin'], actors: ['ALEX'] }), true)
    assert.equal(mayAct(alex, { viewers: ['alex'], actors: [] }), false)
    assert.equal(mayAct(alex, { viewers: ['robin'], actors: ['alex'] }), false)
    assert.equal(mayAct({ mode: 'people', person: undefined }, { actors: ['alex'] }), false)
    assert.equal(mayAct({ mode: 'owner' }, { viewers: ['robin'], actors: [] }), true)
  })

  it('takes every declared button off a card except links, chat included', () => {
    const when = { type: 'list', title: 'x', updatedAt: '2026-03-02T00:00:00Z', actions: [{ kind: 'done', id: 'a' }, { kind: 'snooze', id: 'b' }], data: { rows: [
      { title: 'one', actions: [{ kind: 'step', id: 's', label: 'Go' }, { kind: 'event', id: 'e', label: 'Lock' }] },
      { title: 'two', actions: [{ kind: 'done', id: 'd' }, { kind: 'chat', id: 'c', payload: { prompt: 'Hi', session: 'owners-session' } }, { kind: 'link', id: 'l', payload: { url: 'https://example.com' } }] },
    ] } }
    when.data.rows[0].key = 'one'
    when.data.rows[0].detail = { text: 'More', actions: [{ kind: 'done', id: 'x', label: 'Pick' }, { kind: 'link', id: 'y', payload: { url: 'https://example.com/y' } }] }
    const result = withoutActions(when)
    assert.deepEqual(result.data.rows[0].detail, { text: 'More', actions: [{ kind: 'link', id: 'y', payload: { url: 'https://example.com/y' } }] }, 'an opened row offers no buttons either')
    assert.equal('actions' in result, false)
    assert.equal('actions' in result.data.rows[0], false)
    assert.deepEqual(result.data.rows[1].actions, [{ kind: 'link', id: 'l', payload: { url: 'https://example.com' } }])
    assert.equal(when.actions.length, 2)
  })

  it('maps from a people file under a key and re-reads it when it changes', async () => {
    const file = join(dir, 'people.json')
    await writeFile(file, JSON.stringify({ users: { 'sub-1': 'Kim' }, other: {} }))
    const people = createPeople({ peopleFile: file, peopleKey: 'users' })
    assert.equal(await people.personFor('sub-1'), 'kim')
    await new Promise(resolve => setTimeout(resolve, 20))
    await writeFile(file, JSON.stringify({ users: { 'sub-1': 'Lee', 'sub-2': 'Kim' } }))
    assert.equal(await people.personFor('sub-1'), 'lee')
    assert.equal(await people.personFor('sub-2'), 'kim')
  })

  it('maps nobody from a broken people file', async () => {
    const file = join(dir, 'broken-people.json')
    await writeFile(file, '{')
    const warnings = []
    const people = createPeople({ peopleFile: file }, { warn: w => warnings.push(w) })
    assert.equal(await people.personFor('sub-1'), undefined)
    assert.equal(warnings.length, 1)
  })

  it('is single-owner without a mapping and needs a provider with one', async () => {
    assert.deepEqual(await viewerOf(createPeople({}), undefined), { mode: 'owner' })
    assert.deepEqual(await viewerOf(createPeople({ people: PEOPLE }), undefined), { mode: 'people', unavailable: true })
  })
})

describe('routes', () => {
  it('lists only the boards a person may see', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    assert.deepEqual((await call('/api/card-board/boards')).body.boards, [{ id: 'home', title: HOME_TITLE }])
    state.id = 'sub-robin'
    assert.deepEqual((await call('/api/card-board/boards')).body.boards, [{ id: 'garden', title: 'Garden' }])
    state.id = 'sub-stranger'
    assert.deepEqual((await call('/api/card-board/boards')).body.boards, [])
    state.id = undefined
    assert.deepEqual((await call('/api/card-board/boards')).body.boards, [])
  })

  it('keeps each person to their own boards, both ways', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    assert.equal((await call('/api/card-board/board?id=garden')).status, 403)
    assert.equal((await call('/api/card-board/board?id=home')).status, 200)
    state.id = 'sub-robin'
    assert.equal((await call('/api/card-board/board?id=home')).status, 403)
    assert.equal((await call('/api/card-board/board?id=garden')).status, 200)
  })

  it('answers 403 for a board the person may not see, and for one that does not exist', async () => {
    const { call, state } = routes()
    state.id = 'sub-robin'
    assert.equal((await call('/api/card-board/board?id=home')).status, 403)
    assert.equal((await call('/api/card-board/board?id=nothing')).status, 403)
    assert.equal((await call('/api/card-board/board?id=..')).status, 400)
  })

  it('shows every board to the owner when no mapping is configured', async () => {
    const { call } = routes({ people: {}, provider: false })
    const { body } = await call('/api/card-board/boards')
    assert.equal(body.mode, 'owner')
    assert.deepEqual(body.boards.map(b => b.id), ['garden', 'home'])
    assert.equal((await call('/api/card-board/board?id=nothing')).status, 404)
  })

  it('refuses with 503 when a mapping is configured but no identity provider runs', async () => {
    const { call } = routes({ provider: false })
    assert.equal((await call('/api/card-board/boards')).status, 503)
    assert.equal((await call('/api/card-board/board?id=home')).status, 503)
  })

  it('serves cards in board order with their sizes, and bad cards as errors', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    const { body } = await call('/api/card-board/board?id=home')
    assert.deepEqual(body.cards.map(c => c.id), ['summary', 'countdown', 'weather', 'savings', 'energy', 'next-weeks', 'spending', 'chores', 'house'])
    assert.equal(body.cards.find(c => c.id === 'weather').size, 'small')
    assert.equal(body.cards.find(c => c.id === 'next-weeks').size, undefined) // the page picks by type
    state.id = 'sub-robin'
    const garden = (await call('/api/card-board/board?id=garden')).body
    const byId = Object.fromEntries(garden.cards.map(c => [c.id, c]))
    assert.match(byId.broken.problems[0], /not valid JSON/)
    assert.match(byId.wrong.problems[0], /data\.items: needs at least 1 item/)
    assert.deepEqual(byId.escape.problems, ['points outside the data folder'])
  })

  it('answers 304 to an unchanged board and a new tag after a write', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    const first = await call('/api/card-board/board?id=home')
    assert.ok(first.etag)
    assert.equal((await call('/api/card-board/board?id=home', { 'if-none-match': first.etag })).status, 304)
    await new Promise(resolve => setTimeout(resolve, 20))
    await writeFile(join(dir, 'home', 'cards', 'extra.json'), JSON.stringify({ type: 'list', title: 'New', updatedAt: '2026-03-02T10:00:00Z', data: { rows: [] } }))
    const second = await call('/api/card-board/board?id=home', { 'if-none-match': first.etag })
    assert.equal(second.status, 200)
    assert.notEqual(second.etag, first.etag)
    assert.ok(second.body.cards.some(c => c.id === 'extra'))
    await rm(join(dir, 'home', 'cards', 'extra.json'))
  })
})

/** Read SSE `data` messages from a Response body until `until` returns true for one (or the time runs out). */
async function readEvents(response, until, timeoutMs = 3000) {
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  const seen = []
  let buffer = ''
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const { done, value } = await Promise.race([reader.read(), new Promise(resolve => setTimeout(() => resolve({ timeout: true }), deadline - Date.now()))])
    if (done || value === undefined) break
    buffer += value
    let at
    while ((at = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, at)
      buffer = buffer.slice(at + 2)
      const data = block.split('\n').filter(line => line.startsWith('data: ')).map(line => line.slice(6)).join('\n')
      if (data) {
        const message = JSON.parse(data)
        seen.push(message)
        if (until(message)) { reader.cancel().catch(() => {}); return seen }
      }
    }
  }
  reader.cancel().catch(() => {})
  return seen
}

const card = (title, extra = {}) => JSON.stringify({ type: 'list', title, updatedAt: new Date().toISOString(), data: { rows: [{ title: 'one', key: 'one' }, { title: 'two', key: 'two' }] }, ...extra })

describe('one card, live changes and what is new', () => {
  after(async () => {
    for (const board of ['seen-board', 'live']) await rm(join(dir, board), { recursive: true, force: true })
  })

  it('serves one card with its versions, 304 while unchanged', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    const first = await call('/api/card-board/card?board=home&id=chores')
    assert.equal(first.status, 200)
    assert.equal(first.body.id, 'chores')
    assert.match(first.body.version, /^[\w-]{12}$/)
    assert.equal((await call('/api/card-board/card?board=home&id=chores', { 'if-none-match': first.etag })).status, 304)
    assert.equal((await call('/api/card-board/card?board=home&id=nothing')).status, 404)
    assert.equal((await call('/api/card-board/card?board=garden&id=broken')).status, 403)
  })

  it('a rewrite with the same content keeps the version; a changed row is new for someone who looked before', async () => {
    await mkdir(join(dir, 'seen-board', 'cards'), { recursive: true })
    await writeFile(join(dir, 'seen-board', 'board.json'), JSON.stringify({ title: 'Seen', viewers: ['alex'] }))
    await writeFile(join(dir, 'seen-board', 'cards', 'todo.json'), card('Todo'))
    const { call, state } = routes()
    state.id = 'sub-alex'
    const before = (await call('/api/card-board/board?id=seen-board')).body.cards[0]
    assert.equal(before.fresh, undefined, 'nothing is new on a first look')
    assert.equal((await call('/api/card-board/seen', {}, { board: 'seen-board', cards: { todo: { v: before.version, rows: before.rows } } })).status, 200)

    await new Promise(resolve => setTimeout(resolve, 15))
    await writeFile(join(dir, 'seen-board', 'cards', 'todo.json'), card('Todo'))
    const same = (await call('/api/card-board/board?id=seen-board')).body.cards[0]
    assert.equal(same.version, before.version)
    assert.equal(same.fresh, undefined)

    await writeFile(join(dir, 'seen-board', 'cards', 'todo.json'), JSON.stringify({ ...JSON.parse(card('Todo')), data: { rows: [{ title: 'one', key: 'one' }, { title: 'two, changed', key: 'two' }, { title: 'three', key: 'three' }] } }))
    await writeFile(join(dir, 'seen-board', 'cards', 'later.json'), card('Later'))
    const after = Object.fromEntries((await call('/api/card-board/board?id=seen-board')).body.cards.map(c => [c.id, c]))
    assert.deepEqual(after.todo.fresh, { card: true, rows: ['two', 'three'] })
    assert.deepEqual(after.later.fresh, { card: true, rows: [] })

    state.id = 'sub-robin'
    assert.equal((await call('/api/card-board/seen', {}, { board: 'seen-board', cards: { todo: { v: after.todo.version } } })).status, 403)
    state.id = 'sub-alex'
    assert.equal((await call('/api/card-board/seen', {}, { board: 'seen-board', cards: { 'Bad Id': { v: 'x' } } })).status, 400)
    await call('/api/card-board/seen', {}, { board: 'seen-board', cards: { todo: { v: after.todo.version, rows: after.todo.rows } } })
    const settled = Object.fromEntries((await call('/api/card-board/board?id=seen-board')).body.cards.map(c => [c.id, c]))
    assert.equal(settled.todo.fresh, undefined)
    assert.deepEqual(settled.later.fresh, { card: true, rows: [] }, 'a card not reported as seen stays new')
  })

  it('streams which card changed, to people who may see the board only, and says goodbye when they no longer may', async () => {
    await mkdir(join(dir, 'live', 'cards'), { recursive: true })
    await writeFile(join(dir, 'live', 'board.json'), JSON.stringify({ title: 'Live', viewers: ['alex'] }))
    await writeFile(join(dir, 'live', 'cards', 'a.json'), card('A'))
    const { state } = routes()
    const list = createRoutes({
      dataDir: dir, people: createPeople({ people: PEOPLE }), identity: () => identityFor(state), pollSeconds: 30,
      presses: createPresses({ logPath: join(dir, '.actions-live.jsonl') }), seen: createSeenStore(join(dir, '.seen-live')), arrange: createArrangeStore(join(dir, '.arrange-live')), watches,
      messages: createMessages(new URL('../locale', import.meta.url).pathname), heartbeatMs: 50,
    })
    const events = list.find(route => route.path === '/api/card-board/events')
    state.id = 'sub-robin'
    assert.equal((await events.fetch(new Request('http://dsh.internal/api/card-board/events?board=live'))).status, 403)
    state.id = 'sub-alex'
    const response = await events.fetch(new Request('http://dsh.internal/api/card-board/events?board=live'))
    assert.equal(response.headers.get('content-type'), 'text/event-stream; charset=utf-8')
    const reading = readEvents(response, message => message.type === 'gone')
    await new Promise(resolve => setTimeout(resolve, 100))
    await writeFile(join(dir, 'live', 'cards', 'a.json'), card('A again'))
    await new Promise(resolve => setTimeout(resolve, 150))
    await writeFile(join(dir, 'live', 'cards', 'b.json'), card('B'))
    await new Promise(resolve => setTimeout(resolve, 150))
    await writeFile(join(dir, 'live', 'board.json'), JSON.stringify({ title: 'Live', viewers: ['robin'] }))
    const got = await reading
    assert.deepEqual(got, [{ type: 'hello' }, { type: 'card', id: 'a' }, { type: 'card', id: 'b' }, { type: 'gone' }])
  })
})

describe('locale route', () => {
  it('answers with the words for the asked language, falling back to its primary tag and English', async () => {
    const { call } = routes()
    const fr = await call('/api/card-board/locale?tag=fr-CA')
    assert.equal(fr.status, 200)
    assert.equal(fr.body.tag, 'fr')
    assert.equal(fr.body.messages.panel, 'Tableaux')
    const unknown = await call('/api/card-board/locale?tag=sw')
    assert.equal(unknown.body.tag, 'en')
    assert.equal(unknown.body.messages.panel, 'Boards')
    assert.equal((await call('/api/card-board/locale')).body.tag, 'en')
  })

  it('refuses a tag that is not a language id', async () => {
    const { call } = routes()
    assert.equal((await call('/api/card-board/locale?tag=../../x')).status, 400)
  })

  it('needs nobody signed in: it is the page’s own text', async () => {
    const { call } = routes({ provider: false })
    assert.equal((await call('/api/card-board/locale?tag=zh')).status, 200)
  })
})

describe('actions', () => {
  const press = body => ['/api/card-board/action', {}, body]

  it('records a press of an action the card offers, as an event with who pressed it', async () => {
    const { call, state, published, presses } = routes()
    state.id = 'sub-alex'
    const result = await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:done' }))
    assert.equal(result.status, 200)
    assert.equal(result.body.state, 'pending')
    assert.equal(result.body.undoable, true)
    assert.equal(published.length, 1)
    assert.equal(published[0].channel, 'ui.action.done')
    assert.equal(published[0].key, result.body.press)
    const event = published[0].data
    assert.deepEqual({ ...event, at: undefined, press: undefined }, {
      action: 'done', id: 'library-books:done', inverse: { kind: 'reopen' }, payload: {}, person: 'alex', user: 'sub-alex', at: undefined, press: undefined,
      source: { plugin: 'dsh-card-board', board: 'home', card: 'chores', row: 1 },
    })
    assert.equal((await presses.list()).length, 1)
  })

  it('records a press of a button the row shows only when opened', async () => {
    const { call, state, published } = routes()
    state.id = 'sub-alex'
    const result = await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:returned-elm' }))
    assert.equal(result.status, 200)
    assert.deepEqual([published[0].channel, published[0].data.payload], ['ui.action.done', { branch: 'elm' }])
    assert.equal((await call(...press({ board: 'home', card: 'chores', row: 2, id: 'library-books:returned-elm' }))).status, 409)
  })

  it('records a step press: the person\'s go-ahead for what its label says', async () => {
    const { call, state, published } = routes()
    state.id = 'sub-alex'
    const result = await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:renew' }))
    assert.equal(result.status, 200)
    assert.equal(published[0].channel, 'ui.action.step')
    assert.equal(published[0].data.person, 'alex')
    assert.equal(published[0].data.id, 'library-books:renew')
    // a step is carried out by sending it, so it is done at once, not pending until the card is written
    const chores = (await call('/api/card-board/board?id=home')).body.cards.find(c => c.id === 'chores')
    assert.equal(chores.presses.find(p => p.id === 'library-books:renew').state, 'done')
  })

  it('takes the picked time for a snooze without one', async () => {
    const { call, state, published } = routes()
    state.id = 'sub-alex'
    const until = '2026-03-03T09:00:00.000Z'
    assert.equal((await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:snooze', until }))).status, 200)
    assert.deepEqual(published[0].data.payload, { until })
  })

  it('refuses actions the card does not offer, chat and link, and other people', async () => {
    const { call, state, published } = routes()
    state.id = 'sub-alex'
    assert.equal((await call(...press({ board: 'home', card: 'chores', row: 0, id: 'library-books:done' }))).status, 409)
    assert.equal((await call(...press({ board: 'home', card: 'chores', row: 2, id: 'landlord:ask' }))).status, 409)
    assert.equal((await call(...press({ board: 'home', card: 'house', id: 'house:panel' }))).status, 409)
    assert.equal((await call(...press({ board: 'home', card: '../x', id: 'a' }))).status, 400)
    state.id = 'sub-robin'
    assert.equal((await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:done' }))).status, 403)
    assert.equal(published.length, 0)
  })

  it('shows a press pending, done once the card is rewritten, and unhandled after the timeout', async () => {
    let clock = Date.now()
    const { call, state } = routes({ now: () => clock })
    state.id = 'sub-alex'
    await call(...press({ board: 'home', card: 'house', row: 2, id: 'front-door:lock' }))
    const stateOf = async () => (await call('/api/card-board/board?id=home')).body.cards.find(c => c.id === 'house').presses[0].state
    assert.equal(await stateOf(), 'pending')
    clock += 301_000
    assert.equal(await stateOf(), 'unhandled')
    clock -= 301_000
    await new Promise(resolve => setTimeout(resolve, 20))
    const file = join(dir, 'home', 'cards', 'house.json')
    const { readFile } = await import('node:fs/promises')
    await writeFile(file, await readFile(file, 'utf8'))
    clock = Date.now()
    assert.equal(await stateOf(), 'done')
  })

  it('takes a press back with the inverse the card offered, once, and keeps both records', async () => {
    const { call, state, published, presses } = routes()
    state.id = 'sub-alex'
    const done = (await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:done' }))).body
    const undone = await call(...press({ board: 'home', card: 'chores', undo: done.press }))
    assert.equal(undone.status, 200)
    assert.equal(undone.body.undoes, done.press)
    assert.equal(published[1].channel, 'ui.action.undo')
    assert.deepEqual({ ...published[1].data, at: undefined, press: undefined }, {
      action: 'undo', of: 'done', id: 'library-books:done', undoes: done.press, inverse: 'reopen', payload: {}, person: 'alex', user: 'sub-alex', at: undefined, press: undefined,
      source: { plugin: 'dsh-card-board', board: 'home', card: 'chores', row: 1 },
    })
    assert.equal((await call(...press({ board: 'home', card: 'chores', undo: done.press }))).body.press, undone.body.press)
    assert.equal((await presses.list()).length, 2)
    const states = (await call('/api/card-board/board?id=home')).body.cards.find(c => c.id === 'chores').presses
    assert.deepEqual(states.map(({ press, at, ...rest }) => rest), [{ id: 'library-books:done', row: 1, state: 'undone' }])
  })

  it('takes a snooze back to the date the card declared, not the one picked', async () => {
    const { call, state, published } = routes()
    state.id = 'sub-alex'
    const snoozed = (await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:snooze', until: '2026-03-09T09:00:00Z' }))).body
    assert.equal(published[0].data.payload.until, '2026-03-09T09:00:00Z')
    await call(...press({ board: 'home', card: 'chores', undo: snoozed.press }))
    assert.deepEqual(published[1].data.payload, { until: '2026-03-02T09:00:00Z' })
    assert.equal(published[1].data.of, 'snooze')
  })

  it('refuses to undo what has no inverse, someone else\'s press or an unknown press', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    const lock = (await call(...press({ board: 'home', card: 'house', row: 2, id: 'front-door:lock' }))).body
    assert.equal((await call(...press({ board: 'home', card: 'house', undo: lock.press }))).status, 409)
    assert.equal((await call(...press({ board: 'home', card: 'house', undo: 'nope' }))).status, 409)
    const done = (await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:done' }))).body
    assert.equal((await call(...press({ board: 'home', card: 'house', undo: done.press }))).status, 409)
    state.id = 'sub-robin'
    assert.equal((await call(...press({ board: 'home', card: 'chores', undo: done.press }))).status, 403)
  })

  it('lets a press be made again after it was undone, even within the double-tap window', async () => {
    const { call, state, presses } = routes()
    state.id = 'sub-alex'
    const first = (await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:done' }))).body
    await call(...press({ board: 'home', card: 'chores', undo: first.press }))
    const again = (await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:done' }))).body
    assert.notEqual(again.press, first.press)
    assert.equal((await presses.list()).length, 3)
  })

  it('logs the press even when no event publisher runs', async () => {
    const { call, state, presses } = routes({ publisher: () => undefined })
    state.id = 'sub-alex'
    assert.equal((await call(...press({ board: 'home', card: 'house', row: 2, id: 'front-door:lock' }))).status, 200)
    assert.equal((await presses.list()).length, 1)
  })

  it('reloads recent presses from the log after a restart', async () => {
    const logPath = join(dir, 'restart.jsonl')
    const first = createPresses({ logPath, publisher: () => undefined, timeoutSeconds: 300 })
    await first.press({ action: { kind: 'done', id: 'x' }, person: 'alex', board: 'home', card: 'chores', row: 0, payload: {} })
    const second = createPresses({ logPath, publisher: () => undefined, timeoutSeconds: 300 })
    assert.equal((await second.list()).length, 1)
  })
})

describe('as a DSH plugin, behind the real Connection', () => {
  it('serves /api routes and reads the caller from requestIdentity at request time', async () => {
    const root = new Context()
    try {
      const records = new Map()
      root.provide('credentials')
      root.set('credentials', {
        async modifyRecord(key, mutate) {
          const next = await mutate(records.get(key))
          if (next !== undefined) records.set(key, next)
          return records.get(key)
        },
      })
      await root.plugin(WebServer, { host: '127.0.0.1', port: 0 })
      await root.plugin(connectionPlugin, {})
      // A stand-in sign-in plugin: the caller is whoever the x-test-user header names.
      const scope = { id: undefined }
      root.on('connection/request', async (req, _res, next) => {
        scope.id = req.headers['x-test-user']
        try { await next() } finally { scope.id = undefined }
      })
      root.provide('requestIdentity', identityFor(scope))
      await root.plugin(cardBoard, { dataDir: dir, people: PEOPLE, actionLog: join(dir, 'plugin-actions.jsonl') })
      root.webServer.registerFallback((req, res) => {
        if (root.connection.authorizeIndex(req, res)) res.end('index')
      })
      const origin = root.webServer.getOrigin()
      const bootstrap = await fetch(root.connection.authenticatedUrl(`${origin}/`), { redirect: 'manual' })
      const cookie = (bootstrap.headers.get('set-cookie') ?? '').split(';', 1)[0]
      const get = async (path, user) => {
        const response = await fetch(`${origin}${path}`, { headers: { cookie, ...(user ? { 'x-test-user': user } : {}) } })
        return { status: response.status, body: await response.json() }
      }
      assert.deepEqual((await get('/api/card-board/boards', 'sub-alex')).body.boards, [{ id: 'home', title: HOME_TITLE }])
      assert.equal((await get('/api/card-board/board?id=home', 'sub-alex')).status, 200)
      assert.equal((await get('/api/card-board/board?id=home', 'sub-robin')).status, 403)
      assert.deepEqual((await get('/api/card-board/boards')).body.boards, [])
      const anonymous = await fetch(`${origin}/api/card-board/boards`)
      assert.equal(anonymous.status, 401)
      const pressed = await fetch(`${origin}/api/card-board/action`, {
        method: 'POST',
        headers: { cookie, 'x-test-user': 'sub-alex', 'content-type': 'application/json', origin },
        body: JSON.stringify({ board: 'home', card: 'house', row: 2, id: 'front-door:lock' }),
      })
      assert.equal(pressed.status, 200)
      assert.equal((await pressed.json()).state, 'pending')

      // The events route streams through DSH's web server: headers at once, then each change as it happens.
      const stream = await fetch(`${origin}/api/card-board/events?board=home`, { headers: { cookie, 'x-test-user': 'sub-alex', accept: 'text/event-stream' } })
      assert.equal(stream.status, 200)
      const reading = readEvents(stream, message => message.type === 'card')
      await new Promise(resolve => setTimeout(resolve, 300))
      await writeFile(join(dir, 'home', 'cards', 'chores.json'), JSON.stringify({ ...JSON.parse(await readFile(join(dir, 'home', 'cards', 'chores.json'), 'utf8')), updatedAt: new Date().toISOString() }))
      assert.deepEqual(await reading, [{ type: 'hello' }, { type: 'card', id: 'chores' }])
      assert.equal((await fetch(`${origin}/api/card-board/events?board=home`, { headers: { cookie, 'x-test-user': 'sub-robin' } })).status, 403)
    } finally {
      await root.fiber.dispose()
    }
  })
})

describe('arrangements', () => {
  const both = { title: 'Both', viewers: ['alex', 'robin'], order: ['a', 'b', 'c'] }
  const arrange = (call, body) => call('/api/card-board/arrange', {}, body)
  const idsOf = response => response.body.cards.map(entry => entry.id)

  before(async () => {
    await mkdir(join(dir, 'both', 'cards'), { recursive: true })
    await writeFile(join(dir, 'both', 'board.json'), JSON.stringify(both))
    for (const id of ['a', 'b', 'c']) await writeFile(join(dir, 'both', 'cards', `${id}.json`), card(id))
  })

  it('keeps each person’s pins and order to themselves; the board’s order stays the default', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    assert.equal((await call('/api/card-board/board?id=both')).body.arrangement, undefined)
    assert.equal((await arrange(call, { board: 'both', pinned: ['c'], order: ['b', 'a'] })).status, 200)
    const alex = await call('/api/card-board/board?id=both')
    assert.deepEqual(alex.body.arrangement, { pinned: ['c'], order: ['b', 'a'] })
    assert.deepEqual(idsOf(alex), ['a', 'b', 'c'], 'the cards still come in the board’s order; the page arranges them')
    state.id = 'sub-robin'
    assert.equal((await call('/api/card-board/board?id=both')).body.arrangement, undefined)
    state.id = 'sub-alex'
    assert.deepEqual((await call('/api/card-board/board?id=both')).body.arrangement, { pinned: ['c'], order: ['b', 'a'] })
  })

  it('changes the board’s tag when the arrangement changes, so a poll sees it', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    await arrange(call, { board: 'both', reset: true })
    const first = await call('/api/card-board/board?id=both')
    assert.equal((await call('/api/card-board/board?id=both', { 'if-none-match': first.etag })).status, 304)
    await arrange(call, { board: 'both', pinned: [], order: ['c', 'b', 'a'] })
    const second = await call('/api/card-board/board?id=both', { 'if-none-match': first.etag })
    assert.equal(second.status, 200)
    assert.notEqual(second.etag, first.etag)
  })

  it('goes back to the board’s order on reset', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    await arrange(call, { board: 'both', pinned: ['b'], order: ['a', 'c'] })
    assert.equal((await arrange(call, { board: 'both', reset: true })).status, 200)
    assert.equal((await call('/api/card-board/board?id=both')).body.arrangement, undefined)
  })

  it('refuses a board the person may not see, and bodies that aren’t an arrangement', async () => {
    const { call, state } = routes()
    state.id = 'sub-robin'
    assert.equal((await arrange(call, { board: 'home', pinned: [], order: [] })).status, 403)
    state.id = undefined
    assert.equal((await arrange(call, { board: 'both', pinned: [], order: [] })).status, 403)
    state.id = 'sub-alex'
    assert.equal((await arrange(call, { board: 'both', pinned: ['a'], order: ['a'] })).status, 400)
    assert.equal((await arrange(call, { board: 'both', pinned: 'a', order: [] })).status, 400)
    assert.equal((await arrange(call, { board: 'Bad Id', reset: true })).status, 400)
    assert.equal((await arrange(call, {})).status, 400)
  })

  it('tells the person’s other open pages, and only theirs', async () => {
    const { state } = routes()
    const store = createArrangeStore(join(dir, '.arrange-events'))
    const list = createRoutes({
      dataDir: dir, people: createPeople({ people: PEOPLE }), identity: () => identityFor(state), pollSeconds: 30,
      presses: createPresses({ logPath: join(dir, '.actions-events.jsonl') }), seen: createSeenStore(join(dir, '.seen-events')), arrange: store, watches,
      messages: createMessages(new URL('../locale', import.meta.url).pathname), heartbeatMs: 50,
    })
    const events = list.find(route => route.path === '/api/card-board/events')
    state.id = 'sub-alex'
    const response = await events.fetch(new Request('http://dsh.internal/api/card-board/events?board=both'))
    const reading = readEvents(response, message => message.type === 'arrange')
    await new Promise(resolve => setTimeout(resolve, 100))
    await store.set('robin', 'both', { pinned: [], order: ['a'] })
    await store.set('alex', 'other', { pinned: [], order: ['a'] })
    await store.set('alex', 'both', { pinned: ['a'], order: [] })
    const messages = await reading
    assert.equal(messages.filter(message => message.type === 'arrange').length, 1)
  })

  it('writes a person’s file once, readable only by the plugin', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    await arrange(call, { board: 'both', pinned: ['a'], order: ['b'] })
    const { readdir, stat } = await import('node:fs/promises')
    const folder = join(dir, `.arrange-${logCount}`)
    const files = await readdir(folder)
    assert.equal(files.length, 1)
    assert.equal((await stat(join(folder, files[0]))).mode & 0o077, 0)
  })
})

describe('cards only some viewers see', () => {
  const card = title => ({ type: 'list', title, updatedAt: '2026-03-02T00:00:00Z', data: { rows: [{ title: 'Water the plants', actions: [{ kind: 'done', id: 'water:done' }] }] } })
  before(async () => {
    await mkdir(join(dir, 'shared', 'cards'), { recursive: true })
    await writeFile(join(dir, 'shared', 'board.json'), JSON.stringify({ title: 'Shared', viewers: ['alex', 'robin'], cardViewers: { mine: ['Alex'] } }))
    await writeFile(join(dir, 'shared', 'cards', 'mine.json'), JSON.stringify(card('Alex’s asks')))
    await writeFile(join(dir, 'shared', 'cards', 'ours.json'), JSON.stringify(card('Both')))
  })

  it('serves a card listed in cardViewers only to the people it names', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    assert.deepEqual((await call('/api/card-board/board?id=shared')).body.cards.map(c => c.id), ['mine', 'ours'])
    assert.equal((await call('/api/card-board/card?board=shared&id=mine')).status, 200)
    state.id = 'sub-robin'
    assert.deepEqual((await call('/api/card-board/board?id=shared')).body.cards.map(c => c.id), ['ours'])
    assert.equal((await call('/api/card-board/card?board=shared&id=mine')).status, 404)
    assert.equal((await call('/api/card-board/action', {}, { board: 'shared', card: 'mine', row: 0, id: 'water:done' })).status, 403)
    assert.equal((await call('/api/card-board/action', {}, { board: 'shared', card: 'ours', row: 0, id: 'water:done' })).status, 200)
  })

  it('tells a viewer nothing about a card they may not see changing', async () => {
    const { state } = routes()
    state.id = 'sub-robin'
    const list = createRoutes({
      dataDir: dir, people: createPeople({ people: PEOPLE }), identity: () => identityFor(state), pollSeconds: 30,
      presses: createPresses({ logPath: join(dir, '.actions-cv.jsonl'), publisher: () => undefined, timeoutSeconds: 300 }),
      seen: createSeenStore(join(dir, '.seen-cv')), arrange: createArrangeStore(join(dir, '.arrange-cv')), watches,
      messages: createMessages(new URL('../locale', import.meta.url).pathname), version: 'test',
    })
    const route = list.find(r => r.path === '/api/card-board/events')
    const controller = new AbortController()
    const response = await route.fetch(new Request('http://dsh.internal/api/card-board/events?board=shared', { signal: controller.signal }))
    const reader = response.body.getReader()
    const seen = []
    const reading = (async () => {
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        text += decoder.decode(value)
        for (const line of text.split('\n\n')) if (line.startsWith('data: ')) seen.push(JSON.parse(line.slice(6)))
        text = text.endsWith('\n\n') ? '' : text.slice(text.lastIndexOf('\n\n') + 2)
        if (seen.some(m => m.type === 'card')) break
      }
    })()
    await new Promise(resolve => setTimeout(resolve, 300))
    await writeFile(join(dir, 'shared', 'cards', 'mine.json'), JSON.stringify(card('Alex’s asks, again')))
    await new Promise(resolve => setTimeout(resolve, 500))
    await writeFile(join(dir, 'shared', 'cards', 'ours.json'), JSON.stringify(card('Both, again')))
    await reading
    controller.abort()
    assert.deepEqual(seen.filter(m => m.type === 'card'), [{ type: 'card', id: 'ours' }])
  })

  it('checks cardViewers in board.json', async () => {
    const { checkBoard } = await import('../src/schema.js')
    assert.deepEqual(checkBoard({ title: 'x', cardViewers: { mine: ['alex'] } }), [])
    assert.ok(checkBoard({ title: 'x', cardViewers: { 'Not An Id': ['alex'] } }).length > 0)
    assert.ok(checkBoard({ title: 'x', cardViewers: { mine: 'alex' } }).length > 0)
  })
})

describe('boards someone may see but not act on', () => {
  const card = { type: 'list', title: 'Chores', updatedAt: '2026-03-02T00:00:00Z', actions: [{ kind: 'snooze', id: 'later' }], data: { rows: [{ title: 'Water the plants', actions: [{ kind: 'done', id: 'water:done', inverse: { kind: 'reopen' } }, { kind: 'chat', id: 'water:ask', label: 'Ask' }] }] } }
  before(async () => {
    await mkdir(join(dir, 'trust', 'cards'), { recursive: true })
    await writeFile(join(dir, 'trust', 'board.json'), JSON.stringify({ title: 'Trust', viewers: ['alex', 'robin'], actors: ['alex'] }))
    await writeFile(join(dir, 'trust', 'cards', 'chores.json'), JSON.stringify(card))
    await mkdir(join(dir, 'ghost', 'cards'), { recursive: true })
    await writeFile(join(dir, 'ghost', 'board.json'), JSON.stringify({ title: 'Ghost', viewers: ['alex'], actors: ['robin'] }))
    await writeFile(join(dir, 'ghost', 'cards', 'chores.json'), JSON.stringify(card))
  })
  const press = { board: 'trust', card: 'chores', row: 0, id: 'water:done' }

  it('gives an actor the board as it is', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    const body = (await call('/api/card-board/board?id=trust')).body
    assert.equal(body.readOnly, undefined)
    assert.equal(body.cards[0].card.data.rows[0].actions.length, 2)
    assert.equal((await call('/api/card-board/action', {}, press)).status, 200)
  })

  it('gives a viewer the board without its pressing buttons, marked read-only, and refuses their presses', async () => {
    const { call, state, published } = routes()
    state.id = 'sub-alex'
    await call('/api/card-board/action', {}, press)
    const mine = (await call('/api/card-board/board?id=trust')).body.cards[0].presses
    assert.equal(mine.length, 1)
    state.id = 'sub-robin'
    const board = (await call('/api/card-board/board?id=trust')).body
    assert.equal(board.readOnly, true)
    assert.equal(board.cards[0].card.title, 'Chores')
    assert.equal('actions' in board.cards[0].card, false)
    assert.equal('actions' in board.cards[0].card.data.rows[0], false)
    assert.equal(board.cards[0].presses, undefined)
    const one = (await call('/api/card-board/card?board=trust&id=chores')).body
    assert.equal('actions' in one.card.data.rows[0], false)
    assert.equal((await call('/api/card-board/boards')).body.boards.some(b => b.id === 'trust'), true)
    const before = published.length
    assert.equal((await call('/api/card-board/action', {}, press)).status, 403)
    assert.equal((await call('/api/card-board/action', {}, { ...press, id: 'later', row: undefined })).status, 403)
    const pressed = published.find(event => event.data.source.board === 'trust')
    assert.equal((await call('/api/card-board/action', {}, { undo: pressed.data.press, board: 'trust', card: 'chores' })).status, 403)
    assert.equal(published.length, before)
  })

  it('keeps a declared chat button for an actor and takes it from a viewer', async () => {
    const { call, state } = routes()
    const chatOf = body => body.cards[0].card.data.rows[0].actions?.filter(action => action.kind === 'chat') ?? []
    state.id = 'sub-alex'
    assert.deepEqual(chatOf((await call('/api/card-board/board?id=trust')).body).map(action => action.id), ['water:ask'])
    state.id = 'sub-robin'
    assert.deepEqual(chatOf((await call('/api/card-board/board?id=trust')).body), [])
    assert.deepEqual(chatOf({ cards: [(await call('/api/card-board/card?board=trust&id=chores')).body] }), [])
  })

  it('answers a viewer and an actor differently even with the same card tag', async () => {
    const { call, state } = routes()
    state.id = 'sub-alex'
    const first = await call('/api/card-board/board?id=trust')
    state.id = 'sub-robin'
    assert.equal((await call('/api/card-board/board?id=trust', { 'if-none-match': first.etag })).status, 200)
  })

  it('does not let an actor who is not a viewer see or act', async () => {
    const { call, state } = routes()
    state.id = 'sub-robin'
    assert.equal((await call('/api/card-board/board?id=ghost')).status, 403)
    assert.equal((await call('/api/card-board/action', {}, { ...press, board: 'ghost' })).status, 403)
  })

  it('lets everyone DSH admits act on a single-person DSH', async () => {
    const { call } = routes({ people: {} })
    assert.equal((await call('/api/card-board/action', {}, press)).status, 200)
  })
})

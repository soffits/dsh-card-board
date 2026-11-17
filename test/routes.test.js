import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import * as connectionPlugin from '@deepseek-ai/dsh-client-connection'
import { WebServer } from '@deepseek-ai/dsh-host-webserver'
import * as cardBoard from '../index.js'
import { createPeople, maySee, personKey, viewerOf } from '../src/access.js'
import { createPresses } from '../src/presses.js'
import { createRoutes } from '../src/routes.js'

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

const PEOPLE = { 'sub-alex': 'Alex', 'sub-robin': 'robin' }
/** A stand-in identity provider whose current caller the test sets. */
function identityFor(state) {
  return { current: () => (state.id ? { provider: 'test', issuer: 'https://id.example', id: state.id } : null) }
}

let logCount = 0
function routes({ people = PEOPLE, provider = true, state = {}, published = [], now = Date.now, publisher, ownerPerson } = {}) {
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
    ownerPerson,
    version: 'test',
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
    assert.deepEqual((await call('/api/card-board/boards')).body.boards, [{ id: 'home', title: 'Home' }])
    state.id = 'sub-robin'
    assert.deepEqual((await call('/api/card-board/boards')).body.boards, [{ id: 'garden', title: 'Garden' }])
    state.id = 'sub-stranger'
    assert.deepEqual((await call('/api/card-board/boards')).body.boards, [])
    state.id = undefined
    assert.deepEqual((await call('/api/card-board/boards')).body.boards, [])
  })

  it('gives requests without a sign-in identity the ownerPerson view, and nothing without a provider', async () => {
    const { call } = routes({ ownerPerson: 'Robin' })
    assert.deepEqual((await call('/api/card-board/boards')).body.boards, [{ id: 'garden', title: 'Garden' }])
    assert.equal((await routes({ ownerPerson: 'robin', provider: false }).call('/api/card-board/boards')).status, 503)
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
    assert.deepEqual(body.cards.map(c => c.id), ['weather', 'savings', 'energy', 'next-weeks', 'spending', 'chores', 'house'])
    assert.deepEqual(body.cards.find(c => c.id === 'next-weeks'), { ...body.cards.find(c => c.id === 'next-weeks'), w: 2, h: 1 })
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

describe('actions', () => {
  const press = body => ['/api/card-board/action', {}, body]

  it('records a press of an action the card offers, as an event with who pressed it', async () => {
    const { call, state, published, presses } = routes()
    state.id = 'sub-alex'
    const result = await call(...press({ board: 'home', card: 'chores', row: 1, id: 'library-books:done' }))
    assert.equal(result.status, 200)
    assert.equal(result.body.state, 'pending')
    assert.equal(published.length, 1)
    assert.equal(published[0].channel, 'ui.action.done')
    assert.equal(published[0].key, result.body.press)
    const event = published[0].data
    assert.deepEqual({ ...event, at: undefined, press: undefined }, {
      action: 'done', id: 'library-books:done', payload: {}, person: 'alex', user: 'sub-alex', at: undefined, press: undefined,
      source: { plugin: 'dsh-card-board', board: 'home', card: 'chores', row: 1 },
    })
    assert.equal((await presses.list()).length, 1)
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
      assert.deepEqual((await get('/api/card-board/boards', 'sub-alex')).body.boards, [{ id: 'home', title: 'Home' }])
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
    } finally {
      await root.fiber.dispose()
    }
  })
})

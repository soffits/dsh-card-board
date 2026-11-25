import assert from 'node:assert/strict'
import { appendFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { createEventStreams, createPeople, readLocales, tableFor } from '@soffits/dsh-host-kit'
import { createCommandSource } from '../src/command-source.js'
import { createArrangeStore } from '../src/arrange-store.js'
import { createPresses } from '../src/presses.js'
import { createRoutes } from '../src/routes.js'
import { createSeenStore } from '../src/seen.js'
import { createWatches } from '../src/watch.js'

// A stand-in board command: a script that answers from a JSON file the test edits, counts its runs and logs presses.
const SCRIPT = `
import { appendFileSync, readFileSync } from 'node:fs'
const dir = process.env.FAKE_DIR
const [what, id] = process.argv.slice(2)
const state = JSON.parse(readFileSync(dir + '/state.json', 'utf8'))
appendFileSync(dir + '/runs.log', what + ' ' + (id ?? '') + '\\n')
if (state.down) { console.error('the store is locked'); process.exit(3) }
if (what === 'boards') console.log(JSON.stringify({ boards: state.boards, watch: state.specWatch ?? [] }))
else if (what === 'board') console.log(JSON.stringify({ cards: state.cards[id] ?? {}, watch: state.noWatch ? [] : [dir + '/state.json'], ...(state.refreshAt ? { refreshAt: state.refreshAt } : {}) }))
else if (what === 'press') {
  const input = readFileSync(0, 'utf8')
  appendFileSync(dir + '/presses.log', input + '\\n')
  if (state.failPress) { console.error('cannot do that'); process.exit(1) }
  state.cards[id] = state.afterPress ?? state.cards[id]
  import('node:fs').then(fs => fs.writeFileSync(dir + '/state.json', JSON.stringify(state)))
}
`

let dir
const state = {}
const stat = (title, extra = {}) => ({ type: 'stat', title, data: { items: [{ label: 'n', value: 1 }] }, ...extra })
const save = async patch => { Object.assign(state, patch); await writeFile(join(dir, 'state.json'), JSON.stringify(state)) }
const runs = async what => (await readFile(join(dir, 'runs.log'), 'utf8').catch(() => '')).split('\n').filter(line => line.startsWith(`${what} `)).length
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))

before(async () => {
  dir = await mkdtemp(join(tmpdir(), 'card-board-command-'))
  await writeFile(join(dir, 'fake.mjs'), SCRIPT)
  await writeFile(join(dir, 'runs.log'), '')
})
after(() => rm(dir, { recursive: true, force: true }))

function make(options = {}) {
  return createCommandSource({ command: [process.execPath, join(dir, 'fake.mjs')], env: { ...process.env, FAKE_DIR: dir }, pollMs: 100, ...options })
}

const BOARDS = { home: { title: 'Home', viewers: ['robin'], order: ['b', 'a'], layout: { a: { size: 'wide' } } }, other: { title: 'Other', viewers: ['alex'] } }

describe('a board command', () => {
  before(() => save({ boards: BOARDS, cards: { home: { a: stat('A'), b: stat('B'), c: { error: 'the store is locked' }, d: { type: 'pie' } } }, down: false }))

  it('lists boards and reads cards in the board order, with sizes, stamps and problems', async () => {
    const source = make()
    assert.deepEqual((await source.list()).map(entry => entry.id), ['home', 'other'])
    const home = await source.board('home')
    const cards = await source.cards('home', home.board)
    assert.deepEqual(cards.map(card => card.id), ['b', 'a', 'c', 'd'])
    assert.equal(cards[1].size, 'wide')
    assert.match(cards[0].card.updatedAt, /^\d{4}-\d\d-\d\dT[\d:]+.*Z$/)
    assert.deepEqual(cards[2].problems, ['the store is locked'])
    assert.ok(cards[3].problems.length > 0, 'a card that fails the schema carries its problems')
    assert.equal(await source.board('nope'), undefined)
    source.close()
  })

  it('reuses an answer until a watched path changes, then asks again', async () => {
    const source = make()
    const before = await runs('board')
    const home = await source.board('home')
    const first = await source.boardTag('home', 'x')
    await source.cards('home', home.board)
    await source.cards('home', home.board)
    assert.equal(await runs('board'), before + 1)
    await pause(20)
    await save({ cards: { ...state.cards, home: { ...state.cards.home, a: stat('A changed') } } })
    const cards = await source.cards('home', home.board, 'a')
    assert.equal(cards[0].card.title, 'A changed')
    assert.equal(await runs('board'), before + 2)
    assert.notEqual(await source.boardTag('home', 'x'), first)
    source.close()
  })

  it('keeps a card’s updatedAt while its content is the same, and refreshes it when a staleAfter card is half old', async () => {
    let at = Date.parse('2026-03-02T10:00:00Z')
    await save({ cards: { home: { a: stat('A'), s: stat('S', { staleAfter: 3600 }) } } })
    const source = make({ now: () => at })
    const home = await source.board('home')
    const stamp = async id => (await source.card('home', id)).updatedAt
    const firstA = await stamp('a')
    const firstS = await stamp('s')
    assert.equal(firstA, '2026-03-02T10:00:00.000Z')
    at += 600_000
    await save({ cards: { home: { a: stat('A'), s: stat('S', { staleAfter: 3600 }), t: stat('T') } } })
    assert.equal(await stamp('a'), firstA, 'same content, same time')
    assert.equal(await stamp('s'), firstS, 'not yet half of staleAfter')
    at += 1_300_000
    await save({ cards: { home: { a: stat('A'), s: stat('S', { staleAfter: 3600 }), t: stat('T') } }, bump: at })
    assert.equal(await stamp('a'), firstA)
    assert.notEqual(await stamp('s'), firstS, 'older than half of staleAfter: stamped again')
    assert.ok(home)
    source.close()
  })

  it('asks again at refreshAt, and after a few seconds when it names no paths', async () => {
    let at = Date.parse('2026-03-02T10:00:00Z')
    await save({ cards: { home: { a: stat('A') } }, refreshAt: '2026-03-02T10:05:00Z', noWatch: false })
    const source = make({ now: () => at })
    const before = await runs('board')
    await source.card('home', 'a')
    at += 60_000
    await source.card('home', 'a')
    assert.equal(await runs('board'), before + 1)
    at += 300_000
    await source.card('home', 'a')
    assert.equal(await runs('board'), before + 2, 'refreshAt passed')
    await save({ refreshAt: undefined, noWatch: true })
    await source.card('home', 'a')
    const settled = await runs('board')
    at += 1000
    await source.card('home', 'a')
    assert.equal(await runs('board'), settled)
    at += 6000
    await source.card('home', 'a')
    assert.equal(await runs('board'), settled + 1, 'no paths: reused only for a few seconds')
    await save({ noWatch: false })
    source.close()
  })

  it('tells a listener which card changed', async () => {
    await save({ cards: { home: { a: stat('A'), b: stat('B') } } })
    const source = make()
    const seen = []
    const stop = await source.watch('home', change => seen.push(change))
    await pause(30)
    await save({ cards: { home: { a: stat('A'), b: stat('B changed'), e: stat('E') } } })
    for (let i = 0; i < 40 && seen.length < 2; i += 1) await pause(50)
    assert.deepEqual(seen.filter(change => change.type === 'card').map(change => change.id).sort(), ['b', 'e'])
    stop()
    source.close()
  })

  it('tells a listener when the boards’ own fields change', async () => {
    const watched = join(dir, 'boards-config.json')
    await writeFile(watched, '1')
    await save({ cards: { home: { a: stat('A') } }, specWatch: [watched] })
    const source = make()
    const seen = []
    const stop = await source.watch('home', change => seen.push(change))
    await pause(30)
    await save({ boards: { ...BOARDS, home: { ...BOARDS.home, title: 'Renamed' } } })
    await writeFile(watched, '2')
    for (let i = 0; i < 40 && seen.length === 0; i += 1) await pause(50)
    assert.ok(seen.some(change => change.type === 'board'))
    assert.equal((await source.board('home')).board.title, 'Renamed')
    stop()
    source.close()
    await save({ boards: BOARDS, specWatch: [] })
  })

  it('keeps the last good cards and says why when the command fails', async () => {
    await save({ cards: { home: { a: stat('A') } }, down: false })
    const source = make({ warn: () => {} })
    const home = await source.board('home')
    await source.cards('home', home.board)
    await pause(20)
    await save({ down: true })
    const cards = await source.cards('home', home.board)
    assert.deepEqual(cards.map(card => card.id), ['a'])
    assert.deepEqual(await source.problems('home'), ['the store is locked'])
    await pause(20)
    await save({ down: false })
    await source.cards('home', home.board)
    assert.deepEqual(await source.problems('home'), [])
    source.close()
  })

  it('hands a press to the command on stdin and asks for a fresh answer', async () => {
    await save({ cards: { home: { a: stat('A') } }, afterPress: { a: stat('A done') }, failPress: false })
    const source = make()
    await source.card('home', 'a')
    const handledAt = await source.press('home', { action: 'done', id: 'a:done', source: { board: 'home', card: 'a' } })
    assert.equal(typeof handledAt, 'number')
    assert.equal((await source.card('home', 'a')).title, 'A done')
    assert.ok((await source.writtenAt('home')) >= handledAt)
    assert.match((await readFile(join(dir, 'presses.log'), 'utf8')).trim().split('\n').pop(), /"id":"a:done"/)
    await save({ failPress: true })
    await assert.rejects(source.press('home', { action: 'done', id: 'x' }), /cannot do that/)
    await save({ failPress: false })
    source.close()
  })
})

describe('boards from a command in the routes', () => {
  const watches = createWatches({ pollMs: 100, settleMs: 20 })
  after(() => watches.close())
  let n = 0
  async function setup({ time = Date.now } = {}) {
    n += 1
    const folder = join(dir, `folder-${n}`)
    await mkdir(join(folder, 'garden', 'cards'), { recursive: true })
    await writeFile(join(folder, 'garden', 'board.json'), JSON.stringify({ title: 'Garden', viewers: ['robin'] }))
    await mkdir(join(folder, 'home', 'cards'), { recursive: true })
    await writeFile(join(folder, 'home', 'board.json'), JSON.stringify({ title: 'Shadowed by the command' }))
    const source = make()
    const presses = createPresses({ logPath: join(folder, '.actions.jsonl'), publisher: () => ({ emit: () => ({ matched: [] }) }), timeoutSeconds: 300, now: time })
    const list = createRoutes({
      dataDir: folder, source, people: createPeople({ people: { 'sub-robin': 'robin', 'sub-alex': 'alex' } }),
      identity: () => ({ current: () => (callState.id ? { provider: 't', issuer: 'i', id: callState.id } : null) }),
      pollSeconds: 30, presses, seen: createSeenStore(join(folder, '.seen')), arrange: createArrangeStore(join(folder, '.arrange')),
      watches, messages: async tag => tableFor(await readLocales(new URL('../locale', import.meta.url).pathname), tag), version: 't', streams: createEventStreams({}),
    })
    const callState = { id: 'sub-robin' }
    const call = async (path, body) => {
      const route = list.find(r => path.split('?')[0] === r.path)
      const init = body === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
      const response = await route.fetch(new Request(`http://dsh.internal${path}`, init))
      const text = await response.text()
      return { status: response.status, body: text ? JSON.parse(text) : null }
    }
    return { call, callState, source }
  }

  it('shows a person the boards they may see, from both kinds, the command’s first', async () => {
    await save({ boards: BOARDS, cards: { home: { a: stat('A'), b: stat('B') } }, down: false, failPress: false })
    const { call, callState, source } = await setup()
    assert.deepEqual((await call('/api/card-board/boards')).body.boards.map(b => [b.id, b.title]), [['garden', 'Garden'], ['home', 'Home']])
    callState.id = 'sub-alex'
    assert.deepEqual((await call('/api/card-board/boards')).body.boards.map(b => b.id), ['other'])
    assert.equal((await call('/api/card-board/board?id=home')).status, 403)
    callState.id = 'sub-robin'
    const home = (await call('/api/card-board/board?id=home')).body
    assert.deepEqual(home.cards.map(c => c.id), ['b', 'a'])
    assert.equal((await call('/api/card-board/card?board=home&id=a')).body.card.title, 'A')
    source.close()
  })

  it('answers 304 for an unchanged board and a new tag after a change', async () => {
    await save({ cards: { home: { a: stat('A') } } })
    const { source } = await setup()
    const first = await source.boardTag('home', 's')
    assert.equal(await source.boardTag('home', 's'), first)
    await pause(20)
    await save({ cards: { home: { a: stat('A2') } } })
    assert.notEqual(await source.boardTag('home', 's'), first)
    source.close()
  })

  it('hands a press to the command: pending, then done once the board was read after it', async () => {
    await save({ cards: { home: { a: stat('A', { actions: [{ kind: 'done', id: 'a:done' }] }) } }, afterPress: { a: stat('A', { actions: [{ kind: 'done', id: 'a:done' }], title2: undefined }) } })
    const { call, source } = await setup()
    await call('/api/card-board/board?id=home')
    const pressed = await call('/api/card-board/action', { board: 'home', card: 'a', id: 'a:done' })
    assert.equal(pressed.status, 200)
    let state
    for (let i = 0; i < 40; i += 1) {
      await pause(50)
      state = (await call('/api/card-board/card?board=home&id=a')).body.presses?.[0]?.state
      if (state === 'done') break
    }
    assert.equal(state, 'done')
    const logged = (await readFile(join(dir, 'presses.log'), 'utf8')).trim().split('\n').pop()
    assert.equal(JSON.parse(logged).person, 'robin')
    source.close()
  })

  it('shows a press its command refused as not handled, and tells the page', async () => {
    await save({ cards: { home: { a: stat('A', { actions: [{ kind: 'done', id: 'a:done' }] }) } }, failPress: true })
    const { call, source } = await setup()
    await call('/api/card-board/board?id=home')
    await call('/api/card-board/action', { board: 'home', card: 'a', id: 'a:done' })
    let state
    for (let i = 0; i < 40; i += 1) {
      await pause(50)
      state = (await call('/api/card-board/card?board=home&id=a')).body.presses?.[0]?.state
      if (state === 'unhandled') break
    }
    assert.equal(state, 'unhandled')
    await save({ failPress: false })
    source.close()
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { liveOf, nextLive, seenReport, withCard } from '../src/client/live-state.js'

const board = cards => ({ id: 'home', cards })

describe('what the open page remembers about its cards', () => {
  it('washes nothing on the first load, and marks what the server says is new', () => {
    const live = nextLive(null, board([{ id: 'a', version: '1', fresh: { card: true, rows: ['x'] } }, { id: 'b', version: '1' }]), {})
    assert.equal(live.a.wash, 0)
    assert.equal(live.a.fresh, true)
    assert.deepEqual([...live.a.freshRows], ['x'])
    assert.equal(liveOf(live, 'b').fresh, false)
  })

  it('washes a whole card when its content changed, and only the rows when keyed rows did', () => {
    const one = board([{ id: 'a', version: '1', rows: { x: 'x1', y: 'y1' } }, { id: 'b', version: '1' }])
    let live = nextLive(null, one, {})
    const two = board([{ id: 'a', version: '2', rows: { x: 'x1', y: 'y2', z: 'z1' } }, { id: 'b', version: '2' }])
    live = nextLive(one, two, live)
    assert.equal(live.a.wash, 0)
    assert.deepEqual(live.a.rows, { y: 1, z: 1 })
    assert.equal(live.b.wash, 1)
    const three = board([{ id: 'a', version: '3', rows: { x: 'x1', y: 'y2', z: 'z1' } }, { id: 'b', version: '2' }])
    assert.equal(nextLive(two, three, live).a.wash, 1, 'a change outside the rows washes the card')
  })

  it('washes a card that appears while the page is open, and keeps dots for the whole visit', () => {
    const one = board([{ id: 'a', version: '1', fresh: { card: true, rows: [] } }])
    let live = nextLive(null, one, {})
    const two = board([{ id: 'a', version: '1' }, { id: 'c', version: '1' }])
    live = nextLive(one, two, live)
    assert.equal(live.c.wash, 1)
    assert.equal(live.a.fresh, true, 'the server forgot it once seen; the page still shows it')
  })

  it('replaces, adds and removes one card, and reports what was seen', () => {
    const one = board([{ id: 'a', version: '1' }, { id: 'b', version: '1', rows: { x: 'x1' } }])
    assert.deepEqual(withCard(one, 'a', { id: 'a', version: '2' }).cards.map(c => c.version), ['2', '1'])
    assert.deepEqual(withCard(one, 'c', { id: 'c', version: '1' }).cards.map(c => c.id), ['a', 'b', 'c'])
    assert.deepEqual(withCard(one, 'a', null).cards.map(c => c.id), ['b'])
    assert.deepEqual(seenReport(board([...one.cards, { id: 'broken', problems: ['x'] }])), { board: 'home', cards: { a: { v: '1' }, b: { v: '1', rows: { x: 'x1' } } } })
  })
})

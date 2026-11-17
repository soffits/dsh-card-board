import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { doneState, keepOf, keepTicked, withKept } from '../src/client/ticks.js'

const row = (name, extra = {}) => ({ title: name, actions: [{ kind: 'done', id: `${name}:done` }, { kind: 'snooze', id: `${name}:snooze` }], ...extra })

describe('rows ticked this visit', () => {
  it('keeps a row with only its done action, ticked', () => {
    const kept = keepOf(row('a'), 1)
    assert.equal(kept.id, 'a:done')
    assert.equal(kept.row.checked, true)
    assert.deepEqual(kept.row.actions.map(action => action.id), ['a:done'])
    assert.equal(keepOf({ title: 'no buttons' }, 0), undefined)
  })

  it('puts kept rows back where they stood once the card is rewritten without them', () => {
    const kept = [keepOf(row('b'), 1), keepOf(row('d'), 3)]
    assert.deepEqual(keepTicked([row('a'), row('c'), row('e')], kept).map(r => r.title), ['a', 'b', 'c', 'd', 'e'])
    assert.deepEqual(keepTicked([row('a'), row('b'), row('c')], kept.slice(0, 1)).map(r => r.title), ['a', 'b', 'c'], 'a row the card still has is not doubled')
    assert.deepEqual(keepTicked([], [keepOf(row('z'), 5)]).map(r => r.title), ['z'])
  })

  it('shows a box ticked once pressed, unticked once undone, and says which press unticking takes back', () => {
    assert.deepEqual(doneState(row('a'), undefined), { checked: false, undo: undefined })
    assert.deepEqual(doneState(row('a'), { press: 'p1', state: 'pending', undoable: true }), { checked: true, undo: 'p1' })
    assert.deepEqual(doneState(row('a'), { press: 'p1', state: 'done', undoable: true }), { checked: false, undo: undefined }, 'once the card was rewritten it decides, not the press')
    assert.deepEqual(doneState(keepOf(row('a'), 0).row, { press: 'p1', state: 'done', undoable: true }), { checked: true, undo: 'p1' })
    assert.deepEqual(doneState(keepOf(row('a'), 0).row, { press: 'p1', state: 'undone' }), { checked: false, undo: undefined })
    assert.deepEqual(doneState(row('a', { checked: true }), undefined), { checked: true, undo: undefined })
  })

  it('replaces an earlier entry for the same row', () => {
    const first = keepOf(row('a'), 0)
    assert.equal(withKept(withKept([], first), keepOf(row('a'), 2)).length, 1)
  })
})

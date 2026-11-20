import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { doneOf, doneState, keepOf, keepTicked, rowRef, withKept } from '../src/client/ticks.js'

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

  it('tells keyed rows apart when they share their done action\'s id', () => {
    const ask = key => ({ title: key, key, actions: [{ kind: 'done', id: 'done' }] })
    const kept = withKept(withKept([], keepOf(ask('a'), 0)), keepOf(ask('b'), 1))
    assert.equal(kept.length, 2, 'ticking b keeps a')
    assert.deepEqual(keepTicked([ask('c')], kept).map(r => r.title), ['a', 'b', 'c'], 'c having a done of the same id does not hide them')
    assert.equal(rowRef(ask('b'), 1), 'b')
    assert.equal(rowRef(row('x'), 3), 3)
  })

  it('replaces an earlier entry for the same row', () => {
    const first = keepOf(row('a'), 0)
    assert.equal(withKept(withKept([], first), keepOf(row('a'), 2)).length, 1)
  })
})

describe('choices', () => {
  it('ticks only with an unlabelled done; a labelled done is a choice, a button of its own', () => {
    const row = { title: 'White or oak?', actions: [{ kind: 'done', id: 'answer-1', label: 'White' }, { kind: 'done', id: 'answer-2', label: 'Oak' }] }
    assert.equal(doneOf(row), undefined)
    assert.equal(keepOf(row, 0), undefined)
    const both = { title: 'Water the plants', actions: [{ kind: 'done', id: 'answer-1', label: 'Later' }, { kind: 'done', id: 'water:done' }] }
    assert.equal(doneOf(both).id, 'water:done')
  })
})

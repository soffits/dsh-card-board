import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { arranged, canShift, dropCard, isRaised, nextRaiseChange, parseArrangement, pinCard, sequenceOf, shiftCard, unpinCard, visibleOrder } from '../src/arrange.js'
import { dropAfter } from '../src/client/layout.js'

const state = (pinned, order) => ({ pinned, order })

describe('arranged', () => {
  it('is the board’s own order for someone who never arranged it', () => {
    assert.deepEqual(arranged(['a', 'b', 'c'], undefined), state([], ['a', 'b', 'c']))
  })

  it('keeps a person’s pins and order, and drops cards that are gone', () => {
    assert.deepEqual(arranged(['a', 'b', 'c', 'd'], state(['b', 'z'], ['d', 'y', 'c', 'a'])), state(['b'], ['d', 'c', 'a']))
  })

  it('puts a new card where the board’s order puts it, after the card that comes before it', () => {
    const mine = state(['b'], ['d', 'c', 'a'])
    assert.deepEqual(arranged(['a', 'b', 'x', 'c', 'd'], mine).order, ['d', 'c', 'a', 'x'])
    assert.deepEqual(arranged(['x', 'a', 'b', 'c', 'd'], mine).order, ['x', 'd', 'c', 'a'])
    assert.deepEqual(arranged(['a', 'b', 'c', 'x', 'd'], mine).order, ['d', 'c', 'x', 'a'])
  })

  it('slots several new cards in the board’s order', () => {
    assert.deepEqual(arranged(['a', 'x', 'y', 'b'], state([], ['b', 'a'])).order, ['b', 'a', 'x', 'y'])
  })
})

describe('what a person can do', () => {
  it('pins to the end of the pins and unpins to the top of the rest', () => {
    const base = state(['a'], ['b', 'c', 'd'])
    assert.deepEqual(pinCard(base, 'c'), state(['a', 'c'], ['b', 'd']))
    assert.deepEqual(unpinCard(state(['a', 'c'], ['b', 'd']), 'a'), state(['c'], ['a', 'b', 'd']))
  })

  it('moves a card one place within its own kind, and says when it can’t', () => {
    const base = state(['a', 'b'], ['c', 'd'])
    assert.deepEqual(shiftCard(base, 'd', -1), state(['a', 'b'], ['d', 'c']))
    assert.deepEqual(shiftCard(base, 'a', 1), state(['b', 'a'], ['c', 'd']))
    assert.equal(canShift(base, 'c', -1), false)
    assert.equal(canShift(base, 'b', 1), false)
    assert.equal(canShift(base, 'c', 1), true)
    assert.deepEqual(shiftCard(base, 'c', -1), base)
  })

  it('drops a card before or after another, and the place decides whether it is pinned', () => {
    const base = state(['a', 'b'], ['c', 'd', 'e'])
    assert.deepEqual(dropCard(base, 'e', 'c', false), state(['a', 'b'], ['e', 'c', 'd']))
    assert.deepEqual(dropCard(base, 'e', 'a', false), state(['e', 'a', 'b'], ['c', 'd']))
    assert.deepEqual(dropCard(base, 'e', 'a', true), state(['a', 'e', 'b'], ['c', 'd']))
    assert.deepEqual(dropCard(base, 'a', 'd', true), state(['b'], ['c', 'd', 'a', 'e']))
    // right on the edge between the pins and the rest, a card stays what it was
    assert.deepEqual(dropCard(base, 'a', 'b', true), state(['b', 'a'], ['c', 'd', 'e']))
    assert.deepEqual(dropCard(base, 'e', 'b', true), state(['a', 'b'], ['e', 'c', 'd']))
    assert.deepEqual(dropCard(base, 'e', 'e', false), base)
    assert.deepEqual(dropCard(base, 'e', 'nope', false), base)
  })

  it('never loses or repeats a card', () => {
    let current = state(['a'], ['b', 'c', 'd', 'e'])
    for (const [id, target, after] of [['e', 'a', false], ['b', 'd', true], ['a', 'e', true], ['c', 'e', false]]) {
      current = dropCard(current, id, target, after)
      assert.deepEqual([...sequenceOf(current)].sort(), ['a', 'b', 'c', 'd', 'e'])
    }
  })
})

describe('raised cards', () => {
  const window = { from: '2026-03-04T07:40:00Z', until: '2026-03-05T07:40:00Z' }
  const at = time => Date.parse(time)

  it('is raised only inside its window, with either end open', () => {
    assert.equal(isRaised(window, at('2026-03-04T07:39:59Z')), false)
    assert.equal(isRaised(window, at('2026-03-04T07:40:00Z')), true)
    assert.equal(isRaised(window, at('2026-03-05T07:40:00Z')), false)
    assert.equal(isRaised({ until: window.until }, at('2020-01-01T00:00:00Z')), true)
    assert.equal(isRaised({ from: window.from }, at('2030-01-01T00:00:00Z')), true)
    assert.equal(isRaised(undefined, 0), false)
  })

  it('names the next moment a window opens or closes, or none', () => {
    const windows = [window, { until: '2026-03-04T12:00:00Z' }, undefined]
    assert.equal(nextRaiseChange(windows, at('2026-03-04T00:00:00Z')), at('2026-03-04T07:40:00Z'))
    assert.equal(nextRaiseChange(windows, at('2026-03-04T08:00:00Z')), at('2026-03-04T12:00:00Z'))
    assert.equal(nextRaiseChange(windows, at('2026-03-06T00:00:00Z')), undefined)
    assert.equal(nextRaiseChange([], 0), undefined)
  })

  it('puts raised cards above the pins, each group keeping the person’s order', () => {
    const mine = state(['p', 'q'], ['a', 'b', 'c'])
    assert.deepEqual(visibleOrder(mine, new Set(['c', 'q'])), ['q', 'c', 'p', 'a', 'b'])
    assert.deepEqual(visibleOrder(mine, new Set()), ['p', 'q', 'a', 'b', 'c'])
  })
})

describe('parseArrangement', () => {
  it('takes lists of card ids that don’t repeat', () => {
    assert.deepEqual(parseArrangement({ pinned: ['a'], order: ['b', 'c'] }), { pinned: ['a'], order: ['b', 'c'] })
    assert.equal(parseArrangement({ pinned: ['a'], order: ['a'] }), undefined)
    assert.equal(parseArrangement({ pinned: ['A b'], order: [] }), undefined)
    assert.equal(parseArrangement({ pinned: [], order: 'a' }), undefined)
    assert.equal(parseArrangement({ pinned: [] }), undefined)
    assert.equal(parseArrangement(null), undefined)
    assert.equal(parseArrangement({ pinned: [], order: Array.from({ length: 201 }, (_, i) => `c${i}`) }), undefined)
  })
})

describe('drop side', () => {
  const rect = { left: 100, top: 100, width: 200, height: 100 }
  it('is the lower half on a single column, and the way the pointer is furthest from the middle otherwise', () => {
    assert.equal(dropAfter(rect, 110, 190, true), true)
    assert.equal(dropAfter(rect, 290, 110, true), false)
    assert.equal(dropAfter(rect, 290, 150, false), true)
    assert.equal(dropAfter(rect, 110, 150, false), false)
    assert.equal(dropAfter(rect, 200, 195, false), true)
    assert.equal(dropAfter(rect, 200, 105, false), false)
  })
})

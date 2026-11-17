import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DEFAULT_SIZE, LIST_ROWS, shownRows, spanOf } from '../src/client/layout.js'

describe('layout', () => {
  it('spans a card by its size, with a default per type, on 6, 2 and 1 tracks', () => {
    assert.equal(spanOf('stat', undefined, 6), 2)
    assert.equal(spanOf('list', undefined, 6), 3)
    assert.equal(spanOf('countdown', undefined, 6), 4)
    assert.equal(spanOf('timeline', undefined, 6), 6)
    assert.equal(spanOf('line', 'wide', 6), 6)
    assert.equal(spanOf('summary', 'small', 6), 6) // a summary is always the whole width
    assert.equal(spanOf('stat', 'small', 2), 1)
    assert.equal(spanOf('line', 'large', 2), 2)
    assert.equal(spanOf('line', 'large', 1), 1)
    assert.equal(spanOf(undefined, undefined, 6), 3) // a card with problems
    assert.equal(DEFAULT_SIZE.summary, 'wide')
  })

  it('caps a long list, keeps new and changed rows visible, and opens fully', () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({ key: `r${i}`, title: String(i) }))
    assert.equal(shownRows(rows, false, LIST_ROWS, undefined).length, LIST_ROWS)
    assert.equal(shownRows(rows, true, LIST_ROWS, undefined).length, 12)
    assert.equal(shownRows(rows.slice(0, LIST_ROWS + 1), false, LIST_ROWS, undefined).length, LIST_ROWS + 1) // "1 more" would save nothing
    const live = { freshRows: new Set(['r9']), rows: { r11: 1 } }
    assert.deepEqual(shownRows(rows, false, LIST_ROWS, live).map(r => r.key), ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r9', 'r11'])
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { checkCard } from '../src/schema.js'
import { openedButtons, rowButtons } from '../src/client/ask.js'

const done = { kind: 'done', id: 'a:done' }
const ids = list => list.map(action => action.id)

describe('the Ask button every row has', () => {
  it('still offers the built-in Ask on a row whose declared chat button a view-only viewer lost', async () => {
    const { withoutActions } = await import('../src/access.js')
    const declared = { title: 'q', actions: [{ kind: 'chat', id: 'q:answer', payload: { prompt: 'My answer: ' } }] }
    assert.deepEqual(ids(rowButtons(declared)), ['q:answer'])
    const [row] = withoutActions({ type: 'list', data: { rows: [declared] } }).data.rows
    assert.deepEqual(rowButtons(row), [{ kind: 'chat', id: '_ask' }])
  })

  it('is added after the row’s own buttons, and to a row with none', () => {
    assert.deepEqual(ids(rowButtons({ title: 'a', actions: [done] })), ['a:done', '_ask'])
    assert.deepEqual(rowButtons({ title: 'a' }), [{ kind: 'chat', id: '_ask' }])
    assert.equal(rowButtons({ title: 'a' })[0].label, undefined, 'no label of its own, so the board’s assistant name applies')
  })

  it('gives way to a chat action the row declares', () => {
    const own = [{ kind: 'chat', id: 'a:ask', label: 'Draft a message' }, done]
    assert.deepEqual(rowButtons({ title: 'a', actions: own }), own)
  })

  it('is left out by `ask: false` on the row or the card', () => {
    assert.deepEqual(rowButtons({ title: 'a', ask: false }), [])
    assert.deepEqual(rowButtons({ title: 'a', ask: false, actions: [done] }, true), [done])
    assert.deepEqual(rowButtons({ title: 'a', actions: [done] }, false), [done])
    assert.deepEqual(ids(rowButtons({ title: 'a', ask: true, actions: [done] }, false)), ['a:done'], 'the card’s opt-out wins')
  })

  it('keeps the six-button budget', () => {
    const six = Array.from({ length: 6 }, (_, i) => ({ kind: 'event', id: `e${i}`, label: 'x' }))
    assert.equal(rowButtons({ title: 'a', actions: six }).length, 6)
    assert.equal(rowButtons({ title: 'a', actions: six.slice(0, 5) }).length, 6)
  })

  it('is a boolean on cards and on list and status rows in the file format', () => {
    const at = '2026-01-01T00:00:00Z'
    assert.deepEqual(checkCard({ type: 'list', title: 'T', updatedAt: at, ask: false, data: { rows: [{ title: 'a', ask: false }] } }), [])
    assert.deepEqual(checkCard({ type: 'status', title: 'T', updatedAt: at, data: { rows: [{ label: 'a', value: 1, tone: 'ok', ask: false }] } }), [])
    assert.notDeepEqual(checkCard({ type: 'list', title: 'T', updatedAt: at, data: { rows: [{ title: 'a', ask: 'no' }] } }), [])
    assert.notDeepEqual(checkCard({ type: 'list', title: 'T', updatedAt: at, ask: 1, data: { rows: [{ title: 'a' }] } }), [])
  })
})

describe('the buttons of an opened row', () => {
  const snooze = { kind: 'snooze', id: 'a:snooze' }
  const answer = { kind: 'chat', id: 'a:answer', label: 'Answer' }
  const yes = { kind: 'done', id: 'a:yes', label: 'Yes' }

  it('lead with the detail’s, then the row’s own, then the Ask', () => {
    const row = { title: 'a', actions: [snooze], detail: { text: 'why', actions: [answer, yes] } }
    assert.deepEqual(ids(openedButtons(row)), ['a:answer', 'a:yes', 'a:snooze', '_ask'])
  })

  it('leave the tick to the opened row’s box, but keep a labelled done as a choice', () => {
    assert.deepEqual(ids(openedButtons({ title: 'a', actions: [done, snooze] })), ['a:snooze', '_ask'])
    assert.deepEqual(ids(openedButtons({ title: 'a', actions: [yes] })), ['a:yes', '_ask'])
  })

  it('follow the row’s and the card’s Ask opt-out', () => {
    assert.deepEqual(ids(openedButtons({ title: 'a', ask: false, detail: { actions: [answer] } })), ['a:answer'])
    assert.deepEqual(ids(openedButtons({ title: 'a', actions: [snooze] }, false)), ['a:snooze'])
  })
})

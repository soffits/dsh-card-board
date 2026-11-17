import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { checkBoard, checkCard, isSafeLink } from '../src/schema.js'

const EXAMPLES = new URL('../examples/boards/home/', import.meta.url).pathname
const card = name => JSON.parse(readFileSync(join(EXAMPLES, 'cards', `${name}.json`), 'utf8'))
const base = { title: 'T', updatedAt: '2026-03-02T09:30:00Z' }

describe('checkCard', () => {
  it('accepts every example card, one per type', () => {
    const files = readdirSync(join(EXAMPLES, 'cards'))
    const types = new Set()
    for (const file of files) {
      const value = card(file.replace(/\.json$/, ''))
      assert.deepEqual(checkCard(value), [], file)
      types.add(value.type)
    }
    assert.deepEqual([...types].sort(), ['bar', 'donut', 'line', 'list', 'stat', 'status', 'timeline'])
  })

  it('names the path of each problem', () => {
    const problems = checkCard({ ...base, type: 'stat', data: { items: [{ label: 'x', value: 1, lable: 'typo' }] } })
    assert.deepEqual(problems, ['data.items[0].lable: is not a known field'])
  })

  it('rejects unknown types, missing fields and bad tones', () => {
    assert.match(checkCard({ ...base, type: 'pie', data: {} })[0], /^type: must be one of/)
    assert.ok(checkCard({ type: 'list', data: { rows: [] } }).some(p => p.startsWith('title: is required')))
    const status = { ...base, type: 'status', data: { rows: [{ label: 'Door', value: 'open', tone: 'red' }] } }
    assert.deepEqual(checkCard(status), ['data.rows[0].tone: must be one of ok, warn, bad, muted, accent'])
  })

  it('wants updatedAt with a zone', () => {
    const problems = checkCard({ ...base, updatedAt: '2026-03-02 09:30', type: 'list', data: { rows: [] } })
    assert.match(problems[0], /^updatedAt:/)
  })

  it('takes a headline stat on chart cards only', () => {
    const line = { ...card('savings') }
    assert.deepEqual(checkCard(line), [])
    const stat = { ...card('weather'), stat: card('weather').data }
    assert.match(checkCard(stat)[0], /^stat: is for chart cards/)
  })

  it('checks bars have exactly one of value and values', () => {
    const bar = bars => ({ ...base, type: 'bar', data: { bars } })
    assert.deepEqual(checkCard(bar([{ x: 'Mon', value: 3 }])), [])
    assert.match(checkCard(bar([{ x: 'Mon' }]))[0], /needs value or values/)
    assert.match(checkCard(bar([{ x: 'Mon', value: 1, values: { a: 1 } }]))[0], /has both/)
  })

  it('lets line points leave gaps with null', () => {
    const line = { ...base, type: 'line', data: { series: [{ name: 'a', points: [{ x: 1, y: 2 }, { x: 2, y: null }, { x: 3, y: 4 }] }] } }
    assert.deepEqual(checkCard(line), [])
  })

  it('checks timeline order', () => {
    const timeline = { ...base, type: 'timeline', data: { from: '2026-03-10', to: '2026-03-01' } }
    assert.deepEqual(checkCard(timeline), ['data.to: must be after from'])
  })

  it('refuses links that could run script', () => {
    assert.equal(isSafeLink('https://example.com/a'), true)
    assert.equal(isSafeLink('/settings'), true)
    assert.equal(isSafeLink('//evil.example'), false)
    assert.equal(isSafeLink('javascript:alert(1)'), false)
    assert.match(checkCard({ ...base, type: 'list', link: 'javascript:alert(1)', data: { rows: [] } })[0], /^link:/)
  })

  it('handles text in any script', () => {
    const list = { ...base, title: '今日', type: 'list', data: { rows: [{ title: '買い物リスト', chip: { text: '오늘' } }] } }
    assert.deepEqual(checkCard(list), [])
  })
})

describe('checkBoard', () => {
  it('accepts the example board', () => {
    assert.deepEqual(checkBoard(JSON.parse(readFileSync(join(EXAMPLES, 'board.json'), 'utf8'))), [])
  })

  it('checks ids in order and sizes in layout', () => {
    const problems = checkBoard({ title: 'B', order: ['ok', '../x'], layout: { ok: { w: 4 } } })
    assert.deepEqual(problems, ['order[1]: must be a card id', 'layout.ok.w: must be 1, 2 or 3'])
  })
})

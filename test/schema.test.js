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
    assert.deepEqual([...types].sort(), ['bar', 'countdown', 'donut', 'line', 'list', 'stat', 'status', 'summary', 'timeline'])
  })

  it('names the path of each problem', () => {
    const problems = checkCard({ ...base, type: 'stat', data: { items: [{ label: 'x', value: 1, lable: 'typo' }] } })
    assert.deepEqual(problems, ['data.items[0].lable: is not a known field'])
  })

  it('rejects unknown types, missing fields and bad tones', () => {
    assert.match(checkCard({ ...base, type: 'pie', data: {} })[0], /^type: must be one of/)
    assert.ok(checkCard({ type: 'list', data: { rows: [] } }).some(p => p.startsWith('title: is required')))
    const status = { ...base, type: 'status', data: { rows: [{ label: 'Door', value: 'open', tone: 'red' }] } }
    assert.deepEqual(checkCard(status), ['data.rows[0].tone: must be one of ok, warn, bad, muted, accent, violet'])
  })

  it('wants updatedAt with a zone', () => {
    const problems = checkCard({ ...base, updatedAt: '2026-03-02 09:30', type: 'list', data: { rows: [] } })
    assert.match(problems[0], /^updatedAt:/)
  })

  it('takes a headline stat above a chart or rows, not on stat, summary or countdown cards', () => {
    assert.deepEqual(checkCard(card('savings')), [])
    for (const name of ['weather', 'summary', 'countdown']) {
      assert.match(checkCard({ ...card(name), stat: card('weather').data })[0], /^stat: doesn't go on a/, name)
    }
  })

  it('takes a stat’s change as words with a tone and a direction, and its spark, progress and strip', () => {
    const item = { label: 'Total', value: 10 }
    const stat = items => ({ ...base, type: 'stat', data: { items } })
    assert.deepEqual(checkCard(stat([{ ...item, delta: { text: { en: '9,854 since Nov 1', zh: '11月1日以来 9,854' }, tone: 'muted', dir: 'down' }, spark: [1, null, 3], progress: { value: 3, max: 4, text: 'on pace' } }])), [])
    assert.deepEqual(checkCard(stat([{ ...item, delta: { value: -2 } }])), ['data.items[0].delta.text: is required', 'data.items[0].delta.value: is not a known field'])
    assert.deepEqual(checkCard(stat([{ ...item, delta: { text: 'x', dir: 'sideways' } }])), ['data.items[0].delta.dir: must be one of up, down, flat'])
    assert.deepEqual(checkCard(stat([{ ...item, strip: [{ label: '14', value: 12.8, icon: 'sun', on: true }, { label: '15', value: 'n/a', icon: 'Sun!' }] }])), ['data.items[0].strip[1].icon: must be an icon name like plane-takeoff'])
  })

  it('takes an icon, a tone, a key and an active window on rows; keys are unique in a card', () => {
    const list = rows => ({ ...base, type: 'list', icon: 'utensils', tone: 'violet', data: { rows } })
    const lunch = { title: 'Lunch', icon: 'sandwich', tone: 'accent', key: 'meal:lunch', active: { from: '2026-03-02T12:00:00+01:00', to: '2026-03-02T13:30:00+01:00' } }
    assert.deepEqual(checkCard(list([lunch, { ...lunch, key: 'meal:dinner' }])), [])
    assert.deepEqual(checkCard(list([lunch, lunch])), ["data.rows[1].key: repeats another row's key"])
    assert.deepEqual(checkCard(list([{ ...lunch, active: { from: '2026-03-02T13:00:00Z', to: '2026-03-02T12:00:00Z' } }])), ['data.rows[0].active.to: must be after from'])
    const status = { ...base, type: 'status', data: { rows: [{ label: 'Door', value: 'locked', tone: 'ok', icon: 'lock', key: 'door' }] } }
    assert.deepEqual(checkCard(status), [])
  })

  it('checks summary chips and countdown steps', () => {
    const summary = { ...card('summary') }
    assert.deepEqual(checkCard(summary), [])
    assert.deepEqual(checkCard({ ...summary, data: { text: 'x', chips: [{ text: 'Train', to: 'Thursday' }] } }), ['data.chips[0].to: must be an ISO date-time with a zone, like 2026-03-02T09:30:00Z'])
    const countdown = card('countdown')
    assert.deepEqual(checkCard({ ...countdown, data: { ...countdown.data, expiresAt: '2026-03-01T00:00:00Z' } }), ['data.expiresAt: must not be before to'])
    assert.deepEqual(checkCard({ ...countdown, data: { ...countdown.data, steps: [{ at: '2026-03-04T07:15:00+01:00', label: 'x', zone: 'Mars/Olympus' }] } }), ['data.steps[0].zone: must be an IANA time zone like Europe/Paris'])
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

  it('takes any visible text as a string or as a map of language id to text with English in it', () => {
    const list = { ...base, title: { en: 'Today', fr: 'Aujourd’hui', 'zh-cn': '今天' }, type: 'list', data: { rows: [{ title: { en: 'Pay rent', fr: 'Payer le loyer' }, chip: { text: { en: 'due' } } }], empty: { en: 'Nothing' } } }
    assert.deepEqual(checkCard(list), [])
    const status = { ...base, type: 'status', data: { rows: [{ label: { en: 'Door' }, value: { en: 'open', zh: '开着' }, tone: 'ok' }] } }
    assert.deepEqual(checkCard(status), [])
    const line = { ...base, type: 'line', data: { series: [{ name: { en: 'Weight' }, points: [{ x: 1, y: 2 }] }], unit: { en: 'kg' }, goal: { label: { en: 'Goal' }, y: 3 } } }
    assert.deepEqual(checkCard(line), [])
  })

  it('takes a chat prompt in several languages', () => {
    const action = payload => ({ ...base, type: 'list', data: { rows: [{ title: 'x', actions: [{ kind: 'chat', id: 'c', payload }] }] } })
    assert.deepEqual(checkCard(action({ prompt: { en: 'About this', fr: 'À propos' }, context: { a: 1 } })), [])
    assert.deepEqual(checkCard(action({ prompt: { fr: 'À propos' } })), ['data.rows[0].actions[0].payload.prompt: needs an "en" text'])
  })

  it('takes suggested steps: a plain label is required, at most 80 characters and 3 per row', () => {
    const steps = list => ({ ...base, type: 'list', data: { rows: [{ title: 'x', actions: list }] } })
    const step = (id, extra = {}) => ({ kind: 'step', id, label: { en: 'Renew the books', fr: 'Renouveler les livres' }, ...extra })
    assert.deepEqual(checkCard(steps([step('a', { payload: { prompt: { en: 'Renew them online.' }, context: { n: 2 } } })])), [])
    assert.deepEqual(checkCard(steps([{ kind: 'step', id: 'a' }])), ['data.rows[0].actions[0].label: is required for a step: it says the step plainly'])
    assert.deepEqual(checkCard(steps([step('a', { label: 'x'.repeat(81) })])), ['data.rows[0].actions[0].label: is longer than 80 characters'])
    assert.deepEqual(checkCard(steps(['a', 'b', 'c', 'd'].map(id => step(id)))), ['data.rows[0].actions: has more than 3 steps'])
  })

  it('names the path of a bad text map', () => {
    const at = title => checkCard({ ...base, title, type: 'list', data: { rows: [] } })
    assert.deepEqual(at({ fr: 'Aujourd’hui' }), ['title: needs an "en" text'])
    assert.deepEqual(at({ en: 'Today', FR: 'x' }), ['title.FR: is not a lowercase language id like en or zh-cn'])
    assert.deepEqual(at({ en: '  ' }), ['title.en: must not be empty'])
    assert.deepEqual(at({ en: 3 }), ['title.en: must be a string'])
    assert.deepEqual(at({}), ['title: needs 1 to 12 languages'])
    assert.match(at(['Today'])[0], /^title: must be a string or an object/)
  })

  it('keeps the text limits for every language', () => {
    const long = 'x'.repeat(121)
    assert.deepEqual(checkCard({ ...base, title: { en: 'ok', fr: long }, type: 'list', data: { rows: [] } }), ['title.fr: is longer than 120 characters'])
  })

  it('handles text in any script', () => {
    const list = { ...base, title: '今日', type: 'list', data: { rows: [{ title: '買い物リスト', chip: { text: '오늘' } }] } }
    assert.deepEqual(checkCard(list), [])
  })
})

describe('checkBoard', () => {
  it('takes a localized title and the assistant’s name', () => {
    assert.deepEqual(checkBoard({ title: { en: 'Home', fr: 'Maison' }, assistant: 'Robin' }), [])
    assert.deepEqual(checkBoard({ title: 'B', assistant: '' }), ['assistant: must not be empty'])
  })

  it('accepts the example board', () => {
    assert.deepEqual(checkBoard(JSON.parse(readFileSync(join(EXAMPLES, 'board.json'), 'utf8'))), [])
  })

  it('checks ids in order and sizes in layout', () => {
    const problems = checkBoard({ title: 'B', order: ['ok', '../x'], layout: { ok: { size: 'huge' }, old: { w: 2 } } })
    assert.deepEqual(problems, ['order[1]: must be a card id', 'layout.ok.size: must be one of small, medium, large, wide', 'layout.old.w: is not a known field'])
    assert.deepEqual(checkBoard({ title: 'B', layout: { a: { size: 'small' }, b: { size: 'wide' }, c: {} } }), [])
  })

describe('detail and link', () => {
  const base = { type: 'list', title: 'T', updatedAt: '2026-03-04T10:00:00Z' }
  it('takes a detail on a card and on keyed rows, and links on rows and stat items', () => {
    const detail = { text: 'More', facts: [{ label: 'Due', value: 3 }], history: [{ at: '2026-03-01T09:00:00Z', text: 'Opened' }],
      chart: { type: 'bar', data: { bars: [{ x: '2026-03-01', value: 2 }] } } }
    assert.deepEqual(checkCard({ ...base, detail, data: { rows: [{ title: 'a', key: 'a', detail, link: '/?messages=1' }] } }), [])
    assert.deepEqual(checkCard({ type: 'stat', title: 'S', updatedAt: base.updatedAt, data: { items: [{ label: 'Doing', value: 3, link: '/?work=board' }] } }), [])
  })
  it('refuses a detail row without a key, unknown parts and unsafe links', () => {
    assert.deepEqual(checkCard({ ...base, data: { rows: [{ title: 'a', detail: { text: 'x' } }] } }), ['data.rows[0].key: is required on a row with a detail: it is how the row is opened'])
    assert.deepEqual(checkCard({ ...base, detail: { more: 1 }, data: { rows: [{ title: 'a', link: 'javascript:alert(1)' }] } }),
      ['detail.more: is not a known field', 'data.rows[0].link: must be an http(s) URL or a path starting with /'])
    assert.deepEqual(checkCard({ ...base, detail: { chart: { type: 'donut', data: {} } }, data: { rows: [] } }).slice(0, 1), ['detail.chart.type: must be one of line, bar'])
  })
})

})

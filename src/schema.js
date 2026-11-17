/**
 * The card and board file format, checked the same way by the plugin when it
 * reads a file and by the CLI before it writes one. Plain functions, no
 * dependencies, so producers can also import it directly.
 *
 * Every check returns a list of problems as `path: what is wrong`; an empty
 * list means the value is valid. Unknown fields are problems too, so a typo
 * fails at write time instead of quietly not showing.
 */

export const CARD_TYPES = Object.freeze(['stat', 'line', 'bar', 'donut', 'list', 'timeline', 'status'])
export const TONES = Object.freeze(['ok', 'warn', 'bad', 'muted', 'accent'])
export const ACTION_KINDS = Object.freeze(['chat', 'done', 'snooze', 'event', 'link'])
/** Kinds the server records as events; chat and link happen in the browser only. */
export const PRESS_KINDS = Object.freeze(['done', 'snooze', 'event'])
export const ACTION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/
const MAX_ACTIONS = 6
const MAX_PAYLOAD_BYTES = 4096
export const TIMELINE_KINDS = Object.freeze(['travel', 'due', 'event', 'health', 'home', 'money'])
/** Board and card ids: also folder and file names, so nothing that can climb out of the data folder. */
export const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/
export const MAX_CARD_BYTES = 256 * 1024

const MAX_TEXT = 200
const MAX_ITEMS = 500
const MAX_LANGUAGES = 12
const LANGUAGE_ID = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/
const MAX_POINTS = 2000
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/

/** A small builder that collects problems with their paths. A missing required field is reported once, by object(), so the checks of its value skip undefined. */
class Check {
  constructor() {
    this.problems = []
  }

  fail(path, message) {
    this.problems.push(`${path || '(root)'}: ${message}`)
    return false
  }

  object(value, path, required, optional = []) {
    if (value === undefined) return false
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return this.fail(path, 'must be an object')
    for (const key of required) if (!(key in value)) this.fail(join(path, key), 'is required')
    const known = new Set([...required, ...optional])
    for (const key of Object.keys(value)) if (!known.has(key)) this.fail(join(path, key), 'is not a known field')
    return true
  }

  array(value, path, { min = 0, max = MAX_ITEMS } = {}) {
    if (value === undefined) return false
    if (!Array.isArray(value)) return this.fail(path, 'must be an array')
    if (value.length < min) return this.fail(path, `needs at least ${min} item${min === 1 ? '' : 's'}`)
    if (value.length > max) return this.fail(path, `has more than ${max} items`)
    return true
  }

  text(value, path, { max = MAX_TEXT, empty = false } = {}) {
    if (value === undefined) return false
    if (typeof value !== 'string') return this.fail(path, 'must be a string')
    if (!empty && value.trim() === '') return this.fail(path, 'must not be empty')
    if (value.length > max) return this.fail(path, `is longer than ${max} characters`)
    return true
  }

  /**
   * Text a person reads: a string, or a map of language id to string with `en` always present
   * (the shape DSH uses for localized package text). The browser picks by the active language.
   */
  label(value, path, options = {}) {
    if (value === undefined) return false
    if (typeof value === 'string') return this.text(value, path, options)
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return this.fail(path, 'must be a string or an object of language id to string')
    const languages = Object.keys(value)
    if (languages.length === 0 || languages.length > MAX_LANGUAGES) return this.fail(path, `needs 1 to ${MAX_LANGUAGES} languages`)
    if (!('en' in value)) this.fail(path, 'needs an "en" text')
    let ok = true
    for (const language of languages) {
      if (!LANGUAGE_ID.test(language)) ok = this.fail(join(path, language), 'is not a lowercase language id like en or zh-cn')
      else ok = this.text(value[language], join(path, language), options) && ok
    }
    return ok
  }

  number(value, path, { min = -Infinity } = {}) {
    if (value === undefined) return false
    if (typeof value !== 'number' || !Number.isFinite(value)) return this.fail(path, 'must be a finite number')
    if (value < min) return this.fail(path, `must be at least ${min}`)
    return true
  }

  boolean(value, path) {
    if (value === undefined) return false
    return typeof value === 'boolean' || this.fail(path, 'must be true or false')
  }

  oneOf(value, path, allowed) {
    if (value === undefined) return false
    return allowed.includes(value) || this.fail(path, `must be one of ${allowed.join(', ')}`)
  }

  textOrNumber(value, path) {
    if (value === undefined) return false
    if (typeof value === 'number') return this.number(value, path)
    return this.text(value, path)
  }

  /** A shown value: a number, or a label. */
  labelOrNumber(value, path) {
    if (value === undefined) return false
    if (typeof value === 'number') return this.number(value, path)
    return this.label(value, path)
  }

  date(value, path) {
    if (value === undefined) return false
    if (typeof value !== 'string' || !(DATE_ONLY.test(value) || DATE_TIME.test(value)) || Number.isNaN(Date.parse(value)))
      return this.fail(path, 'must be a date (YYYY-MM-DD) or an ISO date-time with a zone')
    return true
  }

  dateTime(value, path) {
    if (value === undefined) return false
    if (typeof value !== 'string' || !DATE_TIME.test(value) || Number.isNaN(Date.parse(value)))
      return this.fail(path, 'must be an ISO date-time with a zone, like 2026-03-02T09:30:00Z')
    return true
  }

  optional(value, key, fn) {
    if (key in value) fn(value[key])
  }
}

function join(path, key) {
  if (typeof key === 'number') return `${path}[${key}]`
  return path ? `${path}.${key}` : key
}

function tone(c, value, path) {
  c.optional(value, 'tone', v => c.oneOf(v, join(path, 'tone'), TONES))
}

/** Problems with an `actions` list (on a card, a list row or a status row). */
function actions(c, list, path) {
  if (!c.array(list, path, { max: MAX_ACTIONS })) return
  const seen = new Set()
  list.forEach((action, i) => {
    const p = join(path, i)
    if (!c.object(action, p, ['kind', 'id'], ['label', 'payload'])) return
    const kindOk = c.oneOf(action.kind, join(p, 'kind'), ACTION_KINDS)
    if (typeof action.id !== 'string' || !ACTION_ID_PATTERN.test(action.id)) c.fail(join(p, 'id'), 'must be letters, digits and . _ : - (up to 100), starting with a letter or digit')
    else if (seen.has(action.id)) c.fail(join(p, 'id'), 'repeats another action id here')
    else seen.add(action.id)
    if ('label' in action) c.label(action.label, join(p, 'label'), { max: 40 })
    else if (action.kind === 'event') c.fail(join(p, 'label'), 'is required for an event action')
    const payload = action.payload
    if ('payload' in action) {
      const pp = join(p, 'payload')
      if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return c.fail(pp, 'must be an object')
      if (Buffer.byteLength(JSON.stringify(payload)) > MAX_PAYLOAD_BYTES) c.fail(pp, `is larger than ${MAX_PAYLOAD_BYTES} bytes`)
    }
    if (!kindOk) return
    if (action.kind === 'link') {
      if (!isSafeLink(payload?.url)) c.fail(join(join(p, 'payload'), 'url'), 'is required: an http(s) URL or a path starting with /')
    }
    if (action.kind === 'snooze' && payload !== undefined && 'until' in payload) c.dateTime(payload.until, join(join(p, 'payload'), 'until'))
    if (action.kind === 'chat' && payload !== undefined) {
      const pp = join(p, 'payload')
      if ('prompt' in payload) c.label(payload.prompt, join(pp, 'prompt'), { max: 2000 })
      if ('session' in payload) c.text(payload.session, join(pp, 'session'), { max: 200 })
    }
  })
}

function statData(c, data, path) {
  if (!c.object(data, path, ['items'])) return
  if (!c.array(data.items, join(path, 'items'), { min: 1, max: 6 })) return
  data.items.forEach((item, i) => {
    const p = join(join(path, 'items'), i)
    if (!c.object(item, p, ['label', 'value'], ['unit', 'delta', 'sub', 'tone'])) return
    c.label(item.label, join(p, 'label'))
    c.labelOrNumber(item.value, join(p, 'value'))
    c.optional(item, 'unit', v => c.label(v, join(p, 'unit'), { max: 20 }))
    c.optional(item, 'sub', v => c.label(v, join(p, 'sub')))
    tone(c, item, p)
    c.optional(item, 'delta', delta => {
      const dp = join(p, 'delta')
      if (!c.object(delta, dp, ['value'], ['unit', 'tone'])) return
      c.number(delta.value, join(dp, 'value'))
      c.optional(delta, 'unit', v => c.label(v, join(dp, 'unit'), { max: 20 }))
      tone(c, delta, dp)
    })
  })
}

function points(c, list, path) {
  if (!c.array(list, path, { min: 1, max: MAX_POINTS })) return
  list.forEach((point, i) => {
    const p = join(path, i)
    if (!c.object(point, p, ['x', 'y'])) return
    c.textOrNumber(point.x, join(p, 'x'))
    if (point.y !== null) c.number(point.y, join(p, 'y'))
  })
}

function goalLine(c, goal, path, allowPoints) {
  if (typeof goal !== 'object' || goal === null) return c.fail(path, 'must be an object')
  if (allowPoints && 'points' in goal) {
    if (!c.object(goal, path, ['points'], ['label'])) return
    points(c, goal.points, join(path, 'points'))
  } else {
    if (!c.object(goal, path, ['y'], ['label'])) return
    c.number(goal.y, join(path, 'y'))
  }
  c.optional(goal, 'label', v => c.label(v, join(path, 'label')))
}

function lineData(c, data, path) {
  if (!c.object(data, path, ['series'], ['unit', 'area', 'goal', 'markers'])) return
  if (c.array(data.series, join(path, 'series'), { min: 1, max: 6 }))
    data.series.forEach((series, i) => {
      const p = join(join(path, 'series'), i)
      if (!c.object(series, p, ['name', 'points'], ['tone'])) return
      c.label(series.name, join(p, 'name'), { empty: true })
      points(c, series.points, join(p, 'points'))
      tone(c, series, p)
    })
  c.optional(data, 'unit', v => c.label(v, join(path, 'unit'), { max: 20 }))
  c.optional(data, 'area', v => c.boolean(v, join(path, 'area')))
  c.optional(data, 'goal', v => goalLine(c, v, join(path, 'goal'), true))
  c.optional(data, 'markers', markers => {
    if (!c.array(markers, join(path, 'markers'), { max: 50 })) return
    markers.forEach((marker, i) => {
      const p = join(join(path, 'markers'), i)
      if (!c.object(marker, p, ['x', 'label'])) return
      c.textOrNumber(marker.x, join(p, 'x'))
      c.label(marker.label, join(p, 'label'))
    })
  })
}

function barData(c, data, path) {
  if (!c.object(data, path, ['bars'], ['stacked', 'unit', 'goal'])) return
  if (c.array(data.bars, join(path, 'bars'), { min: 1, max: 400 }))
    data.bars.forEach((bar, i) => {
      const p = join(join(path, 'bars'), i)
      if (!c.object(bar, p, ['x'], ['value', 'values'])) return
      c.textOrNumber(bar.x, join(p, 'x'))
      if (!('value' in bar) && !('values' in bar)) c.fail(p, 'needs value or values')
      if ('value' in bar && 'values' in bar) c.fail(p, 'has both value and values; use one')
      c.optional(bar, 'value', v => c.number(v, join(p, 'value')))
      c.optional(bar, 'values', values => {
        const vp = join(p, 'values')
        if (typeof values !== 'object' || values === null || Array.isArray(values)) return c.fail(vp, 'must be an object of series name to number')
        const keys = Object.keys(values)
        if (keys.length === 0 || keys.length > 8) return c.fail(vp, 'needs 1 to 8 series')
        for (const key of keys) {
          c.text(key, join(vp, key), { max: 60 })
          c.number(values[key], join(vp, key))
        }
      })
    })
  c.optional(data, 'stacked', v => c.boolean(v, join(path, 'stacked')))
  c.optional(data, 'unit', v => c.label(v, join(path, 'unit'), { max: 20 }))
  c.optional(data, 'goal', v => goalLine(c, v, join(path, 'goal'), false))
}

function donutData(c, data, path) {
  if (!c.object(data, path, ['segments'], ['centre', 'unit'])) return
  if (c.array(data.segments, join(path, 'segments'), { min: 1, max: 12 }))
    data.segments.forEach((segment, i) => {
      const p = join(join(path, 'segments'), i)
      if (!c.object(segment, p, ['label', 'value'], ['tone'])) return
      c.label(segment.label, join(p, 'label'))
      c.number(segment.value, join(p, 'value'), { min: 0 })
      tone(c, segment, p)
    })
  c.optional(data, 'centre', centre => {
    const p = join(path, 'centre')
    if (!c.object(centre, p, ['text'], ['sub'])) return
    c.label(centre.text, join(p, 'text'), { max: 40 })
    c.optional(centre, 'sub', v => c.label(v, join(p, 'sub'), { max: 40 }))
  })
  c.optional(data, 'unit', v => c.label(v, join(path, 'unit'), { max: 20 }))
}

function listData(c, data, path) {
  if (!c.object(data, path, ['rows'], ['empty', 'progress'])) return
  if (c.array(data.rows, join(path, 'rows'), { max: 100 }))
    data.rows.forEach((row, i) => {
      const p = join(join(path, 'rows'), i)
      if (!c.object(row, p, ['title'], ['sub', 'chip', 'checked', 'date', 'actions'])) return
      c.optional(row, 'actions', v => actions(c, v, join(p, 'actions')))
      c.label(row.title, join(p, 'title'))
      c.optional(row, 'sub', v => c.label(v, join(p, 'sub')))
      c.optional(row, 'checked', v => c.boolean(v, join(p, 'checked')))
      c.optional(row, 'date', v => c.date(v, join(p, 'date')))
      c.optional(row, 'chip', chip => {
        const cp = join(p, 'chip')
        if (!c.object(chip, cp, ['text'], ['tone'])) return
        c.label(chip.text, join(cp, 'text'), { max: 40 })
        tone(c, chip, cp)
      })
    })
  c.optional(data, 'empty', v => c.label(v, join(path, 'empty')))
  c.optional(data, 'progress', progress => {
    const p = join(path, 'progress')
    if (!c.object(progress, p, ['done', 'total'], ['label'])) return
    const done = c.number(progress.done, join(p, 'done'), { min: 0 })
    const total = c.number(progress.total, join(p, 'total'), { min: 0 })
    if (done && total && progress.done > progress.total) c.fail(join(p, 'done'), 'must not be more than total')
    c.optional(progress, 'label', v => c.label(v, join(p, 'label'), { max: 40 }))
  })
}

function timelineData(c, data, path) {
  if (!c.object(data, path, ['from', 'to'], ['points', 'spans'])) return
  const fromOk = c.date(data.from, join(path, 'from'))
  const toOk = c.date(data.to, join(path, 'to'))
  if (fromOk && toOk && Date.parse(data.to) <= Date.parse(data.from)) c.fail(join(path, 'to'), 'must be after from')
  c.optional(data, 'points', list => {
    if (!c.array(list, join(path, 'points'), { max: 100 })) return
    list.forEach((point, i) => {
      const p = join(join(path, 'points'), i)
      if (!c.object(point, p, ['date', 'label'], ['kind', 'tone'])) return
      c.date(point.date, join(p, 'date'))
      c.label(point.label, join(p, 'label'))
      c.optional(point, 'kind', v => c.text(v, join(p, 'kind'), { max: 20 }))
      tone(c, point, p)
    })
  })
  c.optional(data, 'spans', list => {
    if (!c.array(list, join(path, 'spans'), { max: 20 })) return
    list.forEach((span, i) => {
      const p = join(join(path, 'spans'), i)
      if (!c.object(span, p, ['from', 'to', 'label'], ['tone'])) return
      const fromValid = c.date(span.from, join(p, 'from'))
      const toValid = c.date(span.to, join(p, 'to'))
      if (fromValid && toValid && Date.parse(span.to) < Date.parse(span.from)) c.fail(join(p, 'to'), 'must not be before from')
      c.label(span.label, join(p, 'label'))
      tone(c, span, p)
    })
  })
}

function statusData(c, data, path) {
  if (!c.object(data, path, ['rows'])) return
  if (!c.array(data.rows, join(path, 'rows'), { min: 1, max: 50 })) return
  data.rows.forEach((row, i) => {
    const p = join(join(path, 'rows'), i)
    if (!c.object(row, p, ['label', 'value', 'tone'], ['sub', 'spark', 'actions'])) return
    c.optional(row, 'actions', v => actions(c, v, join(p, 'actions')))
    c.label(row.label, join(p, 'label'))
    c.labelOrNumber(row.value, join(p, 'value'))
    c.oneOf(row.tone, join(p, 'tone'), TONES)
    c.optional(row, 'sub', v => c.label(v, join(p, 'sub')))
    c.optional(row, 'spark', spark => {
      if (!c.array(spark, join(p, 'spark'), { min: 2, max: MAX_POINTS })) return
      spark.forEach((v, j) => c.number(v, join(join(p, 'spark'), j)))
    })
  })
}

const DATA = { stat: statData, line: lineData, bar: barData, donut: donutData, list: listData, timeline: timelineData, status: statusData }

/** Links a card may open: web pages and paths on the same site, nothing that runs script. */
export function isSafeLink(value) {
  if (typeof value !== 'string' || value.length > 2000) return false
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/** Problems with one card file's parsed content. */
export function checkCard(card) {
  const c = new Check()
  if (!c.object(card, '', ['type', 'title', 'updatedAt', 'data'], ['staleAfter', 'link', 'stat', 'actions'])) return c.problems
  if (!c.oneOf(card.type, 'type', CARD_TYPES)) return c.problems
  c.label(card.title, 'title', { max: 120 })
  c.dateTime(card.updatedAt, 'updatedAt')
  c.optional(card, 'staleAfter', v => c.number(v, 'staleAfter', { min: 1 }))
  c.optional(card, 'link', v => isSafeLink(v) || c.fail('link', 'must be an http(s) URL or a path starting with /'))
  c.optional(card, 'stat', v => {
    if (card.type === 'stat') return c.fail('stat', 'is for chart cards; a stat card has its numbers in data')
    statData(c, v, 'stat')
  })
  c.optional(card, 'actions', v => actions(c, v, 'actions'))
  DATA[card.type](c, card.data, 'data')
  return c.problems
}

/**
 * The action a press names, looked up in the card as written: on the card
 * itself, or on row `row` of a list or status card. Undefined when there is
 * no such action, so a browser can only press what the data offers.
 */
export function findAction(card, actionId, row) {
  const list = row === undefined ? card?.actions : card?.data?.rows?.[row]?.actions
  return Array.isArray(list) ? list.find(action => action?.id === actionId) : undefined
}

/** Problems with a board.json's parsed content. */
export function checkBoard(board) {
  const c = new Check()
  if (!c.object(board, '', ['title'], ['viewers', 'order', 'layout', 'assistant'])) return c.problems
  c.label(board.title, 'title', { max: 80 })
  c.optional(board, 'assistant', v => c.text(v, 'assistant', { max: 40 }))
  c.optional(board, 'viewers', viewers => {
    if (c.array(viewers, 'viewers', { max: 100 })) viewers.forEach((v, i) => c.text(v, join('viewers', i), { max: 100 }))
  })
  c.optional(board, 'order', order => {
    if (c.array(order, 'order', { max: 200 }))
      order.forEach((id, i) => (typeof id === 'string' && ID_PATTERN.test(id)) || c.fail(join('order', i), 'must be a card id'))
  })
  c.optional(board, 'layout', layout => {
    if (typeof layout !== 'object' || layout === null || Array.isArray(layout)) return c.fail('layout', 'must be an object of card id to size')
    for (const [id, size] of Object.entries(layout)) {
      const p = join('layout', id)
      if (!ID_PATTERN.test(id)) c.fail(p, 'is not a card id')
      if (!c.object(size, p, [], ['w', 'h'])) continue
      c.optional(size, 'w', v => (Number.isInteger(v) && v >= 1 && v <= 3) || c.fail(join(p, 'w'), 'must be 1, 2 or 3'))
      c.optional(size, 'h', v => (Number.isInteger(v) && v >= 1 && v <= 3) || c.fail(join(p, 'h'), 'must be 1, 2 or 3'))
    }
  })
  return c.problems
}

/** Parse JSON text into a value plus problems; never throws. */
export function parseJson(text) {
  try {
    return { value: JSON.parse(text), problems: [] }
  } catch (error) {
    return { value: undefined, problems: [`not valid JSON: ${error.message}`] }
  }
}

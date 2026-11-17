/**
 * One card on the grid: its head (tile, title, what is new or just changed, stale mark, link, chat), its body by
 * type, its suggested next steps and its other buttons.
 */
import { createElement as h } from 'react'
import { IconRightUpOutlineRegular, Tag } from '@deepseek-ai/dsh-client-ui-primitives'
import { BarChart, Donut, LineChart, Timeline } from './charts.js'
import { CountdownBody, ListCard, StatBlock, StatusCard, SummaryBody } from './cards.js'
import { formatAge } from './format.js'
import { listRowLine, statusRowLine, summaryLines } from './quote.js'
import { OWNER, useButtons, useKit } from './services.js'
import { Trunc } from './pieces.js'
import { pickCard } from './words.js'

const CHART_HEIGHT = { 1: 150, 2: 360, 3: 560 }
/** One column (a phone): taller cards would only scroll further, so charts stay moderate. */
const CHART_HEIGHT_NARROW = { 1: 150, 2: 220, 3: 260 }
const CHARTS = { line: LineChart, bar: BarChart, donut: Donut, timeline: Timeline }

/** Press states by action id for the card (row undefined) or one row: the latest press wins. */
function statesOf(presses, row) {
  const states = {}
  for (const press of presses ?? []) if (press.row === row) states[press.id] = press.state
  return states
}

function Body({ card, size, narrow, live, wash, locale, t, rowActions }) {
  const data = card.data
  switch (card.type) {
    case 'stat': return h(StatBlock, { data, locale, wash })
    case 'list': return h(ListCard, { data, live, locale, t, rowActions })
    case 'status': return h(StatusCard, { data, live, locale, rowActions })
    case 'countdown': return h(CountdownBody, { card, locale })
    default: {
      const Chart = CHARTS[card.type]
      if (Chart === undefined) return null
      const height = (narrow ? CHART_HEIGHT_NARROW : CHART_HEIGHT)[size.h]
      return h(Chart, { data, locale, height: card.type === 'bar' ? Math.min(height, 130 + (size.h - 1) * 200) : card.type === 'donut' ? Math.max(height, 160) : height })
    }
  }
}

/**
 * @param {object} props
 * @param {object} props.entry - the card as the server sent it: `{ id, w, h, card | problems, presses?, version, rows? }`
 * @param {{ wash: number, rows: Record<string, number>, fresh: boolean, freshRows: Set<string> }} props.live - what just
 *   changed (counts that go up with each change) and what is new since the viewer last looked
 */
export function Card({ entry, live, boardId, assistant, columns, active, locale, t, press }) {
  const kit = useKit()
  const actions = useButtons()
  const now = kit.useNow()
  const wash = kit.useWash(live.wash, entry.id)
  const full = entry.card?.type === 'summary'
  const size = { w: full ? columns : Math.min(entry.w ?? 1, columns), h: entry.h ?? 1 }
  const style = { gridColumn: `span ${size.w}`, gridRow: size.h > 1 && columns > 1 && !full ? `span ${size.h}` : undefined }
  if (!entry.card) {
    return h('section', { className: 'cb-card cb-cardError', style },
      h('header', { className: 'cb-cardHead' }, h('h3', { title: entry.id }, entry.id)),
      h('p', { className: 'cb-errorText' }, t('cardError')),
      h('ul', { className: 'cb-problems' }, (entry.problems ?? []).map((p, i) => h('li', { key: i }, p))))
  }
  const card = pickCard(entry.card, active)
  // A countdown that has run its course leaves by itself.
  if (card.type === 'countdown' && card.data.expiresAt && Date.parse(card.data.expiresAt) <= now) return null
  const updated = Date.parse(card.updatedAt)
  const age = Math.max(0, (now - updated) / 1000)
  const stale = typeof card.staleAfter === 'number' && age > card.staleAfter
  const external = card.link && /^https?:/i.test(card.link)

  // What a chat is about: the card as a few lines, or one row of it.
  const about = (row, line) => ({
    source: OWNER,
    title: card.title,
    lines: row === undefined ? summaryLines(card, locale, t).slice(0, 15) : [line],
    context: { board: boardId, card: entry.id, ...(row === undefined ? {} : { row }), type: card.type, updatedAt: card.updatedAt },
  })
  const rowLine = row => (card.type === 'status' ? statusRowLine(card.data.rows[row], locale) : listRowLine(card.data.rows[row]))
  // A chat button without its own label says "Ask <assistant>" when the board names one.
  const askName = assistant ? t('action.chatNamed', { name: assistant }) : undefined
  const named = list => (assistant ? list?.map(action => (action.kind === 'chat' && action.label === undefined ? { ...action, label: askName } : action)) : list)
  const onPress = target => (action, extra) => press(action, extra, { card: entry.id, ...target })
  const rowActions = actions && ((row, list, part) => h(actions.ActionBar, {
    actions: named(list), part, states: statesOf(entry.presses, row), compact: true, about: about(row, rowLine(row)), onPress: onPress({ row }),
  }))
  const chat = actions && h('span', { className: 'cb-cardChat' }, h(actions.ActionButton, { action: { kind: 'chat', id: '_chat', label: askName }, compact: true, about: about() }))
  const others = card.actions?.filter(action => action.kind !== 'step') ?? []
  const steps = card.actions?.some(action => action.kind === 'step')
    && h(kit.Suggested, { actions: card.actions, about: about(), states: statesOf(entry.presses, undefined), onPress: onPress({}) })
  const footer = actions && others.length > 0 && h('footer', { className: 'cb-cardActions' }, h(actions.ActionBar, {
    actions: named(others), part: 'buttons', states: statesOf(entry.presses, undefined), about: about(), onPress: onPress({}),
  }))
  const className = ['cb-card', `cb-card-${card.type}`, stale && 'cb-cardStale', wash].filter(Boolean).join(' ')

  if (card.type === 'summary') {
    return h('section', { className, style, 'data-type': card.type },
      h('div', { className: 'cb-summaryMain' }, h(SummaryBody, { card, locale, t, wash: wash !== '' }), steps, footer),
      h('div', { className: 'cb-summaryAside' }, live.fresh && h(kit.NewDot), chat))
  }

  const statBlock = card.stat && h(StatBlock, { data: card.stat, locale, compact: true, wash: wash !== '' })
  const body = h(Body, { card, size, narrow: columns === 1, live, wash: wash !== '', locale, t, rowActions })
  return h('section', { className, style, 'data-type': card.type },
    h('header', { className: 'cb-cardHead' },
      card.icon && h(kit.Tile, { icon: card.icon, tone: card.tone ?? 'muted', size: 30 }),
      h(Trunc, { as: 'h3', text: card.title }),
      live.fresh && h(kit.NewDot),
      wash !== '' && card.type !== 'stat' && !card.stat && h(kit.JustNow),
      stale && h('span', { className: 'cb-stale', title: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(updated) },
        h(Tag, { tone: 'warning' }, t('stale', { age: formatAge(age, locale) }))),
      card.link && h('a', { className: 'cb-cardLink', href: card.link, title: t('open'), 'aria-label': t('open'), ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }, h(IconRightUpOutlineRegular, { size: 14 })),
      chat),
    statBlock && ['line', 'bar', 'donut'].includes(card.type)
      ? h('div', { className: 'cb-split' }, statBlock, h('div', { className: 'cb-cardBody' }, body))
      : [statBlock && h('div', { key: 'stat' }, statBlock), h('div', { key: 'body', className: 'cb-cardBody' }, body)],
    steps,
    footer)
}

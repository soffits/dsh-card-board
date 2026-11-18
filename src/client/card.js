/**
 * One card on the grid: its head (tile, title, what is new or just changed, stale mark, link, chat), its body by
 * type, its suggested next steps and its other buttons.
 */
import { createElement as h, useLayoutEffect, useRef, useState } from 'react'
import { IconFullscreenOutlineRegular, IconRightUpOutlineRegular, Tag } from '@deepseek-ai/dsh-client-ui-primitives'
import { BarChart, Donut, LineChart, Timeline } from './charts.js'
import { CountdownBody, ListCard, StatBlock, StatusCard, SummaryBody } from './cards.js'
import { formatAge } from './format.js'
import { listRowLine, statusRowLine, summaryLines } from './quote.js'
import { OWNER, useButtons, useKit } from './services.js'
import { Trunc } from './pieces.js'
import { pickCard } from './words.js'
import { DetailParts } from './detail.js'
import { onControl } from './links.js'
import { ArrangeControls } from './arrange-ui.js'
import { GAP, ROW, spanOf } from './layout.js'

const CHART_HEIGHT = 150
function useRowSpan() {
  const ref = useRef(null)
  const [rows, setRows] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const measure = () => setRows(Math.ceil((el.getBoundingClientRect().height + GAP) / ROW))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, rows]
}
const CHARTS = { line: LineChart, bar: BarChart, donut: Donut, timeline: Timeline }

/** Press states by action id for the card (row undefined) or one row: the latest press wins. */
function statesOf(presses, row) {
  const states = {}
  for (const press of presses ?? []) if (press.row === row) states[press.id] = press.state
  return states
}

/** The newest press of an action on a row (any row when `row` is -1: a kept row is no longer where it was). */
function latestOf(presses, row, id) {
  return (presses ?? []).findLast(press => press.id === id && (row < 0 || press.row === row))
}

function Body({ card, live, wash, locale, t, rowActions, all, onOpenRow, rowControls }) {
  const data = card.data
  switch (card.type) {
    case 'stat': return h(StatBlock, { data, locale, wash, tone: card.tone })
    case 'list': return h(ListCard, { data, live, locale, t, rowActions, ask: card.ask, all, onOpenRow, rowControls })
    case 'status': return h(StatusCard, { data, live, locale, rowActions, ask: card.ask, onOpenRow })
    case 'countdown': return h(CountdownBody, { card, locale })
    default: {
      const Chart = CHARTS[card.type]
      if (Chart === undefined) return null
      return h(Chart, { data, locale, height: all ? (card.type === 'donut' ? 200 : 240) : card.type === 'bar' ? 130 : card.type === 'donut' ? 160 : CHART_HEIGHT })
    }
  }
}

/**
 * @param {object} props
 * @param {object} props.entry - the card as the server sent it: `{ id, size?, card | problems, presses?, version, rows? }`
 * @param {{ wash: number, rows: Record<string, number>, fresh: boolean, freshRows: Set<string> }} props.live - what just
 *   changed (counts that go up with each change) and what is new since the viewer last looked
 */
/**
 * `arrange` (not in the sheet) is what the person can do with the card's place: pin it, move it, drag it; `raised` says the
 * card's `raise` window is open now (the cue says why it is up); `dragging` is where a card being dragged is, and `drop` marks
 * the card a drag would land before or after.
 *
 * `onOpen(rowKey?)` opens the card (or one of its rows) in the sheet; `sheet` draws the card inside it: no head (the
 * sheet has the title), the whole list, a taller chart and the card's `detail` with the buttons only it shows; with
 * `row`, just that row and its detail and buttons.
 */
export function Card({ entry, live, boardId, assistant, tracks, active, locale, t, press, undo, kept, onOpen, sheet = false, row: openRow, arrange, raised = false, dragging = null, drop }) {
  const kit = useKit()
  const actions = useButtons()
  const now = kit.useNow()
  const wash = kit.useWash(live.wash, entry.id)
  const [ref, rows] = useRowSpan()
  const style = sheet ? undefined : {
    gridColumn: `span ${spanOf(entry.card?.type, entry.size, tracks)}`,
    gridRowEnd: rows > 0 ? `span ${rows}` : undefined,
    ...(dragging ? { transform: `translate(${dragging.dx}px, ${dragging.dy}px) scale(1.015)`, transition: 'box-shadow var(--ds-transition-duration,.2s) var(--ds-ease-in-out,ease)' } : {}),
  }
  const placing = { 'data-card': sheet ? undefined : entry.id, 'data-drop': drop, 'data-axis': tracks === 1 ? 'y' : 'x' }
  if (!entry.card) {
    return h('section', { ref, className: `cb-card cb-cardError${dragging ? ' cb-cardDragging' : ''}`, style, ...placing },
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
  // A press carries the row as it stood, so a row ticked done can stay in view when the card is rewritten without it.
  const onPress = target => (action, extra) => press(action, extra, { card: entry.id, ...target }, target.row === undefined ? undefined : card.data.rows?.[target.row])
  const rowActions = actions && ((row, list, part) => h(actions.ActionBar, {
    actions: named(list), part, states: statesOf(entry.presses, row), compact: true, about: about(row, rowLine(row)), onPress: onPress({ row }),
  }))
  const rowControls = {
    press: (row, action) => onPress({ row })(action),
    state: (row, id) => statesOf(entry.presses, row)[id],
    latest: (row, id) => latestOf(entry.presses, row, id),
    kept,
    undo: pressId => undo(pressId, entry.id),
  }
  const chat = actions && h('span', { className: 'cb-cardChat' }, h(actions.ActionButton, { action: { kind: 'chat', id: '_chat', label: askName }, compact: true, about: about() }))
  const others = card.actions?.filter(action => action.kind !== 'step') ?? []
  const steps = card.actions?.some(action => action.kind === 'step')
    && h(kit.Suggested, { actions: card.actions, about: about(), states: statesOf(entry.presses, undefined), onPress: onPress({}) })
  const footer = actions && others.length > 0 && h('footer', { className: 'cb-cardActions' }, h(actions.ActionBar, {
    actions: named(others), part: 'buttons', states: statesOf(entry.presses, undefined), about: about(), onPress: onPress({}),
  }))
  // Buttons the card's detail keeps for when it is open: with the whole card in view.
  const opened = sheet && actions && card.detail?.actions?.length > 0 && [
    card.detail.actions.some(action => action.kind === 'step') && h(kit.Suggested, { key: 'steps', actions: card.detail.actions, about: about(), states: statesOf(entry.presses, undefined), onPress: onPress({}) }),
    h('footer', { key: 'buttons', className: 'cb-cardActions' }, h(actions.ActionBar, {
      actions: named(card.detail.actions.filter(action => action.kind !== 'step')), part: 'buttons', states: statesOf(entry.presses, undefined), about: about(), onPress: onPress({}),
    })),
  ]
  const openable = !sheet && onOpen && card.type !== 'summary'
  const className = ['cb-card', `cb-card-${card.type}`, stale && 'cb-cardStale', openable && 'cb-cardOpenable', sheet && 'cb-cardInSheet', raised && 'cb-cardRaised', dragging && 'cb-cardDragging', wash].filter(Boolean).join(' ')
  // Tapping the card's own surface (not one of its buttons, links or rows that open themselves) opens it.
  const openOnTap = openable ? { onClick: event => { if (!onControl(event) && !event.target.closest?.('[data-opens]') && !window.getSelection?.()?.toString()) onOpen() } } : {}
  const onOpenRow = onOpen && (key => onOpen(key))

  if (sheet && openRow !== undefined) {
    const index = card.data.rows?.findIndex(r => r.key === openRow) ?? -1
    const target = index >= 0 ? card.data.rows[index] : null
    if (!target) return h('p', { className: 'cb-muted' }, t('rowGone'))
    const opened = target.detail?.actions ?? []
    return h('div', { className: 'cb-rowSheet' },
      h(Body, { card: { ...card, data: { ...card.data, rows: [target], progress: undefined } }, live, wash: false, locale, t, rowActions: rowActions && ((_, list, part) => rowActions(index, list, part)), all: true,
        rowControls: { ...rowControls, kept: [], press: (_, action) => rowControls.press(index, action), state: (_, id) => rowControls.state(index, id), latest: (_, id) => rowControls.latest(index, id) } }),
      h(DetailParts, { detail: target.detail, locale, t }),
      rowActions && opened.length > 0 && h('footer', { className: 'cb-cardActions' },
        opened.some(action => action.kind === 'step') && rowActions(index, opened, 'steps'),
        rowActions(index, opened, 'buttons')))
  }

  if (card.type === 'summary') {
    return h('section', { ref, className, style, 'data-type': card.type, ...placing },
      h('div', { className: 'cb-summaryMain' }, h(SummaryBody, { card, locale, t, wash: wash !== '' }), steps, footer),
      h('div', { className: 'cb-summaryAside' }, live.fresh && h(kit.NewDot), chat))
  }

  const statBlock = card.stat && h(StatBlock, { data: card.stat, locale, compact: true, wash: wash !== '', tone: card.tone })
  const body = h(Body, { card, live, wash: wash !== '', locale, t, rowActions, all: sheet, onOpenRow, rowControls })
  return h('section', { ref, className, style, 'data-type': card.type, ...placing, ...openOnTap },
    !sheet && h('header', { className: 'cb-cardHead', ...(arrange ? { onPointerDown: event => { if (event.pointerType !== 'mouse' && !onControl(event)) arrange.onHold(event) } } : {}) },
      card.icon && h(kit.Tile, { icon: card.icon, tone: card.tone ?? 'muted', size: 30 }),
      h(Trunc, { as: 'h3', text: card.title }),
      live.fresh && h(kit.NewDot),
      raised && h('span', { className: 'cb-raisedCue', title: t('arrange.raisedWhy') }, h(Tag, { tone: 'info' }, card.raise?.label ?? t('arrange.raised'))),
      wash !== '' && card.type !== 'stat' && !card.stat && h(kit.JustNow),
      stale && h('span', { className: 'cb-stale', title: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(updated) },
        h(Tag, { tone: 'warning' }, t('stale', { age: formatAge(age, locale) }))),
      arrange && h(ArrangeControls, { t, arrange }),
      card.link && h('a', { className: 'cb-cardLink', href: card.link, title: t('open'), 'aria-label': t('open'), ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }, h(IconRightUpOutlineRegular, { size: 14 })),
      openable && h('button', { type: 'button', className: 'cb-cardLink cb-cardOpen', title: t('details'), 'aria-label': t('details'), onClick: () => onOpen() }, h(IconFullscreenOutlineRegular, { size: 14 })),
      chat),
    statBlock && ['line', 'bar', 'donut'].includes(card.type)
      ? h('div', { className: 'cb-split' }, statBlock, h('div', { className: 'cb-cardBody' }, body))
      : [statBlock && h('div', { key: 'stat' }, statBlock), h('div', { key: 'body', className: 'cb-cardBody' }, body)],
    sheet && h(DetailParts, { detail: card.detail, locale, t }),
    opened,
    steps,
    footer,
    sheet && chat && h('div', { className: 'cb-sheetChat' }, chat))
}

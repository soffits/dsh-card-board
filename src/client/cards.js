/**
 * The bodies of the cards that aren't charts: stats, lists, status rows, the summary and the countdown. Facts sit in
 * DSH's own Tag and StateDot; icons, tiles, rings, sparklines, progress and ticking time come from the kit.
 */
import { createElement as h, useState } from 'react'
import { Button, Checkbox, StateDot, Tag } from '@deepseek-ai/dsh-client-ui-primitives'
import { Trunc } from './pieces.js'
import { formatClock, formatNumber, isActive, toTime } from './format.js'
import { useKit } from './services.js'
import { useEased } from './motion.js'
import { onControl, openLink } from './links.js'
import { stepTimes } from './steps.js'
import { LIST_ROWS, shownRows } from './layout.js'
import { doneOf, doneState, keepTicked } from './ticks.js'

const STATE_OF_TONE = { ok: 'done', warn: 'warning', bad: 'error' }
const DIRECTION_ICON = { up: 'trending-up', down: 'trending-down' }

/** A number that eases to its new value, drawn with as many decimals as the value itself has. */
function EasedNumber({ value, locale }) {
  const shown = useEased(value)
  if (typeof value !== 'number') return formatNumber(value, locale)
  const decimals = Math.min(3, (String(value).split('.')[1] ?? '').length)
  return formatNumber(shown === value ? value : Number(shown.toFixed(decimals)), locale)
}

/** The numbers of a stat card, or the headline numbers above a chart or rows. */
export function StatBlock({ data, locale, compact, wash }) {
  const kit = useKit()
  return h('div', { className: `cb-stats${compact ? ' cb-statsCompact' : ''}` }, data.items.map((item, i) =>
    h(item.link ? 'a' : 'div', { key: i, className: `cb-stat${item.strip ? ' cb-statWide' : ''}${item.link ? ' cb-statLink' : ''}`, ...(item.link ? linkProps(item.link) : {}) },
      h('div', { className: 'cb-statLabel' }, h(Trunc, { as: 'span', text: item.label }), i === 0 && wash && h(kit.JustNow)),
      h('div', { className: 'cb-statValue', style: item.tone ? { color: kit.toneColor(item.tone) } : undefined },
        h('span', null, h(EasedNumber, { value: item.value, locale })),
        item.unit && h('small', null, item.unit)),
      item.delta && h('div', { className: 'cb-delta', style: { color: kit.toneColor(item.delta.tone ?? 'muted') } },
        DIRECTION_ICON[item.delta.dir] && h(kit.Icon, { name: DIRECTION_ICON[item.delta.dir], size: 13 }),
        h('span', null, item.delta.text)),
      item.progress && h('div', { className: 'cb-statProgress' },
        h(kit.Progress, { value: item.progress.value, max: item.progress.max, tone: item.tone ?? (item.progress.value > item.progress.max ? 'warn' : 'ok') }),
        item.progress.text && h('div', { className: 'cb-statSub' }, item.progress.text)),
      item.spark && h(kit.Spark, { values: item.spark, tone: item.tone ?? 'accent', height: 28, area: true }),
      item.sub && h(Trunc, { className: 'cb-statSub', lines: 2, text: item.sub }),
      item.strip && h('ol', { className: 'cb-strip' }, item.strip.map((cell, j) =>
        h('li', { key: j, 'data-on': cell.on ? 'true' : undefined },
          h('b', null, formatNumber(cell.value, locale, 1)),
          cell.icon && h(kit.Icon, { name: cell.icon, size: 14 }),
          h('span', null, cell.label)))))))
}

function linkProps(link) {
  const external = /^https?:/i.test(link)
  return { href: link, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : { onClick: event => { event.preventDefault(); openLink(link) } }) }
}

/** "now" or "from 18:00" for a row with an active window, else its day relative to today. */
function RowWhen({ row, locale, t }) {
  const kit = useKit()
  const now = kit.useNow()
  if (row.active) {
    if (isActive(row.active, now)) return h(Tag, { tone: 'info' }, t('now'))
    const from = Date.parse(row.active.from)
    if (from > now && new Date(from).toDateString() === new Date(now).toDateString()) return h('span', { className: 'cb-when' }, t('fromTime', { time: formatClock(from, locale) }))
  }
  return row.date ? h('span', { className: 'cb-when' }, h(kit.RelativeDay, { date: row.date })) : null
}

/**
 * One list or status row: its lead (checkbox, tile or dot), its words, its facts and its buttons. It washes when its
 * own version changes, and carries a dot while it is new since you last looked.
 */
function Row({ lead, title, sub, meta, value, spark, row, index, washCount, fresh, rowActions, className, onOpenRow }) {
  const kit = useKit()
  const now = kit.useNow()
  const wash = kit.useWash(washCount, row.key)
  // A row with a link goes there when tapped; one with a detail opens it; its own buttons keep theirs.
  const go = row.link ? () => openLink(row.link) : row.detail && row.key !== undefined && onOpenRow ? () => onOpenRow(row.key) : null
  const opens = go && {
    'data-opens': 'true',
    role: row.link ? 'link' : 'button',
    tabIndex: 0,
    onClick: event => { if (!onControl(event)) { event.stopPropagation(); go() } },
    onKeyDown: event => { if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) { event.preventDefault(); go() } },
  }
  return h('li', { className: ['cb-row', className, isActive(row.active, now) && 'cb-rowNow', go && 'cb-rowOpens', wash].filter(Boolean).join(' '), ...opens },
    lead,
    h('div', { className: 'cb-rowText' },
      h('div', { className: 'cb-rowTitle' }, fresh && h(kit.NewDot), h(Trunc, { as: 'span', lines: 2, text: title })),
      sub && h(Trunc, { className: 'cb-rowSub', lines: 2, text: sub })),
    spark,
    meta,
    value,
    // The row's own buttons on the right: its steps first (a step starts the work on one tap), then the others.
    row.actions && rowActions && h('span', { className: 'cb-rowActions' },
      row.actions.some(action => action.kind === 'step') && rowActions(index, row.actions, 'steps'),
      rowActions(index, row.actions, 'buttons')))
}

/**
 * A row's done action as a checkbox: ticked when the row says so or once the press went through, and, when the card
 * offered a way back, unticking it takes the press back. A kept row is no longer on the card, so only a way back works.
 */
function DoneBox({ row, index, done, rowControls, t }) {
  const { checked, undo } = doneState(row, rowControls.latest(index, done.id))
  const label = t(checked ? (undo ? 'markNotDone' : 'checked') : 'markDone')
  return h('span', { className: 'cb-doneBox', onClick: event => event.stopPropagation() },
    h(Checkbox, {
      checked,
      disabled: checked ? undo === undefined : index < 0,
      title: label,
      label: h('span', { className: 'cb-visuallyHidden' }, label),
      onChange: value => { if (value) rowControls.press(index, done); else if (undo) rowControls.undo(undo) },
    }))
}

/** What is new and what just changed in one keyed row. */
const rowLive = (live, row) => ({ washCount: live.rows?.[row.key] ?? 0, fresh: row.key !== undefined && live.freshRows.has(row.key) })

export function ListCard({ data, live, locale, t, rowActions, all = false, onOpenRow, rowControls }) {
  const kit = useKit()
  const [open, setOpen] = useState(false)
  // Rows ticked this visit stay where they were; their index is -1 because the card no longer has them.
  const listed = keepTicked(data.rows, rowControls?.kept)
  const rows = shownRows(listed, open || all, LIST_ROWS, live)
  const hidden = listed.length - rows.length
  const ticked = row => { const done = doneOf(row); return done !== undefined && rowControls !== undefined ? doneState(row, rowControls.latest(data.rows.indexOf(row), done.id)).checked : row.checked === true }
  const progress = data.progress
  return h('div', { className: 'cb-list' },
    progress && h('div', { className: 'cb-progress' },
      h(kit.Ring, { value: progress.done, max: progress.total, size: 54, tone: progress.done >= progress.total ? 'ok' : 'accent', label: `${progress.done}/${progress.total}` },
        h('span', null, String(progress.done)), h('small', null, t('ofTotal', { total: progress.total }))),
      h('div', { className: 'cb-progressText' },
        progress.label && h('div', { className: 'cb-progressLabel' }, progress.label),
        progress.sub && h('div', { className: 'cb-rowSub' }, progress.sub))),
    listed.length === 0
      ? h('p', { className: 'cb-muted' }, data.empty ?? t('listEmpty'))
      : h('ul', { className: 'cb-rows' }, rows.map((row, i) => h(Row, {
        key: row.key ?? i, index: data.rows.indexOf(row), row: doneOf(row) && rowControls ? { ...row, actions: row.actions.filter(a => a.kind !== 'done') } : row, rowActions: data.rows.includes(row) ? rowActions : undefined, onOpenRow, className: [i >= LIST_ROWS && 'cb-rowLate', ticked(row) && 'cb-done'].filter(Boolean).join(' ') || undefined, ...rowLive(live, row),
        lead: [
          doneOf(row) && rowControls && h(DoneBox, { key: 'check', row, index: data.rows.indexOf(row), done: doneOf(row), rowControls, t }),
          row.icon && h(kit.Tile, { key: 'tile', icon: row.icon, tone: row.tone ?? 'muted', size: 30 }),
        ],
        title: row.title,
        sub: row.sub,
        meta: h('span', { className: 'cb-rowMeta' },
          row.chip && h(Tag, { tone: kit.tagTone(row.chip.tone ?? 'muted') }, row.chip.text),
          h(RowWhen, { row, locale, t })),
      }))),
    !all && (hidden > 0 || open) && listed.length > LIST_ROWS + 1 && h(Button, { variant: 'ghost', size: 'sm', className: 'cb-more', onClick: () => setOpen(value => !value) },
      open ? t('showFewer') : t('showMore', { n: hidden })))
}

export function StatusCard({ data, live, locale, rowActions, onOpenRow }) {
  const kit = useKit()
  return h('ul', { className: 'cb-rows' }, data.rows.map((row, i) => h(Row, {
    key: row.key ?? i, index: i, row, rowActions, onOpenRow, ...rowLive(live, row), className: 'cb-statusRow',
    lead: row.icon ? h(kit.Tile, { icon: row.icon, tone: row.tone, size: 28 }) : h('span', { className: 'cb-dotSlot' }, h(StateDot, { state: STATE_OF_TONE[row.tone] ?? 'idle' })),
    title: row.label,
    sub: row.sub,
    spark: row.spark && h('span', { className: 'cb-statusSpark' }, h(kit.Spark, { values: row.spark, tone: row.tone === 'ok' ? 'ok' : row.tone, height: 22 })),
    value: h('span', { className: 'cb-statusValue', style: row.tone === 'bad' || row.tone === 'warn' ? { color: kit.toneColor(row.tone) } : undefined }, formatNumber(row.value, locale)),
  })))
}

const PARTS = [[5, 'dayPart.morning'], [12, 'dayPart.afternoon'], [18, 'dayPart.evening'], [22, 'dayPart.night']]

/** "Tuesday afternoon": the day and its part, from the page's own clock, so it is always right. */
function dayLine(now, locale, t) {
  const hour = new Date(now).getHours()
  const part = [...PARTS].reverse().find(([from]) => hour >= from)?.[1] ?? 'dayPart.night'
  return { text: t('dayLine', { day: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now), part: t(part) }), dark: part === 'dayPart.night' || part === 'dayPart.evening' }
}

export function SummaryBody({ card, locale, t, wash }) {
  const kit = useKit()
  const now = kit.useNow()
  const day = dayLine(now, locale, t)
  return h('div', { className: 'cb-summary' },
    h('div', { className: 'cb-summaryLine' }, h(kit.Icon, { name: day.dark ? 'moon' : 'sun-medium', size: 14 }), h('span', null, `${day.text} · ${card.title}`), wash && h(kit.JustNow)),
    h('p', { className: 'cb-summaryText' }, card.data.text),
    card.data.chips?.length > 0 && h('div', { className: 'cb-chips' }, card.data.chips.map((chip, i) =>
      h(kit.Chip, { key: i, icon: chip.icon, tone: chip.tone ?? 'muted', to: chip.to }, chip.text))))
}

/** Each step's time where it happens: the weekday when the day changes, the zone's short name when it isn't the viewer's. */
export function CountdownBody({ card, locale }) {
  const kit = useKit()
  const now = kit.useNow()
  const data = card.data
  const times = data.steps ? stepTimes(data.steps, locale) : []
  const next = times.findIndex(step => step.time > now)
  return h('div', { className: 'cb-countdown' },
    h('div', { className: 'cb-countdownHead' },
      h(kit.Countdown, { to: data.to }),
      h('div', { className: 'cb-countdownText' },
        h('div', null, data.label),
        data.sub && h('div', { className: 'cb-rowSub' }, data.sub))),
    times.length > 0 && h('ol', { className: 'cb-track' }, data.steps.map((step, i) =>
      h('li', { key: i, 'data-state': i === next ? 'next' : times[i].time <= now ? 'past' : 'later' },
        h('i', { 'aria-hidden': true }),
        h('b', null, times[i].text),
        h('span', null, step.sub ? `${step.label} · ${step.sub}` : step.label)))))
}

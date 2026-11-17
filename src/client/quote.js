/**
 * What a chat about a card quotes: a few plain lines saying what the card shows, in the person's language.
 */
import { formatNumber } from './format.js'

function withUnit(value, unit, locale) {
  return `${formatNumber(value, locale)}${unit ? ` ${unit}` : ''}`
}

function statLines(data, locale) {
  return data.items.map(item => `${item.label}: ${withUnit(item.value, item.unit, locale)}${item.delta ? ` (${item.delta.text})` : ''}${item.sub ? ` · ${item.sub}` : ''}${item.progress?.text ? ` · ${item.progress.text}` : ''}`)
}

export function listRowLine(row) {
  const box = 'checked' in row ? (row.checked ? '☑ ' : '☐ ') : ''
  return `${box}${row.title}${row.sub ? ` · ${row.sub}` : ''}${row.date ? ` · ${row.date}` : ''}${row.chip ? ` [${row.chip.text}]` : ''}`
}

export function statusRowLine(row, locale) {
  return `${row.label}: ${formatNumber(row.value, locale)}${row.sub ? ` · ${row.sub}` : ''}`
}

/** A few plain lines saying what a card shows, for the agent. */
export function summaryLines(card, locale, t) {
  const data = card.data
  const lines = card.stat ? statLines(card.stat, locale) : []
  switch (card.type) {
    case 'summary': return [data.text, ...(data.chips ?? []).map(chip => (chip.to ? `${chip.text} (${chip.to})` : chip.text))]
    case 'countdown': return [`${data.label}: ${data.to}`, ...(data.sub ? [data.sub] : []), ...(data.steps ?? []).map(step => `${step.at} ${step.label}${step.sub ? ` · ${step.sub}` : ''}`)]
    case 'stat': return statLines(data, locale)
    case 'line':
      for (const series of data.series) {
        const last = [...series.points].reverse().find(p => typeof p.y === 'number')
        if (last) lines.push(t('summary.latest', { name: series.name || t('summary.latestName'), value: withUnit(last.y, data.unit, locale), x: last.x, n: series.points.length, from: series.points[0].x }))
      }
      if (data.goal?.y !== undefined) lines.push(t('summary.goal', { value: withUnit(data.goal.y, data.unit, locale) }))
      return lines
    case 'bar':
      return lines.concat(data.bars.slice(-10).map(bar => `${bar.x}: ${bar.values ? Object.entries(bar.values).map(([k, v]) => `${k} ${formatNumber(v, locale)}`).join(', ') : withUnit(bar.value, data.unit, locale)}`))
    case 'donut': {
      const total = data.segments.reduce((sum, s) => sum + s.value, 0)
      return lines.concat(data.segments.map(s => `${s.label}: ${withUnit(s.value, data.unit, locale)}${total > 0 ? ` (${Math.round((s.value / total) * 100)}%)` : ''}`))
    }
    case 'list':
      return lines.concat(data.progress ? [t('summary.progress', data.progress)] : [], data.rows.slice(0, 15).map(listRowLine))
    case 'timeline':
      return lines.concat((data.points ?? []).map(p => `${p.date}: ${p.label}`), (data.spans ?? []).map(s => `${s.from} – ${s.to}: ${s.label}`))
    case 'status':
      return lines.concat(data.rows.map(row => statusRowLine(row, locale)))
    default: return lines
  }
}

/**
 * The parts of a `detail` (on a card or a row), shown when it is opened: text, facts, a larger chart with point
 * tooltips, and a history.
 */
import { createElement as h } from 'react'
import { BarChart, LineChart } from './charts.js'
import { formatNumber } from './format.js'
import { useKit } from './services.js'

const CHARTS = { line: LineChart, bar: BarChart }

export function DetailParts({ detail, locale, t }) {
  const kit = useKit()
  if (!detail) return null
  const Chart = detail.chart && CHARTS[detail.chart.type]
  return h('div', { className: 'cb-detail' },
    detail.text && h('p', { className: 'cb-detailText' }, detail.text),
    detail.facts?.length > 0 && h('dl', { className: 'cb-facts' }, detail.facts.map((fact, i) => [
      h('dt', { key: `t${i}` }, fact.label),
      h('dd', { key: `d${i}` }, typeof fact.value === 'number' ? formatNumber(fact.value, locale) : fact.value)])),
    Chart && h('div', { className: 'cb-detailChart' }, h(Chart, { data: detail.chart.data, locale, height: 240 })),
    detail.history?.length > 0 && h('section', { className: 'cb-detailHistory' },
      h('h4', null, t('history')),
      h(kit.History, { items: detail.history, max: 8, moreLabel: t('showMore', { n: '{n}' }) })))
}

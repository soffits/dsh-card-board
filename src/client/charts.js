/**
 * Charts sized to their card: line, bar, donut and timeline, as small SVGs coloured through the data tones (theme
 * tokens), so light and dark follow the app.
 */
import { createElement as h, useMemo, useState } from 'react'
import { Trunc } from './pieces.js'
import { fit, formatAxis, formatDay, formatNumber, niceTicks, spread, textWidth, toTime, useWidth } from './format.js'
import { kitStore, useKit } from './services.js'

/** Series without a tone take these in turn. */
const PALETTE = ['accent', 'ok', 'warn', 'violet', 'bad', 'muted']
const toneColor = (tone, index = 0) => kitStore.get().toneColor(tone ?? PALETTE[index % PALETTE.length])

/** The point under the pointer (a mouse hovering, or a finger tapping): its value and date in a small bubble. */
function usePointer(pick) {
  const [at, setAt] = useState(null)
  const fromEvent = event => {
    const box = event.currentTarget.getBoundingClientRect()
    return pick(event.clientX - box.left)
  }
  return [at, {
    onPointerMove: event => setAt(fromEvent(event)),
    onPointerDown: event => setAt(fromEvent(event)),
    onPointerLeave: event => { if (event.pointerType === 'mouse') setAt(null) },
  }, () => setAt(null)]
}

function Bubble({ x, width, lines }) {
  const flip = x > width * 0.6
  return h('div', { className: 'cb-bubble', role: 'status', style: flip ? { right: Math.max(0, width - x + 10) } : { left: x + 10 } },
    lines.map((line, i) => h('div', { key: i, className: i === 0 ? 'cb-bubbleHead' : undefined }, line)))
}

function Legend({ items, locale }) {
  return h('ul', { className: 'cb-legend' }, items.map((item, i) =>
    h('li', { key: i },
      h('i', { style: { background: item.color } }),
      h(Trunc, { as: 'span', text: item.label }),
      item.value !== undefined && h('b', null, formatNumber(item.value, locale)))))
}

export function LineChart({ data, locale, height }) {
  const [ref, width] = useWidth()
  const model = useMemo(() => {
    // The x range covers the series, a goal drawn as points and the markers, so none of them runs off the plot.
    const allX = [...data.series.flatMap(s => s.points.map(p => p.x)), ...(data.goal?.points ?? []).map(p => p.x), ...(data.markers ?? []).map(m => m.x)]
    const times = allX.map(toTime)
    const timeAxis = times.every(Number.isFinite)
    const numberAxis = !timeAxis && allX.every(x => typeof x === 'number')
    const categories = timeAxis || numberAxis ? [] : [...new Set(allX.map(String))]
    const xValue = x => (timeAxis ? toTime(x) : numberAxis ? x : categories.indexOf(String(x)))
    const xs = allX.map(xValue)
    let ys = data.series.flatMap(s => s.points.map(p => p.y)).filter(y => typeof y === 'number')
    if (data.goal?.y !== undefined) ys = ys.concat(data.goal.y)
    if (data.goal?.points) ys = ys.concat(data.goal.points.map(p => p.y).filter(y => typeof y === 'number'))
    let yMin = Math.min(...ys)
    let yMax = Math.max(...ys)
    const pad = (yMax - yMin || Math.abs(yMax) || 1) * 0.08
    yMin -= pad
    yMax += pad
    return { timeAxis, categories, xValue, xMin: Math.min(...xs), xMax: Math.max(...xs), yMin, yMax }
  }, [data])

  const ticks = niceTicks(model.yMin, model.yMax, height > 160 ? 4 : 3).filter(v => v >= model.yMin && v <= model.yMax)
  const left = Math.max(...ticks.map(v => textWidth(formatAxis(v, locale)))) + 10
  const right = 12
  const top = 10
  const bottom = 20
  const plotW = Math.max(10, width - left - right)
  const plotH = Math.max(10, height - top - bottom)
  const sx = x => left + (model.xMax === model.xMin ? plotW / 2 : ((model.xValue(x) - model.xMin) / (model.xMax - model.xMin)) * plotW)
  const sy = y => top + (1 - (y - model.yMin) / (model.yMax - model.yMin || 1)) * plotH
  const spanDays = model.timeAxis ? (model.xMax - model.xMin) / 86400000 : 0
  const xLabel = x => (model.timeAxis ? formatDay(toTime(x), locale, spanDays) : typeof x === 'number' ? formatNumber(x, locale) : String(x))

  const longest = data.series.reduce((best, s) => (s.points.length > best.points.length ? s : best), data.series[0])
  const labelWidth = Math.max(36, ...longest.points.slice(0, 40).map(p => textWidth(xLabel(p.x)) + 12))
  const labelCount = Math.max(2, Math.floor(plotW / labelWidth))
  // Evenly spaced labels, minus any that would print the same text or sit on top of the one before.
  const xTicks = []
  for (const x of spread(longest.points.length, labelCount).map(i => longest.points[i].x)) {
    const last = xTicks[xTicks.length - 1]
    if (last !== undefined && (xLabel(last) === xLabel(x) || sx(x) - sx(last) < labelWidth)) continue
    xTicks.push(x)
  }

  // Marker labels sit just above the x axis, right of their line (left of it near the right edge), in up to two rows;
  // one that finds no free spot shows only its line, and its text on hover.
  const labelRows = [[], []]
  const markerLabels = [...(data.markers ?? [])].sort((a, b) => model.xValue(a.x) - model.xValue(b.x)).map(marker => {
    const x = sx(marker.x)
    const room = left + plotW - x - 6
    const flip = room < Math.min(textWidth(marker.label), 90) && x - left > room
    const space = Math.max(20, Math.min(120, flip ? x - left - 6 : room))
    const width = Math.min(textWidth(marker.label), space)
    const span = flip ? [x - 4 - width, x - 4] : [x + 4, x + 4 + width]
    const row = labelRows.findIndex(taken => taken.every(([from, to]) => span[0] > to + 4 || span[1] < from - 4))
    if (row >= 0) labelRows[row].push(span)
    return { marker, x, flip, space, label: row >= 0 ? row : null }
  })

  const path = points => {
    let d = ''
    let pen = false
    for (const p of points) {
      if (typeof p.y !== 'number') { pen = false; continue }
      d += `${pen ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`
      pen = true
    }
    return d
  }
  const gradientId = useMemo(() => `cb-g-${Math.random().toString(36).slice(2, 9)}`, [])
  const xsAll = useMemo(() => [...new Set(data.series.flatMap(s => s.points.filter(p => typeof p.y === 'number').map(p => p.x)))], [data])
  const [hover, pointer] = usePointer(px => {
    let best = null
    for (const x of xsAll) if (best === null || Math.abs(sx(x) - px) < Math.abs(sx(best) - px)) best = x
    return best
  })
  const hoverX = hover === null ? null : sx(hover)
  const hoverLines = hover === null ? [] : [model.timeAxis ? formatDay(toTime(hover), locale, 0) : xLabel(hover), ...data.series.flatMap(s => {
    const p = s.points.find(q => q.x === hover && typeof q.y === 'number')
    return p ? [`${s.name ? `${s.name}: ` : ''}${formatNumber(p.y, locale)}${data.unit ? ` ${data.unit}` : ''}`] : []
  })]

  return h('div', { ref, className: 'cb-chart', style: { height } }, width > 0 && hover !== null && h(Bubble, { x: hoverX, width, lines: hoverLines }), width > 0 && h('svg', { width, height, role: 'img', className: 'cb-plot', ...pointer },
    h('defs', null, data.series.map((s, i) => h('linearGradient', { key: i, id: `${gradientId}-${i}`, x1: 0, y1: 0, x2: 0, y2: 1 },
      h('stop', { offset: '0%', stopColor: toneColor(s.tone, i), stopOpacity: 0.22 }),
      h('stop', { offset: '100%', stopColor: toneColor(s.tone, i), stopOpacity: 0 })))),
    ticks.map(v => h('g', { key: v },
      h('line', { x1: left, x2: left + plotW, y1: sy(v), y2: sy(v), className: 'cb-rule' }),
      h('text', { x: left - 8, y: sy(v), className: 'cb-axis', textAnchor: 'end', dominantBaseline: 'middle' }, formatAxis(v, locale)))),
    xTicks.map((x, i) => h('text', { key: i, x: sx(x), y: height - 4, className: 'cb-axis', textAnchor: i === 0 && xTicks.length > 1 ? 'start' : i === xTicks.length - 1 && xTicks.length > 1 ? 'end' : 'middle' }, xLabel(x))),
    markerLabels.map(({ marker, x, label, flip, space }, i) => h('g', { key: `m${i}` },
      h('line', { x1: x, x2: x, y1: top, y2: top + plotH, className: 'cb-marker' }),
      h('title', null, marker.label),
      label !== null && h('text', { x: flip ? x - 4 : x + 4, y: top + plotH - 5 - label * 13, className: 'cb-markerLabel', textAnchor: flip ? 'end' : 'start' }, fit(marker.label, space)))),
    data.goal && (data.goal.points
      ? h('path', { d: path(data.goal.points), className: 'cb-goal' })
      : h('line', { x1: left, x2: left + plotW, y1: sy(data.goal.y), y2: sy(data.goal.y), className: 'cb-goal' })),
    data.goal?.label && (() => {
      const end = data.goal.points ? data.goal.points[data.goal.points.length - 1] : { x: null, y: data.goal.y }
      const x = end.x === null ? left + plotW : sx(end.x)
      return h('text', { x: Math.min(x, left + plotW), y: sy(end.y) - 5, className: 'cb-goalLabel', textAnchor: 'end' }, h('title', null, data.goal.label), fit(data.goal.label, plotW))
    })(),
    data.series.map((s, i) => {
      const color = toneColor(s.tone, i)
      const line = path(s.points)
      const valid = s.points.filter(p => typeof p.y === 'number')
      const last = valid[valid.length - 1]
      const area = data.area && valid.length > 1
        ? `${line}L${sx(last.x).toFixed(1)},${(top + plotH).toFixed(1)}L${sx(valid[0].x).toFixed(1)},${(top + plotH).toFixed(1)}Z`
        : null
      return h('g', { key: `s${i}` },
        area && h('path', { d: area, fill: `url(#${gradientId}-${i})`, stroke: 'none' }),
        h('path', { d: line, fill: 'none', stroke: color, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' }),
        valid.length <= 16 && valid.map((p, j) => h('circle', { key: j, cx: sx(p.x), cy: sy(p.y), r: 2.6, fill: 'var(--dsw-alias-bg-base)', stroke: color, strokeWidth: 1.6 },
          h('title', null, `${s.name ? `${s.name} · ` : ''}${xLabel(p.x)}: ${formatNumber(p.y, locale)}${data.unit ? ` ${data.unit}` : ''}`))),
        valid.length > 16 && last && h('circle', { cx: sx(last.x), cy: sy(last.y), r: 3, fill: color }))
    }),
    hover !== null && h('g', { className: 'cb-hover' },
      h('line', { x1: hoverX, x2: hoverX, y1: top, y2: top + plotH, className: 'cb-hoverRule' }),
      data.series.map((s, i) => {
        const p = s.points.find(q => q.x === hover && typeof q.y === 'number')
        return p && h('circle', { key: i, cx: hoverX, cy: sy(p.y), r: 4, fill: toneColor(s.tone, i), stroke: 'var(--dsw-alias-bg-base)', strokeWidth: 2 })
      }))))
}

export function BarChart({ data, locale, height }) {
  const [ref, width] = useWidth()
  const keys = useMemo(() => {
    const seen = []
    for (const bar of data.bars) for (const key of Object.keys(bar.values ?? {})) if (!seen.includes(key)) seen.push(key)
    return seen
  }, [data])
  const multi = keys.length > 0
  const stacked = multi && data.stacked === true
  const totals = data.bars.map(bar => (multi ? keys.reduce((sum, key) => sum + Math.max(0, bar.values?.[key] ?? 0), 0) : Math.max(0, bar.value ?? 0)))
  const peaks = data.bars.map((bar, i) => (multi && !stacked ? Math.max(0, ...keys.map(key => bar.values?.[key] ?? 0)) : totals[i]))
  const max = Math.max(1e-9, ...peaks, data.goal?.y ?? 0)
  const showValues = data.bars.length <= 14
  const top = showValues ? 16 : 6
  const bottom = 20
  const plotH = Math.max(10, height - top - bottom)
  const slot = width / data.bars.length
  const barW = Math.max(2, Math.min(44, slot * 0.62))
  const sy = v => top + plotH - (v / max) * plotH
  const labelEvery = Math.max(1, Math.ceil(data.bars.length / Math.max(1, Math.floor(width / 40))))
  const label = x => {
    const time = toTime(x)
    return Number.isFinite(time) ? formatDay(time, locale, 0) : String(x)
  }
  const [hover, pointer] = usePointer(px => Math.max(0, Math.min(data.bars.length - 1, Math.floor(px / slot))))
  const tipOf = bar => (multi
    ? [label(bar.x), ...keys.filter(k => bar.values?.[k] !== undefined).map(k => `${k}: ${formatNumber(bar.values[k], locale)}${data.unit ? ` ${data.unit}` : ''}`)]
    : [label(bar.x), `${formatNumber(bar.value, locale)}${data.unit ? ` ${data.unit}` : ''}`])
  return h('div', null,
    h('div', { ref, className: 'cb-chart', style: { height } },
      width > 0 && hover !== null && data.bars[hover] && h(Bubble, { x: slot * hover + slot / 2, width, lines: tipOf(data.bars[hover]) }),
      width > 0 && h('svg', { width, height, role: 'img', className: 'cb-plot', ...pointer },
      h('line', { x1: 0, x2: width, y1: top + plotH + 0.5, y2: top + plotH + 0.5, className: 'cb-rule' }),
      data.goal && h('line', { x1: 0, x2: width, y1: sy(data.goal.y), y2: sy(data.goal.y), className: 'cb-goal' }),
      data.goal?.label && h('text', { x: width, y: sy(data.goal.y) - 4, className: 'cb-goalLabel', textAnchor: 'end' }, h('title', null, data.goal.label), fit(data.goal.label, width)),
      data.bars.map((bar, i) => {
        const cx = slot * i + slot / 2
        const tip = multi
          ? `${label(bar.x)}: ${keys.filter(k => bar.values?.[k] !== undefined).map(k => `${k} ${formatNumber(bar.values[k], locale)}`).join(', ')}`
          : `${label(bar.x)}: ${formatNumber(bar.value, locale)}${data.unit ? ` ${data.unit}` : ''}`
        let parts
        if (!multi) parts = [{ y0: 0, y1: Math.max(0, bar.value), color: toneColor(undefined, 1), x: cx - barW / 2, w: barW }]
        else if (stacked) {
          let base = 0
          parts = keys.map((key, k) => {
            const v = Math.max(0, bar.values?.[key] ?? 0)
            const part = { y0: base, y1: base + v, color: toneColor(undefined, k), x: cx - barW / 2, w: barW }
            base += v
            return part
          })
        } else {
          const each = barW / keys.length
          parts = keys.map((key, k) => ({ y0: 0, y1: Math.max(0, bar.values?.[key] ?? 0), color: toneColor(undefined, k), x: cx - barW / 2 + k * each, w: Math.max(1, each - 1) }))
        }
        return h('g', { key: i },
          h('title', null, tip),
          parts.filter(p => p.y1 > p.y0).map((p, k) => h('rect', {
            key: k, x: p.x, width: p.w, y: sy(p.y1), height: Math.max(0.5, sy(p.y0) - sy(p.y1)),
            rx: Math.min(4, p.w / 3), fill: p.color, fillOpacity: hover === i ? 1 : multi ? 0.85 : 0.55,
          })),
          showValues && h('text', { x: cx, y: sy(peaks[i]) - 4, className: 'cb-barValue', textAnchor: 'middle' }, formatNumber(multi && !stacked ? peaks[i] : totals[i], locale, 1)),
          i % labelEvery === 0 && h('text', { x: Math.min(Math.max(cx, textWidth(label(bar.x)) / 2), width - textWidth(label(bar.x)) / 2), y: height - 4, className: 'cb-axis', textAnchor: 'middle' }, label(bar.x)))
      }))),
    multi && h(Legend, { items: keys.map((key, k) => ({ label: key, color: toneColor(undefined, k) })), locale }))
}

function arc(cx, cy, r, start, end) {
  const large = end - start > Math.PI ? 1 : 0
  const x0 = cx + r * Math.sin(start)
  const y0 = cy - r * Math.cos(start)
  const x1 = cx + r * Math.sin(end)
  const y1 = cy - r * Math.cos(end)
  return `M${x0.toFixed(2)},${y0.toFixed(2)}A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`
}

export function Donut({ data, locale, height }) {
  const [ref, width] = useWidth()
  const total = data.segments.reduce((sum, s) => sum + s.value, 0)
  const narrow = width < 340
  const size = Math.max(90, Math.min(narrow ? 150 : 170, height - 8, narrow ? width * 0.6 : width * 0.42))
  const ring = size * 0.13
  const r = size / 2 - ring / 2
  let angle = 0
  const gap = data.segments.filter(s => s.value > 0).length > 1 ? 0.025 : 0
  const segments = data.segments.map((s, i) => {
    const sweep = total > 0 ? (s.value / total) * Math.PI * 2 : 0
    const seg = { ...s, color: toneColor(s.tone, i), start: angle + gap / 2, end: angle + sweep - gap / 2 }
    angle += sweep
    return seg
  })
  return h('div', { ref, className: `cb-donut${narrow ? ' cb-donutNarrow' : ''}` },
    width > 0 && h('div', { className: 'cb-donutRing', style: { width: size, height: size } },
      h('svg', { width: size, height: size, role: 'img' },
        h('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: 'var(--dsw-alias-border-l2)', strokeWidth: ring }),
        segments.filter(s => s.end > s.start).map((s, i) => h('path', { key: i, d: arc(size / 2, size / 2, r, s.start, s.end), fill: 'none', stroke: s.color, strokeWidth: ring },
          h('title', null, `${s.label}: ${formatNumber(s.value, locale)}${data.unit ? ` ${data.unit}` : ''}`)))),
      data.centre && h('div', { className: 'cb-donutCentre' },
        h('strong', null, data.centre.text),
        data.centre.sub && h('span', null, data.centre.sub))),
    h('table', { className: 'cb-donutTable' }, h('tbody', null, segments.map((s, i) => h('tr', { key: i },
      h('td', null, h('i', { style: { background: s.color } })),
      h('td', { className: 'cb-donutLabel' }, h(Trunc, { text: s.label })),
      h('td', { className: 'cb-num' }, formatNumber(s.value, locale)),
      h('td', { className: 'cb-num cb-dim' }, total > 0 ? `${Math.round((s.value / total) * 100)}%` : '–'))))))
}
const KIND_TONE = { due: 'warn', health: 'ok', event: 'accent', home: 'muted', money: 'ok', travel: 'accent' }
const KIND_ICON = { due: 'receipt', health: 'heart-pulse', event: 'calendar', home: 'house', money: 'wallet', travel: 'plane' }

export function Timeline({ data, locale }) {
  const kit = useKit()
  const [ref, width] = useWidth()
  const from = toTime(data.from)
  const to = toTime(data.to)
  const days = Math.max(1, Math.round((to - from) / 86400000))
  const pad = 14
  const plotW = Math.max(10, width - pad * 2)
  const sx = time => pad + ((time - from) / (to - from)) * plotW
  const now = Date.now()
  const dayEvery = Math.max(1, Math.ceil(days / Math.max(1, Math.floor(plotW / 44))))
  const ticks = []
  for (let i = 0; i <= days; i += dayEvery) ticks.push(from + i * 86400000)

  // Points get label rows so neighbours don't overlap.
  const points = (data.points ?? []).map(p => ({ ...p, time: toTime(p.date) })).filter(p => p.time >= from && p.time <= to).sort((a, b) => a.time - b.time)
  const rowEnds = []
  const placed = points.map(p => {
    const half = Math.min(90, textWidth(p.label)) / 2 + 4
    const x = sx(p.time)
    let row = rowEnds.findIndex(end => x - half > end)
    if (row === -1) { row = rowEnds.length; rowEnds.push(0) }
    rowEnds[row] = x + half
    return { ...p, x, row }
  })
  const labelRows = Math.max(1, rowEnds.length)
  const tickH = 18
  const pointY = tickH + 16
  const labelTop = pointY + 18
  const spansTop = labelTop + labelRows * 15 + 8
  const spans = (data.spans ?? []).map(s => ({ ...s, a: Math.max(from, toTime(s.from)), b: Math.min(to, toTime(s.to) + 86400000 - 1) })).filter(s => s.b >= s.a)
  const height = spansTop + spans.length * 36 + 4

  return h('div', { ref, className: 'cb-chart', style: { height } }, width > 0 && h('svg', { width, height, role: 'img' },
    ticks.map((time, i) => h('g', { key: i },
      h('line', { x1: sx(time), x2: sx(time), y1: tickH, y2: height, className: 'cb-dayLine' }),
      h('text', { x: sx(time), y: 11, className: 'cb-axis', textAnchor: 'middle' }, formatDay(time, locale, 0)))),
    now >= from && now <= to && h('line', { x1: sx(now), x2: sx(now), y1: tickH - 2, y2: height, className: 'cb-today' }),
    placed.map((p, i) => {
      const color = toneColor(p.tone ?? KIND_TONE[p.kind] ?? 'accent')
      const text = fit(p.label, 90)
      return h('g', { key: i },
        h('title', null, `${formatDay(p.time, locale, 0)} · ${p.label}`),
        KIND_ICON[p.kind]
          ? h('g', { transform: `translate(${(p.x - 8).toFixed(1)},${pointY - 8})`, style: { color } }, h(kit.Icon, { name: KIND_ICON[p.kind], size: 16 }))
          : h('circle', { cx: p.x, cy: pointY, r: 5, fill: color }),
        p.row > 0 && h('line', { x1: p.x, x2: p.x, y1: pointY + 8, y2: labelTop + p.row * 15 - 9, className: 'cb-leader' }),
        h('text', { x: p.x, y: labelTop + p.row * 15, className: 'cb-pointLabel', textAnchor: 'middle' }, text))
    }),
    spans.map((s, i) => {
      const x = sx(s.a)
      const w = Math.max(6, sx(s.b) - x)
      const y = spansTop + i * 36
      const full = `${s.label} · ${formatDay(toTime(s.from), locale, 0)} – ${formatDay(toTime(s.to), locale, 0)}`
      return h('g', { key: `s${i}` },
        h('title', null, full),
        h('rect', { x, y, width: w, height: 12, rx: 6, fill: toneColor(s.tone ?? 'accent'), fillOpacity: 0.22 }),
        h('text', { x: Math.min(Math.max(x + w / 2, pad + Math.min(plotW, textWidth(full) * 0.55) / 2), width - pad - Math.min(plotW, textWidth(full) * 0.55) / 2), y: y + 26, className: 'cb-spanLabel', textAnchor: 'middle' }, fit(full, plotW)))
    })))
}

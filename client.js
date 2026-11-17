/*
 * Browser half of dsh-card-board: the Boards entry in the sidebar and its
 * page in the main column.
 *
 * Plain JavaScript in DSH's Client module format (no build step); React
 * comes from the page's module table. The page asks the Host for the boards
 * this person may see, shows one at a time, and polls the open board with
 * If-None-Match while the tab is visible. Charts are small hand-drawn SVGs
 * sized to their card, coloured only through DSH's theme tokens, so light and
 * dark both follow the app.
 */
window.__ModuleLoader__.load({
  id: '@soffits/dsh-card-board',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } = React

    const NS = 'dsh-card-board'
    const PANEL = 'dsh-card-board'
    const STYLE_ID = 'dsh-card-board-style'
    const STORE_KEY = 'dsh-card-board:board'
    const api = path => new URL(`api/card-board/${path}`, document.baseURI).href

    // ---- the page's own words -------------------------------------------------------
    // One file per language in the package's locale folder (`ui` in locale/<tag>.json), served by the
    // Host for the active language; the action buttons (client.actions.js) take theirs from the same
    // files under `action.`. The code names no language. A test fails when a component renders a
    // literal string instead of one of these.

    const messageRequests = new Map()
    /** The words for a DSH language id, fetched once per page load (a failed fetch is tried again next time). */
    function fetchMessages(tag) {
      if (!messageRequests.has(tag)) {
        const request = fetch(api(`locale?tag=${encodeURIComponent(tag)}`), { credentials: 'same-origin' })
          .then(response => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
          .then(body => body.messages)
        request.catch(() => messageRequests.delete(tag))
        messageRequests.set(tag, request)
      }
      return messageRequests.get(tag)
    }

    /** What a card writes for a person to read: a string, or a map of language id → string (`en` always there). */
    function pickText(value, active) {
      if (typeof value !== 'object' || value === null) return value
      const byId = new Map(Object.entries(value).map(([id, text]) => [id.toLowerCase(), text]))
      const tag = String(active ?? 'en').toLowerCase()
      const primary = tag.split('-')[0]
      return byId.get(tag) ?? byId.get(primary) ?? [...byId].find(([id]) => id.split('-')[0] === primary)?.[1] ?? byId.get('en') ?? [...byId.values()][0] ?? ''
    }

    /** A card copy whose texts are resolved: walks the whole tree, so every component sees plain strings. */
    function pickCard(card, active) {
      const walk = value => {
        if (Array.isArray(value)) return value.map(walk)
        if (typeof value !== 'object' || value === null) return value
        const keys = Object.keys(value)
        if (keys.length > 0 && 'en' in value && keys.every(key => /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(key)) && keys.every(key => typeof value[key] === 'string')) return pickText(value, active)
        return Object.fromEntries(keys.map(key => [key, key === 'payload' ? value[key] : walk(value[key])]))
      }
      return walk(card)
    }

    const fill = (text, params) => String(text).replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match))

    /** The language id as an Intl locale, when this browser knows it. */
    function intlTag(active) {
      try {
        return Intl.DateTimeFormat.supportedLocalesOf(active).length > 0 ? active : 'en'
      } catch {
        return 'en'
      }
    }

    const translator = messages => (key, params) => {
      const text = messages[key] ?? key
      return params ? fill(text, params) : text
    }

    /** The client context: the locale service and the Web UI services the actions reach (set in apply). */
    let clientCtx = null

    /**
     * DSH's active language, live (the same value `useLocale(s => s.active)` gives a TSX plugin), with the
     * page's words for it. `ready` turns true when they have arrived; a switch keeps the old words until the new ones do.
     */
    function useActiveLocale() {
      const subscribe = useCallback(listener => clientCtx.locale.subscribe(listener), [])
      const active = React.useSyncExternalStore(subscribe, () => clientCtx.locale.getSnapshot().active)
      const [loaded, setLoaded] = useState(null)
      const [attempt, setAttempt] = useState(0)
      useEffect(() => {
        let live = true
        let timer
        fetchMessages(active).then(
          messages => { if (live) setLoaded({ active, messages }) },
          () => { if (live) timer = setTimeout(() => setAttempt(count => count + 1), 3000) })
        return () => { live = false; clearTimeout(timer) }
      }, [active, attempt])
      return useMemo(() => ({ active: loaded?.active ?? active, ready: loaded !== null, intl: intlTag(loaded?.active ?? active), t: translator(loaded?.messages ?? {}) }), [loaded, active])
    }

    /** The shared action buttons (client.actions.js), loaded with the page. */
    let actionsModule
    const loadActions = () => {
      actionsModule ??= require.async('./client.actions.js').catch(error => {
        actionsModule = undefined
        throw error
      })
      return actionsModule
    }

    // ---- numbers, dates, tones -------------------------------------------------

    const TONES = { ok: 'var(--cb-ok)', warn: 'var(--cb-warn)', bad: 'var(--cb-bad)', muted: 'var(--cb-muted)', accent: 'var(--cb-accent)' }
    const PALETTE = ['var(--cb-accent)', 'var(--cb-ok)', 'var(--cb-warn)', 'var(--cb-violet)', 'var(--cb-bad)', 'var(--cb-muted)']
    const toneColor = (tone, index = 0) => TONES[tone] ?? PALETTE[index % PALETTE.length]

    function formatNumber(value, locale, digits) {
      if (typeof value !== 'number') return String(value)
      const abs = Math.abs(value)
      const max = digits ?? (abs >= 1000 ? 0 : abs >= 100 ? 1 : 2)
      return new Intl.NumberFormat(locale, { maximumFractionDigits: max }).format(value)
    }

    /** Short axis numbers in the language's own way: 18,240 → 18.2K, 1.8万. */
    function formatAxis(value, locale) {
      const abs = Math.abs(value)
      if (abs >= 1e4) return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: abs >= 1e5 ? 0 : 1 }).format(value)
      return formatNumber(value, locale, abs >= 100 ? 0 : 1)
    }

    const DAY_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
    /** A date string as a time: a bare day is local midnight, so it labels as that day everywhere. */
    function toTime(value) {
      if (typeof value !== 'string') return NaN
      const day = DAY_ONLY.exec(value)
      if (day) return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])).getTime()
      return /^\d{4}-\d{2}-\d{2}T/.test(value) ? Date.parse(value) : NaN
    }

    function formatDay(time, locale, spanDays) {
      const date = new Date(time)
      if (spanDays > 120) return new Intl.DateTimeFormat(locale, { month: 'short' }).format(date)
      return new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric' }).format(date)
    }

    /** How long ago, in the language's own units: 3 min, 5 h, 2 d. */
    function formatAge(seconds, locale) {
      const [unit, amount] = seconds < 3600 ? ['minute', Math.max(1, Math.round(seconds / 60))] : seconds < 86400 * 2 ? ['hour', Math.round(seconds / 3600)] : ['day', Math.round(seconds / 86400)]
      return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'short' }).format(amount)
    }

    function formatUpdated(time, locale) {
      const date = new Date(time)
      const today = new Date()
      const sameDay = date.toDateString() === today.toDateString()
      return new Intl.DateTimeFormat(locale, sameDay ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
    }

    /** About this many pixels for 11px label text: CJK characters are about twice as wide. */
    const textWidth = text => [...String(text)].reduce((sum, char) => sum + (char.charCodeAt(0) > 0x2e7f ? 11.5 : 6.4), 0)

    /** `text` cut with an ellipsis to fit about `px` pixels of label text. */
    function fit(text, px) {
      if (textWidth(text) <= px) return String(text)
      let out = ''
      for (const char of String(text)) {
        if (textWidth(`${out}${char}…`) > px) break
        out += char
      }
      return `${out}…`
    }

    /** Round tick values covering [min, max], about `count` of them. */
    function niceTicks(min, max, count) {
      if (min === max) return [min]
      const raw = (max - min) / Math.max(1, count)
      const power = 10 ** Math.floor(Math.log10(raw))
      const step = [1, 2, 2.5, 5, 10].map(m => m * power).find(s => s >= raw) ?? raw
      const ticks = []
      for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toFixed(10)))
      return ticks
    }

    /** Evenly spaced indexes, at most `count`, always including the last. */
    function spread(length, count) {
      if (length <= count) return Array.from({ length }, (_, i) => i)
      const step = (length - 1) / Math.max(1, count - 1)
      return Array.from({ length: count }, (_, i) => Math.round(i * step))
    }

    /** A callback ref and the width of the element it is on, kept up to date as the element resizes (or appears later). */
    function useWidth() {
      const [element, setElement] = useState(null)
      const [width, setWidth] = useState(0)
      useLayoutEffect(() => {
        if (!element) return undefined
        const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
        observer.observe(element)
        return () => observer.disconnect()
      }, [element])
      return [setElement, width]
    }

    // ---- pieces shared by cards ------------------------------------------------

    /** Text that shortens to fit; hover shows all of it, and a tap opens it up (or closes it again). */
    function Trunc({ text, as = 'div', className = '', lines = 1 }) {
      const [open, setOpen] = useState(false)
      return h(as, {
        className: `cb-trunc${lines > 1 ? ' cb-trunc2' : ''}${open ? ' cb-truncOpen' : ''} ${className}`.trim(),
        title: text,
        onClick: () => setOpen(value => !value),
      }, text)
    }

    function Chip({ text, tone }) {
      return h('span', { className: 'cb-chip', 'data-tone': tone ?? 'muted', title: text }, text)
    }

    function Legend({ items, locale }) {
      return h('ul', { className: 'cb-legend' }, items.map((item, i) =>
        h('li', { key: i },
          h('i', { style: { background: item.color } }),
          h(Trunc, { as: 'span', text: item.label }),
          item.value !== undefined && h('b', null, formatNumber(item.value, locale)))))
    }

    function StatBlock({ data, locale, compact }) {
      return h('div', { className: `cb-stats${compact ? ' cb-statsCompact' : ''}` }, data.items.map((item, i) =>
        h('div', { key: i, className: 'cb-stat' },
          !compact && h(Trunc, { className: 'cb-statLabel', text: item.label }),
          h('div', { className: 'cb-statValue', style: item.tone ? { color: toneColor(item.tone) } : undefined },
            h('span', null, formatNumber(item.value, locale)),
            item.unit && h('small', null, item.unit),
            item.delta && h('em', { className: 'cb-delta', style: { color: toneColor(item.delta.tone ?? 'muted') } },
              `${item.delta.value > 0 ? '▲' : item.delta.value < 0 ? '▼' : '•'} ${formatNumber(Math.abs(item.delta.value), locale)}${item.delta.unit ? ` ${item.delta.unit}` : ''}`)),
          (compact ? [item.label, item.sub].filter(Boolean).join(' · ') : item.sub) &&
            h(Trunc, { className: 'cb-statSub', lines: 2, text: compact ? [item.label, item.sub].filter(Boolean).join(' · ') : item.sub }))))
    }

    // ---- line ----------------------------------------------------------------

    function LineChart({ data, locale, height }) {
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

      return h('div', { ref, className: 'cb-chart', style: { height } }, width > 0 && h('svg', { width, height, role: 'img' },
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
            valid.length <= 16 && valid.map((p, j) => h('circle', { key: j, cx: sx(p.x), cy: sy(p.y), r: 2.6, fill: 'var(--cb-card)', stroke: color, strokeWidth: 1.6 },
              h('title', null, `${s.name ? `${s.name} · ` : ''}${xLabel(p.x)}: ${formatNumber(p.y, locale)}${data.unit ? ` ${data.unit}` : ''}`))),
            valid.length > 16 && last && h('circle', { cx: sx(last.x), cy: sy(last.y), r: 3, fill: color }))
        })))
    }

    // ---- bar -----------------------------------------------------------------

    function BarChart({ data, locale, height }) {
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
      return h('div', null,
        h('div', { ref, className: 'cb-chart', style: { height } }, width > 0 && h('svg', { width, height, role: 'img' },
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
                rx: Math.min(4, p.w / 3), fill: p.color, fillOpacity: multi ? 0.85 : 0.55,
              })),
              showValues && h('text', { x: cx, y: sy(peaks[i]) - 4, className: 'cb-barValue', textAnchor: 'middle' }, formatNumber(multi && !stacked ? peaks[i] : totals[i], locale, 1)),
              i % labelEvery === 0 && h('text', { x: Math.min(Math.max(cx, textWidth(label(bar.x)) / 2), width - textWidth(label(bar.x)) / 2), y: height - 4, className: 'cb-axis', textAnchor: 'middle' }, label(bar.x)))
          }))),
        multi && h(Legend, { items: keys.map((key, k) => ({ label: key, color: toneColor(undefined, k) })), locale }))
    }

    // ---- donut ---------------------------------------------------------------

    function arc(cx, cy, r, start, end) {
      const large = end - start > Math.PI ? 1 : 0
      const x0 = cx + r * Math.sin(start)
      const y0 = cy - r * Math.cos(start)
      const x1 = cx + r * Math.sin(end)
      const y1 = cy - r * Math.cos(end)
      return `M${x0.toFixed(2)},${y0.toFixed(2)}A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`
    }

    function Donut({ data, locale, height }) {
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
            h('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: 'var(--cb-track)', strokeWidth: ring }),
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

    // ---- list ----------------------------------------------------------------

    function CheckGlyph({ checked }) {
      return h('svg', { className: 'cb-check', 'data-checked': checked ? 'true' : 'false', width: 18, height: 18, viewBox: '0 0 18 18', 'aria-hidden': true },
        h('rect', { x: 1, y: 1, width: 16, height: 16, rx: 4.5 }),
        checked && h('path', { d: 'M5 9.4l2.6 2.5L13 6.4' }))
    }

    function ProgressRing({ progress, size }) {
      const ring = Math.max(6, size * 0.12)
      const r = size / 2 - ring / 2
      const share = progress.total > 0 ? Math.min(1, progress.done / progress.total) : 0
      return h('div', { className: 'cb-donutRing', style: { width: size, height: size } },
        h('svg', { width: size, height: size, role: 'img', 'aria-label': `${progress.done}/${progress.total}` },
          h('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: 'var(--cb-track)', strokeWidth: ring }),
          share >= 1
            ? h('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: 'var(--cb-accent)', strokeWidth: ring })
            : share > 0 && h('path', { d: arc(size / 2, size / 2, r, 0, share * Math.PI * 2), fill: 'none', stroke: 'var(--cb-accent)', strokeWidth: ring, strokeLinecap: 'round' })),
        h('div', { className: 'cb-donutCentre' },
          h('strong', { style: { fontSize: Math.round(size * 0.19) } }, `${progress.done}/${progress.total}`),
          progress.label && size >= 90 && h('span', null, progress.label)))
    }

    function ListCard({ data, locale, t, rowActions }) {
      const [ref, width] = useWidth()
      const checkable = data.rows.some(row => 'checked' in row)
      const rows = data.rows.length === 0
        ? h('p', { className: 'cb-muted' }, data.empty ?? t('listEmpty'))
        : h('ul', { className: 'cb-list' }, data.rows.map((row, i) =>
          h('li', { key: i, className: row.checked ? 'cb-done' : undefined },
            checkable && h('span', { className: 'cb-checkBox', role: 'img', 'aria-label': t(row.checked ? 'checked' : 'unchecked') }, h(CheckGlyph, { checked: row.checked === true })),
            h('div', { className: 'cb-listText' },
              h(Trunc, { className: 'cb-listTitle', lines: 2, text: row.title }),
              row.sub && h(Trunc, { className: 'cb-listSub', lines: 2, text: row.sub })),
            row.date && h('span', { className: 'cb-listDate' }, formatDay(toTime(row.date), locale, 0)),
            row.chip && h(Chip, row.chip),
            row.actions && rowActions && h('span', { className: 'cb-rowActions' }, rowActions(i, row.actions, listRowLine(row))))))
      if (!data.progress) return rows
      // Beside the rows when there is room for both, else a small ring with its count above them.
      const wide = width >= 460
      return h('div', { ref, className: `cb-listWrap${wide ? '' : ' cb-listWrapNarrow'}` },
        width > 0 && (wide
          ? h(ProgressRing, { progress: data.progress, size: Math.min(140, Math.round(width * 0.28)) })
          : h('div', { className: 'cb-progressLine' },
            h(ProgressRing, { progress: { ...data.progress, label: undefined }, size: 40 }),
            data.progress.label && h('span', null, data.progress.label))),
        h('div', { className: 'cb-listMain' }, rows))
    }

    // ---- timeline ------------------------------------------------------------

    const KIND_TONE = { due: 'warn', health: 'ok', event: 'accent', home: 'muted', money: 'ok', travel: 'accent' }

    function PlaneGlyph({ x, y, color }) {
      return h('path', {
        transform: `translate(${x - 7},${y - 7}) scale(0.58)`,
        d: 'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
        fill: color,
      })
    }

    function Timeline({ data, locale, t }) {
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
            p.kind === 'travel' ? h(PlaneGlyph, { x: p.x, y: pointY, color }) : h('circle', { cx: p.x, cy: pointY, r: 5, fill: color }),
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

    // ---- status --------------------------------------------------------------

    function Spark({ values, color }) {
      const [ref, width] = useWidth()
      const height = 22
      const min = Math.min(...values)
      const max = Math.max(...values)
      const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${((i / (values.length - 1)) * (width - 4) + 2).toFixed(1)},${(height - 3 - ((v - min) / (max - min || 1)) * (height - 6)).toFixed(1)}`).join('')
      return h('div', { ref, className: 'cb-spark' }, width > 0 && h('svg', { width, height, 'aria-hidden': true },
        h('path', { d, fill: 'none', stroke: color, strokeWidth: 1.5, strokeLinejoin: 'round', strokeLinecap: 'round' })))
    }

    function StatusCard({ data, locale, rowActions }) {
      const sparks = data.rows.some(row => row.spark)
      const hasActions = data.rows.some(row => row.actions?.length > 0)
      return h('ul', { className: `cb-status${sparks ? ' cb-statusSparks' : ''}${hasActions ? ' cb-statusActions' : ''}` }, data.rows.map((row, i) =>
        h('li', { key: i },
          h('i', { className: 'cb-dot', style: { background: toneColor(row.tone) } }),
          h(Trunc, { as: 'span', className: 'cb-statusLabel', text: row.label }),
          h('span', { className: 'cb-statusValue' },
            h('span', { className: 'cb-statusNum', style: row.tone === 'bad' || row.tone === 'warn' ? { color: toneColor(row.tone) } : undefined }, formatNumber(row.value, locale)),
            row.sub && h(Trunc, { as: 'small', className: 'cb-statusSub', lines: 2, text: row.sub })),
          sparks && (row.spark ? h(Spark, { values: row.spark, color: toneColor(row.tone === 'ok' ? 'accent' : row.tone) }) : h('span', { className: 'cb-spark' })),
          hasActions && h('span', { className: 'cb-rowActions' }, rowActions && row.actions ? rowActions(i, row.actions, statusRowLine(row, locale)) : null))))
    }

    // ---- what a chat quotes ----------------------------------------------------

    function withUnit(value, unit, locale) {
      return `${formatNumber(value, locale)}${unit ? ` ${unit}` : ''}`
    }

    function statLines(data, locale) {
      return data.items.map(item => `${item.label}: ${withUnit(item.value, item.unit, locale)}${item.delta ? ` (${item.delta.value > 0 ? '+' : ''}${formatNumber(item.delta.value, locale)}${item.delta.unit ? ` ${item.delta.unit}` : ''})` : ''}${item.sub ? ` · ${item.sub}` : ''}`)
    }

    function listRowLine(row) {
      const box = 'checked' in row ? (row.checked ? '☑ ' : '☐ ') : ''
      return `${box}${row.title}${row.sub ? ` · ${row.sub}` : ''}${row.date ? ` · ${row.date}` : ''}${row.chip ? ` [${row.chip.text}]` : ''}`
    }

    function statusRowLine(row, locale) {
      return `${row.label}: ${formatNumber(row.value, locale)}${row.sub ? ` · ${row.sub}` : ''}`
    }

    /** A few plain lines saying what a card shows, for the agent. */
    function summaryLines(card, locale, t) {
      const data = card.data
      const lines = card.stat ? statLines(card.stat, locale) : []
      switch (card.type) {
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

    /** Press states by action id for the card (row undefined) or one row: the latest press wins. */
    function statesOf(presses, row) {
      const states = {}
      for (const press of presses ?? []) if (press.row === row) states[press.id] = press.state
      return states
    }

    // ---- card frame ----------------------------------------------------------

    const CHART_HEIGHT = { 1: 150, 2: 360, 3: 560 }
    /** One column (a phone): taller cards would only scroll further, so charts stay moderate. */
    const CHART_HEIGHT_NARROW = { 1: 150, 2: 220, 3: 260 }

    function CardBody({ card, size, narrow, locale, t, rowActions }) {
      const height = (narrow ? CHART_HEIGHT_NARROW : CHART_HEIGHT)[size.h] - (card.stat ? 40 : 0)
      const data = card.data
      switch (card.type) {
        case 'stat': return h(StatBlock, { data, locale })
        case 'line': return h(LineChart, { data, locale, height })
        case 'bar': return h(BarChart, { data, locale, height: Math.min(height, 130 + (size.h - 1) * 200) })
        case 'donut': return h(Donut, { data, locale, height: Math.max(height, 160) })
        case 'list': return h(ListCard, { data, locale, t, rowActions })
        case 'timeline': return h(Timeline, { data, locale, t })
        case 'status': return h(StatusCard, { data, locale, rowActions })
        default: return null
      }
    }

    function LinkIcon() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': true, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M6 3.5H3.5v9h9V10M9 3h4v4M13 3 7.5 8.5' }))
    }

    function Card({ entry, boardId, assistant, columns, now, active, locale, t, actions }) {
      const size = { w: Math.min(entry.w ?? 1, columns), h: entry.h ?? 1 }
      const style = { gridColumn: `span ${size.w}`, gridRow: size.h > 1 && columns > 1 ? `span ${size.h}` : undefined }
      if (!entry.card) {
        return h('section', { className: 'cb-card cb-cardError', style },
          h('header', { className: 'cb-cardHead' }, h('h3', { title: entry.id }, entry.id)),
          h('p', { className: 'cb-errorText' }, t('cardError')),
          h('ul', { className: 'cb-problems' }, (entry.problems ?? []).map((p, i) => h('li', { key: i }, p))))
      }
      const card = pickCard(entry.card, active)
      const updated = Date.parse(card.updatedAt)
      const age = Math.max(0, (now - updated) / 1000)
      const stale = typeof card.staleAfter === 'number' && age > card.staleAfter
      const external = card.link && /^https?:/i.test(card.link)
      const context = row => ({ board: boardId, card: entry.id, ...(row === undefined ? {} : { row }), type: card.type, updatedAt: card.updatedAt })
      // A chat opens a new conversation whose draft quotes the card (or the row) and names it.
      const chat = (action, row, rowLine) => actions.startChat({
        text: actions.chatText({
          prompt: action.payload?.prompt ?? '',
          title: card.title,
          lines: row === undefined ? summaryLines(card, locale, t) : [rowLine],
          context: action.payload?.context ?? context(row),
        }),
        session: action.payload?.session,
      })
      // A chat button without its own label says "Ask <assistant>" when the board names one.
      const named = list => (assistant ? list?.map(action => (action.kind === 'chat' && action.label === undefined ? { ...action, label: t('action.chatNamed', { name: assistant }) } : action)) : list)
      const defaultChat = { kind: 'chat', id: '_chat', label: assistant ? t('action.chatNamed', { name: assistant }) : t('action.chatAbout') }
      const rowActions = actions && ((row, list, line) => h(actions.ActionBar, {
        actions: named(list),
        states: statesOf(entry.presses, row),
        compact: true,
        chat: action => chat(action, row, line),
        onPress: (action, extra) => actions.press(action, extra, { card: entry.id, row }),
      }))
      return h('section', { className: `cb-card${stale ? ' cb-cardStale' : ''}`, style, 'data-type': card.type },
        h('header', { className: 'cb-cardHead' },
          h(Trunc, { as: 'h3', text: card.title }),
          stale && h('span', { className: 'cb-staleChip', title: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(updated) }, t('stale', { age: formatAge(age, locale) })),
          card.link && h('a', { className: 'cb-cardLink', href: card.link, title: t('open'), 'aria-label': t('open'), ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }, h(LinkIcon)),
          actions && h('span', { className: 'cb-cardChat' }, h(actions.ActionButton, { action: defaultChat, compact: true, chat: action => chat(action) }))),
        card.stat && h(StatBlock, { data: card.stat, locale, compact: true }),
        h('div', { className: 'cb-cardBody' }, h(CardBody, { card, size, narrow: columns === 1, locale, t, rowActions })),
        actions && card.actions && h('footer', { className: 'cb-cardActions' }, h(actions.ActionBar, {
          actions: named(card.actions),
          states: statesOf(entry.presses, undefined),
          chat: action => chat(action),
          onPress: (action, extra) => actions.press(action, extra, { card: entry.id }),
        })))
    }

    // ---- page ----------------------------------------------------------------

    /** A failed request: its status says what went wrong; the server's own words stay out of the page. */
    function requestError(status, body) {
      const error = new Error(body?.error ?? `HTTP ${status}`)
      error.status = status
      return error
    }

    async function getJson(path, etag) {
      const response = await fetch(api(path), { cache: 'no-store', credentials: 'same-origin', headers: etag ? { 'if-none-match': etag } : {} })
      if (response.status === 304) return { notModified: true }
      let body = null
      try { body = await response.json() } catch { /* not JSON */ }
      if (!response.ok) throw requestError(response.status, body)
      return { body, etag: response.headers.get('etag') }
    }

    const ERROR_KEYS = { 403: 'error.forbidden', 404: 'error.notFound', 409: 'error.gone', 503: 'error.noProvider' }
    const errorText = (error, t) => (error.status === undefined ? error.message : t(ERROR_KEYS[error.status] ?? 'error.http', { status: error.status }))

    function useColumns() {
      const [ref, width] = useWidth()
      return [ref, width >= 1400 ? 4 : width >= 980 ? 3 : width >= 620 ? 2 : 1]
    }

    function BoardsPage() {
      const { active, intl: locale, ready, t } = useActiveLocale()
      const [boards, setBoards] = useState(null)
      const [listError, setListError] = useState(null)
      const [selected, setSelected] = useState(() => { try { return localStorage.getItem(STORE_KEY) } catch { return null } })
      const [board, setBoard] = useState(null)
      const [boardError, setBoardError] = useState(null)
      const [refreshFailed, setRefreshFailed] = useState(false)
      const [pollSeconds, setPollSeconds] = useState(30)
      const [now, setNow] = useState(() => Date.now())
      const etag = useRef(null)
      const [gridRef, columns] = useColumns()
      const [actions, setActions] = useState(null)
      const currentRef = useRef(null)
      // The buttons ask for words at render time, so a language switch reaches them without rebuilding them.
      const translateRef = useRef(t)
      translateRef.current = t

      const loadList = useCallback(async () => {
        try {
          const { body } = await getJson('boards')
          setBoards(body.boards)
          setPollSeconds(body.pollSeconds ?? 30)
          setListError(null)
        } catch (error) {
          setListError(error)
        }
      }, [])

      const current = boards?.some(b => b.id === selected) ? selected : boards?.[0]?.id ?? null

      const loadBoard = useCallback(async (id, fresh) => {
        if (!id) return
        try {
          const result = await getJson(`board?id=${encodeURIComponent(id)}`, fresh ? null : etag.current)
          setRefreshFailed(false)
          setBoardError(null)
          if (result.notModified) return
          etag.current = result.etag
          setBoard(result.body)
        } catch (error) {
          if (error.status === 403 || error.status === 404) { setBoard(null); setBoardError(error); loadList(); return }
          setRefreshFailed(true)
        }
      }, [loadList])

      useEffect(() => { loadList() }, [loadList])

      // The action buttons load with the page; until then (or if they fail) cards show without them.
      useEffect(() => {
        let live = true
        loadActions().then(({ createActions }) => {
          if (!live) return
          const press = async (action, extra, target) => {
            const response = await fetch(api('action'), {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ board: currentRef.current, ...target, id: action.id, ...extra }),
            })
            const body = await response.json().catch(() => null)
            if (!response.ok) throw new Error(errorText(requestError(response.status, body), translateRef.current))
            loadBoard(currentRef.current, false)
            return body
          }
          const ui = createActions({ React, ctx: clientCtx, t: (key, params) => translateRef.current(`action.${key}`, params) })
          setActions({ ...ui, press })
        }, error => console.warn('card-board: action buttons not loaded:', error))
        return () => { live = false }
      }, [loadBoard])

      useEffect(() => {
        currentRef.current = current
        if (!current) return undefined
        etag.current = null
        setBoard(prev => (prev?.id === current ? prev : null))
        loadBoard(current, true)
        let ticks = 0
        const tick = () => {
          if (document.visibilityState !== 'visible') return
          setNow(Date.now())
          loadBoard(current, false)
          if (++ticks % 10 === 0) loadList()
        }
        const timer = setInterval(tick, Math.max(5, pollSeconds) * 1000)
        const onVisible = () => { if (document.visibilityState === 'visible') { setNow(Date.now()); loadBoard(current, false); loadList() } }
        document.addEventListener('visibilitychange', onVisible)
        return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible) }
      }, [current, pollSeconds, loadBoard, loadList])

      const choose = id => {
        setSelected(id)
        try { localStorage.setItem(STORE_KEY, id) } catch { /* private mode */ }
      }

      const newest = board?.cards?.reduce((max, entry) => {
        const time = entry.card ? Date.parse(entry.card.updatedAt) : NaN
        return Number.isFinite(time) && time > max ? time : max
      }, 0)

      const titleOf = entry => pickText(entry.title, active)
      const tabs = boards && boards.length > 1 && h('div', { className: 'cb-tabs', role: 'tablist' }, boards.map(b =>
        h('button', { key: b.id, type: 'button', role: 'tab', 'aria-selected': b.id === current, className: 'cb-tab', title: titleOf(b), onClick: () => choose(b.id) }, h('span', null, titleOf(b)))))

      if (!ready) return h('div', { className: 'cb-page' })

      let content
      if (listError) content = h('p', { className: 'cb-notice' }, errorText(listError, t))
      else if (boards === null) content = h('p', { className: 'cb-muted' }, t('loading'))
      else if (boards.length === 0) content = h('div', { className: 'cb-empty' }, h('p', { className: 'cb-emptyTitle' }, t('emptyTitle')), h('p', { className: 'cb-muted' }, t('emptyHint')))
      else if (boardError) content = h('p', { className: 'cb-notice' }, errorText(boardError, t))
      else if (!board) content = h('p', { className: 'cb-muted' }, t('loading'))
      else content = h(React.Fragment, null,
        board.problems?.length > 0 && h('div', { className: 'cb-notice' }, t('boardProblems'), h('ul', { className: 'cb-problems' }, board.problems.map((p, i) => h('li', { key: i }, p)))),
        board.cards.length === 0 && h('p', { className: 'cb-muted' }, t('noCards')),
        h('div', { className: 'cb-grid', style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } },
          board.cards.map(entry => h(Card, { key: entry.id, entry, boardId: board.id, assistant: board.assistant, columns, now, active, locale, t, actions }))))

      return h('div', { className: 'cb-page' },
        h('div', { className: 'cb-content', ref: gridRef },
          h('div', { className: 'cb-heading' },
            h('h1', null, boards?.length === 1 ? titleOf(boards[0]) : t('title')),
            h('p', { className: 'cb-sub' },
              newest > 0 ? t('updated', { time: formatUpdated(newest, locale) }) : ' ',
              refreshFailed && h('span', { className: 'cb-warnText' }, ` · ${t('refreshFailed')}`))),
          tabs,
          content))
    }

    function SidebarIcon({ size }) {
      const stroke = { stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }
      return h('svg', { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': true, focusable: 'false' },
        h('rect', { x: 1.75, y: 1.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
        h('rect', { x: 8.75, y: 1.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
        h('rect', { x: 1.75, y: 8.75, width: 5.5, height: 5.5, rx: 1.4, ...stroke }),
        h('path', { d: 'M9 13.5l1.6-2 1.4 1 2-2.8', ...stroke }))
    }

    const CSS = `
.cb-page{overflow-x:hidden;--cb-ok:var(--dsw-alias-state-success-primary,#22a06b);--cb-warn:var(--dsw-alias-state-warn-primary,#f5a524);--cb-bad:var(--dsw-alias-state-error-primary,#e5484d);--cb-muted:var(--dsw-alias-state-idle-primary,#b8bec9);--cb-accent:var(--dsw-alias-state-business-primary,#3b82f6);--cb-violet:var(--dsw-alias-state-done-primary,#8b5cf6);--cb-card:var(--dsw-alias-bg-base,#fff);--cb-track:var(--dsw-alias-border-l2,#0000001a);width:100%;height:100%;min-height:0;overflow:auto;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.5;scrollbar-gutter:stable}
.cb-content{box-sizing:border-box;max-width:1680px;margin:0 auto;padding:0 clamp(16px,3.2vw,40px) 48px}
.cb-heading{padding-top:28px;margin-bottom:14px}
[data-platform=darwin] .cb-heading{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.cb-heading h1{margin:0;font-size:22px;font-weight:600;line-height:30px}
.cb-sub{margin:2px 0 0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.cb-warnText{color:var(--cb-warn)}
.cb-tabs{display:flex;flex-wrap:wrap;gap:0 4px;margin:0 0 18px;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.cb-tab{position:relative;flex:0 1 auto;min-width:40px;justify-content:center;display:inline-flex;align-items:center;min-width:0;max-width:100%;min-height:40px;padding:8px 12px 10px;border:0;background:none;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:14px;cursor:pointer;border-radius:8px 8px 0 0}
.cb-tab span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:min(60vw,260px)}
.cb-tab[aria-selected=true]{color:var(--dsw-alias-label-primary);font-weight:500}
.cb-tab[aria-selected=true]:after{content:"";position:absolute;left:10px;right:10px;bottom:-.5px;height:2px;border-radius:2px;background:var(--cb-accent)}
@media (hover:hover){.cb-tab:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}}
.cb-grid{display:grid;gap:14px;grid-auto-flow:row dense;align-items:stretch}
.cb-card{container-type:inline-size;box-sizing:border-box;min-width:0;display:flex;flex-direction:column;gap:10px;padding:16px 18px 18px;border-radius:16px;background:var(--cb-card);box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l2)}
.cb-cardHead{display:flex;align-items:center;gap:8px;min-height:22px}
.cb-cardHead h3{flex:1;min-width:0;margin:0;font-size:15px;font-weight:600;line-height:22px}
.cb-trunc{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cb-trunc2{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}
.cb-truncOpen{white-space:normal;display:block;overflow:visible;overflow-wrap:anywhere}
h3.cb-truncOpen{overflow:visible}
.cb-cardChat{display:inline-flex;margin:-5px -8px -5px 0}
.cb-cardActions{padding-top:4px}
.cb-rowActions{display:inline-flex;flex-wrap:wrap;justify-content:flex-end;min-width:0}
.cb-statusActions{grid-template-columns:8px fit-content(45%) minmax(0,1fr) auto}
.cb-statusSparks.cb-statusActions{grid-template-columns:8px fit-content(40%) minmax(0,1fr) minmax(56px,1.2fr) auto}
.cb-cardLink{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;margin:-5px 0;border-radius:6px;color:var(--dsw-alias-label-tertiary)}
@media (hover:hover){.cb-cardLink:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}
.cb-staleChip{flex:0 1 auto;min-width:0;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:1px 8px;border-radius:999px;font-size:11px;line-height:18px;color:var(--dsw-alias-state-warn-label,var(--cb-warn));background:color-mix(in srgb,var(--cb-warn) 14%,transparent)}
.cb-cardStale .cb-cardBody,.cb-cardStale .cb-stats{opacity:.62}
.cb-cardBody{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-start}
.cb-cardError{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--cb-bad) 35%,transparent)}
.cb-errorText{margin:0;color:var(--cb-bad);font-size:13px}
.cb-problems{margin:6px 0 0;padding:0 0 0 16px;color:var(--dsw-alias-label-tertiary);font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}
.cb-notice{margin:0 0 14px;padding:10px 14px;border-radius:12px;background:color-mix(in srgb,var(--cb-warn) 10%,transparent);color:var(--dsw-alias-label-secondary);font-size:13px}
.cb-muted{margin:0;color:var(--dsw-alias-label-tertiary);font-size:13px}
.cb-empty{padding:48px 0;text-align:center}
.cb-emptyTitle{margin:0 0 4px;color:var(--dsw-alias-label-secondary)}
.cb-chart{position:relative;width:100%;min-width:0}
.cb-chart svg,.cb-donutRing svg{display:block;overflow:visible}
.cb-rule{stroke:var(--dsw-alias-border-l2);stroke-width:1;shape-rendering:crispEdges}
.cb-axis{fill:var(--dsw-alias-label-caption);font-size:11px}
.cb-goal{stroke:var(--dsw-alias-label-caption);stroke-width:1.2;stroke-dasharray:4 4;fill:none}
.cb-goalLabel{fill:var(--dsw-alias-label-tertiary);font-size:11px}
.cb-marker{stroke:var(--dsw-alias-border-l3);stroke-dasharray:2 3}
.cb-markerLabel{fill:var(--dsw-alias-label-tertiary);font-size:11px}
.cb-barValue{fill:var(--dsw-alias-label-secondary);font-size:11px}
.cb-dayLine{stroke:var(--dsw-alias-border-l1,var(--dsw-alias-border-l2));stroke-dasharray:2 4}
.cb-today{stroke:var(--cb-accent);stroke-width:1.2;stroke-opacity:.6}
.cb-leader{stroke:var(--dsw-alias-border-l3)}
.cb-pointLabel{fill:var(--dsw-alias-label-secondary);font-size:12px}
.cb-spanLabel{fill:var(--dsw-alias-label-tertiary);font-size:12px}
.cb-stats{display:flex;flex-wrap:wrap;gap:12px 28px}
.cb-stat{min-width:0}
.cb-statLabel{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.cb-statValue{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 6px;font-size:28px;font-weight:600;line-height:36px;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.cb-statValue small{font-size:15px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.cb-statsCompact .cb-statValue{font-size:26px;line-height:32px}
.cb-delta{font-style:normal;font-size:12px;font-weight:500}
.cb-statSub{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.cb-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin:8px 0 0;padding:0;list-style:none;color:var(--dsw-alias-label-secondary);font-size:12px}
.cb-legend li{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:100%}
.cb-legend i,.cb-donutTable i{display:inline-block;width:8px;height:8px;border-radius:50%}
.cb-legend b{font-weight:500;color:var(--dsw-alias-label-tertiary)}
.cb-donut{display:flex;align-items:center;gap:24px}
.cb-donutNarrow{flex-direction:column;align-items:stretch;gap:12px}
.cb-donutNarrow .cb-donutRing{align-self:center}
.cb-donutRing{position:relative;flex:none}
.cb-donutCentre{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.cb-donutCentre strong{font-size:22px;font-weight:600;line-height:28px;font-variant-numeric:tabular-nums}
.cb-donutCentre span{color:var(--dsw-alias-label-tertiary);font-size:12px}
.cb-donutTable{flex:1;min-width:0;border-collapse:collapse;font-size:13px}
.cb-donutTable td{padding:4px 0;white-space:nowrap}
.cb-donutTable td:first-child{width:8px;padding-right:10px}
.cb-donutLabel{max-width:0;width:100%}
.cb-num{text-align:right;padding-left:14px!important;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}
.cb-dim{color:var(--dsw-alias-label-tertiary)}
.cb-list{list-style:none;margin:0;padding:0}
.cb-listWrap{display:flex;align-items:center;gap:24px}
.cb-listWrapNarrow{flex-direction:column;align-items:stretch;gap:6px}
.cb-progressLine{display:flex;align-items:center;gap:10px;color:var(--dsw-alias-label-tertiary);font-size:13px}
.cb-progressLine strong{font-size:10px!important}

.cb-listMain{flex:1;min-width:0}
.cb-list li{display:flex;align-items:center;gap:10px;padding:8px 2px;border-top:.5px solid var(--dsw-alias-border-l2)}
.cb-list li:first-child{border-top:0}
.cb-listText{flex:1;min-width:0}
.cb-listSub{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.cb-listDate{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;font-variant-numeric:tabular-nums}
.cb-done .cb-listTitle{color:var(--dsw-alias-label-tertiary)}
.cb-checkBox{flex:none;display:inline-flex}
.cb-check rect{fill:none;stroke:var(--dsw-alias-border-l4,var(--dsw-alias-label-caption));stroke-width:1.3}
.cb-check[data-checked=true] rect{fill:var(--cb-accent);stroke:var(--cb-accent)}
.cb-check path{fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.cb-chip{flex:0 1 auto;max-width:11em;overflow:hidden;text-overflow:ellipsis;padding:1px 8px;border-radius:6px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover,#0000000d);font-variant-numeric:tabular-nums;white-space:nowrap}
.cb-chip[data-tone=ok]{color:var(--cb-ok);background:color-mix(in srgb,var(--cb-ok) 12%,transparent)}
.cb-chip[data-tone=warn]{color:var(--dsw-alias-state-warn-label,var(--cb-warn));background:color-mix(in srgb,var(--cb-warn) 14%,transparent)}
.cb-chip[data-tone=bad]{color:var(--cb-bad);background:color-mix(in srgb,var(--cb-bad) 12%,transparent)}
.cb-chip[data-tone=accent]{color:var(--cb-accent);background:color-mix(in srgb,var(--cb-accent) 12%,transparent)}
.cb-status{list-style:none;margin:0;padding:0}
.cb-status{display:grid;grid-template-columns:8px fit-content(45%) minmax(0,1fr);column-gap:12px}
.cb-statusSparks{grid-template-columns:8px fit-content(40%) minmax(0,1fr) minmax(56px,1.2fr)}
.cb-status li{grid-column:1/-1;display:grid;grid-template-columns:subgrid;align-items:center;padding:8px 2px;border-top:.5px solid var(--dsw-alias-border-l2)}
.cb-status li:first-child{border-top:0}
.cb-dot{width:8px;height:8px;border-radius:50%}
.cb-statusLabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cb-statusValue{min-width:0;display:flex;flex-direction:column;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.cb-statusValue small{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:16px}
.cb-spark{min-width:0}
@container (width<380px){
.cb-list li{flex-wrap:wrap}
.cb-list li .cb-listText{flex:1 1 9em}
.cb-list li .cb-rowActions{flex:1 0 100%;justify-content:flex-start;padding-left:28px}
}
@container (width<380px){
.cb-status,.cb-statusSparks,.cb-statusActions,.cb-statusSparks.cb-statusActions{grid-template-columns:8px minmax(0,1fr) auto}
.cb-statusValue{display:contents}
.cb-status li>.cb-dot{grid-column:1;grid-row:1}
.cb-statusLabel{grid-column:2;grid-row:1}
.cb-statusNum{grid-column:3;grid-row:1;justify-self:end}
.cb-statusSub{grid-column:2/-1;grid-row:2}
.cb-status li>.cb-spark{grid-column:2/-1;grid-row:3}
.cb-spark:empty{display:none}
.cb-statusActions li .cb-rowActions{grid-column:2/-1;grid-row:4;justify-content:flex-start}
}
@media (width<=640px){.cb-heading{padding-top:18px}.cb-heading h1{font-size:20px}.cb-card{padding:14px 14px 16px;border-radius:14px}.cb-statValue{font-size:24px;line-height:30px}}
@media (width<=768px),(pointer:coarse){
.cb-cardLink{width:40px;height:40px;margin:-9px 0}
.cb-cardChat{margin:-9px -10px -9px 0}
.cb-tab{padding:8px 14px 10px}
}
`

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        clientCtx = ctx
        // The sidebar entry's name comes from the same locale files: fetched for the active language, then
        // handed to DSH's own dictionary (which also makes the sidebar redraw).
        let forget = () => {}
        ctx.effect(() => {
          let live = true
          let loadedFor = null
          const load = () => {
            const active = ctx.locale.getSnapshot().active
            // Registering the words is itself a locale change notification, so only a new language starts a load.
            if (active === loadedFor) return
            loadedFor = active
            fetchMessages(active).then(messages => {
              if (!live) return
              forget()
              try {
                forget = ctx.locale.register(NS, active, { panel: messages.panel })
              } catch (error) {
                console.warn('card-board: sidebar name not registered:', error)
              }
            }, () => { if (live) { loadedFor = null; setTimeout(load, 3000) } })
          }
          load()
          const stop = ctx.locale.subscribe(load)
          return () => { live = false; stop(); forget() }
        }, 'card-board: sidebar words')
        const sidebarT = ctx.locale.bind(NS)

        ctx.effect(() => {
          if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return () => {}
          const tag = document.createElement('style')
          tag.id = STYLE_ID
          tag.dataset.plugin = '@soffits/dsh-card-board'
          tag.textContent = CSS
          document.head.appendChild(tag)
          return () => tag.remove()
        }, 'card-board: styles')

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL,
          locale: NS,
        }, BoardsPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL,
          order: 13,
          locale: NS,
          label: () => {
            const text = sidebarT('panel')
            return text === 'panel' ? '' : text
          },
        }, SidebarIcon))
      },
    }
  },
})

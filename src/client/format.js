/**
 * Numbers, dates and text sizes for charts and cards, in the language's own way (Intl), plus the width of an element.
 */
import { useLayoutEffect, useState } from 'react'

export function formatNumber(value, locale, digits) {
  if (typeof value !== 'number') return String(value)
  const abs = Math.abs(value)
  const max = digits ?? (abs >= 1000 ? 0 : abs >= 100 ? 1 : 2)
  return new Intl.NumberFormat(locale, { maximumFractionDigits: max }).format(value)
}

/** Short axis numbers in the language's own way: 18,240 → 18.2K, 1.8万. */
export function formatAxis(value, locale) {
  const abs = Math.abs(value)
  if (abs >= 1e4) return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: abs >= 1e5 ? 0 : 1 }).format(value)
  return formatNumber(value, locale, abs >= 100 ? 0 : 1)
}

const DAY_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/
/** A date string as a time: a bare day is local midnight, so it labels as that day everywhere. */
export function toTime(value) {
  if (typeof value !== 'string') return NaN
  const day = DAY_ONLY.exec(value)
  if (day) return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])).getTime()
  return /^\d{4}-\d{2}-\d{2}T/.test(value) ? Date.parse(value) : NaN
}

export function formatDay(time, locale, spanDays) {
  const date = new Date(time)
  if (spanDays > 120) return new Intl.DateTimeFormat(locale, { month: 'short' }).format(date)
  return new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric' }).format(date)
}

/** How long ago, in the language's own units: 3 min, 5 h, 2 d. */
export function formatAge(seconds, locale) {
  const [unit, amount] = seconds < 3600 ? ['minute', Math.max(1, Math.round(seconds / 60))] : seconds < 86400 * 2 ? ['hour', Math.round(seconds / 3600)] : ['day', Math.round(seconds / 86400)]
  return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'short' }).format(amount)
}

export function formatClock(time, locale, zone) {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', ...(zone ? { timeZone: zone } : {}) }).format(time)
}

/** About this many pixels for 11px label text: CJK characters are about twice as wide. */
export const textWidth = text => [...String(text)].reduce((sum, char) => sum + (char.charCodeAt(0) > 0x2e7f ? 11.5 : 6.4), 0)

/** `text` cut with an ellipsis to fit about `px` pixels of label text. */
export function fit(text, px) {
  if (textWidth(text) <= px) return String(text)
  let out = ''
  for (const char of String(text)) {
    if (textWidth(`${out}${char}…`) > px) break
    out += char
  }
  return `${out}…`
}

/** Round tick values covering [min, max], about `count` of them. */
export function niceTicks(min, max, count) {
  if (min === max) return [min]
  const raw = (max - min) / Math.max(1, count)
  const power = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map(m => m * power).find(s => s >= raw) ?? raw
  const ticks = []
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toFixed(10)))
  return ticks
}

/** Evenly spaced indexes, at most `count`, always including the last. */
export function spread(length, count) {
  if (length <= count) return Array.from({ length }, (_, i) => i)
  const step = (length - 1) / Math.max(1, count - 1)
  return Array.from({ length: count }, (_, i) => Math.round(i * step))
}

/** A callback ref and the width of the element it is on, kept up to date as the element resizes (or appears later). */
export function useWidth() {
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

/** Whether `now` falls inside a row's `active: { from, to }`. */
export const isActive = (active, now) => active !== undefined && Date.parse(active.from) <= now && now < Date.parse(active.to)

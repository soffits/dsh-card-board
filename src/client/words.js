/**
 * The page's own words and the card text in the person's language.
 *
 * The page's words are one file per language in the package's locale folder (`ui` in locale/<tag>.json), served by
 * the Host for the active language. Card text is a string or a map of language id → string with `en` always there;
 * the page picks the active language, its primary tag, then English. The code names no language.
 */
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { api } from './services.js'

const messageRequests = new Map()

/** The words for a DSH language id, fetched once per page load (a failed fetch is tried again next time). */
export function fetchMessages(tag) {
  if (!messageRequests.has(tag)) {
    const request = fetch(api(`locale?tag=${encodeURIComponent(tag)}`), { credentials: 'same-origin' })
      .then(response => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
      .then(body => body.messages)
    request.catch(() => messageRequests.delete(tag))
    messageRequests.set(tag, request)
  }
  return messageRequests.get(tag)
}

const LANGUAGE_KEY = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/

/** What a card writes for a person to read: a string, or a map of language id → string. */
export function pickText(value, active) {
  if (typeof value !== 'object' || value === null) return value
  const byId = new Map(Object.entries(value).map(([id, text]) => [id.toLowerCase(), text]))
  const tag = String(active ?? 'en').toLowerCase()
  const primary = tag.split('-')[0]
  return byId.get(tag) ?? byId.get(primary) ?? [...byId].find(([id]) => id.split('-')[0] === primary)?.[1] ?? byId.get('en') ?? [...byId.values()][0] ?? ''
}

/** A card copy whose texts are resolved: walks the whole tree, so every component sees plain strings. */
export function pickCard(card, active) {
  const withPrompt = payload => (payload && 'prompt' in payload ? { ...payload, prompt: pickText(payload.prompt, active) } : payload)
  const walk = value => {
    if (Array.isArray(value)) return value.map(walk)
    if (typeof value !== 'object' || value === null) return value
    const keys = Object.keys(value)
    if (keys.length > 0 && 'en' in value && keys.every(key => LANGUAGE_KEY.test(key)) && keys.every(key => typeof value[key] === 'string')) return pickText(value, active)
    // An action's payload is data for handlers, except the words a chat or a step starts with.
    return Object.fromEntries(keys.map(key => [key, key === 'payload' ? withPrompt(value[key]) : walk(value[key])]))
  }
  return walk(card)
}

const fill = (text, params) => String(text).replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match))

/** The language id as an Intl locale, when this browser knows it. */
export function intlTag(active) {
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

/** The client context, for the locale service (set in apply). */
let clientCtx = null
export const setClientContext = ctx => { clientCtx = ctx }

/**
 * DSH's active language, live, with the page's words for it. `ready` turns true when they have arrived; a switch
 * keeps the old words until the new ones do.
 */
export function useActiveLocale() {
  const subscribe = useCallback(listener => clientCtx.locale.subscribe(listener), [])
  const active = useSyncExternalStore(subscribe, () => clientCtx.locale.getSnapshot().active)
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

/**
 * The Boards page: the boards this person may see, one at a time, kept current.
 *
 * Changes arrive over the plugin's events route: the page then fetches only the card that changed (or the whole board
 * when board.json did). While that stream is down, or while a press waits to be picked up, the page polls the board
 * with If-None-Match instead. Whatever the person has seen is reported back, so the dots for "new since you last
 * looked" follow them across devices.
 */
import { createElement as h, Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Pill } from '@deepseek-ai/dsh-client-ui-primitives'
import { Card } from './card.js'
import { GAP, ROW } from './layout.js'
import { useWidth } from './format.js'
import { liveOf, nextLive, seenReport, withCard } from './live-state.js'
import { api, useKit } from './services.js'
import { pickText, useActiveLocale } from './words.js'

const STORE_KEY = 'dsh-card-board:board'
/** How long a page shows a board before it counts as seen. */
const SEEN_AFTER_MS = 2500

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

/** Grid tracks for the content's width: 6 on a wide screen (a small card a third, a medium one half), 2 on a
 * tablet, 1 on a phone. */
function useTracks() {
  const [ref, width] = useWidth()
  return [ref, width >= 900 ? 6 : width >= 560 ? 2 : 1]
}

const visible = () => document.visibilityState === 'visible'

export function BoardsPage() {
  const kit = useKit()
  const { active, intl: locale, ready, t } = useActiveLocale()
  const [boards, setBoards] = useState(null)
  const [listError, setListError] = useState(null)
  const [selected, setSelected] = useState(() => { try { return localStorage.getItem(STORE_KEY) } catch { return null } })
  // The board and what the page remembers about its cards change together.
  const [view, setView] = useState({ board: null, live: {} })
  const [boardError, setBoardError] = useState(null)
  const [pollSeconds, setPollSeconds] = useState(30)
  const etag = useRef(null)
  const [gridRef, tracks] = useTracks()
  const currentRef = useRef(null)
  const translateRef = useRef(t)
  translateRef.current = t
  const board = view.board
  const boardRef = useRef(null)
  boardRef.current = board

  const show = useCallback(next => setView(prev => ({
    board: next,
    live: next === null ? {} : nextLive(prev.board?.id === next.id ? prev.board : null, next, prev.board?.id === next.id ? prev.live : {}),
  })), [])

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
      setBoardError(null)
      if (result.notModified || currentRef.current !== id) return
      etag.current = result.etag
      show(result.body)
    } catch (error) {
      if (error.status === 403 || error.status === 404) { show(null); setBoardError(error); loadList() }
    }
  }, [loadList, show])

  /** One card changed: fetch only it. A card the page doesn't know yet means the order may have changed too. */
  const loadCard = useCallback(async (boardId, id) => {
    try {
      if (boardRef.current?.id !== boardId || !boardRef.current.cards.some(card => card.id === id)) return loadBoard(boardId, false)
      const { body } = await getJson(`card?board=${encodeURIComponent(boardId)}&id=${encodeURIComponent(id)}`)
      setView(prev => {
        if (prev.board?.id !== boardId) return prev
        const next = withCard(prev.board, id, body)
        return { board: next, live: nextLive(prev.board, next, prev.live) }
      })
    } catch (error) {
      if (error.status === 404) setView(prev => (prev.board?.id === boardId ? { ...prev, board: withCard(prev.board, id, null) } : prev))
      else loadBoard(boardId, false)
    }
  }, [loadBoard])

  const onEvent = useCallback(message => {
    const id = currentRef.current
    if (!id) return
    if (message.type === 'card') loadCard(id, message.id)
    // On (re)connecting the page may have missed changes, so it checks the whole board once.
    else if (message.type === 'board' || message.type === 'hello') loadBoard(id, false)
    else if (message.type === 'gone') { show(null); setBoardError(requestError(403)); loadList() }
  }, [loadBoard, loadCard, loadList, show])
  const status = kit.useEventStream(current ? `api/card-board/events?board=${encodeURIComponent(current)}` : null, onEvent)

  // A press of done, snooze, event or a step goes to this plugin's server, which checks it and records it.
  const press = useCallback(async (action, extra, target) => {
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
  }, [loadBoard])

  useEffect(() => { loadList() }, [loadList])

  useEffect(() => {
    currentRef.current = current
    if (!current) return
    etag.current = null
    setView(prev => (prev.board?.id === current ? prev : { board: null, live: {} }))
    loadBoard(current, true)
  }, [current, loadBoard])

  // The fallback: poll while the stream is down, and while a press waits for whatever handles it.
  const waiting = board?.cards.some(entry => entry.presses?.some(p => p.state === 'pending')) === true
  useEffect(() => {
    if (!current || (status === 'live' && !waiting)) return undefined
    let ticks = 0
    const timer = setInterval(() => {
      if (!visible()) return
      loadBoard(current, false)
      if (++ticks % 10 === 0) loadList()
    }, Math.max(5, pollSeconds) * 1000)
    const onVisible = () => { if (visible()) { loadBoard(current, false); loadList() } }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [current, status, waiting, pollSeconds, loadBoard, loadList])

  // What the person has looked at for a moment counts as seen, on the server.
  const reported = useRef('')
  useEffect(() => {
    if (!board) return undefined
    const report = seenReport(board)
    const text = JSON.stringify(report)
    if (text === reported.current) return undefined
    const timer = setTimeout(() => {
      if (!visible()) return
      fetch(api('seen'), { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: text })
        .then(response => { if (response.ok) reported.current = text }, () => {})
    }, SEEN_AFTER_MS)
    return () => clearTimeout(timer)
  }, [board])

  const choose = id => {
    setSelected(id)
    try { localStorage.setItem(STORE_KEY, id) } catch { /* private mode */ }
  }

  const newest = board?.cards.reduce((max, entry) => {
    const time = entry.card ? Date.parse(entry.card.updatedAt) : NaN
    return Number.isFinite(time) && time > max ? time : max
  }, 0)

  const titleOf = entry => pickText(entry.title, active)
  if (!ready) return h('div', { className: 'cb-page' })

  let content
  if (listError) content = h('p', { className: 'cb-notice' }, errorText(listError, t))
  else if (boards === null) content = h('p', { className: 'cb-muted' }, t('loading'))
  else if (boards.length === 0) content = h('div', { className: 'cb-empty' }, h('p', { className: 'cb-emptyTitle' }, t('emptyTitle')), h('p', { className: 'cb-muted' }, t('emptyHint')))
  else if (boardError) content = h('p', { className: 'cb-notice' }, errorText(boardError, t))
  else if (!board) content = h('p', { className: 'cb-muted' }, t('loading'))
  else content = h(Fragment, null,
    board.problems?.length > 0 && h('div', { className: 'cb-notice' }, t('boardProblems'), h('ul', { className: 'cb-problems' }, board.problems.map((p, i) => h('li', { key: i }, p)))),
    board.cards.length === 0 && h('p', { className: 'cb-muted' }, t('noCards')),
    h('div', { className: 'cb-grid', style: { gridTemplateColumns: `repeat(${tracks}, minmax(0, 1fr))`, gridAutoRows: `${ROW}px`, columnGap: GAP } },
      board.cards.map(entry => h(Card, { key: entry.id, entry, live: liveOf(view.live, entry.id), boardId: board.id, assistant: board.assistant, tracks, active, locale, t, press }))))

  return h('div', { className: 'cb-page' },
    h('div', { className: 'cb-content', ref: gridRef },
      h('div', { className: 'cb-heading' },
        h('h1', null, boards?.length === 1 ? titleOf(boards[0]) : t('title')),
        board && h('div', { className: 'cb-sub' }, h(kit.LiveStatus, { status, updatedAt: newest || undefined }))),
      boards && boards.length > 1 && h('div', { className: 'cb-tabs', role: 'tablist' }, boards.map(b =>
        h(Pill, { key: b.id, active: b.id === current, role: 'tab', 'aria-selected': b.id === current, title: titleOf(b), onClick: () => choose(b.id) }, titleOf(b)))),
      content))
}

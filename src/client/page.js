/**
 * The Boards page: the boards this person may see, one at a time, kept current.
 *
 * Changes arrive over the plugin's events route: the page then fetches only the card that changed (or the whole board
 * when board.json did). While that stream is down, or while a press waits to be picked up, the page polls the board
 * with If-None-Match instead. Whatever the person has seen is reported back, so the dots for "new since you last
 * looked" follow them across devices.
 */
import { createElement as h, Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Pill, Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import { arranged, canShift, dropCard, pinCard, shiftCard, unpinCard, visibleOrder } from '../arrange.js'
import { Card } from './card.js'
import { useCardDrag } from './drag.js'
import { useGlide } from './flip.js'
import { useRaised } from './raise.js'
import { GAP, ROW } from './layout.js'
import { useWidth } from './format.js'
import { liveOf, nextLive, seenReport, withCard } from './live-state.js'
import { api, useKit } from './services.js'
import { pickCard, pickText, useActiveLocale } from './words.js'
import { readNav, writeNav } from './nav.js'
import { Sheet } from './sheet.js'
import { keepOf, withKept } from './ticks.js'

const STORE_KEY = 'dsh-card-board:board'
/** How long a page shows a board before it counts as seen. */
const SEEN_AFTER_MS = 2500
/** How long Undo stays on offer: the toast holds this long, then fades for a second. */
const UNDO_HOLD_MS = 7000
/** The toast's words for a press, by the kind of action it was. */
const TOAST_KEYS = { done: 'toast.done', snooze: 'toast.snooze' }

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
  // The card (or row) open in the sheet, kept in the URL so a link opens it and Back closes it.
  const [opened, setOpened] = useState(() => (typeof location === 'undefined' ? {} : readNav(location.search)))
  const pushed = useRef(false)
  const [selected, setSelected] = useState(() => { if (opened.board) return opened.board; try { return localStorage.getItem(STORE_KEY) } catch { return null } })
  // The board and what the page remembers about its cards change together.
  const [view, setView] = useState({ board: null, live: {} })
  const [boardError, setBoardError] = useState(null)
  const [pollSeconds, setPollSeconds] = useState(30)
  const etag = useRef(null)
  const currentRef = useRef(null)
  const translateRef = useRef(t)
  translateRef.current = t
  // Rows ticked this visit (by card) and the toast that offers to take a press back; both end with the visit.
  const [kept, setKept] = useState({})
  const [toast, setToast] = useState(null)
  const toasts = useRef(0)
  const board = view.board
  const boardRef = useRef(null)
  boardRef.current = board

  // The person's own order: the board's default, their pins and placing, then what is raised for now on top.
  const ids = useMemo(() => (board ? board.cards.map(entry => entry.id) : []), [board])
  const mine = useMemo(() => arranged(ids, board?.arrangement), [ids, board?.arrangement])
  const raised = useRaised(board?.cards ?? [])
  const order = useMemo(() => visibleOrder(mine, raised), [mine, raised])
  const shown = useMemo(() => {
    const byId = new Map((board?.cards ?? []).map(entry => [entry.id, entry]))
    return order.map(id => byId.get(id)).filter(Boolean)
  }, [board, order])
  const gridRef = useRef(null)
  const [contentRef, tracks] = useTracks()
  useGlide(gridRef, order.join('\n'))
  const [said, setSaid] = useState('')

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
    else if (message.type === 'board' || message.type === 'hello' || message.type === 'arrange') loadBoard(id, false)
    else if (message.type === 'gone') { show(null); setBoardError(requestError(403)); loadList() }
  }, [loadBoard, loadCard, loadList, show])
  const status = kit.useEventStream(current ? `api/card-board/events?board=${encodeURIComponent(current)}` : null, onEvent)

  /** One request to the plugin's server, which checks it and records it. */
  const post = useCallback(async body => {
    const response = await fetch(api('action'), {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ board: currentRef.current, ...body }),
    })
    const answer = await response.json().catch(() => null)
    if (!response.ok) throw new Error(errorText(requestError(response.status, answer), translateRef.current))
    loadBoard(currentRef.current, false)
    return answer
  }, [loadBoard])

  const showToast = useCallback(next => setToast({ seq: ++toasts.current, ...next }), [])

  /** Keep the person's new arrangement: shown at once, then written to the server (and read back if that fails). */
  const keepArrangement = useCallback(async (next, board) => {
    setView(prev => (prev.board?.id === board ? { ...prev, board: { ...prev.board, arrangement: next ?? undefined } } : prev))
    try {
      const response = await fetch(api('arrange'), {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(next === null ? { board, reset: true } : { board, ...next }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
    } catch {
      showToast({ text: 'arrange.failed' })
      loadBoard(board, true)
    }
  }, [loadBoard, showToast])

  /** Take a press back, and say so. */
  const undo = useCallback(async (pressId, card) => {
    try {
      await post({ card, undo: pressId })
      showToast({ text: 'toast.undone' })
    } catch {
      showToast({ text: 'toast.undoFailed' })
    }
  }, [post, showToast])

  // A press of done, snooze, event or a step goes to this plugin's server. One the card can take back offers Undo for a
  // few seconds, and a done row stays in view, ticked, in the place it had.
  const press = useCallback(async (action, extra, target, row) => {
    const answer = await post({ ...target, id: action.id, ...extra })
    if (answer?.undoable) {
      showToast({ text: TOAST_KEYS[action.kind] ?? 'toast.event', undo: () => undo(answer.press, target.card) })
      const keep = action.kind === 'done' && row !== undefined ? keepOf(row, target.row) : undefined
      if (keep) setKept(prev => ({ ...prev, [target.card]: withKept(prev[target.card], keep) }))
    }
    return answer
  }, [post, showToast, undo])

  useEffect(() => { loadList() }, [loadList])

  useEffect(() => {
    currentRef.current = current
    if (!current) return
    etag.current = null
    setKept({})
    setToast(null)
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

  useEffect(() => {
    const onPop = () => { pushed.current = false; setOpened(readNav(location.search)) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const openCard = useCallback((boardId, card, row) => {
    const nav = { board: boardId, card, ...(row === undefined ? {} : { row }) }
    window.history[pushed.current ? 'replaceState' : 'pushState'](window.history.state, '', `${location.pathname}${writeNav(location.search, nav)}${location.hash}`)
    pushed.current = true
    setOpened(nav)
  }, [])
  const closeCard = useCallback(() => {
    setOpened({})
    if (pushed.current) { pushed.current = false; window.history.back() }
    else window.history.replaceState(window.history.state, '', `${location.pathname}${writeNav(location.search, {})}${location.hash}`)
  }, [])

  /** A card was moved: keep it, and say so for anyone who can't see it happen. */
  const rearrange = (next, id, saying) => {
    if (board === null) return
    keepArrangement(next, board.id)
    const title = pickText(boardRef.current?.cards.find(entry => entry.id === id)?.card?.title, active) ?? id
    const place = [...visibleOrder(next, raised)].indexOf(id) + 1
    setSaid(t(saying, { title, n: place, total: ids.length }))
  }
  const { drag, begin } = useCardDrag((id, target, after) => rearrange(dropCard(mine, id, target, after), id, 'arrange.moved'))
  const arrangeOf = id => ({
    pinned: mine.pinned.includes(id),
    canUp: canShift(mine, id, -1),
    canDown: canShift(mine, id, 1),
    onPin: () => (mine.pinned.includes(id) ? rearrange(unpinCard(mine, id), id, 'arrange.unpinnedDone') : rearrange(pinCard(mine, id), id, 'arrange.pinnedDone')),
    onMove: delta => rearrange(shiftCard(mine, id, delta), id, 'arrange.moved'),
    onGrip: event => { event.preventDefault(); begin(event, id, false) },
    onHold: event => begin(event, id, true),
  })

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
    h('div', { className: 'cb-grid', ref: gridRef, style: { gridTemplateColumns: `repeat(${tracks}, minmax(0, 1fr))`, gridAutoRows: `${ROW}px`, columnGap: GAP } },
      shown.map(entry => h(Card, {
        key: entry.id, entry, live: liveOf(view.live, entry.id), boardId: board.id, assistant: board.assistant, tracks, active, locale, t, press, undo, kept: kept[entry.id], onOpen: row => openCard(board.id, entry.id, row),
        raised: raised.has(entry.id),
        dragging: drag?.id === entry.id ? drag : null,
        drop: drag?.hint?.target === entry.id ? (drag.hint.after ? 'after' : 'before') : undefined,
        arrange: entry.card && arrangeOf(entry.id),
      }))))

  const openEntry = opened.card && board && (!opened.board || opened.board === board.id) ? board.cards.find(entry => entry.id === opened.card && entry.card) : undefined
  const openCardData = openEntry && pickCard(openEntry.card, active)
  const openRow = openCardData && opened.row !== undefined ? openCardData.data.rows?.find(r => r.key === opened.row) : undefined
  const sheet = h(Sheet, {
    open: Boolean(openEntry),
    onClose: closeCard,
    title: openRow ? (openRow.title ?? openRow.label) : openCardData?.title,
    closeLabel: t('close'),
  }, openEntry && h(Card, { entry: openEntry, live: liveOf(view.live, openEntry.id), boardId: board.id, assistant: board.assistant, tracks: 1, active, locale, t, press, undo, kept: kept[openEntry.id], sheet: true, row: opened.row }))

  return h('div', { className: 'cb-page' },
    h('div', { className: 'cb-content', ref: contentRef },
      h('div', { className: 'cb-heading' },
        h('h1', null, boards?.length === 1 ? titleOf(boards[0]) : t('title')),
        board && h('div', { className: 'cb-sub' }, h(kit.LiveStatus, { status, updatedAt: newest || undefined }),
          board.arrangement && h(Button, { variant: 'ghost', size: 'sm', className: 'cb-reset', title: t('arrange.resetHint'), onClick: () => { keepArrangement(null, board.id); setSaid(t('arrange.resetDone')) } }, t('arrange.reset')))),
      boards && boards.length > 1 && h('div', { className: 'cb-tabs', role: 'tablist' }, boards.map(b =>
        h(Pill, { key: b.id, active: b.id === current, role: 'tab', 'aria-selected': b.id === current, title: titleOf(b), onClick: () => choose(b.id) }, titleOf(b)))),
      content),
    board && sheet,
    h('div', { className: 'cb-sr', role: 'status', 'aria-live': 'polite' }, said),
    toast && h(Toast, {
      key: toast.seq,
      text: t(toast.text),
      tone: 'success',
      ...(toast.undo ? { holdMs: UNDO_HOLD_MS, actions: [{ label: h('span', { className: 'cb-toastUndo' }, t('undo')), onClick: () => { setToast(null); toast.undo() } }] } : {}),
      onDone: () => setToast(null),
    }))
}

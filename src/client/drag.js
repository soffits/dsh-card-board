/**
 * Dragging a card to a new place. A mouse pulls a card by its grip; a finger or pen presses and holds on the card's
 * head (the press shows itself with a short buzz where the device has one) and then drags, so scrolling still works.
 * While dragging, the card follows the pointer and a bar marks where it would land; letting go drops it there, and
 * Escape puts it back. The page decides what a drop means (`onDrop(id, target, after)`).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { dropAfter } from './layout.js'

/** How long a finger holds before the card lifts. */
export const HOLD_MS = 380
/** Finger travel before the hold that means "scrolling", not "dragging". */
const SLOP = 8
/** Mouse travel from the grip that starts a drag. */
const PULL = 4
/** How near the edge of the page the pointer scrolls it. */
const EDGE = 72

/**
 * @param {(id: string, target: string, after: boolean) => void} onDrop
 * @returns {{ drag: null | { id: string, dx: number, dy: number, hint: null | { target: string, after: boolean } }, begin: (event: PointerEvent, id: string, hold: boolean) => void }}
 */
export function useCardDrag(onDrop) {
  const [drag, setDrag] = useState(null)
  const dropRef = useRef(onDrop)
  dropRef.current = onDrop
  const stop = useRef(() => {})
  useEffect(() => () => stop.current(), [])

  const begin = useCallback((event, id, hold) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    stop.current()
    const el = event.currentTarget.closest('[data-card]')
    const scroller = el?.closest('.cb-page')
    if (!el || !scroller) return
    const grid = el.parentElement
    const origin = { x: event.clientX, y: event.clientY, scroll: scroller.scrollTop }
    const point = { x: origin.x, y: origin.y }
    let active = false
    let hint = null
    let timer = 0
    let frame = 0

    const single = () => getComputedStyle(grid).gridTemplateColumns.split(' ').length === 1
    const update = () => {
      const under = document.elementsFromPoint(point.x, point.y).map(node => node.closest?.('[data-card]')).find(card => card && card.dataset.card !== id)
      if (under) hint = { target: under.dataset.card, after: dropAfter(under.getBoundingClientRect(), point.x, point.y, single()) }
      setDrag({ id, dx: point.x - origin.x, dy: point.y - origin.y + (scroller.scrollTop - origin.scroll), hint })
    }
    // Near the top or bottom of the page the page scrolls, faster the nearer the edge.
    const scroll = () => {
      if (!active) return
      const box = scroller.getBoundingClientRect()
      const near = point.y < box.top + EDGE ? (point.y - box.top - EDGE) / EDGE : point.y > box.bottom - EDGE ? (point.y - box.bottom + EDGE) / EDGE : 0
      if (near !== 0) {
        const before = scroller.scrollTop
        scroller.scrollTop += Math.round(Math.max(-1, Math.min(1, near)) * 16)
        if (scroller.scrollTop !== before) update()
      }
      frame = requestAnimationFrame(scroll)
    }
    const lift = () => {
      timer = 0
      active = true
      navigator.vibrate?.(10)
      document.body.style.cursor = 'grabbing'
      update()
      scroll()
    }
    const onMove = move => {
      point.x = move.clientX
      point.y = move.clientY
      if (active) return update()
      const travel = Math.hypot(point.x - origin.x, point.y - origin.y)
      if (hold && travel > SLOP) finish(false)
      else if (!hold && travel > PULL) lift()
    }
    // A finger that has lifted the card must not also scroll the page.
    const onTouchMove = move => { if (active && move.cancelable) move.preventDefault() }
    const onKey = key => { if (key.key === 'Escape') finish(false) }
    const onMenu = menu => { if (hold) menu.preventDefault() }
    function finish(drop) {
      clearTimeout(timer)
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('contextmenu', onMenu)
      document.body.style.cursor = ''
      stop.current = () => {}
      if (active) {
        // The release that ends a drag is not a tap on whatever is under it.
        const swallow = click => { click.stopPropagation(); click.preventDefault() }
        window.addEventListener('click', swallow, { capture: true, once: true })
        setTimeout(() => window.removeEventListener('click', swallow, true), 60)
        if (drop && hint) dropRef.current(id, hint.target, hint.after)
      }
      active = false
      setDrag(null)
    }
    const onUp = () => finish(true)
    const onCancel = () => finish(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('contextmenu', onMenu)
    if (hold) timer = setTimeout(lift, HOLD_MS)
    stop.current = () => finish(false)
  }, [])

  return { drag, begin }
}

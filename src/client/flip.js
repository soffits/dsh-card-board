/** Small motion: when the cards change places they glide to their new spot instead of jumping (nothing moves with reduced motion). */
import { useLayoutEffect, useRef } from 'react'

const MS = 240

/**
 * @param {{ current: HTMLElement | null }} gridRef - the grid whose children carry `data-card`
 * @param {string} orderKey - changes whenever the order of the cards does
 */
export function useGlide(gridRef, orderKey) {
  const spots = useRef(new Map())
  const lastKey = useRef(orderKey)
  // After every layout: glide whatever moved if the order changed, and note where everything is now.
  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const next = new Map()
    const animate = lastKey.current !== orderKey && typeof matchMedia === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches
    for (const el of grid.children) {
      const id = el.dataset?.card
      if (id === undefined) continue
      const spot = { x: el.offsetLeft, y: el.offsetTop }
      const was = spots.current.get(id)
      if (animate && was && typeof el.animate === 'function' && (Math.abs(was.x - spot.x) > 1 || Math.abs(was.y - spot.y) > 1)) {
        el.animate([{ transform: `translate(${was.x - spot.x}px, ${was.y - spot.y}px)` }, { transform: 'none' }], { duration: MS, easing: 'cubic-bezier(.2,.7,.2,1)' })
      }
      next.set(id, spot)
    }
    spots.current = next
    lastKey.current = orderKey
  })
}

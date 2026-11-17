/** Small motion: a number eases to its new value. Nothing moves with reduced motion. */
import { useEffect, useRef, useState } from 'react'

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** The value to draw for `value`: when it changes, it eases there over `ms` (only numbers; anything else jumps). */
export function useEased(value, ms = 500) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = from.current
    from.current = value
    if (typeof value !== 'number' || typeof start !== 'number' || start === value || reduced() || typeof requestAnimationFrame !== 'function') {
      setShown(value)
      return undefined
    }
    const begin = performance.now()
    let frame = 0
    const step = now => {
      const k = Math.min(1, (now - begin) / ms)
      const eased = 1 - (1 - k) ** 3
      setShown(k >= 1 ? value : start + (value - start) * eased)
      if (k < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, ms])
  return shown
}

/**
 * Which cards are raised right now, from the clock: a producer gives a card `raise: { from, until }` once and the page
 * decides when it floats to the top. No polling: one timer waits for the next moment a window opens or closes (and is
 * set again when the page comes back to the front, since a sleeping device or a background tab stops timers).
 */
import { useEffect, useMemo, useState } from 'react'
import { isRaised, nextRaiseChange } from '../arrange.js'

/** Longest a timer can wait; a farther moment just sets the timer again then. */
const MAX_WAIT_MS = 2 ** 31 - 1
/** A hair past the moment, so the clock has really crossed it. */
const SLACK_MS = 25

/** The ids of the cards whose `raise` window covers now, kept right as windows open and close. */
export function useRaised(entries) {
  const [now, setNow] = useState(() => Date.now())
  const raises = entries.filter(entry => entry.card?.raise).map(entry => [entry.id, entry.card.raise])
  const key = JSON.stringify(raises)
  useEffect(() => {
    let timer
    const arm = () => {
      clearTimeout(timer)
      const current = Date.now()
      setNow(current)
      const next = nextRaiseChange(raises.map(([, raise]) => raise), current)
      if (next !== undefined) timer = setTimeout(arm, Math.min(next - current + SLACK_MS, MAX_WAIT_MS))
    }
    const wake = () => { if (document.visibilityState === 'visible') arm() }
    arm()
    document.addEventListener('visibilitychange', wake)
    window.addEventListener('focus', wake)
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', wake); window.removeEventListener('focus', wake) }
  }, [key])
  return useMemo(() => new Set(raises.filter(([, raise]) => isRaised(raise, now)).map(([id]) => id)), [key, now])
}

/**
 * How one person arranges a board, and the order a viewer sees. Pure: the server checks and stores an arrangement,
 * the page computes the order from it, and both use this file.
 *
 * The board's own `order` is the default. A person's arrangement is `{ pinned, order }`: the cards they pinned to the
 * top (in the order they pinned them) and the sequence of the rest. Cards the arrangement doesn't know (a card that
 * appeared since) take the place the default order gives them, so a new card is never lost at the bottom of an old
 * arrangement. What the viewer finally sees puts the cards a producer has raised for now above all of it (`raised`).
 */
import { ID_PATTERN } from './schema.js'

/** Most cards a board holds; an arrangement lists no more. */
export const MAX_ARRANGED = 200

/** An arrangement from a request body or a stored file, or undefined when it is malformed. */
export function parseArrangement(value) {
  if (typeof value !== 'object' || value === null) return undefined
  const lists = []
  for (const key of ['pinned', 'order']) {
    const list = value[key]
    if (!Array.isArray(list) || list.length > MAX_ARRANGED || !list.every(id => typeof id === 'string' && ID_PATTERN.test(id))) return undefined
    lists.push(list)
  }
  const [pinned, order] = lists
  if (new Set([...pinned, ...order]).size !== pinned.length + order.length) return undefined
  return { pinned, order }
}

/**
 * The full arrangement for the cards that exist now, in default order `ids`: what the person pinned and placed that is
 * still there, and every other card slotted in after the card the default order puts before it.
 * @param {string[]} ids - the cards present, in the board's default order
 * @param {{ pinned: string[], order: string[] } | undefined} arrangement
 * @returns {{ pinned: string[], order: string[] }}
 */
export function arranged(ids, arrangement) {
  if (arrangement === undefined) return { pinned: [], order: [...ids] }
  const present = new Set(ids)
  const pinned = arrangement.pinned.filter(id => present.has(id))
  const taken = new Set(pinned)
  const order = arrangement.order.filter(id => present.has(id) && !taken.has(id))
  const placed = new Set(order)
  ids.forEach((id, i) => {
    if (taken.has(id) || placed.has(id)) return
    let after = -1
    for (let before = i - 1; before >= 0 && after < 0; before--) after = order.indexOf(ids[before])
    order.splice(after + 1, 0, id)
  })
  return { pinned, order }
}

/** Every card in the order the person arranged it: pinned first. */
export const sequenceOf = ({ pinned, order }) => [...pinned, ...order]

/** The order on the page: cards raised now first, then the rest, each keeping the person's order. */
export function visibleOrder(state, raised) {
  const all = sequenceOf(state)
  return [...all.filter(id => raised.has(id)), ...all.filter(id => !raised.has(id))]
}

/** Pin a card: it joins the end of the pins. */
export function pinCard({ pinned, order }, id) {
  return { pinned: [...pinned.filter(p => p !== id), id], order: order.filter(o => o !== id) }
}

/** Unpin a card: it stays where it is on the page, the first of the others. */
export function unpinCard({ pinned, order }, id) {
  return { pinned: pinned.filter(p => p !== id), order: [id, ...order.filter(o => o !== id)] }
}

/** Move a card one place up or down among its own kind (pinned among the pins, the others among the others). */
export function shiftCard({ pinned, order }, id, delta) {
  const shift = list => {
    const from = list.indexOf(id)
    const to = from + delta
    if (from < 0 || to < 0 || to >= list.length) return list
    const next = [...list]
    next.splice(from, 1)
    next.splice(to, 0, id)
    return next
  }
  return { pinned: shift(pinned), order: shift(order) }
}

/** Whether a card can move one place up (delta -1) or down (+1) among its own kind. */
export function canShift({ pinned, order }, id, delta) {
  const list = pinned.includes(id) ? pinned : order
  const to = list.indexOf(id) + delta
  return list.includes(id) && to >= 0 && to < list.length
}

/**
 * Drop a card before or after another one. Dropped among the pins it becomes a pin, dropped after them it is not one;
 * right at the edge between the two it stays what it was.
 */
export function dropCard(state, id, target, after) {
  if (id === target) return state
  const wasPinned = state.pinned.includes(id)
  const rest = sequenceOf(state).filter(card => card !== id)
  const pinsLeft = state.pinned.filter(card => card !== id).length
  const at = rest.indexOf(target) + (after ? 1 : 0)
  if (at < 0 || rest.indexOf(target) < 0) return state
  const next = [...rest.slice(0, at), id, ...rest.slice(at)]
  const pinCount = at < pinsLeft ? pinsLeft + 1 : at > pinsLeft ? pinsLeft : pinsLeft + (wasPinned ? 1 : 0)
  return { pinned: next.slice(0, pinCount), order: next.slice(pinCount) }
}

const at = (time, fallback) => (time === undefined ? fallback : Date.parse(time))

/** Whether a card's `raise` window covers `now` (ms). An open end counts as never ending, or always having begun. */
export function isRaised(raise, now) {
  return raise !== undefined && at(raise.from, -Infinity) <= now && now < at(raise.until, Infinity)
}

/** The next moment (ms) after `now` when any of these `raise` windows opens or closes, or undefined when none will. */
export function nextRaiseChange(raises, now) {
  const times = raises.flatMap(raise => [at(raise?.from, NaN), at(raise?.until, NaN)]).filter(time => time > now)
  return times.length > 0 ? Math.min(...times) : undefined
}

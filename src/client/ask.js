/**
 * The Ask button every list and status row has without declaring one, the way every card has its chat button. Pure, so
 * it is tested directly.
 */

import { doneOf } from './ticks.js'

const MAX_ACTIONS = 6

/**
 * The buttons a row shows: its own, then a chat about the row last. Left out when the row or its card says
 * `ask: false`, when the row already has a chat action of its own, and when its six buttons are all taken.
 */
export function rowButtons(row, cardAsk) {
  const own = row.actions ?? []
  if (row.ask === false || cardAsk === false) return own
  if (own.some(action => action.kind === 'chat') || own.length >= MAX_ACTIONS) return own
  return [...own, { kind: 'chat', id: '_ask' }]
}

/**
 * The buttons an opened row shows, with their labels: its detail's first (they are what opening is for), then its own,
 * then the Ask. The tick of an unlabelled done is left out: the opened row draws it as its labelled box.
 */
export function openedButtons(row, cardAsk) {
  const done = doneOf(row)
  return [...(row.detail?.actions ?? []), ...rowButtons(row, cardAsk).filter(action => action !== done)]
}

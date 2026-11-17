/**
 * Presses: what happens when someone taps a done, snooze or event action.
 *
 * The plugin changes no data and runs nothing. A press becomes an event that
 * is appended to an action log (JSON lines) and handed to whoever publishes
 * events (dsh-cron-jobs' `cronJobs` service when it runs, as channel
 * `ui.action.<kind>`), so the owner of the item reacts and rewrites the card.
 *
 * A press is pending until its card file is written again after it (done),
 * or until the timeout passes with no write (unhandled). Recent presses are
 * kept in memory and reloaded from the log's tail after a restart.
 */
import { randomUUID } from 'node:crypto'
import { appendFile, mkdir, open, stat } from 'node:fs/promises'
import { dirname } from 'node:path'

const KEEP_MS = 24 * 3600 * 1000
const TAIL_BYTES = 1024 * 1024
const DOUBLE_TAP_MS = 3000

/** Read the presses of the last day from the end of the log. */
async function readTail(path) {
  let handle
  try {
    handle = await open(path, 'r')
  } catch {
    return []
  }
  try {
    const { size } = await handle.stat()
    const length = Math.min(size, TAIL_BYTES)
    const buffer = Buffer.alloc(length)
    await handle.read(buffer, 0, length, size - length)
    const lines = buffer.toString('utf8').split('\n')
    if (size > length) lines.shift()
    const since = Date.now() - KEEP_MS
    return lines.flatMap(line => {
      try {
        const event = JSON.parse(line)
        return Date.parse(event.at) >= since ? [event] : []
      } catch {
        return []
      }
    })
  } finally {
    await handle.close()
  }
}

/**
 * @param {object} options
 * @param {string} options.logPath - the action log (JSON lines)
 * @param {() => object | undefined} options.publisher - `{ emit(event) }` right now, if any
 * @param {(event: object) => void} [options.notify] - in-process listeners (a Cordis event)
 * @param {number} options.timeoutSeconds
 * @param {(message: string) => void} [options.warn]
 * @param {() => number} [options.now]
 */
export function createPresses({ logPath, publisher, notify = () => {}, timeoutSeconds, warn = () => {}, now = Date.now }) {
  let recent
  const loaded = readTail(logPath).then(events => { recent = events })

  async function list() {
    await loaded
    const since = now() - KEEP_MS
    recent = recent.filter(event => Date.parse(event.at) >= since)
    return recent
  }

  /** Record one press; a second identical tap within a few seconds returns the first. */
  async function press({ action, person, user, board, card, row, payload }) {
    const events = await list()
    const at = now()
    const twin = events.find(event => event.id === action.id && event.person === person && event.source.board === board && event.source.card === card && event.source.row === row && at - Date.parse(event.at) < DOUBLE_TAP_MS)
    if (twin) return twin
    const event = {
      press: randomUUID(),
      action: action.kind,
      id: action.id,
      ...(action.label ? { label: action.label } : {}),
      payload,
      person,
      ...(user ? { user } : {}),
      at: new Date(at).toISOString(),
      source: { plugin: 'dsh-card-board', board, card, ...(row === undefined ? {} : { row }) },
    }
    await mkdir(dirname(logPath), { recursive: true })
    await appendFile(logPath, `${JSON.stringify(event)}\n`, { mode: 0o600 })
    recent.push(event)
    notify(event)
    try {
      const result = publisher()?.emit({ channel: `ui.action.${event.action}`, data: event, key: event.press, source: 'dsh-card-board' })
      if (result === undefined) warn(`press ${event.press} logged; no event publisher is running`)
    } catch (error) {
      warn(`press ${event.press} logged but not published: ${error.message}`)
    }
    return event
  }

  /**
   * The presses on one card with their state: done once the card file was
   * written after the press, unhandled after the timeout, else pending.
   */
  async function statesFor(board, card, cardPath) {
    const events = (await list()).filter(event => event.source.board === board && event.source.card === card)
    if (events.length === 0) return []
    const written = await stat(cardPath).then(info => info.mtimeMs, () => 0)
    const at = now()
    return events.map(event => {
      const time = Date.parse(event.at)
      const state = written > time ? 'done' : at - time > timeoutSeconds * 1000 ? 'unhandled' : 'pending'
      return { press: event.press, id: event.id, ...(event.source.row === undefined ? {} : { row: event.source.row }), at: event.at, state }
    })
  }

  return { press, statesFor, list }
}

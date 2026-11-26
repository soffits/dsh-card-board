/**
 * Presses: what happens when someone taps a done, snooze or event action.
 *
 * The plugin changes no data and runs nothing. A press becomes an event that
 * is appended to an action log (JSON lines) and handed to whoever publishes
 * events (dsh-cron-jobs' `cronJobs` service when it runs, as channel
 * `ui.action.<kind>`), so the owner of the item reacts and rewrites the card.
 *
 * A press is pending until whoever handles it says so: on a board read from a command, the command's answer to it
 * (exit 0 handled, anything else not); on a board of files, the card listing the press in its `handled`. That answer
 * is appended to the same log as an acknowledgement (`{ ack: <press>, state, reason? }`), so it survives a restart.
 * A press nobody answers within the timeout is unhandled. Recent presses and acknowledgements are kept in memory and
 * reloaded from the log's tail after a restart.
 *
 * An action that declares an `inverse` can be taken back: the press keeps the
 * inverse as the card offered it, and an undo press (`action: 'undo'`, naming
 * the press it takes back in `undoes`) becomes the event of the way back. The
 * log is append-only, so "undone" is the later record that points at the press.
 */
import { randomUUID } from 'node:crypto'
import { appendFile, mkdir, open } from 'node:fs/promises'
import { dirname } from 'node:path'
import { UNDO_KIND } from './schema.js'

const KEEP_MS = 24 * 3600 * 1000
const TAIL_BYTES = 1024 * 1024
const DOUBLE_TAP_MS = 3000

/** Read the records (presses and acknowledgements) of the last day from the end of the log. */
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
  const acks = new Map() // press id -> its acknowledgement
  const running = new Set() // presses a command has now
  const loaded = readTail(logPath).then(records => {
    recent = records.filter(record => record.ack === undefined)
    for (const record of records) if (record.ack !== undefined) acks.set(record.ack, record)
  }, error => {
    warn(`action log ${logPath} unreadable, starting without recent presses: ${error.message}`)
    recent = []
  })

  async function list() {
    await loaded
    const since = now() - KEEP_MS
    recent = recent.filter(event => Date.parse(event.at) >= since)
    for (const [id, ack] of acks) if (Date.parse(ack.at) < since) acks.delete(id)
    return recent
  }

  async function append(record) {
    await mkdir(dirname(logPath), { recursive: true })
    await appendFile(logPath, `${JSON.stringify(record)}\n`, { mode: 0o600 })
  }

  /** Record one press; a second identical tap within a few seconds returns the first. */
  async function press({ action, person, user, board, card, row, payload }) {
    const events = await list()
    const at = now()
    const twin = events.find(event => event.action !== UNDO_KIND && !events.some(later => later.undoes === event.press) && event.id === action.id && event.person === person && event.source.board === board && event.source.card === card && event.source.row === row && at - Date.parse(event.at) < DOUBLE_TAP_MS)
    if (twin) return twin
    const event = {
      press: randomUUID(),
      action: action.kind,
      id: action.id,
      ...(action.label ? { label: action.label } : {}),
      ...(action.inverse ? { inverse: action.inverse } : {}),
      payload,
      person,
      ...(user ? { user } : {}),
      at: new Date(at).toISOString(),
      source: { plugin: 'dsh-card-board', board, card, ...(row === undefined ? {} : { row }) },
    }
    return record(event)
  }

  /** Append one event to the log and the recent list, tell in-process listeners and publish it. */
  async function record(event) {
    await append(event)
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
   * Take one press back. Whoever pressed may; the way back is the inverse the card offered when it was pressed, so
   * nothing the browser says decides what happens. Undoing twice returns the first undo.
   * @returns {Promise<{ event: object } | { problem: 'unknown' | 'forbidden' | 'no-inverse' }>}
   */
  async function undo({ press: id, person, user, board, card }) {
    const events = await list()
    const original = events.find(event => event.press === id && event.action !== UNDO_KIND)
    if (original === undefined || original.source.board !== board || original.source.card !== card) return { problem: 'unknown' }
    if (original.person !== person) return { problem: 'forbidden' }
    if (!original.inverse) return { problem: 'no-inverse' }
    const earlier = events.find(event => event.action === UNDO_KIND && event.undoes === id)
    if (earlier) return { event: earlier }
    // The press's own additions (a snooze time the person picked) don't belong to the way back.
    const { until: _picked, ...own } = original.payload ?? {}
    const event = {
      press: randomUUID(),
      action: UNDO_KIND,
      of: original.action,
      id: original.id,
      undoes: original.press,
      inverse: original.inverse.kind,
      payload: { ...own, ...(original.inverse.payload ?? {}) },
      person,
      ...(user ? { user } : {}),
      at: new Date(now()).toISOString(),
      source: original.source,
    }
    return { event: await record(event) }
  }

  /** Start handing a press to a command: false when it already was (a double tap returns the first press). */
  function begin(event) {
    if (running.has(event.press) || acks.has(event.press)) return false
    running.add(event.press)
    return true
  }

  /** The board has no command: the press is only published, and its card will say when it was handled. */
  function skip(event) {
    running.delete(event.press)
  }

  /**
   * Whoever handles the press answered it: handled, or not with `failure` saying why. The first answer stands and is
   * logged.
   */
  async function acknowledge(event, failure) {
    running.delete(event.press)
    if (acks.has(event.press)) return acks.get(event.press)
    const ack = { ack: event.press, state: failure === undefined ? 'done' : 'unhandled', ...(failure === undefined ? {} : { reason: String(failure).slice(0, 500) }), at: new Date(now()).toISOString(), source: event.source }
    acks.set(event.press, ack)
    await append(ack).catch(error => warn(`acknowledgement of press ${event.press} not logged: ${error.message}`))
    return ack
  }

  /**
   * The presses on one card with their state: done once its handler acknowledged it, unhandled when the handler
   * refused it or nobody answered within the timeout, else pending. `handled` is the card's own list of the presses it
   * took in (a board of files); a press found there is acknowledged now.
   */
  async function statesFor(board, card, handled = []) {
    const events = (await list()).filter(event => event.source.board === board && event.source.card === card)
    if (events.length === 0) return []
    const taken = new Set(handled)
    const undone = new Set(events.filter(event => event.action === UNDO_KIND).map(event => event.undoes))
    for (const event of events) if (taken.has(event.press) && !acks.has(event.press)) await acknowledge(event)
    const at = now()
    return events.filter(event => event.action !== UNDO_KIND).map(event => {
      // A step is carried out by sending it to the assistant (dsh-ui-actions does that right after the press), so it
      // is done once recorded.
      const answered = acks.get(event.press)?.state
      const state = undone.has(event.press) ? 'undone'
        : event.action === 'step' ? 'done'
          : answered ?? (at - Date.parse(event.at) > timeoutSeconds * 1000 ? 'unhandled' : 'pending')
      return { press: event.press, id: event.id, ...(event.source.row === undefined ? {} : { row: event.source.row }), at: event.at, state, ...(event.inverse && state !== 'undone' ? { undoable: true } : {}) }
    })
  }

  return { press, undo, statesFor, list, begin, skip, acknowledge }
}

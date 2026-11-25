/**
 * Boards read from a command instead of a folder: the plugin keeps no copy of the data, it asks the command that
 * owns it (Kith's `kith cards`, or anything that answers the same JSON).
 *
 *   <command> boards        { "boards": { "<id>": <board.json fields> }, "watch": [path] }
 *   <command> board <id>    { "cards": { "<id>": <card> | { "error": text } }, "watch": [path], "refreshAt": time }
 *   <command> press <id>    a press event (JSON) on stdin; exit 0 means handled
 *
 * An answer is reused until a path in its `watch` changes (a stat of the files, no timer), until its `refreshAt`
 * passes (the moment the answer changes by itself, like midnight), or, when it names no paths, for a few seconds.
 * While a page has a board open, the same paths are watched so a change reaches it at once. A card's `updatedAt` may
 * be left out: it is stamped with the time of the run that made the card's current content, and again once a card
 * with `staleAfter` is half that old, so a card that is still right never shows as stale.
 *
 * Commands run with execFile and an argument list, never a shell.
 */
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { isAbsolute, resolve } from 'node:path'
import { ID_PATTERN, MAX_CARD_BYTES, checkBoard, checkCard, parseJson } from './schema.js'
import { signature, watchPaths } from './paths.js'

const TTL_MS = 5000
const MAX_OUTPUT = 8 * 1024 * 1024
const MAX_CARDS = 100

/** Run a command with `input` on stdin; resolves with stdout, rejects with an error whose message is stderr's last line. */
export function runCommand(argv, { cwd, env, input, timeoutMs = 60_000 } = {}) {
  return new Promise((resolveRun, reject) => {
    const child = execFile(argv[0], argv.slice(1), { cwd: cwd || undefined, env, timeout: timeoutMs, maxBuffer: MAX_OUTPUT, encoding: 'utf8' }, (error, stdout, stderr) => {
      if (error) {
        const said = String(stderr || error.message).trim().split('\n').filter(Boolean).pop() ?? 'failed'
        reject(Object.assign(new Error(said), { code: error.code }))
      } else {
        resolveRun(stdout)
      }
    })
    child.stdin?.on('error', () => {})
    child.stdin?.end(input ?? '')
  })
}

const tag = text => `W/"${createHash('sha256').update(text).digest('base64url').slice(0, 27)}"`
const iso = ms => new Date(Math.floor(ms / 1000) * 1000).toISOString()

/** `watch` of an answer: a list of strings, made absolute against `cwd`. */
function pathsOf(value, cwd) {
  if (!Array.isArray(value)) return []
  return value.filter(path => typeof path === 'string' && path !== '').map(path => (isAbsolute(path) ? path : resolve(cwd || '.', path))).slice(0, 200)
}

function parseAnswer(text, what) {
  const parsed = parseJson(text)
  if (parsed.problems.length > 0) throw new Error(`${what}: ${parsed.problems[0]}`)
  if (parsed.value === null || typeof parsed.value !== 'object' || Array.isArray(parsed.value)) throw new Error(`${what}: not a JSON object`)
  return parsed.value
}

/**
 * @param {object} options
 * @param {string[]} options.command - the argument list the subcommands are appended to
 * @param {string} [options.cwd]
 * @param {Record<string, string>} [options.env]
 * @param {number} [options.timeoutMs]
 * @param {typeof runCommand} [options.run]
 * @param {() => number} [options.now]
 * @param {(message: string) => void} [options.warn]
 * @param {number} [options.pollMs] - the stat poll behind a page's live watch
 */
export function createCommandSource({ command, cwd = '', env, timeoutMs = 60_000, run = runCommand, now = Date.now, warn = () => {}, pollMs = 10_000 }) {
  const call = (args, input) => run([...command, ...args], { cwd, env, input, timeoutMs })

  /** @type {{ boards: Map<string, { board?: object, problems: string[] }>, watch: string[], sig: string, validUntil: number, text: string } | null} */
  let specs = null
  let specsRun = null
  let specVersion = 0
  /** @type {Map<string, any>} */
  const boards = new Map()
  /** @type {Map<string, Set<(change: object) => void>>} */
  const listeners = new Map()
  const armed = new Map() // board id -> stop
  let specsStop = null
  let closed = false

  const emit = (id, change) => {
    for (const listener of listeners.get(id) ?? []) Promise.resolve().then(() => listener(change)).catch(error => warn(`a change listener failed: ${error.message}`))
  }

  // --- the boards' own fields -----------------------------------------------------------------

  async function specsFresh() {
    if (specs === null || closed) return false
    if (specs.watch.length === 0) return now() < specs.validUntil
    return (await signature(specs.watch)) === specs.sig
  }

  function readSpecs() {
    if (specsRun !== null) return specsRun
    specsRun = (async () => {
      const before = specs?.watch.length ? await signature(specs.watch) : undefined
      let answer
      try {
        answer = parseAnswer(await call(['boards']), 'boards')
        if (answer.boards === null || typeof answer.boards !== 'object' || Array.isArray(answer.boards)) throw new Error('boards: no "boards" object')
      } catch (error) {
        warn(`board command: ${error.message}`)
        // Keep what was known and look again soon, so a command that is down isn't asked on every request.
        specs = { boards: specs?.boards ?? new Map(), watch: specs?.watch ?? [], sig: before ?? '', validUntil: now() + TTL_MS, text: specs?.text ?? '', error: error.message }
        return specs
      }
      const watch = pathsOf(answer.watch, cwd)
      const map = new Map()
      for (const [id, spec] of Object.entries(answer.boards)) {
        if (!ID_PATTERN.test(id)) continue
        const problems = checkBoard(spec)
        map.set(id, problems.length > 0 ? { problems } : { board: spec, problems: [] })
      }
      const text = JSON.stringify([...map])
      const changed = specs !== null && specs.text !== text
      specs = { boards: map, watch, sig: before !== undefined && watch.length ? before : await signature(watch), validUntil: now() + TTL_MS, text }
      if (changed) {
        specVersion += 1
        for (const id of new Set([...listeners.keys(), ...map.keys()])) emit(id, { type: 'board' })
      }
      return specs
    })().finally(() => { specsRun = null })
    return specsRun
  }

  async function currentSpecs() {
    return (await specsFresh()) ? specs : readSpecs()
  }

  // --- one board's cards ----------------------------------------------------------------------

  function fresh(entry) {
    if (closed) return false
    if (entry.refreshAt !== undefined && now() >= entry.refreshAt) return false
    if (entry.watch.length === 0) return now() - entry.completedAt < TTL_MS
    return signature(entry.watch).then(sig => sig === entry.sig)
  }

  function build(id, entry, answer, startedAt) {
    const cards = new Map()
    const raw = answer.cards !== null && typeof answer.cards === 'object' && !Array.isArray(answer.cards) ? answer.cards : {}
    for (const [cardId, value] of Object.entries(raw).slice(0, MAX_CARDS)) {
      if (!ID_PATTERN.test(cardId) || value === null || typeof value !== 'object' || Array.isArray(value)) continue
      if (typeof value.error === 'string' && Object.keys(value).length === 1) {
        cards.set(cardId, { problems: [value.error.slice(0, 300)], json: `error:${value.error}`, content: '', updatedMs: startedAt })
        continue
      }
      const { updatedAt: given, ...content } = value
      const contentText = JSON.stringify(content)
      const before = entry.cards.get(cardId)
      let updatedAt = given
      if (updatedAt === undefined) {
        const half = typeof content.staleAfter === 'number' ? content.staleAfter * 500 : Infinity
        updatedAt = before?.card && before.content === contentText && startedAt - before.updatedMs < half ? before.card.updatedAt : iso(startedAt)
      }
      const card = { ...value, updatedAt }
      const json = JSON.stringify(card)
      const problems = json.length > MAX_CARD_BYTES ? [`is larger than ${Math.round(MAX_CARD_BYTES / 1024)} KB`] : checkCard(card)
      cards.set(cardId, problems.length > 0
        ? { problems: problems.slice(0, 5), json: `bad:${json}`, content: contentText, updatedMs: startedAt }
        : { card, json, content: contentText, updatedMs: Date.parse(updatedAt) || startedAt })
    }
    return cards
  }

  async function runOnce(id, entry) {
    const startedAt = now()
    const before = entry.watch.length ? await signature(entry.watch) : undefined
    let answer
    try {
      answer = parseAnswer(await call(['board', id]), `board ${id}`)
    } catch (error) {
      warn(`board command (${id}): ${error.message}`)
      entry.error = error.message
      entry.completedAt = now()
      entry.startedAt = startedAt
      entry.refreshAt = undefined
      entry.sig = before ?? ''
      return
    }
    const watch = pathsOf(answer.watch, cwd)
    const cards = build(id, entry, answer, startedAt)
    const events = []
    for (const cardId of new Set([...entry.cards.keys(), ...cards.keys()])) {
      if (entry.cards.get(cardId)?.json !== cards.get(cardId)?.json) events.push({ type: 'card', id: cardId })
    }
    const first = entry.completedAt === undefined
    entry.cards = cards
    entry.error = undefined
    entry.watch = watch
    entry.sig = before !== undefined && before !== '' && sameSet(watch, entry.watched) ? before : await signature(watch)
    entry.watched = watch
    const refreshAt = typeof answer.refreshAt === 'string' ? Date.parse(answer.refreshAt) : NaN
    entry.refreshAt = Number.isNaN(refreshAt) ? undefined : refreshAt
    entry.startedAt = startedAt
    entry.completedAt = now()
    if (events.length > 0) entry.version += 1
    rearm(id, entry)
    if (!first) for (const event of events) emit(id, event)
  }

  const sameSet = (a, b) => b !== undefined && a.length === b.length && a.every((path, i) => path === b[i])

  /** One run at a time per board; a trigger during a run asks for one more after it. */
  function rerun(id) {
    let entry = boards.get(id)
    if (entry === undefined) {
      entry = { cards: new Map(), watch: [], version: 0, completedAt: undefined, promise: null, again: false }
      boards.set(id, entry)
    }
    if (entry.promise !== null) {
      entry.again = true
      return entry.promise
    }
    const target = entry
    target.promise = (async () => {
      do {
        target.again = false
        await runOnce(id, target)
      } while (target.again && !closed)
      return target
    })().finally(() => { target.promise = null })
    return target.promise
  }

  async function current(id) {
    const entry = boards.get(id)
    if (entry === undefined) return rerun(id)
    if (entry.promise !== null) return entry.promise
    return (await fresh(entry)) ? entry : rerun(id)
  }

  // --- live watching while pages are open -----------------------------------------------------

  function rearm(id, entry) {
    if (!(listeners.get(id)?.size > 0) || closed) return
    armed.get(id)?.()
    const stops = []
    if (entry.watch.length > 0) stops.push(watchPaths(entry.watch, () => { rerun(id).catch(() => {}) }, { pollMs }))
    if (entry.refreshAt !== undefined) {
      const timer = setTimeout(() => { rerun(id).catch(() => {}) }, Math.max(0, entry.refreshAt - now()))
      timer.unref?.()
      stops.push(() => clearTimeout(timer))
    }
    armed.set(id, () => stops.forEach(stop => stop()))
  }

  function armSpecs() {
    if (specsStop !== null || specs === null || specs.watch.length === 0) return
    specsStop = watchPaths(specs.watch, () => { readSpecs().catch(() => {}) }, { pollMs })
  }

  // --- the source's interface -----------------------------------------------------------------

  const knows = async id => (await currentSpecs()).boards.has(id)

  return {
    knows,

    /** Every board the command offers, valid or not, sorted by id. */
    async list() {
      const all = await currentSpecs()
      return [...all.boards].map(([id, entry]) => ({ id, board: entry.board, problems: entry.problems })).sort((a, b) => a.id.localeCompare(b.id))
    },

    /** The board's own fields, or undefined when the command doesn't offer it. */
    async board(id) {
      const found = (await currentSpecs()).boards.get(id)
      return found === undefined ? undefined : { id, board: found.board, problems: found.problems }
    },

    /** Every card of a board in order, each with its size and either the card or its problems; `only` picks one. */
    async cards(id, board, only) {
      const entry = await current(id)
      const present = [...entry.cards.keys()]
      const first = (board?.order ?? []).filter((card, i, list) => entry.cards.has(card) && list.indexOf(card) === i)
      const placed = new Set(first)
      const ids = [...first, ...present.filter(card => !placed.has(card)).sort()].slice(0, MAX_CARDS)
      const layout = board?.layout ?? {}
      return (only === undefined ? ids : ids.filter(card => card === only)).map(card => {
        const found = entry.cards.get(card)
        const size = layout[card]?.size ? { size: layout[card].size } : {}
        return found.card === undefined ? { id: card, ...size, problems: found.problems } : { id: card, ...size, card: found.card }
      })
    },

    async card(id, card) {
      return (await current(id)).cards.get(card)?.card
    },

    /** A version tag for a board's answer, mixed with `salt` (who is asking, what they have seen). */
    async boardTag(id, salt) {
      const entry = await current(id)
      return tag(`${salt}\0${id}\0${entry.version}\0${specVersion}\0${entry.error ?? ''}`)
    },

    async cardTag(id, card, salt) {
      const entry = await current(id)
      return tag(`${salt}\0${id}\0${card}\0${entry.cards.get(card)?.json ?? '-'}\0${specVersion}`)
    },

    /** When the board's answer was last made (the time that run started), 0 if never: a press is handled once it is later. */
    async writtenAt(id) {
      return boards.get(id)?.startedAt ?? 0
    },

    /** The problems of the last run, if it failed. */
    async problems(id) {
      const specError = specs?.error
      const run = boards.get(id)?.error
      return [specError, run].filter(Boolean)
    },

    /** Hand a press to the command; when it exits 0, ask for a fresh answer and resolve with the time it finished. */
    async press(id, event) {
      await call(['press', id], JSON.stringify(event))
      const handledAt = now()
      await rerun(id).catch(() => {})
      return handledAt
    },

    /** Ask for a fresh answer now, and tell open pages what changed. */
    refresh: id => rerun(id),

    /** Tell the open pages of a board that a card needs another look (a press that failed). */
    touch: (id, card) => emit(id, { type: 'card', id: card }),

    /** Call `listener` with each change to the board until the returned function is called. */
    async watch(id, listener) {
      const set = listeners.get(id) ?? new Set()
      listeners.set(id, set)
      set.add(listener)
      try {
        const entry = await current(id)
        await currentSpecs()
        armSpecs()
        if (set.size === 1) rearm(id, entry)
      } catch (error) {
        set.delete(listener)
        throw error
      }
      return () => {
        set.delete(listener)
        if (set.size === 0) {
          listeners.delete(id)
          armed.get(id)?.()
          armed.delete(id)
        }
        if (listeners.size === 0) {
          specsStop?.()
          specsStop = null
        }
      }
    },

    /** Stop watching (the plugin is unloading). */
    close() {
      closed = true
      for (const stop of armed.values()) stop()
      armed.clear()
      specsStop?.()
      specsStop = null
      listeners.clear()
    },
  }
}

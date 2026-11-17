/**
 * Noticing changes to a board's files, for the live events route.
 *
 * One watch per board, shared by every page that has it open. `fs.watch` on
 * the board folder and its cards folder only triggers a rescan; a slower stat
 * poll does the same where watching is unreliable (network file systems, some
 * containers). The scan compares file sizes and times, so what reaches the
 * listeners is exact: `{ type: 'card', id }` for a card written, added or
 * removed, `{ type: 'board' }` for board.json.
 */
import { watch as fsWatch } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { ID_PATTERN } from './schema.js'

async function snapshot(dir) {
  const files = new Map()
  const add = async (name, path) => {
    const info = await stat(path).catch(() => undefined)
    if (info?.isFile()) files.set(name, `${info.size}:${info.mtimeMs}`)
  }
  await add('board.json', join(dir, 'board.json'))
  const names = await readdir(join(dir, 'cards')).catch(() => [])
  for (const name of names) if (name.endsWith('.json') && ID_PATTERN.test(name.slice(0, -5))) await add(name, join(dir, 'cards', name))
  return files
}

/** What changed between two snapshots, as events. */
export function changes(before, after) {
  const names = new Set([...before.keys(), ...after.keys()])
  const events = []
  for (const name of [...names].sort()) {
    if (before.get(name) === after.get(name)) continue
    events.push(name === 'board.json' ? { type: 'board' } : { type: 'card', id: name.slice(0, -5) })
  }
  return events
}

/**
 * @param {object} [options]
 * @param {number} [options.pollMs] - the stat poll's interval (default 10 s)
 * @param {number} [options.settleMs] - how long a burst of file events is gathered before one scan (default 120 ms)
 */
export function createWatches({ pollMs = 10_000, settleMs = 120 } = {}) {
  const boards = new Map()

  function open(dir) {
    const entry = { listeners: new Set(), files: null, watchers: [], timer: null, poll: null, scanning: null }
    const scan = async () => {
      // One scan at a time; a request during a scan runs once more after it.
      if (entry.scanning) { entry.again = true; return entry.scanning }
      entry.scanning = (async () => {
        do {
          entry.again = false
          const files = await snapshot(dir)
          const events = entry.files === null ? [] : changes(entry.files, files)
          entry.files = files
          for (const event of events) for (const listener of entry.listeners) listener(event)
        } while (entry.again)
      })().finally(() => { entry.scanning = null })
      return entry.scanning
    }
    const soon = () => {
      clearTimeout(entry.timer)
      entry.timer = setTimeout(scan, settleMs)
    }
    for (const path of [dir, join(dir, 'cards')]) {
      try {
        entry.watchers.push(fsWatch(path, { persistent: false }, soon).on('error', () => {}))
      } catch {
        // a missing cards folder: the poll notices when it appears
      }
    }
    entry.poll = setInterval(scan, pollMs)
    entry.poll.unref?.()
    entry.ready = scan()
    entry.close = () => {
      clearTimeout(entry.timer)
      clearInterval(entry.poll)
      for (const watcher of entry.watchers) watcher.close()
    }
    return entry
  }

  return {
    /**
     * Call `listener` with each change to the board in `dir` until the returned function is called. Resolves once
     * the first scan is done, so changes after that are all reported.
     */
    async watch(dir, listener) {
      let entry = boards.get(dir)
      if (entry === undefined) {
        entry = open(dir)
        boards.set(dir, entry)
      }
      entry.listeners.add(listener)
      await entry.ready
      return () => {
        entry.listeners.delete(listener)
        if (entry.listeners.size === 0 && boards.get(dir) === entry) {
          entry.close()
          boards.delete(dir)
        }
      }
    },

    /** Stop every watch (the plugin is unloading). */
    close() {
      for (const entry of boards.values()) entry.close()
      boards.clear()
    },
  }
}

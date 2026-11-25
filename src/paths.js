/**
 * Noticing that files a command's answer was built from have changed: a cheap fingerprint of paths (a file, or a
 * folder with everything under it), compared with an earlier one. Names a writer leaves around while it works
 * (editor and sync temporaries, an SQLite journal) are not changes, so reading a store never changes its own
 * fingerprint.
 */
import { watch as fsWatch } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const MAX_FILES = 5000
const NOISE = [/^\./, /~$/, /\.(tmp|swp|swx|lock)$/, /-(wal|shm|journal)$/]

const isNoise = name => NOISE.some(pattern => pattern.test(name))

async function collect(path, into, depth = 0) {
  if (into.size >= MAX_FILES) return
  const info = await stat(path).catch(() => undefined)
  if (info === undefined) return
  if (info.isFile()) {
    into.set(path, `${info.size}:${info.mtimeMs}`)
    return
  }
  if (!info.isDirectory() || depth > 6) return
  const names = await readdir(path).catch(() => [])
  for (const name of names.sort()) if (!isNoise(name)) await collect(join(path, name), into, depth + 1)
}

/** One string for the state of `paths` (files and folders; a path that doesn't exist yet counts as absent). */
export async function signature(paths) {
  const files = new Map()
  for (const path of paths) {
    const before = files.size
    await collect(path, files)
    if (files.size === before) files.set(path, '-')
  }
  return [...files].map(([path, state]) => `${path}\0${state}`).join('\n')
}

/**
 * Call `onChange` (once per burst) when something under `paths` may have changed: `fs.watch` on each path's
 * folder plus a slower check that compares fingerprints, for file systems where watching is unreliable. Returns a
 * function that stops it.
 */
export function watchPaths(paths, onChange, { pollMs = 10_000, settleMs = 150 } = {}) {
  let last
  let timer
  let stopped = false
  const watchers = []
  const check = async () => {
    const now = await signature(paths)
    if (stopped) return
    if (last !== undefined && now !== last) onChange()
    last = now
  }
  const soon = () => {
    clearTimeout(timer)
    timer = setTimeout(() => { check().catch(() => {}) }, settleMs)
  }
  const folders = new Set()
  for (const path of paths) folders.add(path).add(dirname(path))
  for (const folder of folders) {
    try {
      watchers.push(fsWatch(folder, { persistent: false }, soon).on('error', () => {}))
    } catch {
      // a folder that isn't there yet: the poll notices when it appears
    }
  }
  const poll = setInterval(() => { check().catch(() => {}) }, pollMs)
  poll.unref?.()
  check().catch(() => {})
  return () => {
    stopped = true
    clearTimeout(timer)
    clearInterval(poll)
    for (const watcher of watchers) watcher.close()
  }
}

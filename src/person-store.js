/**
 * What the plugin keeps for each person, one small JSON file each: what they have seen (`.seen/`) and how they have
 * arranged their boards (`.arrange/`). Writes to a person's file go one at a time and atomically.
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export function hash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('base64url').slice(0, 12)
}

/**
 * @param {string} dir
 * @param {() => object} empty - a person's file when they have none
 * @param {(value: unknown) => object | undefined} clean - the file's content when it is well formed, else undefined
 */
export function createPersonStore(dir, empty, clean) {
  const fileOf = person => join(dir, `${hash(String(person).toLowerCase())}.json`)
  const queues = new Map()

  async function read(person) {
    try {
      return clean(JSON.parse(await readFile(fileOf(person), 'utf8'))) ?? empty()
    } catch {
      return empty()
    }
  }

  return {
    read,

    /** A tag that changes whenever this person's file changes, for ETags. */
    async tag(person) {
      const info = await stat(fileOf(person)).catch(() => undefined)
      return info ? `${info.size}:${info.mtimeMs}` : '-'
    },

    /** Change a person's file: `change` gets the current content and returns the new one. */
    update(person, change) {
      const path = fileOf(person)
      const previous = queues.get(path) ?? Promise.resolve()
      const next = previous.catch(() => {}).then(async () => {
        const value = change(await read(person))
        await mkdir(dir, { recursive: true, mode: 0o700 })
        const tmp = `${path}.${process.pid}.tmp`
        await writeFile(tmp, JSON.stringify(value), { mode: 0o600 })
        await rename(tmp, path)
      })
      queues.set(path, next)
      return next.finally(() => { if (queues.get(path) === next) queues.delete(path) })
    },
  }
}

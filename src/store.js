/**
 * Reading boards and cards from the data folder:
 *
 *   <dataDir>/<boardId>/board.json
 *   <dataDir>/<boardId>/cards/<cardId>.json
 *
 * Only ids matching ID_PATTERN are read, and only regular files that resolve
 * inside the data folder, so a link or a strange name can't make the plugin
 * read anything else. A card that can't be read or fails the schema comes
 * back as an error entry for its slot; nothing here throws for bad data.
 */
import { createHash } from 'node:crypto'
import { lstat, readFile, readdir, realpath, stat } from 'node:fs/promises'
import { join, sep } from 'node:path'
import { ID_PATTERN, MAX_CARD_BYTES, checkBoard, checkCard, parseJson } from './schema.js'

const MAX_CARDS = 100
const MAX_BOARD_BYTES = 64 * 1024

/** A file's content if it is a regular file inside `root` and not too big; else a reason. */
async function readInside(root, path, maxBytes) {
  let real
  try {
    real = await realpath(path)
  } catch (error) {
    return { missing: error.code === 'ENOENT', problem: error.code === 'ENOENT' ? 'file not found' : `cannot read: ${error.code ?? error.message}` }
  }
  if (!real.startsWith(root + sep)) return { problem: 'points outside the data folder' }
  const info = await stat(real)
  if (!info.isFile()) return { problem: 'is not a file' }
  if (info.size > maxBytes) return { problem: `is larger than ${Math.round(maxBytes / 1024)} KB` }
  return { text: await readFile(real, 'utf8') }
}

async function readJson(root, path, maxBytes, check) {
  const file = await readInside(root, path, maxBytes)
  if (file.text === undefined) return { missing: file.missing === true, problems: [file.problem] }
  const parsed = parseJson(file.text)
  if (parsed.problems.length > 0) return { problems: parsed.problems }
  const problems = check(parsed.value)
  return problems.length > 0 ? { problems } : { value: parsed.value, problems: [] }
}

/** The data folder as an absolute real path, or undefined when it doesn't exist. */
export async function resolveDataDir(dataDir) {
  try {
    return await realpath(dataDir)
  } catch {
    return undefined
  }
}

/** Every board folder with a readable board.json, valid or not, sorted by id. */
export async function listBoards(root) {
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return []
  }
  const boards = []
  for (const entry of entries) {
    if (!ID_PATTERN.test(entry.name)) continue
    const dir = join(root, entry.name)
    const info = await lstat(dir).catch(() => undefined)
    if (info === undefined || !(info.isDirectory() || info.isSymbolicLink())) continue
    const board = await readJson(root, join(dir, 'board.json'), MAX_BOARD_BYTES, checkBoard)
    if (board.missing) continue
    boards.push({ id: entry.name, board: board.value, problems: board.problems })
  }
  return boards.sort((a, b) => a.id.localeCompare(b.id))
}

/** One board's board.json (validated), or undefined when the board doesn't exist. */
export async function readBoard(root, id) {
  if (!ID_PATTERN.test(id)) return undefined
  const board = await readJson(root, join(root, id, 'board.json'), MAX_BOARD_BYTES, checkBoard)
  if (board.missing) return undefined
  return { id, board: board.value, problems: board.problems }
}

/** The card ids in a board's cards folder, in board order: `order` first, then the rest by id. */
async function cardFiles(root, id, order) {
  let names
  try {
    names = await readdir(join(root, id, 'cards'))
  } catch {
    return []
  }
  const ids = names.filter(name => name.endsWith('.json')).map(name => name.slice(0, -5)).filter(card => ID_PATTERN.test(card)).sort()
  const present = new Set(ids)
  const first = (order ?? []).filter((card, i, list) => present.has(card) && list.indexOf(card) === i)
  const placed = new Set(first)
  return [...first, ...ids.filter(card => !placed.has(card))].slice(0, MAX_CARDS)
}

/**
 * A cheap version tag for a board: changes whenever board.json or any card
 * file is added, removed or rewritten. Built from file sizes and times only,
 * so an unchanged board answers a poll without reading a single card.
 */
export async function boardTag(root, id, salt = '') {
  const hash = createHash('sha256').update(salt)
  const add = async (label, path) => {
    const info = await stat(path).catch(() => undefined)
    hash.update(`${label}\0${info ? `${info.size}:${info.mtimeMs}` : '-'}\n`)
  }
  await add('board.json', join(root, id, 'board.json'))
  let names = []
  try {
    names = (await readdir(join(root, id, 'cards'))).filter(name => name.endsWith('.json')).sort()
  } catch {
    // no cards folder yet
  }
  for (const name of names) await add(name, join(root, id, 'cards', name))
  return `W/"${hash.digest('base64url').slice(0, 27)}"`
}

/** The path of a card file (ids already checked). */
export function cardPath(root, board, card) {
  return join(root, board, 'cards', `${card}.json`)
}

/** One valid card, or undefined. */
export async function readCard(root, board, card) {
  if (!ID_PATTERN.test(board) || !ID_PATTERN.test(card)) return undefined
  const result = await readJson(root, cardPath(root, board, card), MAX_CARD_BYTES, checkCard)
  return result.problems.length === 0 ? result.value : undefined
}

/** Every card of a board in order, each with its size on the grid and either the card or its problems. */
export async function readCards(root, id, board) {
  const layout = board?.layout ?? {}
  const cards = []
  for (const card of await cardFiles(root, id, board?.order)) {
    const size = { w: layout[card]?.w ?? 1, h: layout[card]?.h ?? 1 }
    const result = await readJson(root, join(root, id, 'cards', `${card}.json`), MAX_CARD_BYTES, checkCard)
    cards.push(result.problems.length > 0 ? { id: card, ...size, problems: result.problems.slice(0, 5) } : { id: card, ...size, card: result.value })
  }
  return cards
}

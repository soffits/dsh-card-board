/**
 * Where boards come from. The page and the routes ask one object; it answers from the data folder (boards that
 * scripts write as files), from a board command (boards read on demand from the program that owns the data), or
 * both. A board id offered by the command wins over a folder of the same name.
 *
 * Every source answers the same way: `list()`, `board(id)`, `cards(id, board, only)`, `card(id, card)`,
 * `boardTag(id, salt)`, `cardTag(id, card, salt)`,
 * `watch(id, listener)`, `status()` (the board command and why it failed, if it did) and, for a command, `press(id, event)`.
 */
import { join } from 'node:path'
import { boardTag, cardTag, listBoards, readBoard, readCard, readCards, resolveDataDir } from './store.js'

/** The boards of a data folder. */
export function createFolderSource({ dataDir, watches }) {
  const root = () => resolveDataDir(dataDir)
  return {
    async list() {
      const dir = await root()
      return dir === undefined ? [] : listBoards(dir)
    },
    async board(id) {
      const dir = await root()
      return dir === undefined ? undefined : readBoard(dir, id)
    },
    async cards(id, board, only) {
      return readCards(await root(), id, board, only)
    },
    async card(id, card) {
      return readCard(await root(), id, card)
    },
    async boardTag(id, salt) {
      return boardTag(await root(), id, salt)
    },
    async cardTag(id, card, salt) {
      return cardTag(await root(), id, card, salt)
    },
    async problems() {
      return []
    },
    async status() {
      return undefined
    },
    async watch(id, listener) {
      return watches.watch(join(await root(), id), listener)
    },
    async handles() {
      return false
    },
    press: undefined,
    touch() {},
    close() {},
  }
}

/** Command boards first, then folder boards. */
export function createSources({ folder, command }) {
  if (command === undefined) return folder
  const pick = async id => ((await command.knows(id)) ? command : folder)
  return {
    async list() {
      const [fromCommand, fromFolder] = await Promise.all([command.list(), folder.list()])
      const ids = new Set(fromCommand.map(entry => entry.id))
      return [...fromCommand, ...fromFolder.filter(entry => !ids.has(entry.id))].sort((a, b) => a.id.localeCompare(b.id))
    },
    board: async id => (await pick(id)).board(id),
    cards: async (id, board, only) => (await pick(id)).cards(id, board, only),
    card: async (id, card) => (await pick(id)).card(id, card),
    boardTag: async (id, salt) => (await pick(id)).boardTag(id, salt),
    cardTag: async (id, card, salt) => (await pick(id)).cardTag(id, card, salt),
    problems: async id => (await pick(id)).problems(id),
    /** `{ command, error? }` of the board command, if one is configured. */
    status: () => command.status(),
    watch: async (id, listener) => (await pick(id)).watch(id, listener),
    /** Whether presses on this board go to a command (otherwise they are only published). */
    async handles(id) {
      return (await pick(id)) === command
    },
    press: async (id, event) => command.press(id, event),
    touch: (id, card) => command.touch(id, card),
    close: () => command.close(),
  }
}

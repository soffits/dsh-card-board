/**
 * How each person has arranged each board, kept by the plugin per person so it follows them to every device. It is the
 * only thing the plugin stores about cards; the cards themselves stay where their producers write them.
 *
 *   <dataDir>/.arrange/<hash of the person>.json
 *     { "boards": { "<board>": { "pinned": ["<card>"], "order": ["<card>"] } } }
 *
 * A person's change reaches their other open pages through `subscribe`.
 */
import { parseArrangement } from './arrange.js'
import { createPersonStore } from './person-store.js'
import { ID_PATTERN } from './schema.js'

function clean(value) {
  if (typeof value?.boards !== 'object' || value.boards === null) return undefined
  const boards = {}
  for (const [board, arrangement] of Object.entries(value.boards)) {
    const parsed = ID_PATTERN.test(board) ? parseArrangement(arrangement) : undefined
    if (parsed) boards[board] = parsed
  }
  return { boards }
}

export function createArrangeStore(dir) {
  const store = createPersonStore(dir, () => ({ boards: {} }), clean)
  const listeners = new Set()
  const change = async (person, board, edit) => {
    await store.update(person, value => {
      const boards = { ...value.boards }
      edit(boards)
      return { boards }
    })
    for (const listener of [...listeners]) listener(person, board)
  }
  return {
    /** A person's arrangement of a board, or undefined when they never arranged it. */
    async get(person, board) {
      return (await store.read(person)).boards[board]
    },

    tag: store.tag,

    set: (person, board, arrangement) => change(person, board, boards => { boards[board] = arrangement }),

    /** Back to the board's own order. */
    reset: (person, board) => change(person, board, boards => { delete boards[board] }),

    /** Call `listener(person, board)` whenever an arrangement changes; returns the way to stop. */
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
}

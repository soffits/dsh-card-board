#!/usr/bin/env node
/**
 * Write card board files safely: validate, then write atomically.
 *
 *   dsh-card-board put <board> <card> [file|-]   write <dir>/<board>/cards/<card>.json
 *   dsh-card-board board <board> [file|-]        write <dir>/<board>/board.json
 *   dsh-card-board rm <board> <card>             remove a card
 *   dsh-card-board check [--board] <file|->      validate only
 *   dsh-card-board check --dir <dir>             validate every board and card under a data folder
 *   dsh-card-board check-command <command...>    run a board command's boards and each board, validate every answer
 *
 * The data folder comes from --dir or CARD_BOARD_DIR. Input is JSON from the
 * file, or stdin when it is "-" or left out. `put` fills a missing updatedAt
 * with the current time. Anything invalid exits 1 with the reasons on stderr
 * and writes nothing.
 */
import { randomBytes } from 'node:crypto'
import { mkdir, open, readFile, readdir, rename, rm, unlink } from 'node:fs/promises'
import { realpathSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runCommand } from '../src/command-source.js'
import { ID_PATTERN, MAX_CARD_BYTES, checkBoard, checkCard, parseJson } from '../src/schema.js'

const USAGE = `usage:
  dsh-card-board put <board> <card> [file|-]
  dsh-card-board board <board> [file|-]
  dsh-card-board rm <board> <card>
  dsh-card-board check [--board] <file|->
  dsh-card-board check --dir <dir>
  dsh-card-board check-command <command...>
options:
  --dir <dir>   the data folder (default: $CARD_BOARD_DIR)`

class UsageError extends Error {}
class InvalidError extends Error {
  constructor(problems) {
    super(problems.join('\n'))
    this.problems = problems
  }
}

function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dir') {
      if (argv[i + 1] === undefined) throw new UsageError('--dir needs a folder')
      flags.dir = argv[++i]
    } else if (arg.startsWith('--dir=')) flags.dir = arg.slice(6)
    else if (arg === '--board') flags.board = true
    else if (arg === '-h' || arg === '--help') flags.help = true
    else if (arg.startsWith('--')) throw new UsageError(`unknown option ${arg}`)
    else positional.push(arg)
  }
  return { positional, flags }
}

async function readInput(source, stdin) {
  if (source === undefined || source === '-') {
    const chunks = []
    for await (const chunk of stdin) chunks.push(chunk)
    return Buffer.concat(chunks).toString('utf8')
  }
  return readFile(source, 'utf8')
}

function id(value, what) {
  if (typeof value !== 'string' || !ID_PATTERN.test(value))
    throw new UsageError(`${what} id must match ${ID_PATTERN} (lowercase letters, digits, - and _)`)
  return value
}

function dataDir(flags, env) {
  const dir = flags.dir ?? env.CARD_BOARD_DIR
  if (!dir) throw new UsageError('say where the data folder is: --dir <dir> or CARD_BOARD_DIR')
  return dir
}

/** Write `text` to `path` through a temporary file in the same folder, so readers see the old or the new file, never half. */
export async function writeAtomic(path, text) {
  const temp = `${path}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`
  const handle = await open(temp, 'w', 0o644)
  try {
    await handle.writeFile(text)
    await handle.sync()
  } finally {
    await handle.close()
  }
  try {
    await rename(temp, path)
  } catch (error) {
    await unlink(temp).catch(() => {})
    throw error
  }
}

function validated(text, check) {
  const parsed = parseJson(text)
  if (parsed.problems.length > 0) throw new InvalidError(parsed.problems)
  const problems = check(parsed.value)
  if (problems.length > 0) throw new InvalidError(problems)
  return parsed.value
}

async function checkDir(dir, out) {
  let bad = 0
  let count = 0
  const boards = (await readdir(dir, { withFileTypes: true })).filter(entry => entry.isDirectory() && ID_PATTERN.test(entry.name))
  for (const board of boards) {
    const report = (file, problems) => {
      count += 1
      if (problems.length === 0) return
      bad += 1
      out.error(`${join(board.name, file)}:\n  ${problems.join('\n  ')}`)
    }
    const boardText = await readFile(join(dir, board.name, 'board.json'), 'utf8').catch(() => undefined)
    if (boardText === undefined) continue
    const parsed = parseJson(boardText)
    report('board.json', parsed.problems.length > 0 ? parsed.problems : checkBoard(parsed.value))
    const names = await readdir(join(dir, board.name, 'cards')).catch(() => [])
    for (const name of names.filter(n => n.endsWith('.json')).sort()) {
      const text = await readFile(join(dir, board.name, 'cards', name), 'utf8')
      const card = parseJson(text)
      report(join('cards', name), card.problems.length > 0 ? card.problems : checkCard(card.value))
    }
  }
  out.log(`${count} file${count === 1 ? '' : 's'} checked, ${bad} with problems`)
  return bad === 0 ? 0 : 1
}

/** Ask a board command for its boards and each board's cards, and check every answer against the schema. */
async function checkCommand(command, out, env) {
  const ask = async args => {
    const parsed = parseJson(await runCommand([...command, ...args], { env, timeoutMs: 120_000 }))
    if (parsed.problems.length > 0) throw new InvalidError(parsed.problems.map(problem => `${args.join(' ')}: ${problem}`))
    return parsed.value
  }
  let bad = 0
  let count = 0
  const report = (what, problems) => {
    count += 1
    if (problems.length === 0) return
    bad += 1
    out.error(`${what}:\n  ${problems.join('\n  ')}`)
  }
  const { boards } = await ask(['boards'])
  for (const [boardId, spec] of Object.entries(boards ?? {})) {
    report(`${boardId} (board)`, ID_PATTERN.test(boardId) ? checkBoard(spec) : ['not a valid board id'])
    const { cards } = await ask(['board', boardId])
    for (const [cardId, card] of Object.entries(cards ?? {})) {
      if (card !== null && typeof card === 'object' && typeof card.error === 'string' && Object.keys(card).length === 1) report(`${boardId}/${cardId}`, [`the command reported: ${card.error}`])
      else report(`${boardId}/${cardId}`, [...(ID_PATTERN.test(cardId) ? [] : ['not a valid card id']), ...checkCard({ updatedAt: new Date().toISOString(), ...card })])
    }
  }
  out.log(`${count} answer${count === 1 ? '' : 's'} checked, ${bad} with problems`)
  return bad === 0 ? 0 : 1
}

/** Run the CLI; returns the exit code. `io` is injectable for tests. */
export async function main(argv, { env = process.env, stdin = process.stdin, out = console, now = () => new Date() } = {}) {
  try {
    if (argv[0] === 'check-command') {
      const command = argv.slice(argv[1] === '--' ? 2 : 1)
      if (command.length === 0) throw new UsageError('say the board command, e.g. check-command kith cards')
      return await checkCommand(command, out, env)
    }
    const { positional, flags } = parseArgs(argv)
    const [command, ...rest] = positional
    if (flags.help || command === undefined) {
      out.log(USAGE)
      return command === undefined && !flags.help ? 2 : 0
    }
    if (command === 'put') {
      const [boardId, cardId, source] = rest
      const dir = dataDir(flags, env)
      id(boardId, 'board')
      id(cardId, 'card')
      const text = await readInput(source, stdin)
      const parsed = parseJson(text)
      if (parsed.problems.length > 0) throw new InvalidError(parsed.problems)
      const card = parsed.value
      if (typeof card === 'object' && card !== null && !Array.isArray(card) && !('updatedAt' in card))
        card.updatedAt = now().toISOString().replace(/\.\d{3}Z$/, 'Z')
      const problems = checkCard(card)
      if (problems.length > 0) throw new InvalidError(problems)
      const body = `${JSON.stringify(card, null, 2)}\n`
      if (Buffer.byteLength(body) > MAX_CARD_BYTES) throw new InvalidError([`the card is larger than ${MAX_CARD_BYTES / 1024} KB`])
      const folder = join(dir, boardId, 'cards')
      await mkdir(folder, { recursive: true })
      await writeAtomic(join(folder, `${cardId}.json`), body)
      return 0
    }
    if (command === 'board') {
      const [boardId, source] = rest
      const dir = dataDir(flags, env)
      id(boardId, 'board')
      const board = validated(await readInput(source, stdin), checkBoard)
      await mkdir(join(dir, boardId, 'cards'), { recursive: true })
      await writeAtomic(join(dir, boardId, 'board.json'), `${JSON.stringify(board, null, 2)}\n`)
      return 0
    }
    if (command === 'rm') {
      const [boardId, cardId] = rest
      const dir = dataDir(flags, env)
      id(boardId, 'board')
      id(cardId, 'card')
      await rm(join(dir, boardId, 'cards', `${cardId}.json`), { force: true })
      return 0
    }
    if (command === 'check') {
      if (rest.length === 0 && flags.dir !== undefined) return await checkDir(flags.dir, out)
      validated(await readInput(rest[0], stdin), flags.board ? checkBoard : checkCard)
      out.log('ok')
      return 0
    }
    throw new UsageError(`unknown command ${command}`)
  } catch (error) {
    if (error instanceof UsageError) {
      out.error(`${error.message}\n${USAGE}`)
      return 2
    }
    if (error instanceof InvalidError) {
      out.error(`invalid:\n  ${error.problems.join('\n  ')}`)
      return 1
    }
    out.error(error.message)
    return 1
  }
}

const invoked = process.argv[1] !== undefined && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
if (invoked) process.exitCode = await main(process.argv.slice(2))

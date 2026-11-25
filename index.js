/**
 * DeepSeek Harness Host plugin: a read-only card board.
 *
 * Boards come from small JSON card files that scripts write into a data folder,
 * or from a board command (`command`) that the plugin asks when a page needs
 * them. It checks who is asking and serves the boards they may see to the Web
 * UI page in client.js. It makes no outbound requests and holds no credentials;
 * the only program it runs is the board command the owner configured.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'
import { delimiter } from 'node:path'
import { fileURLToPath } from 'node:url'
import z from '@deepseek-ai/schemastery'
import { createEventStreams, createPeople, expandHome, readLocales, tableFor } from '@soffits/dsh-plugin-sdk/host'
import { createArrangeStore } from './src/arrange-store.js'
import { createCommandSource } from './src/command-source.js'
import { createPresses } from './src/presses.js'
import { createRoutes } from './src/routes.js'
import { createSeenStore } from './src/seen.js'
import { createWatches } from './src/watch.js'

export const name = 'dsh-card-board'
export const inject = ['connection']

/** card-board in DSH's home folder. */
export const DEFAULT_DATA_DIR = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'card-board')

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export const Config = z.object({
  dataDir: z.string().default(DEFAULT_DATA_DIR)
    .description('The folder holding the boards: <dataDir>/<board>/board.json and <dataDir>/<board>/cards/<card>.json, and the plugin\'s own state (what each person has seen, how they arranged a board, the press log). A leading ~/ means the home folder. Default: card-board in the DSH home.'),
  command: z.array(z.string()).default([])
    .description('A board command, as an argument list (the companion practice\'s is `companion cards`): the plugin runs `<command> boards`, `<command> board <id>` and `<command> press <id>` for boards read on demand instead of from files. A leading ~/ in the first part means the home folder. Empty: folder boards only.'),
  commandCwd: z.string().default('')
    .description('Where the board command runs (a home it finds from there). Default: the DSH process\'s own folder.'),
  commandTimeoutSeconds: z.natural().min(5).max(600).default(60)
    .description('How long one run of the board command may take.'),
  people: z.dict(z.string()).default({})
    .description('Verified user id (from the sign-in plugin, such as an OIDC sub) → person id used in a board\'s viewers. With any mapping configured, each person sees only the boards that list them.'),
  peopleFile: z.string().default('')
    .description('A JSON file with more of the same mapping, re-read when it changes. Entries in people win.'),
  peopleKey: z.string().default('')
    .description('The top-level key in peopleFile that holds the mapping. Empty means the whole file is the mapping.'),
  pollSeconds: z.natural().min(5).max(3600).default(30)
    .description('How often an open, visible page checks for changes while its live connection is down.'),
  actionLog: z.string().default('')
    .description('Where presses of done, snooze and event actions are appended (JSON lines). Empty means .actions.jsonl in dataDir.'),
  actionTimeoutSeconds: z.natural().min(10).default(300)
    .description('A press whose card nobody rewrites within this time shows as not handled.'),
})

/** `~/bin/tool` is the home folder's; a bare name is looked up on PATH. */
function absoluteCommand(part, absolute) {
  return part.startsWith('~/') ? absolute(part) : part
}

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {{ dataDir: string, command: string[], commandCwd: string, commandTimeoutSeconds: number, people: Record<string, string>, peopleFile: string, peopleKey: string, pollSeconds: number, actionLog: string, actionTimeoutSeconds: number }} config
 */
export function apply(ctx, config) {
  const logger = ctx.logger('card-board')
  const home = homedir()
  const absolute = path => {
    const expanded = expandHome(path, home)
    return isAbsolute(expanded) ? expanded : resolve(expanded)
  }
  const people = createPeople({
    people: config.people ?? {},
    peopleFile: config.peopleFile ? absolute(config.peopleFile) : '',
    peopleKey: config.peopleKey ?? '',
  }, { warn: message => logger.warn(message) })
  const dataDir = absolute(config.dataDir)
  const presses = createPresses({
    logPath: config.actionLog ? absolute(config.actionLog) : join(dataDir, '.actions.jsonl'),
    publisher: () => ctx.get('cronJobs')?.controller?.(),
    notify: event => ctx.emit('card-board/action', event),
    timeoutSeconds: config.actionTimeoutSeconds ?? 300,
    warn: message => logger.warn(message),
  })
  const watches = createWatches({ warn: message => logger.warn(message) })
  ctx.effect(() => () => watches.close())
  const command = (config.command ?? []).map((part, i) => (i === 0 ? absoluteCommand(part, absolute) : part))
  // A command named without a path is looked up on PATH, with the home's own bin folder added.
  const source = command.length === 0 ? undefined : createCommandSource({
    command,
    cwd: config.commandCwd ? absolute(config.commandCwd) : '',
    env: { ...process.env, PATH: [process.env.PATH, join(home, '.local', 'bin')].filter(Boolean).join(delimiter) },
    timeoutMs: (config.commandTimeoutSeconds ?? 60) * 1000,
    warn: message => logger.warn(message),
  })
  ctx.effect(() => () => source?.close())
  const streams = createEventStreams()
  ctx.effect(() => () => streams.close())
  const localeDir = fileURLToPath(new URL('./locale', import.meta.url))
  const routes = createRoutes({
    dataDir,
    source,
    people,
    identity: () => ctx.get('requestIdentity'),
    pollSeconds: config.pollSeconds ?? 30,
    presses,
    seen: createSeenStore(join(dataDir, '.seen')),
    arrange: createArrangeStore(join(dataDir, '.arrange')),
    watches,
    // Read on each request, so an update that changes only words shows without a restart.
    messages: async tag => tableFor(await readLocales(localeDir, { warn: message => logger.warn(message) }), tag),
    streams,
    version,
  })
  for (const route of routes) ctx.connection.fetch.register(route)
  logger.info(`serving boards from ${dataDir}${source ? ` and from \`${command.join(' ')}\`` : ''} (${people.enabled ? 'per person' : 'single owner'})`)
}

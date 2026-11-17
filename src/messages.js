/**
 * The page's own words. One file per language in `locale/<tag>.json` (the same
 * layout DSH packages use for their titles); a file's `ui` object holds the
 * page's messages next to its `meta`. Which languages exist is whatever files
 * are there: nothing in the code names one.
 *
 * A request for a language gets English overlaid by the language's primary
 * tag and then by the exact tag, so a half-translated file still shows whole
 * pages (`pt-BR` → `pt` → `en`).
 */
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

export const LANGUAGE_ID = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/
const REFERENCE = 'en'

/** Every language file in `directory`: lowercase id → its `ui` messages. */
export async function readLanguages(directory) {
  const languages = new Map()
  for (const name of (await readdir(directory)).sort()) {
    if (!name.endsWith('.json') || !LANGUAGE_ID.test(name.slice(0, -5))) continue
    const parsed = JSON.parse(await readFile(join(directory, name), 'utf8'))
    if (typeof parsed.ui === 'object' && parsed.ui !== null) languages.set(name.slice(0, -5).toLowerCase(), parsed.ui)
  }
  return languages
}

/** The tags to try for `tag`, most specific first, ending with English: `fr-CA` → fr-ca, fr, en. */
export function fallbackChain(tag) {
  const parts = String(tag).toLowerCase().split('-')
  const chain = parts.map((_, i) => parts.slice(0, parts.length - i).join('-'))
  return chain.includes(REFERENCE) ? chain : [...chain, REFERENCE]
}

/** The merged messages for `tag`, and the tags that contributed (most specific first). */
export function messagesFor(languages, tag) {
  const used = fallbackChain(tag).filter(id => languages.has(id))
  const messages = {}
  for (const id of [...used].reverse()) Object.assign(messages, languages.get(id))
  return { tag: used[0] ?? REFERENCE, messages }
}

/**
 * @param {string} directory - the package's `locale` folder
 * @returns {(tag: string) => Promise<{ tag: string, messages: Record<string, string> }>}
 */
export function createMessages(directory) {
  let languages
  return async tag => {
    languages ??= readLanguages(directory)
    return messagesFor(await languages, tag)
  }
}

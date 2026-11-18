import assert from 'node:assert/strict'
import { cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { createMessages, fallbackChain, messagesFor, readLanguages } from '../src/messages.js'

const LOCALE = new URL('../locale/', import.meta.url).pathname
const placeholders = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()

describe('the language files', () => {
  it('give every language every message English has, with the same placeholders', async () => {
    const languages = await readLanguages(LOCALE)
    const reference = languages.get('en')
    assert.ok(reference, 'en.json is the reference')
    assert.ok(languages.size >= 3, 'English, French and Chinese ship')
    for (const [id, messages] of languages) {
      assert.deepEqual(Object.keys(messages).sort(), Object.keys(reference).sort(), `${id} has exactly the keys of en`)
      for (const [key, text] of Object.entries(messages)) {
        assert.ok(typeof text === 'string' && text.trim() !== '', `${id}.${key} is text`)
        assert.deepEqual(placeholders(text), placeholders(reference[key]), `${id}.${key} keeps the placeholders`)
      }
    }
  })

  it('keep a title and description for DSH next to the messages', async () => {
    for (const name of await readdir(LOCALE)) {
      const file = JSON.parse(await readFile(join(LOCALE, name), 'utf8'))
      assert.equal(typeof file.meta?.title, 'string', name)
      assert.equal(typeof file.meta?.description, 'string', name)
    }
  })
})

describe('fallbackChain', () => {
  it('goes from the exact tag to its primary language to English', () => {
    assert.deepEqual(fallbackChain('pt-BR'), ['pt-br', 'pt', 'en'])
    assert.deepEqual(fallbackChain('zh-Hant-TW'), ['zh-hant-tw', 'zh-hant', 'zh', 'en'])
    assert.deepEqual(fallbackChain('en'), ['en'])
  })
})

describe('messagesFor', () => {
  const languages = new Map([
    ['en', { a: 'one', b: 'two', c: 'three' }],
    ['fr', { a: 'un', b: 'deux' }],
    ['fr-ca', { a: 'un (CA)' }],
  ])

  it('overlays the exact tag on its primary language on English', () => {
    assert.deepEqual(messagesFor(languages, 'fr-CA'), { tag: 'fr-ca', messages: { a: 'un (CA)', b: 'deux', c: 'three' } })
    assert.deepEqual(messagesFor(languages, 'fr-BE'), { tag: 'fr', messages: { a: 'un', b: 'deux', c: 'three' } })
  })

  it('answers English for a language nobody wrote', () => {
    assert.deepEqual(messagesFor(languages, 'ja'), { tag: 'en', messages: { a: 'one', b: 'two', c: 'three' } })
  })
})

describe('serving the words', () => {
  it('reads the folder on every request, so words an update adds show at once', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'card-board-locale-'))
    try {
      await writeFile(join(dir, 'en.json'), JSON.stringify({ ui: { panel: 'Panels' } }))
      const messages = createMessages(dir)
      assert.deepEqual((await messages('en')).messages, { panel: 'Panels' })
      await writeFile(join(dir, 'en.json'), JSON.stringify({ ui: { panel: 'Panels', countdown: 'Countdown' } }))
      assert.equal((await messages('en')).messages.countdown, 'Countdown')
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

describe('adding a language', () => {
  it('is one new file, with no change to the code', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'card-board-locale-'))
    try {
      await cp(LOCALE, dir, { recursive: true })
      const messages = createMessages(dir)
      assert.equal((await messages('it')).tag, 'en')
      await rm(dir, { recursive: true })
      await cp(LOCALE, dir, { recursive: true })
      await writeFile(join(dir, 'it.json'), JSON.stringify({ ui: { panel: 'Pannelli' } }))
      const added = await createMessages(dir)('it-IT')
      assert.equal(added.tag, 'it')
      assert.equal(added.messages.panel, 'Pannelli')
      assert.equal(added.messages.loading, (await readLanguages(LOCALE)).get('en').loading, 'the rest falls back to English')
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('ignores files that are not language files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'card-board-locale-'))
    try {
      await writeFile(join(dir, 'en.json'), JSON.stringify({ ui: { panel: 'Boards' } }))
      await writeFile(join(dir, 'notes.txt'), 'x')
      await writeFile(join(dir, 'not a tag.json'), '{"ui":{"panel":"x"}}')
      await writeFile(join(dir, 'de.json'), JSON.stringify({ meta: { title: 'nur Titel' } }))
      assert.deepEqual([...(await readLanguages(dir)).keys()], ['en'])
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})

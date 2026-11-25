import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { readLocales } from '@soffits/dsh-plugin-sdk/host'

const LOCALE = new URL('../locale/', import.meta.url).pathname
const placeholders = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()

describe('the language files', () => {
  it('give every language every message English has, with the same placeholders', async () => {
    const languages = await readLocales(LOCALE, { warn: message => assert.fail(message) })
    const reference = languages.en
    assert.ok(reference, 'en.json is the reference')
    assert.ok(Object.keys(languages).length >= 3, 'English, French and Chinese ship')
    for (const [id, messages] of Object.entries(languages)) {
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

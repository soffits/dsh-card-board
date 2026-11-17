import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { hasNav, readNav, writeNav } from '../src/client/nav.js'

describe('nav', () => {
  it('reads and writes the open card in the URL, leaving other params alone', () => {
    assert.deepEqual(readNav('?board=home&card=chores&row=library-books&x=1'), { board: 'home', card: 'chores', row: 'library-books' })
    assert.deepEqual(readNav(''), {})
    assert.equal(writeNav('?x=1', { board: 'home', card: 'chores' }), '?x=1&board=home&card=chores')
    assert.equal(writeNav('?x=1&board=home&card=chores&row=a', {}), '?x=1')
    assert.equal(writeNav('?card=a', {}), '')
    assert.equal(hasNav('?card=a'), true)
    assert.equal(hasNav('?board=a'), false)
  })
})

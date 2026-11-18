import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { onControl } from '../src/client/links.js'

// A stand-in for an element: `closest` finds itself or the nearest ancestor that matches.
const element = (name, parent = null, control = false) => ({ name, parent, closest(selector) { for (let at = this; at; at = at.parent) if (at.control) return at; return null }, control })

describe('onControl', () => {
  it('lets a row that opens take a click on itself or its text, but not on a button inside it', () => {
    const row = element('row', null, true)              // li role=button, the listener
    const text = element('text', row)
    const button = element('snooze', row, true)
    assert.equal(onControl({ target: row, currentTarget: row }), false)
    assert.equal(onControl({ target: text, currentTarget: row }), false)
    assert.equal(onControl({ target: button, currentTarget: row }), true)
  })

  it('keeps a card from opening when the tap was on a row that opens itself', () => {
    const card = element('card')
    const row = element('row', card, true)
    assert.equal(onControl({ target: element('text', row), currentTarget: card }), true)
    assert.equal(onControl({ target: element('body', card), currentTarget: card }), false)
  })
})

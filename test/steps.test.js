import assert from 'node:assert/strict'
import { test } from 'node:test'
import { browserOffset, ownOffset, offsetName, stepTimes } from '../src/client/steps.js'

test('an explicit offset is read from the time itself', () => {
  assert.equal(ownOffset('2026-03-04T14:20:00-07:00'), -420)
  assert.equal(ownOffset('2026-03-04T14:20:00+05:30'), 330)
  assert.equal(ownOffset('2026-03-04T14:20:00Z'), 0)
  assert.equal(ownOffset('2026-03-04'), null)
  assert.equal(offsetName(-420), 'GMT−7')
  assert.equal(offsetName(330), 'GMT+5:30')
})

test('a step in another zone shows the wall time of its own offset, even when the browser disagrees', () => {
  const at = '2026-03-04T14:20:00-03:00' // Paris is never at -03:00: the browser's rules disagree with the writer
  const [step] = stepTimes([{ at, label: 'x', zone: 'Europe/Paris' }], 'en-GB', 'Asia/Tokyo')
  assert.match(step.text, /14:20/)
  assert.match(step.text, /GMT−3$/)
  assert.equal(step.time.toISOString(), '2026-03-04T17:20:00.000Z')
})

test('when the browser agrees, the zone keeps its short name', () => {
  const at = '2026-07-04T14:20:00+02:00'
  assert.equal(browserOffset('Europe/Paris', new Date(at)), 120)
  const [step] = stepTimes([{ at, label: 'x', zone: 'Europe/Paris' }], 'en-GB', 'Asia/Tokyo')
  assert.match(step.text, /14:20/)
  assert.doesNotMatch(step.text, /GMT−/)
})

test('a step without a zone, or in the viewer\'s, is shown in the viewer\'s zone', () => {
  const [a, b] = stepTimes([{ at: '2026-03-04T05:00:00Z', label: 'a' }, { at: '2026-03-04T06:00:00Z', label: 'b', zone: 'Asia/Tokyo' }], 'en-GB', 'Asia/Tokyo')
  assert.match(a.text, /14:00/)
  assert.match(b.text, /15:00/)
  assert.doesNotMatch(b.text, /GMT|JST/)
})

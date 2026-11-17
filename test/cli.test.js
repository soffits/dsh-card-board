import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { after, before, describe, it } from 'node:test'
import { main } from '../bin/dsh-card-board.js'

let dir
before(async () => { dir = await mkdtemp(join(tmpdir(), 'card-board-cli-')) })
after(async () => { await rm(dir, { recursive: true, force: true }) })

function run(args, input = '', env = {}) {
  const out = { lines: [], errors: [] }
  const io = {
    env: { CARD_BOARD_DIR: dir, ...env },
    stdin: Readable.from([Buffer.from(input)]),
    out: { log: line => out.lines.push(line), error: line => out.errors.push(line) },
    now: () => new Date('2026-03-02T09:30:12.345Z'),
  }
  return main(args, io).then(code => ({ code, ...out }))
}

const list = { type: 'list', title: 'Errands', data: { rows: [{ title: 'Post office' }] } }

describe('dsh-card-board', () => {
  it('writes a board and a card from stdin, filling updatedAt', async () => {
    assert.equal((await run(['board', 'family', '-'], JSON.stringify({ title: 'Family', viewers: ['alex'] }))).code, 0)
    assert.equal((await run(['put', 'family', 'errands'], JSON.stringify(list))).code, 0)
    const written = JSON.parse(await readFile(join(dir, 'family', 'cards', 'errands.json'), 'utf8'))
    assert.equal(written.updatedAt, '2026-03-02T09:30:12Z')
    assert.equal(written.title, 'Errands')
  })

  it('refuses an invalid card, says why and leaves the old file alone', async () => {
    const before = await readFile(join(dir, 'family', 'cards', 'errands.json'), 'utf8')
    const result = await run(['put', 'family', 'errands'], JSON.stringify({ ...list, data: { rows: [{ titel: 'x' }] } }))
    assert.equal(result.code, 1)
    assert.match(result.errors.join('\n'), /data\.rows\[0\]\.title: is required/)
    assert.equal(await readFile(join(dir, 'family', 'cards', 'errands.json'), 'utf8'), before)
    const leftovers = (await readdir(join(dir, 'family', 'cards'))).filter(name => name.endsWith('.tmp'))
    assert.deepEqual(leftovers, [])
  })

  it('refuses ids that could leave the data folder', async () => {
    const result = await run(['put', '..', 'x'], JSON.stringify(list))
    assert.equal(result.code, 2)
    assert.match(result.errors[0], /board id must match/)
  })

  it('reads a file argument and --dir', async () => {
    const other = await mkdtemp(join(tmpdir(), 'card-board-cli-dir-'))
    const file = join(other, 'in.json')
    await writeFile(file, JSON.stringify(list))
    try {
      assert.equal((await run(['put', 'b', 'c', file, '--dir', other], '', { CARD_BOARD_DIR: '' })).code, 0)
      assert.ok(JSON.parse(await readFile(join(other, 'b', 'cards', 'c.json'), 'utf8')))
    } finally {
      await rm(other, { recursive: true, force: true })
    }
  })

  it('needs a data folder for writes', async () => {
    const result = await run(['put', 'b', 'c'], JSON.stringify(list), { CARD_BOARD_DIR: '' })
    assert.equal(result.code, 2)
    assert.match(result.errors[0], /data folder/)
  })

  it('removes a card', async () => {
    await run(['put', 'family', 'gone'], JSON.stringify(list))
    assert.equal((await run(['rm', 'family', 'gone'])).code, 0)
    assert.equal((await readdir(join(dir, 'family', 'cards'))).includes('gone.json'), false)
  })

  it('checks a file or a whole folder without writing', async () => {
    assert.deepEqual(await run(['check', '-'], JSON.stringify({ ...list, updatedAt: '2026-03-02T09:30:00Z' })), { code: 0, lines: ['ok'], errors: [] })
    assert.equal((await run(['check', '--board', '-'], '{"title": 1}')).code, 1)
    const examples = new URL('../examples/boards', import.meta.url).pathname
    const result = await run(['check', '--dir', examples])
    assert.equal(result.code, 0)
    assert.match(result.lines[0], /8 files checked, 0 with problems/)
  })

  it('reports JSON that does not parse', async () => {
    const result = await run(['put', 'family', 'x'], '{ nope')
    assert.equal(result.code, 1)
    assert.match(result.errors[0], /not valid JSON/)
  })
})

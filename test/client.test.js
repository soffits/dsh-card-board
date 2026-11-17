import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { describe, it } from 'node:test'
import { parse } from 'acorn'
import { readLanguages } from '../src/messages.js'

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const pkg = JSON.parse(read('package.json'))
const HAS_LETTER = /\p{L}/u
/** Props that carry words a person reads. */
const TEXT_PROPS = new Set(['title', 'aria-label', 'placeholder', 'alt', 'label'])

const registrations = []
/** A page's global scope: DSH runs every client script as a classic script in one of these. */
const newContext = () => vm.createContext({ window: { __ModuleLoader__: { load: registration => registrations.push(registration) } }, document: undefined })
const LOCALE = new URL('../locale/', import.meta.url).pathname

function nodes(root, visit) {
  const walk = node => {
    if (node === null || typeof node !== 'object') return
    if (Array.isArray(node)) return node.forEach(walk)
    if (typeof node.type === 'string') visit(node)
    for (const key of Object.keys(node)) if (key !== 'type') walk(node[key])
  }
  walk(root)
}

/** The words a rendered child could be made of: string literals and the text parts of templates, through && || ?? and ?:. */
function* wordsIn(node) {
  switch (node?.type) {
    case 'Literal': if (typeof node.value === 'string') yield node.value; break
    case 'TemplateLiteral': for (const quasi of node.quasis) yield quasi.value.cooked; break
    case 'ConditionalExpression': yield* wordsIn(node.consequent); yield* wordsIn(node.alternate); break
    case 'LogicalExpression': yield* wordsIn(node.left); yield* wordsIn(node.right); break
    case 'ArrayExpression': for (const element of node.elements) yield* wordsIn(element); break
    default:
  }
}

/** Every literal a component hands to React as visible text, with its line. */
function renderedLiterals(source) {
  const found = []
  nodes(parse(source, { ecmaVersion: 'latest', locations: true }), node => {
    if (node.type !== 'CallExpression') return
    const callee = node.callee
    const isElement = (callee.type === 'Identifier' && callee.name === 'h') || (callee.type === 'MemberExpression' && callee.property.name === 'createElement')
    if (!isElement) return
    const [, props, ...children] = node.arguments
    for (const child of children) for (const text of wordsIn(child)) found.push({ text, line: child.loc.start.line, where: 'child' })
    if (props?.type === 'ObjectExpression') {
      for (const property of props.properties) {
        const name = property.key?.name ?? property.key?.value
        if (TEXT_PROPS.has(name)) for (const text of wordsIn(property.value)) found.push({ text, line: property.loc.start.line, where: name })
      }
    }
  })
  return found.filter(item => HAS_LETTER.test(item.text))
}

/** Keys passed to the translate function as literals (through a ?: too). */
function translatedKeys(source) {
  const keys = new Set()
  nodes(parse(source, { ecmaVersion: 'latest' }), node => {
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 't') for (const key of wordsIn(node.arguments[0])) keys.add(key)
  })
  return keys
}

describe('client.js', () => {
  it('renders no literal words: every visible string comes from the language files', () => {
    const words = renderedLiterals(read('client.js'))
    assert.deepEqual(words.map(item => `client.js:${item.line} ${item.where} ${JSON.stringify(item.text)}`), [], 'client.js puts a literal into the page')
  })

  it('only asks for words the language files have, and every word is used', async () => {
    const english = (await readLanguages(LOCALE)).get('en')
    const code = read('client.js')
    for (const key of translatedKeys(code)) assert.ok(key in english, `client.js asks for ${key}`)
    for (const key of [...code.matchAll(/'(error\.\w+)'/g)].map(match => match[1])) assert.ok(key in english, key)
    for (const key of Object.keys(english)) assert.ok(code.includes(`'${key}'`), `${key} is not used anywhere`)
  })

  it('names no language', () => {
    const named = /\b(?:English|French|Chinese|Japanese|Spanish|German|zh-CN|zh-TW|en-US|fr-FR)\b/
    for (const file of ['client.js', 'src/messages.js']) {
      const code = read(file).split('\n').filter(line => !line.trim().startsWith('//') && !line.trim().startsWith('*') && !line.trim().startsWith('/*'))
      assert.deepEqual(code.filter(line => named.test(line)), [], `${file} names a language`)
    }
  })
})

describe('the shared buttons', () => {
  it('come from @soffits/dsh-ui-actions: this package loads after it and carries no copy', () => {
    assert.ok(pkg.dsh.client.inject.includes('@soffits/dsh-ui-actions'))
    assert.ok(!pkg.files.includes('client.actions.js'))
    assert.throws(() => readFileSync(new URL('../client.actions.js', import.meta.url)), { code: 'ENOENT' })
    assert.doesNotMatch(read('client.js'), /require\.async|createActions|startChat|chatText/)
    assert.match(read('client.js'), /ctx\.inject\(\['uiActions'\]/)
  })

  it('are optional: the page registers and works without them', () => {
    const before = registrations.length
    vm.runInContext(read('client.js'), newContext())
    const registration = registrations[before]
    assert.equal(registration.id, pkg.name)
    assert.equal(registration.chunk, undefined)
  })
})

describe('how the page registers with DSH', () => {
  it('leaves nothing behind in the global scope', () => {
    const context = newContext()
    vm.runInContext(read('client.js'), context)
    assert.deepEqual(Object.keys(context).filter(key => !['window', 'document'].includes(key)), [])
  })
})

import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import vm from 'node:vm'
import { describe, it } from 'node:test'
import { parse } from 'acorn'
import { readLocales } from '@soffits/dsh-plugin-sdk/host'

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const pkg = JSON.parse(read('package.json'))
const HAS_LETTER = /\p{L}/u
/** Props that carry words a person reads. */
const TEXT_PROPS = new Set(['title', 'aria-label', 'placeholder', 'alt', 'label'])

const registrations = []
/** A page's global scope: DSH runs every client script as a classic script in one of these. */
const newContext = () => vm.createContext({ window: { __ModuleLoader__: { load: registration => registrations.push(registration) } }, document: undefined })
const LOCALE = new URL('../locale/', import.meta.url).pathname
/** The page's sources, each with its name: the words rule is checked where the code is written. */
const SOURCES = readdirSync(new URL('../src/client/', import.meta.url)).map(name => ({ name, code: read(`src/client/${name}`) }))
const ALL_SOURCE = SOURCES.map(source => source.code).join('\n')

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
  nodes(parse(source, { ecmaVersion: 'latest', sourceType: 'module', locations: true }), node => {
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
  nodes(parse(source, { ecmaVersion: 'latest', sourceType: 'module' }), node => {
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 't') for (const key of wordsIn(node.arguments[0])) keys.add(key)
  })
  return keys
}

describe('the page', () => {
  it('renders no literal words: every visible string comes from the language files', () => {
    const words = SOURCES.flatMap(({ name, code }) => renderedLiterals(code).map(item => `${name}:${item.line} ${item.where} ${JSON.stringify(item.text)}`))
    assert.deepEqual(words, [], 'the page puts a literal into the page')
  })

  it('only asks for words the language files have, and every word is used', async () => {
    const english = (await readLocales(LOCALE)).en
    for (const key of SOURCES.flatMap(({ code }) => [...translatedKeys(code)])) assert.ok(key in english, `the page asks for ${key}`)
    for (const key of [...ALL_SOURCE.matchAll(/'((?:error|dayPart)\.\w+)'/g)].map(match => match[1])) assert.ok(key in english, key)
    for (const key of Object.keys(english)) assert.ok(ALL_SOURCE.includes(`'${key}'`), `${key} is not used anywhere`)
  })

  it('names no language and no assistant', () => {
    const named = /\b(?:English|French|Chinese|Japanese|Spanish|German|zh-CN|zh-TW|en-US|fr-FR)\b/
    for (const { name, code } of SOURCES) {
      const lines = code.split('\n').filter(line => !line.trim().startsWith('//') && !line.trim().startsWith('*') && !line.trim().startsWith('/*'))
      assert.deepEqual(lines.filter(line => named.test(line)), [], `${name} names a language`)
    }
    assert.doesNotMatch(ALL_SOURCE, /Sakina|Claude/)
  })

  it('is built from its sources: client.js is current', async () => {
    const { execFileSync } = await import('node:child_process')
    execFileSync(process.execPath, [new URL('../scripts/build.mjs', import.meta.url).pathname, '--check'])
  })
})

describe('the shared buttons and pieces', () => {
  it('come from @soffits/dsh-plugin-sdk and @soffits/dsh-plugin-sdk: this package loads after them and carries no copy', () => {
    assert.ok(pkg.dsh.client.inject.includes('@soffits/dsh-plugin-sdk'))
    assert.ok(pkg.dsh.client.inject.includes('@soffits/dsh-plugin-sdk'))
    assert.doesNotMatch(ALL_SOURCE, /require\.async|createActions|startChat|chatText|lucide/)
    assert.match(ALL_SOURCE, /ctx\.inject\(\['uiActions'\]/)
    assert.match(ALL_SOURCE, /ctx\.inject\(\['uiKit'\]/)
  })

  it('takes from DSH’s own components only names the oldest DSH it supports exports', () => {
    const shipped = readFileSync(new URL('../node_modules/@deepseek-ai/dsh-client-ui-primitives/lib/index.js', import.meta.url), 'utf8')
    const exported = new Set([...shipped.matchAll(/^export \{([^}]*)\}/gm)].flatMap(m => m[1].split(',').map(name => name.trim().split(/\s+as\s+/).pop())))
    const imported = [...ALL_SOURCE.matchAll(/import \{([^}]*)\} from '@deepseek-ai\/dsh-client-ui-primitives'/g)].flatMap(m => m[1].split(',').map(name => name.trim()).filter(Boolean))
    assert.ok(imported.length > 0)
    for (const name of imported) assert.ok(exported.has(name), `${name} is not in dsh-client-ui-primitives`)
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

/**
 * Builds client.js, the Web page in DSH's module-loader format, from src/client/. React and DSH's own components come
 * from the page's shared module table. client.js is committed so a linked checkout runs as it is; `--check` fails
 * when it is stale.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

const result = await build({
  entryPoints: [resolve(root, 'src/client/index.js')],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  external: ['react', '@deepseek-ai/dsh-client-ui-primitives'],
  legalComments: 'none',
  logLevel: 'warning',
})

// DSH runs client scripts as classic scripts in one global scope: everything stays inside the factory.
const out = `/* ${pkg.name} ${pkg.version}: built by scripts/build.mjs from src/client/. Do not edit. */
window.__ModuleLoader__.load({
  id: ${JSON.stringify(pkg.name)},
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
${result.outputFiles[0].text}
    return module.exports
  },
})
`
const target = resolve(root, 'client.js')
if (process.argv.includes('--check')) {
  let current = ''
  try { current = readFileSync(target, 'utf8') } catch {}
  if (current !== out) {
    console.error('client.js is stale: run npm run build')
    process.exit(1)
  }
} else {
  writeFileSync(target, out)
}

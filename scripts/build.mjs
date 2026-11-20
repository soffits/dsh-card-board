/**
 * Builds client.js, the Web page, from src/client/ (`@soffits/dsh-host-kit/build`). client.js is committed so a
 * linked checkout runs as it is; `--check` fails when it is stale.
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildClient } from '@soffits/dsh-host-kit/build'

await buildClient({ root: resolve(dirname(fileURLToPath(import.meta.url)), '..') })

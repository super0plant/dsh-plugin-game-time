#!/usr/bin/env node
/**
 * Builds the DSH plugin bundle.
 *
 *   dist/dsh-plugin-game-time-<version>.zip   DSH plugin (host + client + tests)
 *
 * Nothing is generated into the source tree.
 *
 * Usage: node scripts/build.mjs [--keep-staging]
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const DIST = resolve(ROOT, '..', '..', 'dist')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const version = pkg.version

/* Everything that both bundles need. */
const SHARED = ['client.js', 'src', 'README.md', 'LICENSE', 'CHANGELOG.md']
/* DSH-only shell: manifest, host entry, dictionaries, plugin icon, tests, handoff. */
const DSH = ['index.js', 'package.json', 'cordis.patch.yml', 'locale', 'icon.svg', 'tests', 'HANDOFF.md']
const bundles = [
  { folder: 'dsh-plugin-game-time', zip: 'dsh-plugin-game-time-' + version + '.zip', files: SHARED.concat(DSH) },
]

function copyInto(staging, bundle) {
  const target = join(staging, bundle.folder)
  mkdirSync(target, { recursive: true })
  for (const entry of bundle.files) {
    const from = join(ROOT, entry)
    if (!existsSync(from)) throw new Error('missing in source tree: ' + entry)
    cpSync(from, join(target, entry), {
      recursive: true,
      filter(source) {
        return !/[\\/](node_modules|\.git|\.icon-tmp)([\\/]|$)/.test(source) && !/launcher-error\.log$/i.test(source)
      },
    })
  }
  return target
}

function zipBundle(staging, bundle) {
  const zipPath = join(DIST, bundle.zip)
  rmSync(zipPath, { force: true })
  const result = spawnSync('tar', ['-a', '-c', '-f', zipPath, '-C', staging, bundle.folder], { stdio: 'inherit' })
  if (result.status !== 0) throw new Error('tar failed for ' + bundle.zip)
  return zipPath
}

mkdirSync(DIST, { recursive: true })

const staging = join(DIST, '.staging-' + process.pid)
rmSync(staging, { recursive: true, force: true })

try {
  for (const bundle of bundles) {
    const folder = copyInto(staging, bundle)
    const zipPath = zipBundle(staging, bundle)
    console.log(bundle.zip + '  ' + Math.round(statSync(zipPath).size / 1024) + ' KB')
  }
} finally {
  if (!process.argv.includes('--keep-staging')) rmSync(staging, { recursive: true, force: true })
}

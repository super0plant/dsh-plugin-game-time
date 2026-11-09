#!/usr/bin/env node
/**
 * Builds the two distribution bundles from ONE source tree.
 *
 *   dist/dsh-plugin-game-time-<version>.zip   DSH plugin (host + client + tests)
 *   dist/game-time-web-<version>.zip          standalone web build (no DSH)
 *
 * Both bundles read the same `client.js` and `src/host/*`; only the shell and
 * the shipped extras differ. Nothing is generated into the source tree.
 *
 * Usage: node scripts/build.mjs [--keep-staging]
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
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
/* Web-only shell: the entry that boots the host without DSH, plus app icons.
 * It also ships the one test that applies to it. */
const WEB = ['standalone', 'icon.png', 'icon.ico', 'tests/standalone-check.mjs']

const bundles = [
  { folder: 'dsh-plugin-game-time', zip: 'dsh-plugin-game-time-' + version + '.zip', files: SHARED.concat(DSH) },
  { folder: 'game-time-web', zip: 'game-time-web-' + version + '.zip', files: SHARED.concat(WEB) },
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

/** The web bundle must not advertise itself as a DSH plugin. */
function writeWebManifest(target) {
  const manifest = {
    name: 'game-time-web',
    version: version,
    private: true,
    type: 'module',
    description: 'Local play-time tracking — standalone web build (no DSH).',
    author: pkg.author,
    license: pkg.license,
    scripts: { start: 'node standalone/server.mjs' },
  }
  writeFileSync(join(target, 'package.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')
}

function zipBundle(staging, bundle) {
  const zipPath = join(DIST, bundle.zip)
  rmSync(zipPath, { force: true })
  const result = spawnSync('tar', ['-a', '-c', '-f', zipPath, '-C', staging, bundle.folder], { stdio: 'inherit' })
  if (result.status !== 0) throw new Error('tar failed for ' + bundle.zip)
  return zipPath
}

mkdirSync(DIST, { recursive: true })

/* Windows PowerShell 5.1 reads a BOM-less .ps1 as ANSI: the Chinese tray labels
 * turn into mojibake and the script fails to parse. Guard the artifact. */
const launcherBytes = readFileSync(join(ROOT, 'standalone', 'launcher.ps1'))
if (launcherBytes[0] !== 0xef || launcherBytes[1] !== 0xbb || launcherBytes[2] !== 0xbf) {
  throw new Error('standalone/launcher.ps1 must be saved as UTF-8 with BOM')
}
const staging = join(DIST, '.staging-' + process.pid)
rmSync(staging, { recursive: true, force: true })

try {
  for (const bundle of bundles) {
    const folder = copyInto(staging, bundle)
    if (bundle.folder === 'game-time-web') writeWebManifest(folder)
    const zipPath = zipBundle(staging, bundle)
    console.log(bundle.zip + '  ' + Math.round(statSync(zipPath).size / 1024) + ' KB')
  }
} finally {
  if (!process.argv.includes('--keep-staging')) rmSync(staging, { recursive: true, force: true })
}

/**
 * The Host exits with `process.exit()` right after the cordis shutdown
 * resolves, so an async flush scheduled from the effect disposer never lands.
 * This harness proves both write paths:
 *
 *   1. a closed session reaches disk within the debounce window, without a quit;
 *   2. a session still in memory when `process.exit()` runs is written by the
 *      synchronous exit hook.
 */
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const home = mkdtempSync(join(tmpdir(), 'gt-exit-'))
process.env.DSH_HOME = home
globalThis.__GT_HOST_TEST__ = {}

const { apply } = await import('../index.js')

const cleanups = []
const ctx = {
  logger: { info() {}, warn() {} },
  effect(fn) {
    const cleanup = fn()
    if (typeof cleanup === 'function') cleanups.push(cleanup)
    return () => {}
  },
  webServer: { register: () => () => {} },
}

apply(ctx)
await new Promise((resolve) => setTimeout(resolve, 400))

const testApi = globalThis.__GT_HOST_TEST__
const file = join(home, 'storages', 'game-time', 'sessions.json')
const read = () => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null)

function fakeSession(gameId, minutes) {
  // Anchor inside one local day: a `now - N minutes` span would split into two
  // pieces when the test happens to run just after midnight.
  const day = new Date()
  day.setHours(0, 0, 0, 0)
  const start = day.getTime() + 3600000
  return { start, lastSeen: start + minutes * 60000, platformId: 'mihoyo', source: 'test' }
}

// --- 1. debounced flush after a session closes ---------------------------
testApi.closeSession('zzz', fakeSession('zzz', 5))
assert.equal(testApi.getSessions().length, 1, 'the session is in memory')
assert.equal(read(), null, 'nothing on disk yet')

await new Promise((resolve) => setTimeout(resolve, 2500))
const flushed = read()
assert.ok(flushed, 'the debounced flush wrote sessions.json')
assert.equal(flushed.length, 1)
assert.equal(flushed[0].gameId, 'zzz')
assert.equal(Math.round((flushed[0].end - flushed[0].start) / 60000), 5)
console.log('exit-check: debounced flush OK (1 session on disk)')

// --- 2. synchronous write on process exit --------------------------------
testApi.closeSession('lol', fakeSession('lol', 7))

let failed = null
process.on('exit', () => {
  // Runs after the plugin's hook (registered at apply time, i.e. earlier).
  const onDisk = read()
  try {
    assert.ok(onDisk, 'sessions.json exists at exit')
    assert.equal(onDisk.length, 2, 'both sessions are on disk at exit')
    assert.deepEqual(
      onDisk.map((session) => session.gameId).sort(),
      ['lol', 'zzz']
    )
  } catch (error) {
    failed = error
    process.exitCode = 1
    console.error('exit-check: FAILED — ' + error.message)
  }
})

process.exit(0)

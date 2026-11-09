/**
 * A crash or a hard kill leaves the running session only in `active.json`.
 * These scenarios prove the next start picks it up:
 *
 *   gone     — the game is no longer running: the record closes at its last
 *              heartbeat, so the time played before the crash is kept;
 *   running  — the game survived: the record continues from its original
 *              start instead of restarting at zero;
 *   dupe     — the same span was already written to sessions.json: the record
 *              is dropped instead of being counted twice.
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scenario = process.env.GT_SCENARIO

if (!scenario) {
  for (const name of ['gone', 'running', 'dupe']) {
    const home = mkdtempSync(join(tmpdir(), 'gt-restore-' + name + '-'))
    const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], {
      env: { ...process.env, GT_SCENARIO: name, GT_HOME: home },
      stdio: 'inherit',
    })
    if (child.status !== 0) {
      console.error('restore-check: scenario failed: ' + name)
      process.exit(child.status || 1)
    }
  }
  console.log('restore-check: OK (gone / running / dupe)')
  process.exit(0)
}

const home = process.env.GT_HOME
const dir = join(home, 'storages', 'game-time')
process.env.DSH_HOME = home

const now = Date.now()
const start = now - 120000
const lastSeen = now - 30000
mkdirSync(dir, { recursive: true })
const fixture = {
  version: 1,
  active: [{ gameId: 'zzz', platformId: 'mihoyo', source: 'test', start, lastSeen }],
}
writeFileSync(join(dir, 'active.json'), JSON.stringify(fixture), 'utf8')

// The plugin ships no preset games, so the scenario needs its own config.
writeFileSync(
  join(dir, 'config.json'),
  JSON.stringify({
    version: 3,
    settings: { intervalSec: 10 },
    platforms: { mihoyo: { id: 'mihoyo', name: '米哈游', color: '#4f8ff7', path: '' } },
    games: [
      {
        id: 'zzz',
        name: '绝区零',
        glyph: '绝',
        color: '#4f8ff7',
        installs: [{ id: 'zzz-i1', platformId: 'mihoyo', path: 'D:/ZZZ/ZenlessZoneZero.exe' }],
        entries: [],
      },
    ],
  }),
  'utf8'
)

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

const testApi = globalThis.__GT_HOST_TEST__
const gameRunning = scenario === 'running'
testApi.setLister(async () => (gameRunning ? new Map([['zenlesszonezero.exe', [4242]]]) : new Map()))

if (scenario === 'dupe') {
  // Pretend this very span already reached sessions.json before the crash.
  const sessions = [{ id: 'seed', gameId: 'zzz', platformId: 'mihoyo', source: 'test', start, end: start + 60000 }]
  await (await import('node:fs/promises')).writeFile(join(dir, 'sessions.json'), JSON.stringify(sessions), 'utf8')
}

apply(ctx)
await new Promise((resolve) => setTimeout(resolve, 800))

const sessions = testApi.getSessions()
const records = testApi.getActive()

if (scenario === 'gone') {
  assert.equal(records.length, 0, 'the stale heartbeat is not left open')
  assert.equal(sessions.length, 1, 'it is written as a finished session')
  assert.equal(sessions[0].start, start, 'the original start is kept')
  assert.equal(sessions[0].end, lastSeen, 'it ends at the last heartbeat')
  console.log('  gone: closed at the last heartbeat (' + Math.round((lastSeen - start) / 1000) + 's kept)')
}

if (scenario === 'running') {
  assert.equal(records.length, 1, 'the game is still tracked')
  assert.equal(records[0][1].start, start, 'the session keeps its original start')
  assert.ok(records[0][1].lastSeen >= lastSeen, 'the heartbeat moved forward')
  assert.equal(sessions.length, 0, 'nothing is closed while the game runs')
  testApi.setLister(async () => new Map())
  await testApi.tick()
  const closed = testApi.getSessions()
  assert.equal(closed.length, 1, 'the continued session closes once')
  assert.equal(closed[0].start, start, 'the crash did not restart the clock')
  assert.ok(closed[0].end - closed[0].start >= 120000, 'the pre-crash time is still counted')
  console.log('  running: session continues from its original start')
}

if (scenario === 'dupe') {
  assert.equal(sessions.length, 1, 'the already-recorded span is not duplicated')
  console.log('  dupe: already-recorded span ignored')
}

for (const cleanup of cleanups) {
  const result = cleanup()
  if (result && typeof result.then === 'function') await result
}

// The clean shutdown removes the heartbeat so the next start does not resurrect it.
assert.equal(existsSync(join(dir, 'active.json')), false, 'a clean quit clears the heartbeat')



import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const home = mkdtempSync(join(tmpdir(), 'gt-host-'))
process.env.DSH_HOME = home

const testApi = {}
globalThis.__GT_HOST_TEST__ = testApi

const { apply, inject, name } = await import('../index.js')

assert.equal(name, 'dsh-plugin-game-time')
assert.deepEqual(inject, ['webServer'])

// --- mount with a stub context ------------------------------------------

const routes = []
const effects = []

const ctx = {
  logger: { info() {}, warn() {} },
  effect(fn) {
    const cleanup = fn()
    effects.push(cleanup)
    return () => {}
  },
  webServer: {
    register(route) {
      routes.push(route)
      return () => {}
    },
  },
}

apply(ctx)

assert.equal(routes.length, 1, 'exactly one route registered')
assert.equal(routes[0].kind, 'prefix')
assert.equal(routes[0].path, '/api/game-time')

await new Promise((resolve) => setTimeout(resolve, 300))

// --- HTTP face -----------------------------------------------------------

function callHandler(pathname, method = 'GET', payload = null) {
  const headers = {}
  let body = ''
  const listeners = {}
  const res = {
    writeHead(status, hdrs = {}) {
      this.status = status
      Object.assign(headers, hdrs)
    },
    end(chunk) {
      body = chunk === undefined ? '' : String(chunk)
    },
    headers,
  }
  const req = {
    url: pathname,
    method,
    on(event, fn) {
      ;(listeners[event] = listeners[event] || []).push(fn)
      return req
    },
    destroy() {},
  }
  const pending = routes[0].handler(req, res)
  setTimeout(function () {
    if (payload !== null) {
      const chunk = Buffer.from(JSON.stringify(payload))
      for (const fn of listeners.data || []) fn(chunk)
    }
    for (const fn of listeners.end || []) fn()
  }, 0)
  return pending.then(() => ({ status: res.status, headers, body }))
}

const ok = await callHandler('/api/game-time/state')
assert.equal(ok.status, 200)
assert.match(ok.headers['content-type'], /application\/json/)
const payload = JSON.parse(ok.body)
assert.equal(payload.source, 'live')
assert.equal(payload.version, 3)
assert.equal(payload.env.standalone, false, 'DSH is not the standalone host')
assert.equal(payload.env.autostart.supported, false)
assert.equal(payload.env.autostart.reason, 'dsh')
assert.ok(Array.isArray(payload.games) && payload.games.length === 0, 'a fresh install ships no games')
assert.ok(payload.platforms.mihoyo, 'platforms still ship')
assert.equal(payload.platforms.mihoyo.path, '', 'no personal launcher path ships')

assert.equal((await callHandler('/api/game-time/nope')).status, 404)
assert.equal((await callHandler('/api/game-time/state', 'POST')).status, 405)

const autostartFace = await callHandler('/api/game-time/autostart')
assert.equal(autostartFace.status, 200)
const autostartPayload = JSON.parse(autostartFace.body)
assert.equal(autostartPayload.supported, false)
assert.equal(autostartPayload.reason, 'dsh')

// --- autostart module (registry is never touched inside DSH) --------------

const autostartModule = await import('../src/host/autostart.js')
assert.deepEqual(autostartModule.parseRegQuery(''), { enabled: false, command: '' })
assert.deepEqual(
  autostartModule.parseRegQuery('    GameTime    REG_SZ    "C:\\node.exe" "C:\\gt\\server.mjs"'),
  { enabled: true, command: '"C:\\node.exe" "C:\\gt\\server.mjs"' }
)
assert.equal(
  autostartModule.buildAutostartCommand('C:\\node.exe', 'C:\\gt\\server.mjs'),
  '"C:\\node.exe" "C:\\gt\\server.mjs"'
)
let registryCalls = 0
const refused = await autostartModule.writeAutostart(true, async () => {
  registryCalls += 1
  return { code: 0, stdout: '' }
})
assert.equal(refused.ok, false)
assert.equal(refused.reason, 'dsh')
assert.equal(registryCalls, 0, 'DSH must never write the login entry')

// --- day splitting -------------------------------------------------------

const start = new Date(2026, 10, 8, 22, 30, 0).getTime()
const end = new Date(2026, 10, 9, 1, 15, 0).getTime()
const pieces = testApi.splitByDay('zzz', 'mihoyo', start, end)
assert.equal(pieces.length, 2)
assert.equal(new Date(pieces[0].end).getHours(), 0)
assert.equal(pieces[0].end, pieces[1].start)
assert.equal(pieces[0].end - pieces[0].start + (pieces[1].end - pieces[1].start), end - start)

// Process listing is exercised in the running app: this sandbox blocks
// child_process with piped stdio (spawn EPERM), so the harness skips it.

// --- configuration sanitising -------------------------------------------

assert.equal(testApi.sanitizeConfig(null), null)
assert.equal(testApi.sanitizeConfig({ games: 'nope' }), null)

const cleaned = testApi.sanitizeConfig({
  version: 3,
  settings: { intervalSec: 0, foregroundOnly: 'yes', autostart: 'nope', density: 'weird' },
  platforms: {
    p1: { id: 'p1', name: '  P1  ', color: 'not-a-colour', path: '  D:/Launcher/p1.exe  ' },
    p2: { id: 'p2', name: 'P2' },
  },
  games: [
    {
      id: 'g1',
      name: '  Test  ',
      color: 'red',
      installs: [
        { platformId: 'p1', path: '  D:/Games/X/Game.exe  ' },
        { platformId: 'ghost', path: 'D:/Games/Y/Game.exe' },
        { platformId: 'p1', path: '   ' },
      ],
      entries: [{ id: 'e1', platformId: 'ghost', path: '  C:/x.exe  ', args: 12 }],
    },
  ],
})

assert.equal(cleaned.settings.intervalSec, 2)
assert.equal(cleaned.settings.foregroundOnly, true)
assert.equal(cleaned.settings.autostart, true, 'autostart defaults to on')
assert.equal(
  testApi.sanitizeConfig({ version: 3, settings: { autostart: false }, games: [] }).settings.autostart,
  false,
  'an explicit opt-out survives sanitising'
)
assert.equal(cleaned.settings.density, 'comfortable')
assert.equal(cleaned.platforms.p1.name, 'P1')
assert.equal(cleaned.platforms.p1.color, '#8a8a8a')
assert.equal(cleaned.platforms.p1.path, 'D:/Launcher/p1.exe')
assert.equal(cleaned.games[0].name, 'Test')
assert.equal(cleaned.games[0].color, '#8a8a8a')
assert.equal(cleaned.games[0].installs.length, 2, 'blank install dropped')
assert.equal(cleaned.games[0].installs[0].path, 'D:/Games/X/Game.exe')
assert.equal(cleaned.games[0].installs[1].platformId, 'p1', 'unknown install platform falls back')
assert.equal(cleaned.games[0].entries[0].platformId, 'p1', 'unknown entry platform falls back')
assert.equal(cleaned.games[0].entries[0].path, 'C:/x.exe')
assert.equal(cleaned.games[0].entries[0].args, '')
assert.deepEqual(cleaned.games[0].platforms, ['p1'], 'platforms derive from installs and entries')

// --- optional stat group ------------------------------------------------

const grouped = testApi.sanitizeConfig({
  version: 3,
  settings: { groupColors: { '通关游戏': '#112233', bad: 'nope', '': '#445566' } },
  platforms: { p1: { id: 'p1', name: 'P1' } },
  games: [
    { id: 'g1', name: 'A', group: '  通关游戏  ' },
    { id: 'g2', name: 'B', group: '   ' },
  ],
})
assert.equal(grouped.games[0].group, '通关游戏', 'group name is trimmed and kept')
assert.equal(grouped.games[1].group, '', 'a blank group stays empty and keeps the platform key')
assert.equal(grouped.games[0].archived, false, 'archived defaults to false')
assert.deepEqual(grouped.settings.groupColors, { '通关游戏': '#112233' }, 'only valid name/colour pairs survive')

const archivedConfig = testApi.sanitizeConfig({
  version: 3,
  platforms: { p1: { id: 'p1', name: 'P1' } },
  games: [
    { id: 'g1', name: 'A', archived: true },
    { id: 'g2', name: 'B', archived: 'yes' },
  ],
})
assert.equal(archivedConfig.games[0].archived, true, 'a real boolean archives')
assert.equal(archivedConfig.games[1].archived, false, 'a truthy non-boolean does not')

// --- auto archive settings ----------------------------------------------

assert.equal(grouped.games[0].noAutoArchive, false, 'the auto-archive exemption defaults to false')

const monthly = testApi.sanitizeConfig({
  version: 3,
  settings: { autoArchive: { enabled: true, value: 0, unit: 'month' } },
  platforms: { p1: { id: 'p1', name: 'P1' } },
  games: [{ id: 'g1', name: 'A', noAutoArchive: true }],
})
assert.equal(monthly.settings.autoArchive.enabled, true)
assert.equal(monthly.settings.autoArchive.unit, 'month')
assert.equal(monthly.settings.autoArchive.value, 1, 'a month rule clamps to at least 1')
assert.equal(monthly.games[0].noAutoArchive, true, 'the per-game exemption survives a save')

const daily = testApi.sanitizeConfig({
  version: 3,
  settings: { autoArchive: { value: 9999, unit: 'week' } },
  platforms: { p1: { id: 'p1', name: 'P1' } },
  games: [{ id: 'g1', name: 'A' }],
})
assert.equal(daily.settings.autoArchive.value, 365, 'a day rule clamps at 365')
assert.equal(daily.settings.autoArchive.unit, 'day', 'an unknown unit falls back to days')
assert.equal(daily.settings.autoArchive.enabled, false, 'auto archive is opt-in')

const polluted = testApi.sanitizeConfig({
  version: 3,
  settings: { groupColors: JSON.parse('{"__proto__":"#445566","ok":"#778899"}') },
  platforms: { p1: { id: 'p1', name: 'P1' } },
  games: [{ id: 'g1', name: 'A' }],
})
assert.equal(Object.prototype.hasOwnProperty.call(polluted.settings.groupColors, '__proto__'), false)
assert.equal(polluted.settings.groupColors.ok, '#778899')

assert.ok(testApi.underDirectory('D:/Games/X/a.exe', 'd:\\games\\x'))
assert.ok(!testApi.underDirectory('D:/Games/Y/a.exe', 'D:/Games/X'))
assert.ok(testApi.underDirectory('anything', ''))

// --- migration -----------------------------------------------------------

const migrated = testApi.migrate({
  version: 1,
  games: [
    {
      id: 'lol-cn',
      name: '英雄联盟（国服）',
      platforms: ['tencent'],
      watch: ['League of Legends.exe'],
      runs: [{ id: 'r1', platformId: 'tencent', path: 'D:/Tencent/Game/League of Legends.exe', args: '' }],
    },
    {
      id: 'lol-jp',
      name: '英雄联盟（日服）',
      platforms: ['riot'],
      watch: ['League of Legends.exe'],
      runs: [{ id: 'r2', platformId: 'riot', path: 'D:/Riot/Game/League of Legends.exe', args: '' }],
    },
  ],
})

assert.equal(migrated.version, 3)
assert.equal(migrated.games.length, 1, 'the two league games fold into one')
assert.equal(migrated.games[0].id, 'lol')
assert.equal(migrated.games[0].installs.length, 2)
assert.deepEqual(
  migrated.games[0].installs.map((install) => install.platformId),
  ['tencent', 'riot']
)

// --- config round-trip: a user adds their first game ---------------------

const seeded = await callHandler('/api/game-time/config', 'POST', {
  version: 3,
  settings: { intervalSec: 10 },
  platforms: {
    mihoyo: { id: 'mihoyo', name: '米哈游', path: 'D:/miHoYo/launcher.exe', rank: 5 },
    steam: { id: 'steam', name: 'Steam', path: 'C:/Steam/steam.exe', rank: 9 },
  },
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
})
assert.equal(seeded.status, 200)
assert.equal(JSON.parse(seeded.body).games, 1, 'one game saved')

// --- config file ---------------------------------------------------------

const { readFile } = await import('node:fs/promises')
const config = JSON.parse(await readFile(join(testApi.DIR, 'config.json'), 'utf8'))
assert.equal(config.version, 3)
assert.equal(config.games.length, 1, 'the saved config keeps exactly the game we posted')
assert.equal(config.settings.intervalSec, 10)

for (const cleanup of effects) {
  if (typeof cleanup === 'function') cleanup()
}

console.log('host-check: OK')
console.log('  route:', routes[0].kind, routes[0].path)
console.log('  games:', payload.games.length, 'installs:', payload.games.reduce((n, g) => n + g.installs.length, 0))
console.log('  fresh games:', payload.games.length, '| platforms:', Object.keys(payload.platforms).length)
console.log('  split:', pieces.length, 'pieces')

// --- migration keeps presentation fields ---------------------------------

const kept = testApi.migrate({
  version: 1,
  platforms: { p1: { id: "p1", name: "P1" } },
  games: [
    {
      id: "g1",
      name: "G1",
      background: "/api/game-time/asset/aaaaaaaaaaaaaaaaaaaaaaaa.png",
      backgroundFit: "tile",
      backgroundOpacity: 0.19,
      backgroundMask: "#101820",
      backgroundMaskOpacity: 0.4,
      headerBackground: "/api/game-time/asset/bbbbbbbbbbbbbbbbbbbbbbbb.png",
      installs: [{ platformId: "p1", path: "D:/Games/G1/g1.exe" }],
      entries: [],
    },
  ],
})

assert.equal(kept.games[0].background, "/api/game-time/asset/aaaaaaaaaaaaaaaaaaaaaaaa.png")
assert.equal(kept.games[0].headerBackground, "/api/game-time/asset/bbbbbbbbbbbbbbbbbbbbbbbb.png")
assert.equal(kept.games[0].backgroundFit, "tile")
assert.equal(kept.games[0].backgroundMask, "#101820")
console.log("  migration keeps background fields")

// --- platform attribution ------------------------------------------------

const platforms = {
  mihoyo: { id: "mihoyo", name: "米哈游", path: "D:/miHoYo/launcher.exe", rank: 5 },
  playnite: { id: "playnite", name: "Playnite", path: "C:/Playnite/Playnite.DesktopApp.exe", rank: 1 },
  xxmi: { id: "xxmi", name: "Mod", path: "C:/XXMI/XXMI Launcher.exe", rank: 0 },
}

const single = { id: "zzz", installs: [{ platformId: "mihoyo", path: "D:/ZZZ/ZenlessZoneZero.exe" }] }
const multi = {
  id: "lol",
  installs: [
    { platformId: "tencent", path: "D:/CN/League of Legends.exe" },
    { platformId: "riot", path: "D:/JP/League of Legends.exe" },
  ],
}

/** Same shape `processChain()` returns: the game first, then its ancestors. */
const chain = (...names) =>
  names.map((name, index) => ({ pid: 9000 - index, name, parent: index === 0 ? 0 : 9001 - index, created: 0 }))

let result = testApi.attributePlatform(single, { platformId: "mihoyo" }, platforms, chain("ZenlessZoneZero.exe"))
assert.equal(result.platformId, "mihoyo", "no launcher evidence falls back to the install platform")
assert.equal(result.source, "自启动")

result = testApi.attributePlatform(
  single,
  { platformId: "mihoyo" },
  platforms,
  chain("ZenlessZoneZero.exe", "launcher.exe", "explorer.exe")
)
assert.equal(result.platformId, "mihoyo", "the install platform always owns the bucket")
assert.equal(result.source, "米哈游", "the launcher that spawned the game is the source")

result = testApi.attributePlatform(
  single,
  { platformId: "mihoyo" },
  platforms,
  chain("ZenlessZoneZero.exe", "playnite.desktopapp.exe")
)
assert.equal(result.platformId, "mihoyo", "a proven launcher must not steal the platform")
assert.equal(result.source, "Playnite", "the launcher still rides along as the source")

result = testApi.attributePlatform(single, { platformId: "mihoyo" }, platforms, chain("ZenlessZoneZero.exe", "explorer.exe"))
assert.equal(result.platformId, "mihoyo")
assert.equal(result.source, "自启动", "a launcher that is merely running is not evidence")

result = testApi.attributePlatform(
  multi,
  { platformId: "riot" },
  platforms,
  chain("League of Legends.exe", "playnite.desktopapp.exe")
)
assert.equal(result.platformId, "riot", "multi-install games keep the matched install platform")
assert.equal(result.source, null, "multi-install games keep a null source")

console.log("  attribution: 5 cases pass")

// --- a full collector tick must not throw --------------------------------

let chainCalls = 0
testApi.setChainReader(async function () {
  chainCalls += 1
  return chain("ZenlessZoneZero.exe", "steam.exe")
})
testApi.setLister(async function () {
  return new Map([
    ["zenlesszonezero.exe", [4242]],
    ["steam.exe", [11]],
  ])
})
await new Promise((resolve) => setTimeout(resolve, 100))
await testApi.tick()
const afterTick = JSON.parse((await callHandler("/api/game-time/state")).body)
assert.equal(afterTick.lastError, null, "tick must not throw: " + afterTick.lastError)
assert.equal(afterTick.active.length, 1, "the running game opens a session")
assert.equal(afterTick.active[0].gameId, "zzz")
assert.equal(
  afterTick.active[0].platformId,
  "mihoyo",
  "the running launcher must not steal the install platform"
)
assert.equal(chainCalls, 1, "the parent chain is read once per launch")

await testApi.tick()
const afterSecondTick = JSON.parse((await callHandler("/api/game-time/state")).body)
assert.equal(afterSecondTick.active[0].platformId, "mihoyo", "a later tick keeps the opening attribution")
assert.equal(chainCalls, 1, "later ticks never re-read the parent chain")

await testApi.setLister(async function () {
  return new Map()
})
await testApi.tick()
const afterStop = JSON.parse((await callHandler("/api/game-time/state")).body)
assert.equal(afterStop.active.length, 0, "the session closes when the process stops")

console.log("  tick: opens and closes a session without errors")

// --- history is kept; /state ships a window and the all-time totals ------

const oldStart = Date.now() - 400 * 86400000
const recentStart = Date.now() - 2 * 3600000
testApi.getSessions().push(
  { id: "old-1", gameId: "zzz", platformId: "steam", source: null, start: oldStart, end: oldStart + 3600000 },
  { id: "recent-1", gameId: "zzz", platformId: "steam", source: null, start: recentStart, end: recentStart + 1800000 }
)

const windowed = testApi.snapshot()
assert.equal(testApi.getSessions().some((session) => session.id === "old-1"), true, "old sessions are kept forever")
assert.equal(windowed.sessions.some((session) => session.id === "old-1"), false, "the state window skips old sessions")
assert.equal(windowed.sessions.some((session) => session.id === "recent-1"), true, "the state window keeps recent sessions")
assert.equal(windowed.historyDays, 365, "the default lazy-load window is one year")
assert.ok(windowed.historyFrom < recentStart, "historyFrom covers the last year")
assert.ok(windowed.firstStart <= oldStart, "firstStart still reaches the oldest session")
assert.ok(windowed.lastPlayed.zzz >= recentStart + 1800000, "lastPlayed reaches the newest session")

const expectedTotal = testApi
  .getSessions()
  .reduce((sum, session) => sum + (session.end - session.start) / 1000, 0)
assert.equal(Math.round(windowed.totals.total), Math.round(expectedTotal), "totals stay all-time")
const expectedGame = testApi
  .getSessions()
  .filter((session) => session.gameId === "zzz")
  .reduce((sum, session) => sum + (session.end - session.start) / 1000, 0)
assert.equal(Math.round(windowed.totals.game.zzz), Math.round(expectedGame), "per-game totals stay all-time")

// --- the lazy-load endpoint returns exactly the requested slice ----------

const day = 86400000
const slice = await callHandler(
  "/api/game-time/sessions?from=" + (oldStart - day) + "&to=" + (oldStart + day)
)
assert.equal(slice.status, 200)
const slicePayload = JSON.parse(slice.body)
assert.equal(slicePayload.sessions.some((session) => session.id === "old-1"), true, "the endpoint returns older sessions")
const invalidSlice = await callHandler("/api/game-time/sessions?from=nope&to=1")
assert.equal(invalidSlice.status, 422, "an invalid range is rejected")
assert.equal((await callHandler("/api/game-time/sessions", "POST")).status, 405)

// --- historyDays is clamped on save ---------------------------------------

const clampedDays = testApi.sanitizeConfig({ version: 3, games: [], platforms: {}, settings: { historyDays: 99999 } })
assert.equal(clampedDays.settings.historyDays, 1825, "historyDays clamps to five years")
const smallDays = testApi.sanitizeConfig({ version: 3, games: [], platforms: {}, settings: { historyDays: 1 } })
assert.equal(smallDays.settings.historyDays, 30, "historyDays clamps to one month")
console.log("  lazy history: old sessions kept, /state windowed, totals all-time, slice endpoint OK")

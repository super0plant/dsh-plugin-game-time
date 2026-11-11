/**
 * Game Time — Host entry: collector loop, snapshot and the HTTP face.
 */
import { spawn } from 'node:child_process'
import { renameSync, rmSync, writeFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import {
  ACTIVE_HEARTBEAT_MS, ACTIVE_PATH, ASSET_DIR, CONFIG_PATH, DAY_MS, DEFAULT_CONFIG, DIR,
  FLUSH_DEBOUNCE_MS, HISTORY_DAYS, HISTORY_DAYS_MAX, HISTORY_DAYS_MIN, MIN_SESSION_MS, PRESETS_PATH,
  PRESETS_VERSION, RETAIN_DAYS, SESSIONS_PATH,
} from './constants.js'
import { applyPresets, migrate, sanitizeConfig } from './config.js'
import { autostartReason, isStandaloneHost, readAutostart, writeAutostart } from './autostart.js'
import {
  attributePlatform, listProcesses, queryProcessPath, setProcessLister, underDirectory,
} from './processes.js'
import {
  ICON_SCRIPT, PICK_SCRIPT, browseExecutables, iconFromFile, pickFileViaDialog, processChain, resolveGamePath,
} from './scripts.js'
import { splitByDay } from './sessions.js'
import { baseName, dirName, fileExists, readJson, saveAsset, writeJson } from './values.js'

export const name = 'dsh-plugin-game-time'

/** The JSON face needs the Host web server. */
export const inject = ['webServer']

/**
 * Parent-chain lookup is one PowerShell call, so it runs once per game launch
 * and the answer is cached per pid. A failed lookup is cached too: never let a
 * broken WMI query add a stall to every tick.
 */
let chainReader = processChain
const chainCache = new Map()

async function chainFor(pid) {
  const key = Number(pid)
  if (!Number.isInteger(key) || key <= 0) return null
  if (chainCache.has(key)) return chainCache.get(key)
  let chain = null
  try {
    chain = await chainReader(key)
  } catch {
    chain = null
  }
  if (chainCache.size >= 32) chainCache.delete(chainCache.keys().next().value)
  chainCache.set(key, chain)
  return chain
}

function forgetChains() {
  chainCache.clear()
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

/* ------------------------------------------------------------------ *
 * Plugin
 * ------------------------------------------------------------------ */

export function apply(ctx) {
  const log = typeof ctx.logger?.warn === 'function' ? ctx.logger : null

  const state = {
    config: sanitizeConfig(DEFAULT_CONFIG) || JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
    sessions: [],
    ready: false,
    processes: null,
    env: {
      standalone: isStandaloneHost(),
      autostart: { supported: false, reason: autostartReason() || 'unread', enabled: false, target: '' },
    },
  }
  /** @type {Map<string, {start: number, lastSeen: number, platformId: string}>} */
  const active = new Map()
  let timer = null
  let flushTimer = null
  let exitHook = null
  let activeWriteAt = 0
  let ticking = false

  function startTimer() {
    if (timer) clearInterval(timer)
    const interval = Math.max(2, Number(state.config.settings.intervalSec) || 10)
    timer = setInterval(() => {
      tick()
    }, interval * 1000)
    if (timer && typeof timer.unref === 'function') timer.unref()
  }

  /**
   * Re-read the login entry. The registry is the truth; `settings.autostart`
   * only remembers the user's intent so a disabled entry is not re-created.
   */
  async function refreshEnv() {
    state.env = { standalone: isStandaloneHost(), autostart: await readAutostart() }
    return state.env
  }

  async function load() {
    const stored = await readJson(CONFIG_PATH, null)
    let config = sanitizeConfig(stored || DEFAULT_CONFIG) || JSON.parse(JSON.stringify(DEFAULT_CONFIG))
    const marker = await readJson(PRESETS_PATH, null)
    if (!marker || Number(marker.version) < PRESETS_VERSION) {
      config = sanitizeConfig(applyPresets(config)) || config
      await writeJson(PRESETS_PATH, { version: PRESETS_VERSION })
    }
    state.config = config
    const sessions = await readJson(SESSIONS_PATH, null)
    state.sessions = Array.isArray(sessions) ? sessions : []
    const heartbeat = await readJson(ACTIVE_PATH, null)
    if (heartbeat && Array.isArray(heartbeat.active)) restoreActive(heartbeat.active)
    await writeJson(CONFIG_PATH, state.config)
    state.ready = true
    await refreshEnv()
    if (isStandaloneHost() && state.env.autostart.supported && state.config.settings.autostart !== false && !state.env.autostart.enabled) {
      await writeAutostart(true)
      await refreshEnv()
    }
    startTimer()
    if (active.size > 0) tick()
  }

  async function flush() {
    try {
      await writeJson(SESSIONS_PATH, state.sessions)
    } catch (error) {
      if (log) log.warn(error)
    }
  }

  /**
   * Synchronous last-chance write. The Desktop Host answers a quit by calling
   * `shutdown()` and then `process.exit()`, which drops every pending promise —
   * an async flush scheduled from the effect disposer never reaches disk. This
   * runs from a `process.on('exit')` hook so a normal quit (and anything else
   * that exits the Host cleanly) still persists the sessions.
   */
  function flushSync() {
    if (!state.ready) return
    try {
      writeFileSync(SESSIONS_PATH + '.tmp', JSON.stringify(state.sessions, null, 2), 'utf8')
      renameSync(SESSIONS_PATH + '.tmp', SESSIONS_PATH)
    } catch (error) {
      if (log) log.warn(error)
    }
  }

  /** Write closed sessions soon after they arrive, instead of at quit time. */
  function scheduleFlush() {
    if (flushTimer) return
    flushTimer = setTimeout(function () {
      flushTimer = null
      flush()
    }, FLUSH_DEBOUNCE_MS)
    if (flushTimer && typeof flushTimer.unref === 'function') flushTimer.unref()
  }

  /** Close whatever is still open and persist it synchronously. */
  function finaliseSync() {
    if (timer) clearInterval(timer)
    if (flushTimer) clearTimeout(flushTimer)
    for (const [gameId, record] of Array.from(active.entries())) closeSession(gameId, record)
    active.clear()
    if (!state.ready) return // never read the files: keep the crash heartbeat intact
    flushSync()
    try {
      rmSync(ACTIVE_PATH, { force: true })
    } catch (error) {
      if (log) log.warn(error)
    }
  }

  /**
   * Write the sessions that are still open. They only live in `active`, so a
   * crash or a hard kill would otherwise lose the whole ongoing game; the
   * heartbeat bounds that loss to one interval.
   */
  async function persistActive() {
    activeWriteAt = Date.now()
    try {
      await writeJson(ACTIVE_PATH, {
        version: 1,
        active: Array.from(active.entries()).map(([gameId, record]) => ({
          gameId,
          platformId: record.platformId,
          installPlatformId: record.installPlatformId || null,
          source: record.source,
          start: record.start,
          lastSeen: record.lastSeen,
        })),
      })
    } catch (error) {
      if (log) log.warn(error)
    }
  }

  /**
   * Rebuild `active` from the heartbeat file. A restored record is either
   * picked up by the first tick (game still running, time keeps accumulating)
   * or closed at its last heartbeat, so the crash keeps the time it earned.
   */
  function restoreActive(items) {
    const known = new Set(state.config.games.map((game) => game.id))
    const recorded = new Set(state.sessions.map((session) => session.gameId + '@' + session.start))
    const cutoff = Date.now() - RETAIN_DAYS * DAY_MS
    for (const item of items) {
      if (!item || typeof item !== 'object') continue
      const gameId = String(item.gameId || '')
      if (!known.has(gameId) || active.has(gameId)) continue
      const start = Math.max(0, Number(item.start) || 0)
      const lastSeen = Math.max(start, Number(item.lastSeen) || 0)
      if (!start || lastSeen < cutoff) continue
      if (recorded.has(gameId + '@' + start)) continue
      active.set(gameId, {
        start,
        lastSeen,
        installPlatformId: item.installPlatformId || null,
        platformId: item.platformId || null,
        source: item.source || null,
      })
    }
  }

  function closeSession(gameId, record) {
    const end = Math.max(record.start + 1000, record.lastSeen)
    if (end - record.start < MIN_SESSION_MS) return
    for (const piece of splitByDay(gameId, record.platformId, record.start, end, record.source)) {
      state.sessions.push(piece)
    }
    scheduleFlush()
  }

  function claimsByProcess() {
    const map = new Map()
    for (const game of state.config.games) {
      for (const install of game.installs || []) {
        const process = baseName(install.path)
        if (!process) continue
        const key = process.toLowerCase()
        const list = map.get(key)
        const claim = { gameId: game.id, platformId: install.platformId, dir: dirName(install.path) }
        if (list) list.push(claim)
        else map.set(key, [claim])
      }
    }
    return map
  }

  async function tick() {
    if (ticking || !state.ready) return
    ticking = true
    try {
      const processes = await listProcesses()
      if (processes === null) return
      state.processes = processes
      const now = Date.now()
      const claims = claimsByProcess()
      const seen = new Set()
      let opened = false
      let closed = false

      for (const [name, pids] of processes) {
        const entries = claims.get(name)
        if (!entries || entries.length === 0) continue

        let winner = entries[0]
        if (entries.length > 1) {
          const resolved = await queryProcessPath(pids[0])
          const matched = entries.find((entry) => underDirectory(resolved, entry.dir))
          if (matched) winner = matched
        }
        seen.add(winner.gameId)

        const game = state.config.games.find(function (item) {
          return item.id === winner.gameId
        })
        const record = active.get(winner.gameId)
        if (record) {
          record.lastSeen = now
          // Attribution is a decision made when the session opens: the platform
          // and the launcher that started the game keep the credit until it
          // ends. Only a different winning install (a game installed on two
          // platforms) is allowed to re-attribute.
          if (!record.installPlatformId) {
            record.installPlatformId = winner.platformId
          } else if (record.installPlatformId !== winner.platformId && game) {
            record.installPlatformId = winner.platformId
            const chain = await chainFor(pids[0])
            const attribution = attributePlatform(game, winner, state.config.platforms, chain)
            record.platformId = attribution.platformId
            record.source = attribution.source
          }
        } else {
          // One parent-chain lookup per launch — only now, never per tick.
          const chain = game ? await chainFor(pids[0]) : null
          const attribution = game
            ? attributePlatform(game, winner, state.config.platforms, chain)
            : { platformId: winner.platformId, source: null }
          active.set(winner.gameId, {
            start: now,
            lastSeen: now,
            installPlatformId: winner.platformId,
            platformId: attribution.platformId,
            source: attribution.source,
          })
          opened = true
        }
      }

      for (const [gameId, record] of active.entries()) {
        if (seen.has(gameId)) continue
        closeSession(gameId, record)
        active.delete(gameId)
        closed = true
      }
      // A closed game's pid can be reused by anything; drop the cached chains.
      if (closed) forgetChains()

      if (opened || closed || (active.size > 0 && now - activeWriteAt >= ACTIVE_HEARTBEAT_MS)) {
        await persistActive()
      }
    } catch (error) {
      state.lastError = String((error && error.message) || error)
      if (log) log.warn(error)
    } finally {
      ticking = false
    }
  }

  function platformRunning(platform) {
    const names = []
    if (platform.path) names.push(baseName(platform.path))
    for (const alias of platform.processes || []) names.push(alias)
    return names.some(function (name) {
      return name && state.processes && state.processes.has(String(name).toLowerCase())
    })
  }

  function isProcessRunning(path) {
    if (!path || !state.processes) return false
    return state.processes.has(baseName(path).toLowerCase())
  }

  /** Clamp the configured lazy-load window to a sane number of days. */
  function historyDays() {
    const value = Number(state.config.settings.historyDays)
    if (!Number.isFinite(value)) return HISTORY_DAYS
    return Math.min(HISTORY_DAYS_MAX, Math.max(HISTORY_DAYS_MIN, Math.round(value)))
  }

  function snapshot() {
    const now = Date.now()
    const days = historyDays()
    const historyFrom = now - days * DAY_MS
    // All-time numbers travel separately from the session window: the client
    // only holds the last `historyDays` of detail, but "总计" must stay true.
    const totals = { total: 0, game: Object.create(null), platform: Object.create(null) }
    const lastPlayed = Object.create(null)
    const recent = []
    let firstStart = 0
    for (const session of state.sessions) {
      const start = Number(session.start)
      const end = Number(session.end)
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue
      const seconds = (end - start) / 1000
      totals.total += seconds
      totals.game[session.gameId] = (totals.game[session.gameId] || 0) + seconds
      totals.platform[session.platformId] = (totals.platform[session.platformId] || 0) + seconds
      if (!lastPlayed[session.gameId] || end > lastPlayed[session.gameId]) lastPlayed[session.gameId] = end
      if (!firstStart || start < firstStart) firstStart = start
      if (end >= historyFrom) recent.push(session)
    }
    return {
      source: 'live',
      version: 3,
      now,
      settings: state.config.settings,
      platforms: (function () {
        const out = {}
        for (const key of Object.keys(state.config.platforms)) {
          const platform = state.config.platforms[key]
          out[key] = {
            ...platform,
            exists: platform.path ? fileExists(platform.path) : false,
            running: platformRunning(platform),
          }
        }
        return out
      })(),
      games: state.config.games.map(function (game) {
        return {
          ...game,
          running: (game.installs || []).some(function (install) {
            return isProcessRunning(install.path)
          }),
          installs: (game.installs || []).map(function (install) {
            return { ...install, exists: fileExists(install.path) }
          }),
        }
      }),
      sessions: recent,
      historyFrom,
      historyDays: days,
      firstStart: firstStart || null,
      totals,
      lastPlayed,
      active: Array.from(active.entries()).map(([gameId, record]) => ({
        gameId,
        platformId: record.platformId,
        start: record.start,
        seconds: Math.round((now - record.start) / 1000),
      })),
      ready: state.ready,
      env: state.env,
      lastError: state.lastError || null,
    }
  }

  async function handleConfig(req, res) {
    let payload
    try {
      payload = await readBody(req, 4 * 1024 * 1024)
    } catch (error) {
      res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('invalid body')
      return
    }

    const next = sanitizeConfig(payload)
    if (!next) {
      res.writeHead(422, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('invalid config')
      return
    }

    const keep = new Set(next.games.map((game) => game.id))
    state.config = next
    state.sessions = state.sessions.filter((session) => keep.has(session.gameId))
    for (const gameId of Array.from(active.keys())) {
      if (!keep.has(gameId)) active.delete(gameId)
    }

    await writeJson(CONFIG_PATH, state.config)
    await flush()
    await persistActive()
    startTimer()

    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ ok: true, games: next.games.length }))
  }

  async function handler(req, res) {
    const url = new URL(req.url || '/', 'http://localhost')
    const path = url.pathname

    try {
      if (path === '/api/game-time/state' || path === '/api/game-time') {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('method not allowed')
          return
        }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify(snapshot()))
        return
      }

      if (path === '/api/game-time/sessions') {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('method not allowed')
          return
        }
        const fromParam = url.searchParams.get('from')
        const toParam = url.searchParams.get('to')
        const from = Number(fromParam)
        const to = Number(toParam)
        if (!fromParam || !toParam || !Number.isFinite(from) || !Number.isFinite(to) || from < 0 || to < 0) {
          res.writeHead(422, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('invalid range')
          return
        }
        const start = Math.min(from, to)
        const end = Math.max(from, to)
        const sessions = state.sessions.filter(function (session) {
          return session.start < end && session.end > start
        })
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ from: start, to: end, sessions }))
        return
      }

      if (path === '/api/game-time/config') {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('method not allowed')
          return
        }
        await handleConfig(req, res)
        return
      }

      if (path === '/api/game-time/asset' && req.method === 'POST') {
        let payload
        try {
          payload = await readBody(req, 6 * 1024 * 1024)
        } catch (error) {
          res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('invalid body')
          return
        }
        const url2 = await saveAsset(payload && payload.dataUrl)
        if (!url2) {
          res.writeHead(422, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('invalid image')
          return
        }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ url: url2 }))
        return
      }

      if (path.startsWith('/api/game-time/asset/')) {
        const name = path.slice('/api/game-time/asset/'.length)
        if (!/^[a-f0-9]{16,64}\.(png|jpg|webp)$/.test(name)) {
          res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('not found')
          return
        }
        try {
          const bytes = await readFile(join(ASSET_DIR, name))
          const type = name.endsWith('.png') ? 'image/png' : name.endsWith('.jpg') ? 'image/jpeg' : 'image/webp'
          res.writeHead(200, { 'content-type': type, 'cache-control': 'public, max-age=31536000, immutable' })
          res.end(bytes)
        } catch {
          res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('not found')
        }
        return
      }

      if (path === '/api/game-time/debug/processes') {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('method not allowed')
          return
        }
        const names = state.processes ? Array.from(state.processes.keys()).sort() : []
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ count: names.length, processes: names }))
        return
      }

      if (path === '/api/game-time/browse') {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('method not allowed')
          return
        }
        const dir = url.searchParams.get('dir') || ''
        const files = await browseExecutables(dir)
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ dir, files }))
        return
      }

      if (path === '/api/game-time/icon') {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('method not allowed')
          return
        }
        const dataUrl = await iconFromFile(url.searchParams.get('path') || '')
        if (!dataUrl) {
          res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('no icon')
          return
        }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ dataUrl }))
        return
      }

      if (path === '/api/game-time/pick-file') {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('method not allowed')
          return
        }
        const picked = await pickFileViaDialog()
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ path: picked || '' }))
        return
      }

      if (path === '/api/game-time/resolve') {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('method not allowed')
          return
        }
        const target = url.searchParams.get('path') || url.searchParams.get('url') || ''
        const resolved = await resolveGamePath(target)
        if (!resolved) {
          res.writeHead(422, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: false, warning: 'resolve failed' }))
          return
        }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify(resolved))
        return
      }

      if (path === '/api/game-time/reveal') {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('method not allowed')
          return
        }
        const target = url.searchParams.get('path') || ''
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: Boolean(target) }))
        if (target) {
          setImmediate(() => {
            try {
              const child = spawn('explorer.exe', ['/select,' + target], { detached: true, stdio: 'ignore' })
              child.unref()
            } catch {
              /* ignore a failed reveal */
            }
          })
        }
        return
      }

      if (path === '/api/game-time/autostart') {
        if (req.method === 'GET') {
          const env = await refreshEnv()
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify(env.autostart))
          return
        }
        if (req.method !== 'POST') {
          res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('method not allowed')
          return
        }
        let payload
        try {
          payload = await readBody(req, 16 * 1024)
        } catch (error) {
          res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
          res.end('invalid body')
          return
        }
        const enabled = Boolean(payload && payload.enabled)
        const result = await writeAutostart(enabled)
        if (!result.ok) {
          res.writeHead(409, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify(result))
          return
        }
        state.config.settings.autostart = enabled
        await writeJson(CONFIG_PATH, state.config)
        const env = await refreshEnv()
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: true, autostart: env.autostart }))
        return
      }

      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('not found')
    } catch (error) {
      if (log) log.warn(error)
      if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('error')
    }
  }

  if (typeof globalThis !== 'undefined' && globalThis.__GT_HOST_TEST__) {
    globalThis.__GT_HOST_TEST__.tick = tick
    globalThis.__GT_HOST_TEST__.getActive = function () {
      return Array.from(active.entries())
    }
    globalThis.__GT_HOST_TEST__.closeSession = function (gameId, record) {
      closeSession(gameId, record)
    }
    globalThis.__GT_HOST_TEST__.getSessions = function () {
      return state.sessions
    }
    globalThis.__GT_HOST_TEST__.snapshot = function () {
      return snapshot()
    }
  }

  ctx.effect(() => {
    // A quit can arrive between two ticks, and the Host exits right after the
    // cordis shutdown resolves; keep a synchronous last-chance writer on exit.
    exitHook = function () {
      finaliseSync()
    }
    if (typeof process !== 'undefined' && typeof process.on === 'function') process.on('exit', exitHook)

    load().catch((error) => {
      if (log) log.warn(error)
    })

    return () => {
      if (exitHook && typeof process !== 'undefined' && typeof process.off === 'function') {
        process.off('exit', exitHook)
        exitHook = null
      }
      finaliseSync()
    }
  }, 'game-time: collector')

  ctx.effect(() => {
    try {
      return ctx.webServer.register({ kind: 'prefix', path: '/api/game-time', handler })
    } catch (error) {
      if (log) log.warn(error)
      return () => {}
    }
  }, 'game-time: json face')
}

/* Test seam — only the Node harness defines this global. */
if (typeof globalThis !== 'undefined' && globalThis.__GT_HOST_TEST__) {
  Object.assign(globalThis.__GT_HOST_TEST__, {
    splitByDay,
    sanitizeConfig,
    migrate,
    underDirectory,
    setLister(fn) {
      setProcessLister(fn)
    },
    ICON_SCRIPT,
    PICK_SCRIPT,
    applyPresets,
    attributePlatform,
    setChainReader(fn) {
      chainReader = typeof fn === 'function' ? fn : processChain
      forgetChains()
    },
    forgetChains,
    DEFAULT_CONFIG,
    MIN_SESSION_MS,
    DIR,
  })
}

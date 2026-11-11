/**
 * Game Time — process enumeration and platform attribution.
 */
import { execFile } from 'node:child_process'
import { baseName } from './values.js'

export let processLister = null

export function listProcesses() {
  if (processLister) return processLister()
  return new Promise((resolve) => {
    execFile(
      'tasklist',
      ['/FO', 'CSV', '/NH'],
      { windowsHide: true, maxBuffer: 16 * 1024 * 1024, timeout: 20000 },
      (error, stdout) => {
        if (error) {
          resolve(null)
          return
        }
        const map = new Map()
        for (const line of String(stdout).split(/\r?\n/)) {
          const match = /^"([^"]+)","(\d+)"/.exec(line)
          if (!match) continue
          const key = match[1].toLowerCase()
          const pid = Number(match[2])
          const list = map.get(key)
          if (list) list.push(pid)
          else map.set(key, [pid])
        }
        resolve(map)
      }
    )
  })
}

export function queryProcessPath(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return Promise.resolve(null)
  return new Promise((resolve) => {
    execFile(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-Command', '(Get-Process -Id ' + String(pid) + ' -ErrorAction SilentlyContinue).Path'],
      { windowsHide: true, timeout: 15000 },
      (error, stdout) => {
        if (error) {
          resolve(null)
          return
        }
        const value = String(stdout).trim()
        resolve(value || null)
      }
    )
  })
}

export function underDirectory(path, directory) {
  if (!directory) return true
  if (!path) return false
  const normalise = (value) => String(value).replace(/\//g, '\\').replace(/\\+$/, '').toLowerCase()
  return normalise(path).startsWith(normalise(directory))
}

/** Process names that mean "this platform's launcher is running". */
export function launcherNames(platform) {
  const names = []
  if (platform && platform.path) names.push(baseName(platform.path))
  for (const alias of (platform && platform.processes) || []) names.push(alias)
  return names
    .map(function (name) {
      return String(name || '').trim().toLowerCase()
    })
    .filter(Boolean)
}

/** Is that platform's launcher running right now? */
export function launcherRunning(platform, processes, exceptName) {
  if (!platform || !processes) return false
  return launcherNames(platform).some(function (name) {
    return name && name !== exceptName && processes.has(name)
  })
}

/**
 * Attribution for one session — the rule the user asked for, in their order:
 *
 *   1. a game installed in several places keeps the install whose path matched;
 *   2. otherwise the first launch entry (config order = priority) whose
 *      launcher is running wins; the entry list is the per-game decision;
 *   3. nothing in the list is running → the install platform, `source` =
 *      "自启动" unless its own launcher is running.
 *
 * `platform.rank` is deliberately not consulted: reordering platforms in the
 * settings list must never change how a game is recognised.
 */
export function attributePlatform(game, winner, platforms, processes) {
  const installs = game.installs || []
  if (installs.length > 1) return { platformId: winner.platformId, source: null }
  const ownName = installs.length === 1 ? baseName(installs[0].path).toLowerCase() : ''

  for (const entry of game.entries || []) {
    const platform = entry ? platforms[entry.platformId] : null
    if (!platform) continue
    if (!launcherRunning(platform, processes, ownName)) continue
    return { platformId: platform.id, source: platform.name }
  }

  const installPlatform = platforms[winner.platformId]
  return {
    platformId: winner.platformId,
    source: launcherRunning(installPlatform, processes, ownName) ? installPlatform.name : '自启动',
  }
}

export function setProcessLister(fn) {
  processLister = fn
}

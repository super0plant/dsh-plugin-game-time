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

/**
 * One exe name → one platform. The first platform that claims a name keeps it,
 * so a duplicated alias can never make the result depend on object order.
 */
export function launcherIndex(platforms) {
  const index = new Map()
  for (const id of Object.keys(platforms || {})) {
    const platform = platforms[id]
    if (!platform || !platform.id) continue
    const names = []
    if (platform.path) names.push(baseName(platform.path))
    for (const alias of platform.processes || []) names.push(alias)
    for (const name of names) {
      const key = String(name || '').trim().toLowerCase()
      if (!key || index.has(key)) continue
      index.set(key, { id, name: platform.name })
    }
  }
  return index
}

/**
 * The launcher that actually spawned the game — the first ancestor matching a
 * configured platform exe/alias. `chain[0]` is the game itself, so it is never
 * treated as its own launcher. A launcher that is merely *running* (Steam in
 * the tray, Playnite minimised) never appears in this chain.
 */
export function launcherInChain(chain, platforms) {
  const index = launcherIndex(platforms)
  for (let depth = 1; depth < (chain || []).length; depth++) {
    const item = chain[depth]
    const key = String((item && item.name) || '').trim().toLowerCase()
    if (!key) continue
    const hit = index.get(key)
    if (hit) return hit
  }
  return null
}

/**
 * Attribution for one session.
 *
 * `platformId` is always where the game is installed: the stats bucket must not
 * depend on which launcher happens to be open. The launcher only rides along
 * as `source` ("通过哪个启动器启动"), and only when the parent chain proves it
 * started this process.
 */
export function attributePlatform(game, winner, platforms, chain) {
  const installs = game.installs || []
  if (installs.length > 1) return { platformId: winner.platformId, source: null }
  const launcher = launcherInChain(chain, platforms)
  if (!launcher) return { platformId: winner.platformId, source: '自启动' }
  return { platformId: winner.platformId, source: launcher.name }
}

export function setProcessLister(fn) {
  processLister = fn
}

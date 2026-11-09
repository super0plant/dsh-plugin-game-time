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

export function runningLaunchers(platforms, processes, exceptName) {
  const out = []
  for (const id of Object.keys(platforms || {})) {
    const platform = platforms[id]
    const names = []
    if (platform.path) names.push(baseName(platform.path))
    for (const alias of platform.processes || []) names.push(alias)
    const matched = names.some(function (name) {
      const key = String(name || '').toLowerCase()
      return key && key !== exceptName && processes && processes.has(key)
    })
    if (!matched) continue
    out.push({ id, name: platform.name, rank: Number(platform.rank) || 0 })
  }
  out.sort(function (left, right) {
    return left.rank - right.rank
  })
  return out
}

export function attributePlatform(game, winner, platforms, processes) {
  const installs = game.installs || []
  if (installs.length > 1) return { platformId: winner.platformId, source: null }
  const ownName = installs.length === 1 ? baseName(installs[0].path).toLowerCase() : ''
  const launchers = runningLaunchers(platforms, processes, ownName)
  if (launchers.length === 0) return { platformId: winner.platformId, source: '自启动' }
  return { platformId: launchers[0].id, source: launchers[0].name }
}

export function setProcessLister(fn) {
  processLister = fn
}

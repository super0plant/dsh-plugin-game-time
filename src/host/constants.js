/**
 * Game Time — paths, retention windows and the shipped defaults.
 */
import { homedir } from 'node:os'
import { join } from 'node:path'

export const HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
export const DIR = join(HOME, 'storages', 'game-time')
export const CONFIG_PATH = join(DIR, 'config.json')
export const SESSIONS_PATH = join(DIR, 'sessions.json')
export const PRESETS_PATH = join(DIR, 'presets.json')
export const ACTIVE_PATH = join(DIR, 'active.json')
export const ASSET_DIR = join(DIR, 'assets')
export const PRESETS_VERSION = 1

export const DAY_MS = 86400000
export const MIN_SESSION_MS = 30000
/** Only used to ignore stale crash heartbeats; sessions are never deleted. */
export const RETAIN_DAYS = 31
/** How much session history `/state` sends by default; the rest loads on demand. */
export const HISTORY_DAYS = 365
export const HISTORY_DAYS_MIN = 30
export const HISTORY_DAYS_MAX = 1825
export const FLUSH_DEBOUNCE_MS = 1500
/** How often a running session refreshes its heartbeat on disk. */
export const ACTIVE_HEARTBEAT_MS = 30000

/**
 * Shipped platforms carry no launcher paths: install locations differ per
 * machine, and a wrong default paints every platform red on first run.
 * Users fill them in (or drop an exe on the path field) once.
 */
export const DEFAULT_PLATFORMS = {
  mihoyo: { id: 'mihoyo', name: '米哈游', short: '米', color: '#4f8ff7', path: '' },
  tencent: { id: 'tencent', name: 'WeGame', short: 'W', color: '#f0a53e', path: '' },
  riot: { id: 'riot', name: 'Riot', short: 'R', color: '#e35c5c', path: '' },
  steam: { id: 'steam', name: 'Steam', short: 'S', color: '#66c0f4', path: '' },
  epic: { id: 'epic', name: 'Epic', short: 'E', color: '#b6b6f2', path: '' },
  gog: { id: 'gog', name: 'GOG', short: 'G', color: '#a86bd6', path: '' },
}

export const DEFAULT_CONFIG = {
  version: 3,
  settings: { intervalSec: 10, autostart: true, density: 'comfortable', historyDays: HISTORY_DAYS, baseColor: '#0b0b0c', todayChartHours: 'line', todayChartRange: 'line', todayWindow: 'last7' },
  platforms: DEFAULT_PLATFORMS,
  games: [],
}

/**
 * Game Time — config v3 migration, validation and preset seeding.
 */
import { DEFAULT_CONFIG, DEFAULT_PLATFORMS, HISTORY_DAYS, HISTORY_DAYS_MAX, HISTORY_DAYS_MIN } from './constants.js'
import { assetRef, bool, clamp01, clampRange, colorOf, iconOf, text } from './values.js'

export function migrate(raw) {
  if (!raw || typeof raw !== 'object') return raw
  if (Number(raw.version) >= 3) return raw

  const games = (Array.isArray(raw.games) ? raw.games : []).map((game) => {
    const platformIds = Array.isArray(game.platforms) ? game.platforms : []
    const installs = []

    if (Array.isArray(game.installs)) {
      for (const item of game.installs) {
        if (!item || typeof item !== 'object') continue
        installs.push({ id: item.id, platformId: item.platformId, path: item.path || '' })
      }
    }
    if (game.path) installs.push({ platformId: platformIds[0], path: game.path })
    for (const item of Array.isArray(game.watch) ? game.watch : []) {
      const watch = typeof item === 'string' ? { process: item, dir: '' } : item
      if (!watch || !watch.process) continue
      const path = watch.dir ? joinPath(watch.dir, watch.process) : ''
      if (!path) continue
      if (installs.some((entry) => String(entry.path).toLowerCase() === path.toLowerCase())) continue
      installs.push({ platformId: watch.platformId || platformIds[0], path })
    }

    const source = Array.isArray(game.entries) ? game.entries : Array.isArray(game.runs) ? game.runs : []
    if (installs.length === 0) {
      const candidate = source.find((run) => {
        const path = String(run.path || '')
        return /\.exe$/i.test(path) && !/launcher|playnite|xxmi|wegame|riotclient/i.test(path)
      })
      if (candidate) installs.push({ platformId: candidate.platformId || platformIds[0], path: candidate.path })
    }

    const entries = source.map((entry, index) => ({
      id: entry.id || game.id + '-e' + String(index),
      platformId: entry.platformId || platformIds[0],
      name: entry.name || '',
      path: entry.path || '',
      args: entry.args || '',
    }))

    return {
      ...game,
      id: game.id,
      name: game.name,
      glyph: game.glyph,
      color: game.color,
      icon: game.icon,
      installs,
      entries,
    }
  })

  const cn = games.find((game) => game.id === 'lol-cn')
  const jp = games.find((game) => game.id === 'lol-jp')
  const kept = games.filter((game) => game.id !== 'lol-cn' && game.id !== 'lol-jp')
  if (cn || jp) {
    kept.push({
      id: 'lol',
      name: '英雄联盟',
      glyph: 'L',
      color: '#d7b45a',
      installs: [].concat(cn ? cn.installs : [], jp ? jp.installs : []),
      entries: [].concat(cn ? cn.entries : [], jp ? jp.entries : []),
    })
  }

  const platforms = JSON.parse(JSON.stringify(raw.platforms && typeof raw.platforms === 'object' ? raw.platforms : {}))
  const rename = { tencent: '国服', riot: '日服' }
  for (const id of Object.keys(rename)) {
    const platform = platforms[id]
    if (!platform || platform.name !== rename[id]) continue
    platform.name = DEFAULT_PLATFORMS[id].name
    platform.short = DEFAULT_PLATFORMS[id].short
    platform.path = platform.path || DEFAULT_PLATFORMS[id].path
  }

  return { version: 3, settings: raw.settings, platforms, games: kept }
}

/**
 * Optional per-game stat group: one name groups several games into one slice.
 * The map is name → hex colour; keys are user text, so skip prototype names.
 */
function groupColorsOf(input) {
  const out = {}
  if (!input || typeof input !== 'object') return out
  for (const key of Object.keys(input).slice(0, 60)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
    const name = text(key, '', 30)
    const color = colorOf(input[key], '')
    if (!name || !color) continue
    out[name] = color
  }
  return out
}

export function sanitizeConfig(input) {
  if (!input || typeof input !== 'object') return null
  if (!Array.isArray(input.games)) return null
  const raw = migrate(input)
  if (!raw || !Array.isArray(raw.games)) return null

  const platforms = {}
  const rawPlatforms = raw.platforms && typeof raw.platforms === 'object' ? raw.platforms : {}
  for (const key of Object.keys(rawPlatforms)) {
    const value = rawPlatforms[key]
    if (!value || typeof value !== 'object') continue
    const id = text(value.id, key, 60)
    const name = text(value.name, id, 60)
    platforms[id] = {
      id,
      name,
      short: text(value.short, name.charAt(0), 4),
      color: colorOf(value.color, '#8a8a8a'),
      path: text(value.path, '', 400),
      processes: (Array.isArray(value.processes) ? value.processes : [])
        .map(function (item) {
          return text(item, '', 120)
        })
        .filter(Boolean)
        .slice(0, 8),
      icon: iconOf(value.icon),
      rank: Number.isFinite(Number(value.rank)) ? Number(value.rank) : 0,
    }
  }
  if (Object.keys(platforms).length === 0) {
    for (const key of Object.keys(DEFAULT_PLATFORMS)) platforms[key] = { ...DEFAULT_PLATFORMS[key] }
  }

  const seen = new Set()
  const games = []
  for (const item of raw.games) {
    if (!item || typeof item !== 'object') continue
    let id = text(item.id, '', 60)
    if (!id || seen.has(id)) id = 'game-' + String(Date.now()) + '-' + String(games.length)
    seen.add(id)

    const rawInstalls = (Array.isArray(item.installs) ? item.installs : [])
      .map((install, index) => {
        if (!install || typeof install !== 'object') return null
        const path = text(install.path, '', 400)
        if (!path) return null
        return { id: text(install.id, id + '-i' + String(index), 80), platformId: text(install.platformId, '', 60), path }
      })
      .filter(Boolean)
      .slice(0, 24)

    const rawEntries = (Array.isArray(item.entries) ? item.entries : [])
      .map((entry, index) => {
        if (!entry || typeof entry !== 'object') return null
        return {
          id: text(entry.id, id + '-e' + String(index), 80),
          platformId: text(entry.platformId, '', 60),
          name: text(entry.name, '', 80),
          path: text(entry.path, '', 400),
          args: typeof entry.args === 'string' ? entry.args.slice(0, 400) : '',
        }
      })
      .filter(Boolean)
      .slice(0, 24)

    const used = []
    for (const value of rawInstalls.concat(rawEntries)) {
      if (value.platformId && platforms[value.platformId] && used.indexOf(value.platformId) < 0) used.push(value.platformId)
    }
    if (used.length === 0) used.push(Object.keys(platforms)[0])
    const fallback = used[0]

    games.push({
      id,
      name: text(item.name, '未命名游戏', 80),
      glyph: text(item.glyph, text(item.name, '?', 80).charAt(0), 2),
      color: colorOf(item.color, '#8a8a8a'),
      group: text(item.group, '', 30),
      archived: item.archived === true,
      noAutoArchive: item.noAutoArchive === true,
      icon: iconOf(item.icon),
      background: assetRef(item.background),
      backgroundFit: item.backgroundFit === 'tile' ? 'tile' : 'cover',
      imageOpacity: clamp01(item.imageOpacity, 1),
      headerBackground: assetRef(item.headerBackground),
      platforms: used,
      installs: rawInstalls.map((install) => ({
        id: install.id,
        platformId: platforms[install.platformId] ? install.platformId : fallback,
        path: install.path,
      })),
      entries: rawEntries.map((entry) => {
        const platformId = platforms[entry.platformId] ? entry.platformId : fallback
        const platformPath = platforms[platformId] ? platforms[platformId].path || '' : ''
        return { ...entry, platformId, path: entry.path || platformPath }
      }),
    })
  }

  const settings = raw.settings && typeof raw.settings === 'object' ? raw.settings : {}
  const intervalNumber = Number(settings.intervalSec)
  const rawArchive = settings.autoArchive && typeof settings.autoArchive === 'object' ? settings.autoArchive : {}
  const archiveUnit = rawArchive.unit === 'month' ? 'month' : 'day'
  const archiveMax = archiveUnit === 'month' ? 24 : 365

  return {
    version: 3,
    settings: {
      intervalSec: Number.isFinite(intervalNumber) ? Math.min(300, Math.max(2, Math.round(intervalNumber))) : 10,
      // foregroundOnly：「仅前台计时」从未实现，0.4.0 起从界面移除。
      // 字段先留着（写进配置也无害），替代方案见 HANDOFF §10：按游戏的后台暂停 + 全局统一管理。
      // foregroundOnly: bool(settings.foregroundOnly, true),
      autostart: bool(settings.autostart, true),
      density: settings.density === 'compact' ? 'compact' : 'comfortable',
      language: settings.language === 'zh' || settings.language === 'en' ? settings.language : 'auto',
      // Today page trend preferences, persisted so a restart keeps them.
      // One field per card: the 24-hour chart and the 7/30-day chart remember
      // their own bar/line choice.
      todayChartHours: settings.todayChartHours === 'bar' ? 'bar' : 'line',
      todayChartRange: settings.todayChartRange === 'bar' ? 'bar' : 'line',
      todayWindow: settings.todayWindow === 'last30' ? 'last30' : 'last7',
      historyDays: clampRange(settings.historyDays, HISTORY_DAYS_MIN, HISTORY_DAYS_MAX, HISTORY_DAYS),
      // How recently a game must have been played for the list row hints
      // (对比平均 / 平均每天 / 已玩) to show. 0 would mean "always", but the row
      // hints are noise for a game nobody touched in months, so the range
      // starts at one day.
      statsDays: clampRange(settings.statsDays, 1, 3650, 7),
      groupColors: groupColorsOf(settings.groupColors),
      autoArchive: {
        enabled: bool(rawArchive.enabled, false),
        value: clampRange(rawArchive.value, 1, archiveMax, archiveUnit === 'month' ? 2 : 60),
        unit: archiveUnit,
      },
      // Opaque panel base: DSH's own custom colours must not bleed through the
      // plugin, so the background is a solid colour with the image on top.
      baseColor: colorOf(settings.baseColor, '#0b0b0c'),
      background: assetRef(settings.background),
      backgroundFit: settings.backgroundFit === 'tile' ? 'tile' : 'cover',
      imageOpacity: clamp01(settings.imageOpacity, 1),
      surfaceColor: colorOf(settings.surfaceColor, '#000000'),
      headerBackground: assetRef(settings.headerBackground),
      headerHeight: clampRange(settings.headerHeight, 80, 900, 300),
      headerFade: clampRange(settings.headerFade, 0, 95, 52),
    },
    platforms,
    games,
  }
}

export function applyPresets(config) {
  const next = JSON.parse(JSON.stringify(config))
  for (const key of Object.keys(DEFAULT_PLATFORMS)) {
    const preset = DEFAULT_PLATFORMS[key]
    if (!next.platforms[key]) {
      next.platforms[key] = JSON.parse(JSON.stringify(preset))
      continue
    }
    if (!next.platforms[key].path && preset.path) next.platforms[key].path = preset.path
  }
  const known = new Set(next.games.map((game) => game.id))
  for (const preset of DEFAULT_CONFIG.games) {
    if (!known.has(preset.id)) next.games.push(JSON.parse(JSON.stringify(preset)))
  }
  return next
}

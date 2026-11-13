import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const FILE = new URL('../client.js', import.meta.url)
const source = readFileSync(FILE, 'utf8')

const React = {
  createElement(type, props, ...children) {
    if (typeof type === 'function') return type(Object.assign({}, props, { children }))
    return { type, props: props || {}, children }
  },
  useState(value) {
    return [value, () => {}]
  },
  useRef(value) {
    return { current: value }
  },
  useEffect() {},
}

const testApi = {}
let mod = null

const sandbox = {
  console,
  React,
  __GT_TEST__: testApi,
  window: {
    __ModuleLoader__: {
      load(definition) {
        mod = definition
      },
    },
  },
}
sandbox.globalThis = sandbox
vm.createContext(sandbox)

vm.runInContext(source, sandbox, { filename: 'client.js' })

if (!mod) throw new Error('module loader was not called')
if (mod.id !== 'dsh-plugin-game-time') throw new Error('unexpected module id: ' + mod.id)

const plugin = mod.factory((name) => {
  if (name !== 'react') throw new Error('unexpected require: ' + name)
  return React
})

if (typeof plugin.apply !== 'function') throw new Error('plugin.apply missing')
if (!Array.isArray(plugin.inject)) throw new Error('plugin.inject missing')

// --- registration surface ------------------------------------------------

const registered = []
const ctx = {
  effect(fn) {
    fn()
    return () => {}
  },
  locale: {
    register() {},
    bind() {
      return (key) => key
    },
  },
  slots: {
    inject(owner, callback) {
      callback()
    },
    register(options, component) {
      registered.push({ options, component })
      return () => {}
    },
  },
}
plugin.apply(ctx)

const slots = registered.map((entry) => entry.options.name)
if (!slots.includes('main')) throw new Error('main slot not registered')
if (!slots.includes('sidebar.panellist')) throw new Error('sidebar.panellist not registered')

const main = registered.find((entry) => entry.options.name === 'main')
if (main.options.key !== 'game-time') throw new Error('main key mismatch')
const side = registered.find((entry) => entry.options.name === 'sidebar.panellist')
if (side.options.id !== 'game-time') throw new Error('sidebar id mismatch')

// --- tree walker ---------------------------------------------------------

function assertTree(node, path) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach((child, index) => assertTree(child, path + '[' + index + ']'))
    return
  }
  if (typeof node !== 'object') return
  if (!node.type) throw new Error('node without type at ' + path)
  assertTree(node.children, path + '/' + String(node.type))
}

function render(component, props, label) {
  let tree
  try {
    tree = component(props)
  } catch (error) {
    throw new Error(label + ' threw: ' + error.stack)
  }
  assertTree(tree, label)
  return tree
}

const t = (key) => key

// --- render every view ---------------------------------------------------

render(main.component, { t }, 'Page')
render(testApi.TodayView, { t, onOpenGame() {} }, 'TodayView')
render(testApi.AllView, { t, onOpenGame() {} }, 'AllView')
const settingsTree = render(testApi.GlobalSettings, { t, onBack() {}, touch() {} }, 'GlobalSettings')

// --- autostart switch (DSH: disabled + explained) -------------------------

const settingsNodes = []
;(function walkSettings(node) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach(walkSettings)
    return
  }
  if (typeof node === 'string' || typeof node === 'number') {
    settingsNodes.push(String(node))
    return
  }
  if (typeof node !== 'object') return
  if (node.type === 'input' && node.props && node.props.type === 'checkbox' && node.props.className === 'gt-check') {
    settingsNodes.push(node.props.disabled ? 'disabled-check' : 'enabled-check')
  }
  walkSettings(node.children)
})(settingsTree)

if (settingsNodes.indexOf('disabled-check') < 0) throw new Error('autostart switch must be disabled inside DSH')
if (settingsNodes.indexOf('settings.autostart.dsh') < 0) throw new Error('DSH explanation missing')
if (settingsNodes.indexOf('settings.autostart.why') < 0) throw new Error('autostart rationale missing')
if (settingsNodes.indexOf('settings.autostart.off') < 0) throw new Error('autostart opt-out note missing')
if (settingsNodes.indexOf('settings.credit') < 0) throw new Error('author credit missing from the settings page')

for (const game of testApi.GAMES) {
  for (const range of ['day', 'week', 'month', 'all']) {
    render(
      testApi.DetailView,
      { key: game.id + range, t, game, initialRange: range, onBack() {}, onSettings() {} },
      'DetailView(' + game.id + ',' + range + ')'
    )
  }
  render(testApi.GameSettings, { t, game, onBack() {}, touch() {} }, 'GameSettings(' + game.id + ')')
}

// --- chart branches ------------------------------------------------------

for (const range of ['day', 'week', 'month', 'all']) {
  const points = testApi.seriesFor(testApi.GAMES[0].id, range, testApi.NOW)
  if (points.length === 0) throw new Error('no points for ' + range)
  for (const chartType of ['bar', 'line']) {
    render(
      testApi.Chart,
      {
        t,
        points,
        chartType,
        selectedKey: points[points.length - 1].key,
        onSelect() {},
      },
      'Chart(' + range + ',' + chartType + ')'
    )
  }
}

// --- stacked bars --------------------------------------------------------

const stackedGame = testApi.GAMES.find((game) => (game.platforms || []).length > 1) || testApi.GAMES[0]
const stackedPoints = testApi.seriesFor(stackedGame.id, 'month', testApi.NOW)
for (const point of stackedPoints) {
  const parts = point.parts || []
  const sum = parts.reduce((acc, part) => acc + part.seconds, 0)
  if (Math.abs(sum - point.seconds) > 0.01) throw new Error('parts sum mismatch for ' + point.key + ': ' + sum)
}

const stackedTree = render(
  testApi.Chart,
  { t, points: stackedPoints, chartType: 'bar', selectedKey: null, onSelect() {} },
  'Chart(stacked)'
)

const chartLabels = []
const chartRects = []
function collect(node) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach(collect)
    return
  }
  if (typeof node !== 'object') return
  if (node.type === 'text' && node.props.className === 'gt-chart-label') chartLabels.push(node)
  if (node.type === 'rect') chartRects.push(node)
  collect(node.children)
}
collect(stackedTree)

if (chartLabels.length !== stackedPoints.length) {
  throw new Error('x labels were skipped: ' + chartLabels.length + '/' + stackedPoints.length)
}
const visibleSegments = stackedPoints.reduce(function (count, point) {
  return count + Math.max(1, (point.parts || []).filter((part) => part.seconds > 0).length)
}, 0)
if (chartRects.length !== visibleSegments) {
  throw new Error('bar segments: ' + chartRects.length + ', expected ' + visibleSegments)
}
const fills = new Set(chartRects.map((rect) => rect.props.fill))
if (fills.size < 1) throw new Error('bar segments carry no fill')
for (const rect of chartRects) {
  if (!Number.isFinite(rect.props.y) || !Number.isFinite(rect.props.height)) throw new Error('bad segment geometry')
  if (rect.props.rx !== undefined) throw new Error('bars must be square')
}

// --- y axis --------------------------------------------------------------
// Real translations here: the width estimate below assumes the shipped glyphs,
// not the "minute"/"hour" keys the generic harness returns.

const axisT = (key) => ({ minute: '分', hour: '时' }[key] || key)
const axisTree = render(
  testApi.Chart,
  { t: axisT, points: stackedPoints, chartType: 'bar', selectedKey: null, onSelect() {} },
  'Chart(axis)'
)
const axisYLabels = []
const axisGrid = []
const axisAvg = []
const axisAvgValue = []
const axisAvgTick = []
function collectAxis(node) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach(collectAxis)
    return
  }
  if (typeof node !== 'object') return
  if (node.type === 'text' && node.props.className === 'gt-chart-y') axisYLabels.push(node)
  if (node.type === 'text' && node.props.className === 'gt-chart-avg-y') axisAvgValue.push(node)
  if (node.type === 'line' && node.props.className === 'gt-chart-grid') axisGrid.push(node)
  if (node.type === 'line' && node.props.className === 'gt-chart-avg') axisAvg.push(node)
  if (node.type === 'line' && node.props.className === 'gt-chart-avg-tick') axisAvgTick.push(node)
  collectAxis(node.children)
}
collectAxis(axisTree)

if (axisYLabels.length < 2) throw new Error('y axis needs at least the zero tick')
const gridYs = axisGrid.map((node) => node.props.y1)
if (!gridYs.every((y) => Number.isFinite(y))) throw new Error('guide line without a y coordinate')
const gaps = gridYs.slice(1).map((y, index) => Math.abs(gridYs[index] - y))
for (const gap of gaps) {
  if (Math.abs(gap - gaps[0]) > 0.001) throw new Error('y ticks are not evenly spaced: ' + gaps.join(','))
}
const baselineY = 12 + (176 - 12 - 22)
for (const node of axisYLabels) {
  if (node.props.textAnchor !== 'end') throw new Error('y tick text must be right aligned')
  if (node.props.x !== 28) throw new Error('y tick text must sit at a fixed x')
  const text = node.children.join('')
  let width = 0
  for (const char of text) width += /[\u4e00-\u9fff]/.test(char) ? 7 : 3.8
  if (node.props.x - width < 0) throw new Error('y tick text collides with the left edge: ' + text)
  const onGrid = Math.abs(node.props.y - baselineY) < 0.01 || gridYs.some((y) => Math.abs(y - node.props.y) < 0.01)
  if (!onGrid) throw new Error('y tick text is off the grid: ' + text)
}
const topTick = axisYLabels[axisYLabels.length - 1]
if (topTick.props.y < 4) throw new Error('top y tick is clipped by the viewBox')
if (!/^\d+(分|时)$/.test(topTick.children.join(''))) {
  throw new Error('unexpected top tick: ' + topTick.children.join(''))
}

// --- average marker ------------------------------------------------------

if (axisAvg.length !== 1) throw new Error('average line missing')
if (axisAvgTick.length !== 1) throw new Error('average line needs its own y tick mark')
if (Math.abs(axisAvgTick[0].props.y1 - axisAvg[0].props.y1) > 0.01) {
  throw new Error('average tick is not on the average line')
}
if (axisAvgTick[0].props.x2 !== 34) throw new Error('average tick must touch the axis')
if (axisAvgValue.length > 1) throw new Error('duplicated average tick label')
if (axisAvgValue.length === 1) {
  const node = axisAvgValue[0]
  if (Math.abs(node.props.y - axisAvg[0].props.y1) > 0.01) throw new Error('average tick is not on the average line')
  if (node.props.x !== 28) throw new Error('average tick must share the ladder x')
  if (!/^\d+(分|时)(\d+(分|时))?$/.test(node.children.join(''))) {
    throw new Error('unexpected average tick: ' + node.children.join(''))
  }
  for (const other of axisYLabels) {
    if (Math.abs(other.props.y - node.props.y) < 9) throw new Error('average tick collides with a ladder label')
  }
}
if (axisAvgValue.length === 0) {
  const near = axisYLabels.some((node) => Math.abs(node.props.y - axisAvg[0].props.y1) < 9)
  if (!near) throw new Error('average label dropped without a collision')
}

// --- overview analysis ---------------------------------------------------

const overviewTree = render(testApi.AllView, { t, onOpenGame() {} }, 'AllView(overview)')
const overviewNodes = []
function collectOverview(node) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach(collectOverview)
    return
  }
  if (typeof node !== 'object') return
  overviewNodes.push(node)
  collectOverview(node.children)
}
collectOverview(overviewTree)
const overviewClass = (name) => overviewNodes.filter((node) => node.props.className === name)

if (overviewClass('gt-bar').length !== 2) throw new Error('overview needs a platform bar and a game bar')
if (overviewClass('gt-panel-card').length < 3) throw new Error('overview needs the three analysis cards')
const collapseHead = overviewClass('gt-collapse')
if (collapseHead.length !== 1) throw new Error('overview sessions card must be collapsible')
if (collapseHead[0].props['aria-expanded'] !== 'false') throw new Error('overview sessions card must start collapsed')
if (overviewClass('gt-list').length !== 0) throw new Error('a collapsed sessions card renders no rows')

const sampleParts = [
  { id: 'big', name: 'big', color: '#111111', seconds: 900 },
  { id: 'mid', name: 'mid', color: '#222222', seconds: 400 },
  { id: 'tiny', name: 'tiny', color: '#333333', seconds: 20 },
]
const foldedItems = testApi.bucketItems(sampleParts, t)
if (foldedItems[foldedItems.length - 1].id !== 'other') throw new Error('small slices must fold into other')
if (foldedItems[foldedItems.length - 1].seconds !== 20) throw new Error('other bucket lost its seconds')

const foldedSeries = testApi.bucketSeries([{ key: 'a', label: 'a', seconds: 1320, parts: sampleParts }], t)
const otherPart = foldedSeries[0].parts.find((part) => part.id === 'other')
if (!otherPart || otherPart.seconds !== 20) throw new Error('stacked series must fold small slices too')
if (foldedSeries[0].parts.length !== 3) throw new Error('folding changed the kept slice count')

const keptItems = testApi.bucketItems(
  [
    { id: 'a', name: 'a', color: '#111111', seconds: 600 },
    { id: 'b', name: 'b', color: '#222222', seconds: 400 },
  ],
  t
)
if (keptItems.length !== 2 || keptItems.some((item) => item.id === 'other')) {
  throw new Error('slices above the threshold must not fold')
}

const gamePoints = testApi.seriesFor(null, 'month', testApi.NOW, testApi.BY_GAME)
if (gamePoints[0].parts.every((part) => !testApi.GAMES.some((game) => game.id === part.id))) {
  throw new Error('all-games series must be sliced by game id')
}

// --- 今日 is a rolling hour window ---------------------------------------

const dayAnchor = testApi.defaultAnchor('day')
const hourPoints = testApi.seriesFor(testApi.GAMES[0].id, 'day', dayAnchor)
if (hourPoints.length !== 24) throw new Error('day series must be 24 hours, got ' + hourPoints.length)
if (hourPoints[0].label !== '00:00') throw new Error('today must start at 00:00, got ' + hourPoints[0].label)
if (hourPoints[23].label !== '23:00') throw new Error('today must end at 23:00, got ' + hourPoints[23].label)
const hourKeys = new Set(hourPoints.map((point) => point.key))
if (hourKeys.size !== 24) throw new Error('hour keys collide')

// One step is one hour, so dragging slides the window instead of jumping a day.
const draggedBack = testApi.panAnchor('day', dayAnchor, -1)
if (dayAnchor.getTime() - draggedBack.getTime() !== 3600000) {
  throw new Error('day pan must move exactly one hour')
}
const draggedPoints = testApi.seriesFor(testApi.GAMES[0].id, 'day', draggedBack)
if (draggedPoints[0].label !== '23:00') {
  throw new Error('rolling window should start at the previous 23:00, got ' + draggedPoints[0].label)
}
if (testApi.panAnchor('day', dayAnchor, 1).getTime() !== dayAnchor.getTime()) {
  throw new Error('day pan must not move past the end of today')
}

// --- 本周 / 本月 end on the period's last day ------------------------------

const weekAnchor = testApi.defaultAnchor('week')
const weekPointsEnd = testApi.seriesFor(testApi.GAMES[0].id, 'week', weekAnchor)
if (weekPointsEnd.length !== 7) throw new Error('week window must hold 7 days')
if (weekPointsEnd[0].label !== '一' || weekPointsEnd[6].label !== '日') {
  throw new Error('week axis must run 一 … 日, got ' + weekPointsEnd[0].label + ' … ' + weekPointsEnd[6].label)
}

const monthAnchor = testApi.defaultAnchor('month')
const monthPointsEnd = testApi.seriesFor(testApi.GAMES[0].id, 'month', monthAnchor)
const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 0).getDate()
if (monthPointsEnd.length !== daysInMonth) {
  throw new Error('month window must hold ' + daysInMonth + ' days, got ' + monthPointsEnd.length)
}
if (monthPointsEnd[monthPointsEnd.length - 1].label !== String(daysInMonth)) {
  throw new Error('month axis must end on the last day, got ' + monthPointsEnd[monthPointsEnd.length - 1].label)
}

const pannedChart = render(
  testApi.Chart,
  { t, points: hourPoints, chartType: 'bar', selectedKey: null, onSelect() {}, onPan() {} },
  'Chart(pan)'
)
const pannedSvg = []
function collectPan(node) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach(collectPan)
    return
  }
  if (typeof node !== 'object') return
  if (node.type === 'svg') pannedSvg.push(node)
  collectPan(node.children)
}
collectPan(pannedChart)
if (pannedSvg.length !== 1) throw new Error('chart svg missing')
if (pannedSvg[0].props['data-pan'] !== 'true') throw new Error('pannable chart must expose data-pan')
if (typeof pannedSvg[0].props.onPointerDown !== 'function') throw new Error('pannable chart needs a pointer handler')

// --- pan clamps to the data ----------------------------------------------

// 今日 may show the rest of today (empty hours), never tomorrow.
const endOfToday = new Date(new Date(testApi.NOW).setHours(0, 0, 0, 0) + 86400000)
const maxAnchor = testApi.panAnchor('day', testApi.NOW, 999)
if (maxAnchor.getTime() !== endOfToday.getTime()) {
  throw new Error('day window must stop at the end of today')
}
if (testApi.panAnchor('day', maxAnchor, 1).getTime() !== maxAnchor.getTime()) {
  throw new Error('future pan is not clamped')
}

// Every range steps by one tick: an hour, a day, a day, a month.
const dayEnd = testApi.defaultAnchor('day')
if (dayEnd.getTime() - testApi.panAnchor('day', dayEnd, -1).getTime() !== 3600000) {
  throw new Error('one day step must be one hour')
}
const weekEnd = testApi.defaultAnchor('week')
if (weekEnd.getTime() - testApi.panAnchor('week', weekEnd, -1).getTime() !== 86400000) {
  throw new Error('one week step must be one day')
}
const monthEnd = testApi.defaultAnchor('month')
if (monthEnd.getTime() - testApi.panAnchor('month', monthEnd, -1).getTime() !== 86400000) {
  throw new Error('one month step must be one day')
}
const allEnd = testApi.defaultAnchor('all')
const allBack = testApi.panAnchor('all', allEnd, -1)
if (allEnd.getMonth() === allBack.getMonth() && allEnd.getFullYear() === allBack.getFullYear()) {
  throw new Error('one all step must be one month')
}

const earliest = new Date(
  Math.min.apply(
    null,
    testApi.SESSIONS.map((session) => session.start)
  )
)
const minEnd = new Date(new Date(earliest).setHours(0, 0, 0, 0) + 86400000)
const floor = testApi.panAnchor('month', testApi.NOW, -5000)
if (floor.getTime() !== minEnd.getTime()) {
  throw new Error('past pan must stop at the first recorded day, got ' + floor.toISOString())
}
if (testApi.panAnchor('month', floor, -1).getTime() !== floor.getTime()) {
  throw new Error('past pan is not clamped')
}

// --- wheel zoom changes the scale, one grain at a time --------------------

const zoomLevels = testApi.GRAIN_LEVELS
const dayHour = testApi.seriesFor(testApi.GAMES[0].id, 'day', dayAnchor, null, zoomLevels.day.levels[0])
const day30 = testApi.seriesFor(testApi.GAMES[0].id, 'day', dayAnchor, null, zoomLevels.day.levels[1])
const day10 = testApi.seriesFor(testApi.GAMES[0].id, 'day', dayAnchor, null, zoomLevels.day.levels[2])
if (dayHour.length !== 24 || day30.length !== 48 || day10.length !== 144) {
  throw new Error('day zoom must be 24 / 48 / 144 ticks, got ' + [dayHour.length, day30.length, day10.length].join('/'))
}
if (day10[0].label !== '00:00' || day10[1].label !== '00:10') throw new Error('10-minute ticks must read as clock times')
if (new Date(dayAnchor.getTime() - testApi.panAnchor('day', dayAnchor, -1, zoomLevels.day.levels[2]).getTime()).getTime() !== 600000) {
  throw new Error('at 10-minute grain one drag step must be 10 minutes')
}

const monthDay = testApi.seriesFor(testApi.GAMES[0].id, 'month', monthAnchor, null, zoomLevels.month.levels[1])
if (monthDay.length !== daysInMonth) throw new Error('month day grain changed')
const monthWeek = testApi.seriesFor(testApi.GAMES[0].id, 'month', monthAnchor, null, zoomLevels.month.levels[0])
if (monthWeek.length < 4 || monthWeek.length > 5) throw new Error('month week grain must be 4-5 ticks, got ' + monthWeek.length)

const allMonth = testApi.seriesFor(testApi.GAMES[0].id, 'all', testApi.NOW, null, zoomLevels.all.levels[0])
const allWeek = testApi.seriesFor(testApi.GAMES[0].id, 'all', testApi.NOW, null, zoomLevels.all.levels[1])
const allDay = testApi.seriesFor(testApi.GAMES[0].id, 'all', testApi.NOW, null, zoomLevels.all.levels[2])
if (allMonth.length !== 12) throw new Error('all month grain must stay 12 ticks')
if (allWeek.length < 52 || allWeek.length > 54) throw new Error('all week grain must be ~52 ticks, got ' + allWeek.length)
if (allDay.length !== 365) throw new Error('all day grain must be 365 ticks, got ' + allDay.length)

const zoomChart = render(
  testApi.Chart,
  { t, points: day10, chartType: 'bar', selectedKey: null, onSelect() {}, onZoom() {} },
  'Chart(zoom)'
)
const zoomSvg = []
;(function walkZoom(node) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach(walkZoom)
    return
  }
  if (typeof node !== 'object') return
  if (node.type === 'svg') zoomSvg.push(node)
  walkZoom(node.children)
})(zoomChart)
if (zoomSvg.length !== 1 || zoomSvg[0].props['data-zoom'] !== 'true') {
  throw new Error('zoomable chart must expose data-zoom')
}
const zoomLabels = []
;(function walkLabels(node) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach(walkLabels)
    return
  }
  if (typeof node !== 'object') return
  if (node.type === 'text' && node.props.className === 'gt-chart-label') zoomLabels.push(node)
  walkLabels(node.children)
})(zoomChart)
if (zoomLabels.length === 0 || zoomLabels.length >= day10.length) {
  throw new Error('dense grains must thin the printed labels, got ' + zoomLabels.length)
}

// A 24-hour view still has room for all 24 labels — no needless thinning.
const hourTree = render(
  testApi.Chart,
  { t, points: dayHour, chartType: 'bar', selectedKey: null, onSelect() {} },
  'Chart(hour labels)'
)
let hourLabelCount = 0
;(function countHourLabels(node) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach(countHourLabels)
    return
  }
  if (typeof node !== 'object') return
  if (node.type === 'text' && node.props.className === 'gt-chart-label') hourLabelCount++
  countHourLabels(node.children)
})(hourTree)
if (hourLabelCount !== 24) throw new Error('24-hour view must keep 24 labels, got ' + hourLabelCount)

// --- title unit, axis note, reset button ---------------------------------

const zhT = (key) =>
  ({
    'detail.trend': '时长趋势',
    'chart.unit': '{title}（{unit}）',
    'unit.1h': '1时',
    'chart.reset': '恢复默认',
  })[key] || key

const unitTree = render(
  testApi.DetailView,
  { t: zhT, game: testApi.GAMES[0], initialRange: 'day', onBack() {}, onSettings() {} },
  'DetailView(unit)'
)
const unitNodes = []
;(function collectUnit(node) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach(collectUnit)
    return
  }
  if (typeof node !== 'object') return
  unitNodes.push(node)
  collectUnit(node.children)
})(unitTree)

const unitTitles = unitNodes.filter((node) => node.props.className === 'gt-card-title').map((node) => node.children.join(''))
if (unitTitles.indexOf('时长趋势（1时）') < 0) {
  throw new Error('chart title must carry the unit in brackets, got ' + unitTitles.join(' | '))
}
const axisNote = unitNodes.find((node) => node.props.className === 'gt-chart-unit')
if (!axisNote || axisNote.children.join('') !== '(1时)') {
  throw new Error('x axis must print the scale unit at its left edge')
}
if (axisNote.props.x !== 2 || axisNote.props.textAnchor !== 'start') {
  throw new Error('axis unit must sit at the left edge')
}
const resetButton = unitNodes.find((node) => node.props.className === 'gt-icon-btn' && node.props.title === '恢复默认')
if (!resetButton || typeof resetButton.props.onClick !== 'function') {
  throw new Error('trend card needs a reset button next to the title')
}
const unitHourLabels = unitNodes.filter((node) => node.props.className === 'gt-chart-label')
if (unitHourLabels.length !== 24) {
  throw new Error('short unit note must not push out the first hour label, got ' + unitHourLabels.length)
}

// --- logic sanity --------------------------------------------------------

const fmt = testApi.formatDuration
const cases = [
  [0, '0minute'],
  [45, '1minute'],
  [60, '1minute'],
  [3599, '1hour'],
  [3600, '1hour'],
  [5400, '1hour30minute'],
  [36000, '10hour'],
]
for (const [seconds, expected] of cases) {
  const actual = fmt(seconds, t)
  if (actual !== expected) throw new Error('formatDuration(' + seconds + ') = ' + actual + ', expected ' + expected)
}

const dayTotal = testApi.totalsFor(null, 'day', testApi.NOW)
const weekTotal = testApi.totalsFor(null, 'week', testApi.NOW)
const allTotal = testApi.totalsFor(null, 'all', testApi.NOW)
if (!(allTotal > 0 && allTotal >= weekTotal && weekTotal >= dayTotal)) {
  throw new Error('implausible totals: day=' + dayTotal + ' week=' + weekTotal + ' all=' + allTotal)
}

const weekPoints = testApi.seriesFor(testApi.GAMES[0].id, 'week', testApi.NOW)
if (weekPoints.length !== 7) throw new Error('week series must be 7 points, got ' + weekPoints.length)

const monthPoints = testApi.seriesFor(testApi.GAMES[0].id, 'month', testApi.NOW)
if (monthPoints.length < 28 || monthPoints.length > 31) throw new Error('month series length ' + monthPoints.length)

const allPoints = testApi.seriesFor(testApi.GAMES[0].id, 'all', testApi.NOW)
if (allPoints.length !== 12) throw new Error('all series must be 12 months, got ' + allPoints.length)

const breakdown = testApi.platformBreakdown(testApi.GAMES[0].id, 'all', testApi.NOW)
if (breakdown.length === 0) throw new Error('platform breakdown empty for zzz')
const sumBreakdown = breakdown.reduce((sum, item) => sum + item.seconds, 0)
const windowTotal = allPoints.reduce((sum, point) => sum + point.seconds, 0)
if (Math.abs(sumBreakdown - windowTotal) > 1) {
  throw new Error('breakdown does not add up to the chart window')
}

const weekRows = testApi.daysInRange(testApi.GAMES[0].id, 'week', testApi.NOW)
if (weekRows.length === 0 || weekRows.length > 7) throw new Error('week rows length ' + weekRows.length)

// Platforms derive from installs so every game reports a usable badge set.
const sample = testApi.GAMES[0]
const derived = testApi.enabledPlatforms(sample)
if (derived.length === 0) throw new Error('no derived platforms for the first game')
if (sample.installs.length === 0) throw new Error('demo games need an install')
const breakdownSample = testApi.platformBreakdown(sample.id, 'all', testApi.NOW)
if (breakdownSample.length === 0) throw new Error('breakdown empty for the first game')

const segmentsOfGame = testApi.segmentsOf(testApi.GAMES[0].id, testApi.NOW)
for (const segment of segmentsOfGame) {
  if (!(segment.end > segment.start)) throw new Error('segment end <= start')
}

// --- stat group: one name collapses a game's platform slices ------------

const groupedGame = testApi.GAMES[0]
const sharedGame = testApi.GAMES[1]
const sumOf = (items) => items.reduce((sum, item) => sum + item.seconds, 0)
const beforeSums = [groupedGame, sharedGame].map((game) =>
  sumOf(testApi.platformBreakdown(game.id, "all", testApi.NOW))
)

groupedGame.group = "通关游戏"
sharedGame.group = "通关游戏"

const groupedSettingsTree = render(
  testApi.GameSettings,
  { t, game: groupedGame, onBack() {}, touch() {} },
  "GameSettings(group)"
)
const groupNameInputs = []
const groupColorInputs = []
function collectGroupFields(node) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    node.forEach(collectGroupFields)
    return
  }
  if (node.type === "input") {
    if (node.props.value === "通关游戏") groupNameInputs.push(node)
    if (node.props.type === "color" && node.props.title === "game.group.color") groupColorInputs.push(node)
  }
  collectGroupFields(node.children)
}
collectGroupFields(groupedSettingsTree)
assert.equal(groupNameInputs.length, 1, "the group name needs one input")
assert.match(groupColorInputs[0].props.value, /^#[0-9a-f]{6}$/i, "the group colour picker holds a hex value")

assert.equal(
  testApi.BY_PLATFORM.of({ gameId: groupedGame.id, platformId: "mihoyo" }),
  "group:通关游戏",
  "a grouped session is keyed by the group, not the platform"
)
const groupMeta = testApi.BY_PLATFORM.meta("group:通关游戏")
assert.equal(groupMeta.name, "通关游戏")
assert.match(groupMeta.color, /^#[0-9a-f]{6}$/i, "an auto colour is a plain hex")
const platformColors = new Set(Object.values(testApi.PLATFORMS).map((platform) => platform.color))
assert.equal(platformColors.has(groupMeta.color), false, "an auto colour avoids the platform palette")

const groupedParts = testApi.platformBreakdown(groupedGame.id, "all", testApi.NOW)
assert.equal(groupedParts.length, 1, "a grouped game collapses into one slice")
assert.equal(groupedParts[0].name, "通关游戏")
assert.ok(Math.abs(sumOf(groupedParts) - beforeSums[0]) < 1, "grouping must not change the window total")

const allParts = testApi.totalsByRange("all", testApi.NOW, testApi.BY_PLATFORM)
const merged = allParts.filter((part) => part.name === "通关游戏")
assert.equal(merged.length, 1, "games sharing a group merge into one slice")
assert.ok(Math.abs(merged[0].seconds - (beforeSums[0] + beforeSums[1])) < 1, "merged slice adds both games")
assert.equal(new Set(allParts.map((part) => part.id)).size, allParts.length, "slice ids stay unique")

render(
  testApi.DetailView,
  { key: "group", t, game: groupedGame, initialRange: "all", onBack() {}, onSettings() {} },
  "DetailView(group)"
)
render(testApi.AllView, { t, onOpenGame() {} }, "AllView(group)")

groupedGame.group = ""
sharedGame.group = ""
assert.equal(
  testApi.BY_PLATFORM.of({ gameId: groupedGame.id, platformId: "mihoyo" }),
  "mihoyo",
  "an empty group keeps the platform key"
)

// A group named after a real platform folds into it instead of duplicating it.
groupedGame.group = "Steam"
assert.equal(
  testApi.BY_PLATFORM.of({ gameId: groupedGame.id, platformId: "mihoyo" }),
  "steam",
  "a group named after a platform folds into that platform"
)
assert.equal(testApi.BY_PLATFORM.meta("steam").name, "Steam")
assert.equal(
  testApi.BY_PLATFORM.of({ gameId: groupedGame.id, platformId: "mihoyo" }),
  testApi.BY_PLATFORM.of({ gameId: groupedGame.id, platformId: "steam" }),
  "the folded slice is the platform slice, whatever the install platform"
)

groupedGame.group = "steam"
assert.equal(
  testApi.BY_PLATFORM.of({ gameId: groupedGame.id, platformId: "mihoyo" }),
  "steam",
  "the platform id also folds (case-insensitive)"
)

const foldedTree = render(
  testApi.GameSettings,
  { t, game: groupedGame, onBack() {}, touch() {} },
  "GameSettings(folded)"
)
const foldedColorInputs = []
function collectFoldedInputs(node) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    node.forEach(collectFoldedInputs)
    return
  }
  if (node.type === "input" && node.props.type === "color" && node.props.title === "game.group.color") foldedColorInputs.push(node)
  collectFoldedInputs(node.children)
}
collectFoldedInputs(foldedTree)
assert.equal(foldedColorInputs.length, 0, "a folded group has no colour of its own")

groupedGame.group = ""

// --- archive: folds the row, counts everywhere ---------------------------

const archivedGame = testApi.GAMES[0]
const allBefore = testApi.totalsFor(null, "all", testApi.NOW)
const gameTotal = testApi.totalsFor(archivedGame.id, "all", testApi.NOW)
const shareBefore = testApi.totalsByRange("all", testApi.NOW, testApi.BY_GAME)

archivedGame.archived = true
const allAfter = testApi.totalsFor(null, "all", testApi.NOW)
assert.equal(allAfter, allBefore, "archiving keeps the all-games total")
assert.equal(testApi.totalsFor(archivedGame.id, "all", testApi.NOW), gameTotal, "the game keeps its own history")

const shareAfter = testApi.totalsByRange("all", testApi.NOW, testApi.BY_GAME)
assert.equal(shareAfter.some((part) => part.id === archivedGame.id), true, "charts still count the archived game")
assert.equal(shareAfter.length, shareBefore.length, "the share list is unchanged")

const archivedSettingsTree = render(
  testApi.GameSettings,
  { t, game: archivedGame, onBack() {}, touch() {} },
  "GameSettings(archived)"
)
const archiveCheckboxes = []
function collectArchiveChecks(node) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    node.forEach(collectArchiveChecks)
    return
  }
  if (node.type === "input" && node.props.type === "checkbox") archiveCheckboxes.push(node)
  collectArchiveChecks(node.children)
}
collectArchiveChecks(archivedSettingsTree)
assert.equal(archiveCheckboxes.length, 2, "the archive toggle and the auto-archive exemption exist")
assert.equal(archiveCheckboxes[0].props.checked, true, "the archive toggle reflects the archived state")
assert.equal(archiveCheckboxes[1].props.checked, false, "the exemption starts off")

const archivedAllTree = render(testApi.AllView, { t, onOpenGame() {}, touch() {} }, "AllView(archived)")
const tableRows = []
function collectTableRows(node) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    node.forEach(collectTableRows)
    return
  }
  if (node.type === "button" && node.props.className === "gt-row") tableRows.push(node)
  collectTableRows(node.children)
}
collectTableRows(archivedAllTree)
assert.ok(tableRows.length > 0, "the game table still renders")
assert.equal(tableRows.some((row) => row.props.key === archivedGame.id), false, "the archived game folds out of the table")

render(
  testApi.DetailView,
  { key: "archived", t, game: archivedGame, initialRange: "all", onBack() {}, onSettings() {} },
  "DetailView(archived)"
)

// Settings keep their back bar while the body scrolls, and archived games fold.
assert.equal(archivedSettingsTree.props.className, "gt-root gt-fixed-head", "game settings pin the header")
const globalTree = render(testApi.GlobalSettings, { t, onBack() {}, touch() {} }, "GlobalSettings(archived)")
assert.equal(globalTree.props.className, "gt-root gt-fixed-head", "settings pin the header")

const manageRows = []
const gamePills = []
const archiveFolds = []
const platformRows = []
const groupToggles = []
const groupChevrons = []
function collectManage(node) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    node.forEach(collectManage)
    return
  }
  if (node.type === "div" && node.props.className === "gt-gamerow") manageRows.push(node)
  if (node.type === "button" && typeof node.props.className === "string" && node.props.className.split(" ").includes("gt-gamepill")) gamePills.push(node)
  if (node.type === "button" && node.props.className === "gt-collapse") archiveFolds.push(node)
  if (node.type === "div" && node.props.className === "gt-platrow") platformRows.push(node)
  if (node.type === "button" && typeof node.props.className === "string" && node.props.className.split(" ").includes("gt-group-head")) groupToggles.push(node)
  if (node.props.className === "gt-chevron") groupChevrons.push(node)
  collectManage(node.children)
}
collectManage(globalTree)
assert.equal(manageRows.length, 0, "the detailed game rows are folded by default")
assert.equal(archiveFolds.length, 0, "the archived fold lives inside the folded rows")
assert.equal(platformRows.length, 0, "platform details are folded by default")
assert.ok(gamePills.length > 0, "games still show as pills")
assert.equal(gamePills.some((pill) => pill.props.key === "gp-" + archivedGame.id), false, "archived games stay out of the pill row")
const visibleGames = testApi.GAMES.filter((game) => !testApi.isArchived(game)).length
assert.equal(gamePills.length, visibleGames, "one pill per visible game")
assert.equal(groupToggles.length, 2, "both groups expose a details toggle")
assert.ok(groupToggles.every((node) => node.props["aria-expanded"] === "false"), "details start collapsed")
assert.equal(groupChevrons.length, 2, "each toggle carries a chevron")
assert.ok(groupChevrons.every((node) => node.props["data-open"] === "false"), "collapsed chevrons point right")

archivedGame.archived = false
assert.ok(Math.abs(testApi.totalsFor(null, "all", testApi.NOW) - allBefore) < 1, "unarchiving restores the total")

// --- dropping a launch file onto 安装位置 ---------------------------------

const dropTree = render(
  testApi.GameSettings,
  { t, game: testApi.GAMES[1], onBack() {}, touch() {} },
  "GameSettings(drop)"
)
const dropZones = []
function collectDropZones(node) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    node.forEach(collectDropZones)
    return
  }
  if (node.type === "div" && typeof node.props.className === "string" && node.props.className.split(" ").includes("gt-drop")) {
    dropZones.push(node)
  }
  collectDropZones(node.children)
}
collectDropZones(dropTree)
assert.equal(dropZones.length, 1, "the install group is a drop target")
assert.equal(typeof dropZones[0].props.onDrop, "function", "drop handler is wired")
assert.equal(typeof dropZones[0].props.onDragOver, "function", "dragover is wired")
assert.equal(dropZones[0].props["data-drop"], "false", "the drop target starts idle")

assert.equal(
  testApi.shortcutUrlFromText("[InternetShortcut]\r\nURL=steam://rungameid/1551360"),
  "steam://rungameid/1551360",
  "a .url shortcut yields its URL"
)
assert.equal(testApi.shortcutUrlFromText("no url here"), "", "a text file without URL is empty")

const lnkTarget = "D:\\SteamLibrary\\steamapps\\common\\ForzaHorizon5\\ForzaHorizon5.exe"
const lnkBytes = new Uint8Array(lnkTarget.length * 2 + 8)
for (let index = 0; index < lnkTarget.length; index += 1) {
  lnkBytes[index * 2] = lnkTarget.charCodeAt(index) & 0xff
  lnkBytes[index * 2 + 1] = lnkTarget.charCodeAt(index) >> 8
}
assert.equal(testApi.lnkTargetFromBuffer(lnkBytes.buffer), lnkTarget, "a .lnk target is recovered from UTF-16LE bytes")

// --- auto archive: N days of silence folds, one play restores -----------

const staleGame = { id: "stale-test", name: "旧游戏", glyph: "旧", color: "#8899aa", platforms: [], installs: [], entries: [] }
testApi.GAMES.push(staleGame)
const staleSession = {
  id: "stale-test-s1",
  gameId: staleGame.id,
  platformId: "steam",
  start: testApi.NOW.getTime() - 90 * 86400000,
  end: testApi.NOW.getTime() - 90 * 86400000 + 3600000,
}
testApi.SESSIONS.push(staleSession)

assert.equal(testApi.isArchived(staleGame), false, "auto archive starts off")

testApi.SETTINGS.autoArchive = { enabled: true, value: 30, unit: "day" }
assert.equal(testApi.autoArchived(staleGame), true, "90 days of silence folds the game")
assert.equal(testApi.isArchived(staleGame), true, "an auto-archived game leaves the list")

staleGame.noAutoArchive = true
assert.equal(testApi.isArchived(staleGame), false, "the per-game exemption wins")
staleGame.noAutoArchive = false

testApi.SETTINGS.autoArchive = { enabled: true, value: 1, unit: "month" }
assert.equal(testApi.autoArchived(staleGame), true, "one month is 30 days")
testApi.SETTINGS.autoArchive = { enabled: true, value: 4, unit: "month" }
assert.equal(testApi.autoArchived(staleGame), false, "90 days is not old enough for a 4-month rule")

staleSession.end = testApi.NOW.getTime()
staleSession.start = staleSession.end - 3600000
testApi.SETTINGS.autoArchive = { enabled: true, value: 30, unit: "day" }
assert.equal(testApi.autoArchived(staleGame), false, "playing it once restores it")

testApi.SETTINGS.autoArchive = { enabled: "yes", value: "-5", unit: "week" }
const normalized = testApi.autoArchiveConfig()
assert.equal(normalized.enabled, false, "only a real boolean enables the rule")
assert.equal(normalized.unit, "day", "an unknown unit normalises to days")
assert.equal(normalized.value, 60, "an invalid value falls back to 60")

testApi.SETTINGS.autoArchive = { enabled: false, value: 60, unit: "day" }
testApi.GAMES.pop()
testApi.SESSIONS.pop()

// --- a path owned by another game is flagged ----------------------------

const owner = testApi.GAMES[0]
const other = testApi.GAMES[1]
const ownedPath = owner.installs[0].path
assert.equal(testApi.installOwner(ownedPath, other.id), owner, "another game that owns the path is found")
assert.equal(testApi.installOwner(ownedPath, owner.id), null, "the owning game is not a duplicate of itself")
assert.equal(testApi.installOwner("D:\\nope\\none.exe", owner.id), null, "an unknown path has no owner")

const pathFieldTree = render(
  testApi.PathField,
  { t, value: "", placeholder: "x", onChange() {} },
  "PathField(drop)"
)
assert.equal(pathFieldTree.props.className, "gt-pathfield-wrap", "path fields wrap a drop target")
assert.equal(typeof pathFieldTree.props.onDrop, "function", "path fields accept drops")

// --- a game sharing another game's exe is marked, never timed -----------

const original = testApi.GAMES[0]
const copy = {
  id: "dup-test",
  name: "重复的旧游戏",
  glyph: "重",
  color: "#8899aa",
  platforms: ["steam"],
  installs: [{ id: "dup-test-i1", platformId: "steam", path: original.installs[0].path }],
  entries: [],
}
testApi.GAMES.push(copy)

const dupMap = testApi.duplicateMap()
assert.equal(dupMap.has(copy.id), true, "the later entry is the duplicate")
assert.equal(dupMap.get(copy.id).owner.id, original.id, "the first entry owns the path")
assert.equal(dupMap.has(original.id), false, "the owner is not flagged")

const dupAllTree = render(testApi.AllView, { t, onOpenGame() {}, touch() {} }, "AllView(duplicate)")
const dupTags = []
function collectDupTags(node) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    node.forEach(collectDupTags)
    return
  }
  if (node.props.className === "gt-dup-tag") dupTags.push(node)
  collectDupTags(node.children)
}
collectDupTags(dupAllTree)
assert.equal(dupTags.length, 1, "the duplicate row carries a red tag")

const dupSettingsTree = render(
  testApi.GameSettings,
  { t, game: copy, onBack() {}, touch() {}, onDeleted() {} },
  "GameSettings(duplicate)"
)
const settingsDupTags = []
const deleteButtons = []
function collectSettingsChrome(node) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    node.forEach(collectSettingsChrome)
    return
  }
  if (node.props.className === "gt-dup-tag") settingsDupTags.push(node)
  if (node.props.className === "gt-btn danger") deleteButtons.push(node)
  collectSettingsChrome(node.children)
}
collectSettingsChrome(dupSettingsTree)
assert.equal(settingsDupTags.length, 1, "the duplicate tag also shows in its settings header")
assert.equal(deleteButtons.length, 1, "game settings ends with a delete button")

testApi.GAMES.pop()

// --- the settings game list accepts drops ------------------------------

const globalDropTree = render(testApi.GlobalSettings, { t, onBack() {}, touch() {} }, "GlobalSettings(drop)")
const globalDropZones = []
function collectGlobalDropZones(node) {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) {
    node.forEach(collectGlobalDropZones)
    return
  }
  if (typeof node.props.className === "string" && node.props.className.split(" ").includes("gt-drop")) {
    globalDropZones.push(node)
  }
  collectGlobalDropZones(node.children)
}
collectGlobalDropZones(globalDropTree)
assert.equal(globalDropZones.length, 1, "the settings game list is a drop target")
assert.equal(typeof globalDropZones[0].props.onDrop, "function", "dropping there creates a game")

const beforeGames = testApi.GAMES.length
const created = testApi.createGameFromResolved(t, {
  ok: true,
  path: "D:\\Games\\Brand New\\BrandNew.exe",
  name: "Brand New",
  platformId: "steam",
})
assert.equal(created.state, "added", "a fresh exe becomes a new game")
const made = testApi.GAMES[testApi.GAMES.length - 1]
assert.equal(testApi.GAMES.length, beforeGames + 1)
assert.equal(made.name, "Brand New")
assert.equal(made.installs[0].path, "D:\\Games\\Brand New\\BrandNew.exe")
assert.equal(made.platforms[0], "steam")
assert.equal(
  testApi.createGameFromResolved(t, { ok: true, path: "D:\\Games\\Brand New\\BrandNew.exe", name: "Again" }).state,
  "owned",
  "an exe that already has a game is not added twice"
)
assert.equal(testApi.GAMES.length, beforeGames + 1, "the duplicate was refused")
testApi.GAMES.pop()

// --- the panel remembers the page it was on ----------------------------

function collectTexts(node, out) {
  if (node === null || node === undefined || node === false) return
  if (Array.isArray(node)) {
    node.forEach((child) => collectTexts(child, out))
    return
  }
  if (typeof node !== "object") {
    out.push(String(node))
    return
  }
  collectTexts(node.children, out)
}

const restoredTexts = []
testApi.setLastRoute({ name: "settings", from: "today" })
collectTexts(render(main.component, { t }, "Page(restore settings)"), restoredTexts)
assert.ok(restoredTexts.includes("settings.platforms"), "a remembered settings page is restored")

const staleTexts = []
testApi.setLastRoute({ name: "game", id: "no-such-game", from: "today" })
collectTexts(render(main.component, { t }, "Page(restore missing game)"), staleTexts)
assert.ok(staleTexts.includes("stat.today"), "a stale game route falls back to today")
testApi.setLastRoute({ name: "today" })

console.log('render-check: OK')
console.log('  slots:', slots.join(', '))
console.log('  games:', testApi.GAMES.length, 'sessions:', testApi.SESSIONS.length)
console.log('  totals day/week/all (min):', [dayTotal, weekTotal, allTotal].map((v) => Math.round(v / 60)).join(' / '))

// --- the first live payload must not keep the demo snapshot --------------

const firstLiveNow = Date.now()
const firstLiveSession = {
  id: 'first-live',
  gameId: 'zzz',
  platformId: 'mihoyo',
  source: null,
  start: firstLiveNow - 3600000,
  end: firstLiveNow - 1800000,
}
testApi.applyLiveState({
  source: 'live',
  now: firstLiveNow,
  platforms: { mihoyo: { id: 'mihoyo', name: '米哈游', short: '米', color: '#4f8ff7' } },
  games: [
    {
      id: 'zzz',
      name: '绝区零',
      glyph: '绝',
      color: '#4f8ff7',
      platforms: ['mihoyo'],
      disabled: [],
      installs: [],
      entries: [],
    },
  ],
  sessions: [firstLiveSession],
  historyFrom: firstLiveNow - 365 * 86400000,
  historyDays: 365,
  firstStart: firstLiveNow - 400 * 86400000,
  totals: { total: 1800, game: { zzz: 1800 }, platform: { mihoyo: 1800 } },
  lastPlayed: { zzz: firstLiveSession.end },
  active: [],
  settings: { intervalSec: 10, historyDays: 365 },
})
assert.equal(testApi.SESSIONS.length, 1, 'the first live payload keeps only the host session')
assert.equal(testApi.SESSIONS[0].id, 'first-live', 'demo sessions are not kept as lazy pages')
console.log('  first live payload: demo snapshot cleared, no lazy ghosts')

// --- live payload replaces the demo snapshot -----------------------------

const liveNow = Date.now()
testApi.applyLiveState({
  source: 'live',
  now: liveNow,
  platforms: { mihoyo: { id: 'mihoyo', name: '米哈游', short: '米', color: '#4f8ff7' } },
  games: [
    {
      id: 'zzz',
      name: '绝区零',
      glyph: '绝',
      color: '#4f8ff7',
      platforms: ['mihoyo'],
      disabled: [],
      runs: [],
    },
  ],
  sessions: [],
  active: [{ gameId: 'zzz', platformId: 'mihoyo', start: liveNow - 120000, seconds: 120 }],
  settings: { intervalSec: 10 },
})

if (testApi.SESSIONS.length !== 1) throw new Error('live session not folded in')
const liveToday = testApi.totalsFor('zzz', 'day', new Date(liveNow))
if (!(liveToday > 100 && liveToday <= 130)) throw new Error('live total unexpected: ' + liveToday)
if (testApi.GAMES.length !== 1) throw new Error('games not replaced')

render(testApi.TodayView, { t, onOpenGame() {} }, 'TodayView(live)')
render(testApi.AllView, { t, onOpenGame() {} }, 'AllView(live)')
render(
  testApi.DetailView,
  { key: 'live', t, game: testApi.GAMES[0], initialRange: 'day', onBack() {}, onSettings() {} },
  'DetailView(live)'
)

console.log('  live payload: games=1 sessions=1 (in-progress folded in)')

// --- lazy history: /state ships a window, totals stay all-time -----------

const historyFrom = liveNow - 365 * 86400000
const firstStart = liveNow - 400 * 86400000
const recentSession = {
  id: 'recent-1',
  gameId: 'zzz',
  platformId: 'mihoyo',
  source: null,
  start: liveNow - 3600000,
  end: liveNow - 1800000,
}
const basePayload = {
  source: 'live',
  now: liveNow,
  platforms: { mihoyo: { id: 'mihoyo', name: '米哈游', short: '米', color: '#4f8ff7' } },
  games: [
    {
      id: 'zzz',
      name: '绝区零',
      glyph: '绝',
      color: '#4f8ff7',
      platforms: ['mihoyo'],
      disabled: [],
      installs: [],
      entries: [],
    },
  ],
  sessions: [recentSession],
  historyFrom,
  historyDays: 365,
  firstStart,
  totals: { total: 36000, game: { zzz: 36000 }, platform: { mihoyo: 36000 } },
  lastPlayed: { zzz: liveNow - 10 * 86400000 },
  active: [],
  settings: { intervalSec: 10, historyDays: 365 },
}

testApi.applyLiveState(basePayload)
assert.equal(testApi.SESSIONS.length, 1, 'only the configured window is loaded')
assert.equal(
  Math.round(testApi.totalsFor('zzz', 'all', new Date(liveNow))),
  36000,
  'the all-time total comes from the host map, not the loaded window'
)

const clampedOld = testApi.clampAnchor('all', new Date(firstStart - 365 * 86400000), testApi.GRAIN_LEVELS.all.levels[0])
const firstMonth = new Date(new Date(firstStart).getFullYear(), new Date(firstStart).getMonth(), 1).getTime()
assert.equal(clampedOld.getTime(), firstMonth, 'panning clamps to the true first session, not the window edge')

render(testApi.TodayView, { t, onOpenGame() {} }, 'TodayView(lazy)')
render(testApi.AllView, { t, onOpenGame() {} }, 'AllView(lazy)')
render(
  testApi.DetailView,
  { key: 'lazy', t, game: testApi.GAMES[0], initialRange: 'all', onBack() {}, onSettings() {} },
  'DetailView(lazy)'
)

// --- panning past the window fetches the older slice ---------------------

const olderSession = {
  id: 'old-1',
  gameId: 'zzz',
  platformId: 'mihoyo',
  source: null,
  start: firstStart,
  end: firstStart + 3600000,
}
let requestedUrl = ''
sandbox.fetch = function (url) {
  requestedUrl = String(url)
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ sessions: [olderSession] }) })
}
const loadedBefore = testApi.getHistoryFrom()
testApi.ensureHistory(firstStart - 86400000)
await new Promise((resolve) => setTimeout(resolve, 10))
assert.match(requestedUrl, /\/api\/game-time\/sessions\?from=\d+&to=\d+/, 'lazy load asks the slice endpoint')
assert.equal(testApi.getHistoryFrom(), firstStart - 86400000, 'the loaded edge moves back')
assert.equal(
  testApi.SESSIONS.some((session) => session.id === 'old-1'),
  true,
  'the older slice is appended to the session store'
)

// A refresh must keep the page that was just loaded, and lastPlayed must
// still know about games whose sessions sit outside the window.
testApi.applyLiveState(Object.assign({}, basePayload, { sessions: [] }))
assert.equal(
  testApi.SESSIONS.some((session) => session.id === 'old-1'),
  true,
  'a 30-second refresh keeps already-loaded older pages'
)
assert.equal(
  testApi.lastPlayedAt('zzz'),
  liveNow - 10 * 86400000,
  'last played comes from the host map when the window has no session'
)
delete sandbox.fetch
console.log('  lazy history: windowed /state, all-time totals, older slice on demand')

// --- backgrounds render ------------------------------------------------

testApi.GAMES[0].background = "/api/game-time/asset/0123456789abcdef01234567.png"
testApi.SETTINGS.background = "/api/game-time/asset/fedcba9876543210fedcba98.png"
testApi.SETTINGS.backgroundFit = "cover"
render(main.component, { t }, "Page(background)")
render(
  testApi.DetailView,
  { key: "bg", t, game: testApi.GAMES[0], initialRange: "day", onBack() {}, onSettings() {} },
  "DetailView(background)"
)
testApi.GAMES[0].background = ""
testApi.SETTINGS.background = ""
console.log("  backgrounds: rendered with and without images")

// --- header background + surface colour --------------------------------

testApi.SETTINGS.headerBackground = "/api/game-time/asset/aaaaaaaaaaaaaaaaaaaaaaaa.png"
testApi.SETTINGS.surfaceColor = "#101820"
testApi.GAMES[0].headerBackground = "/api/game-time/asset/bbbbbbbbbbbbbbbbbbbbbbbb.png"
render(main.component, { t }, "Page(header)")
render(
  testApi.DetailView,
  { key: "hdr", t, game: testApi.GAMES[0], initialRange: "day", onBack() {}, onSettings() {} },
  "DetailView(header)"
)
render(testApi.GameSettings, { t, game: testApi.GAMES[0], onBack() {}, touch() {} }, "GameSettings(header)")
render(testApi.GlobalSettings, { t, onBack() {}, touch() {} }, "GlobalSettings(header)")
testApi.SETTINGS.headerBackground = ""
testApi.GAMES[0].headerBackground = ""
console.log("  header backgrounds: rendered")

// --- cropper ------------------------------------------------------------

render(
  testApi.Cropper,
  {
    t,
    src: "data:image/png;base64,iVBORw0KGgo=",
    aspect: 8 / 3,
    outputWidth: 1280,
    onCancel() {},
    onApply() {},
  },
  "Cropper(background)"
)
render(
  testApi.Cropper,
  { t, src: "data:image/png;base64,iVBORw0KGgo=", aspect: 1, outputWidth: 96, onCancel() {}, onApply() {} },
  "Cropper(icon)"
)
render(testApi.ImageField, { t, value: "", aspect: 8 / 3, width: 1280, onChange() {} }, "ImageField(empty)")
render(testApi.ImageField, { t, value: "/api/game-time/asset/abc.png", aspect: 8 / 3, width: 1280, onChange() {} }, "ImageField(value)")
console.log("  cropper: rendered for background and icon aspects")

// --- a freshly added game has no installs or entries yet ----------------

const bare = { id: "new-game", name: "新游戏", glyph: "新", color: "#7fbf6a", platforms: ["mihoyo"] }
render(testApi.GameSettings, { t, game: bare, onBack() {}, touch() {} }, "GameSettings(bare)")
render(
  testApi.DetailView,
  { key: "bare", t, game: bare, initialRange: "day", onBack() {}, onSettings() {} },
  "DetailView(bare)"
)
console.log("  freshly added game: renders without installs")

// --- session subtitle: no "米哈游 · 米哈游" ------------------------------

const platform = Object.values(testApi.PLATFORMS)[0]
assert.equal(
  testApi.sessionSub({ platformId: platform.id, source: platform.name }),
  platform.name,
  "a launcher source that repeats the platform name is collapsed"
)
assert.equal(
  testApi.sessionSub({ platformId: platform.id, source: "Playnite" }),
  platform.name + " · Playnite",
  "a different launch source is still shown"
)
assert.equal(testApi.sessionSub({ platformId: platform.id }), platform.name, "no source renders the platform alone")
console.log("  session subtitle: duplicate source collapsed")

// --- lazy pages follow the current game list -----------------------------

testApi.applyLiveState(basePayload)
const ghostSession = {
  id: 'ghost-1',
  gameId: 'ghost',
  platformId: 'mihoyo',
  source: null,
  start: firstStart,
  end: firstStart + 600000,
}
sandbox.fetch = function () {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ sessions: [ghostSession] }) })
}
testApi.ensureHistory(firstStart - 3 * 86400000)
await new Promise((resolve) => setTimeout(resolve, 10))
assert.equal(
  testApi.SESSIONS.some((session) => session.id === 'ghost-1'),
  false,
  'a slice for a game that is not in the config is ignored'
)

sandbox.fetch = function () {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ sessions: [olderSession] }) })
}
testApi.ensureHistory(firstStart - 4 * 86400000)
await new Promise((resolve) => setTimeout(resolve, 10))
assert.equal(
  testApi.SESSIONS.some((session) => session.id === 'old-1'),
  true,
  'a slice for a live game is still appended'
)

testApi.applyLiveState(Object.assign({}, basePayload, { games: [], sessions: [], active: [] }))
assert.equal(testApi.SESSIONS.length, 0, 'deleting a game drops its lazy pages')
delete sandbox.fetch
console.log("  lazy pages: filtered by the current games, dropped when a game is deleted")

// --- 跨零点：面板开着过夜，"今日"必须跟着时钟走 ---------------------------
// 2026-11-13 22:00 开局，一直玩到 14 号凌晨 01:00：界面上"今日"曾经一直停在
// 打开面板那天的窗口，整晚不刷新。现在 NOW 是活的（live 轮询 + 跨天看门狗都会
// 推进它），下面把时钟拨过去，验证窗口、统计和组件都跟着翻页。

const crossingStart = new Date(2026, 10, 13, 23, 0, 0).getTime() // 13th 23:00
const midnight = new Date(2026, 10, 14, 0, 0, 0).getTime() // 14th 00:00

function crossingPayload(now, active, sessions) {
  return {
    source: 'live',
    now: now.getTime(),
    platforms: { mihoyo: { id: 'mihoyo', name: '米哈游', short: '米', color: '#4f8ff7' } },
    games: [
      {
        id: 'zzz',
        name: '绝区零',
        glyph: '绝',
        color: '#4f8ff7',
        platforms: ['mihoyo'],
        disabled: [],
        installs: [],
        entries: [],
      },
    ],
    sessions: sessions || [],
    historyFrom: now.getTime() - 365 * 86400000,
    historyDays: 365,
    firstStart: crossingStart,
    totals: { total: 7200, game: { zzz: 7200 }, platform: { mihoyo: 7200 } },
    lastPlayed: { zzz: now.getTime() },
    active: active || [],
    settings: { intervalSec: 10, historyDays: 365 },
  }
}

function textOf(node, out) {
  const list = out || []
  if (node === null || node === undefined || node === false) return list
  if (Array.isArray(node)) {
    node.forEach((child) => textOf(child, list))
    return list
  }
  if (typeof node === 'object' && node.type) {
    textOf(node.children, list)
    return list
  }
  list.push(String(node))
  return list
}

// 1) 还没过零点：今日 = 23:00 开的那半小时。
testApi.applyLiveState(
  crossingPayload(
    new Date(2026, 10, 13, 23, 30, 0),
    [{ gameId: 'zzz', platformId: 'mihoyo', start: crossingStart, seconds: 1800 }]
  )
)
assert.equal(testApi.dayKey(testApi.NOW), '2026-11-13', '载荷里的 now 会推进模块时钟')
assert.equal(testApi.totalsFor(null, 'day', testApi.NOW), 1800, '零点前算 13 号的半小时')

// 2) 过了零点：还在玩，但"今日"必须是 14 号的那一小时，而不是整段 3 小时。
const afterMidnight = new Date(2026, 10, 14, 1, 0, 0)
testApi.applyLiveState(
  crossingPayload(afterMidnight, [{ gameId: 'zzz', platformId: 'mihoyo', start: crossingStart, seconds: 7200 }])
)
assert.equal(testApi.dayKey(testApi.NOW), '2026-11-14', '轮询把日历翻到 14 号')
assert.equal(testApi.totalsFor(null, 'day', testApi.NOW), 3600, '14 号只算跨零后的那一小时')
assert.equal(
  testApi.totalsFor(null, 'day', new Date(2026, 10, 13, 12, 0, 0)),
  3600,
  '13 号仍然只有零点前的一小时'
)
assert.equal(
  testApi.defaultAnchor('day').getTime(),
  new Date(2026, 10, 15, 0, 0, 0).getTime(),
  '跟随当前的窗口锚点走到 15 号零点'
)

// 组件本身也要跟着翻页：今日卡片显示 1 小时，而不是冻结在昨天。
const rolloverTree = render(testApi.TodayView, { t, onOpenGame() {} }, 'TodayView(rollover)')
const rolloverText = textOf(rolloverTree)
const todayAt = rolloverText.indexOf('stat.today')
assert.ok(todayAt >= 0, '今日卡片存在')
assert.equal(rolloverText[todayAt + 1] + rolloverText[todayAt + 2], '1hour', '今日卡片显示跨零后的一小时')

// 3) 再过一个零点，游戏已在 01:00 结束、被宿主按天拆成两段：今日回到 0。
const splitSessions = [
  { id: 'split-a', gameId: 'zzz', platformId: 'mihoyo', source: null, start: crossingStart, end: midnight },
  { id: 'split-b', gameId: 'zzz', platformId: 'mihoyo', source: null, start: midnight, end: afterMidnight.getTime() },
]
testApi.applyLiveState(crossingPayload(new Date(2026, 10, 15, 0, 30, 0), [], splitSessions))
assert.equal(testApi.dayKey(testApi.NOW), '2026-11-15', '第三个日历日')
assert.equal(testApi.totalsFor(null, 'day', testApi.NOW), 0, '15 号还没玩，今日归零')
assert.equal(
  testApi.totalsFor(null, 'day', new Date(2026, 10, 14, 12, 0, 0)),
  3600,
  '拆开的那一段仍然记在 14 号'
)
assert.equal(
  testApi.totalsFor(null, 'day', new Date(2026, 10, 13, 12, 0, 0)),
  3600,
  '零点前的那一段仍然记在 13 号'
)

// 4) 看门狗用它判断"日历翻了没有"。
assert.equal(testApi.setNow(new Date(2026, 10, 14, 0, 0, 1)), true, '跨天会被报告出来')
assert.equal(testApi.setNow(new Date(2026, 10, 14, 23, 59, 59)), false, '同一天内不算跨天')

// 还原真实时钟，别把后面的输出带偏。
testApi.setNow(Date.now())
assert.equal(testApi.dayKey(testApi.NOW), testApi.dayKey(Date.now()), '时钟恢复')
console.log('  midnight rollover: 今日 follows the clock across 13th -> 14th -> 15th')

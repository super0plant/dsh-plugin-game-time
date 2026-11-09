/**
 * Standalone entry checks (no browser, no DSH).
 *
 *   A. loader shim — the real `client.js` mounts under a fake React/DOM, and the
 *      dictionary binding works (`t('panel')` → 游戏时长, unknown keys fall back).
 *   B. HTTP contract — the server boots on a free port with a throw-away
 *      DSH_HOME, serves the page + bundle + icon, exposes /api/game-time/state
 *      with `env.standalone=true`, rejects unknown paths, and a second launch on
 *      the same port exits 0 without becoming a second collector.
 */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const ENTRY = join(ROOT, 'standalone', 'server.mjs')
const VENDOR = join(ROOT, 'standalone', 'vendor')

if (!existsSync(ENTRY)) {
  /* The DSH plugin bundle deliberately ships without standalone/. */
  console.log('standalone-check: skipped (this bundle has no standalone/ directory)')
  process.exit(0)
}

/* The vendored UMD files came through a proxy that used chunked transfer;
 * a missed de-chunk leaves "16ab\r\n" lines in the JS and the browser reports
 * `Cannot read properties of undefined (reading 'createElement')`. Compile
 * them here so that failure can never reach a page again. */
for (const name of ['react.production.min.js', 'react-dom.production.min.js']) {
  const source = readFileSync(join(VENDOR, name), 'utf8')
  new vm.Script(source, { filename: name })
  assert.match(source.slice(0, 40), /^\/\*\*/, name + ' starts with the license banner')
}
const reactSandbox = { self: null }
reactSandbox.self = reactSandbox
reactSandbox.window = reactSandbox
vm.createContext(reactSandbox)
vm.runInContext(readFileSync(join(VENDOR, 'react.production.min.js'), 'utf8'), reactSandbox, { filename: 'react' })
assert.equal(typeof reactSandbox.React.createElement, 'function', 'the UMD build exposes a usable React')
assert.equal(reactSandbox.React.version, '18.3.1')
console.log('standalone-check: vendor OK (UMD compiles, React 18.3.1 exposed)')

/* ---------------------------------------------------------------- A. mount */

function mount(language, search) {
  let captured = null
  const React = {
    createElement(type, props, ...children) {
      return { type, props: Object.assign({}, props, children.length ? { children } : {}) }
    },
    useState(initial) {
      return [typeof initial === 'function' ? initial() : initial, function () {}]
    },
    useRef(value) {
      return { current: value }
    },
    useEffect() {},
  }
  const document = {
    getElementById(id) {
      return { id, hidden: true, textContent: '', remove() {} }
    },
  }
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    URLSearchParams,
    location: { search },
    navigator: { language },
    document,
    fetch: function () {
      return Promise.reject(new Error('offline in test'))
    },
    React,
    ReactDOM: {
      createRoot() {
        return { render: function (node) { captured = node } }
      },
    },
  }
  sandbox.window = sandbox
  vm.createContext(sandbox)
  vm.runInContext(readFileSync(join(ROOT, 'standalone', 'loader.js'), 'utf8'), sandbox, { filename: 'loader.js' })
  vm.runInContext(readFileSync(join(ROOT, 'client.js'), 'utf8'), sandbox, { filename: 'client.js' })
  return captured
}

const zh = mount('zh-CN', '?lang=zh')
assert.ok(zh, 'client.js mounted a component')
assert.equal(typeof zh.type, 'function', 'the main slot receives the Page component')
assert.equal(zh.props.t('panel'), '游戏时长', 'zh dictionary is bound')
assert.equal(zh.props.t('tab.today'), '今日')
assert.equal(zh.props.t('nope.missing'), 'nope.missing', 'unknown keys fall back to the key')

const en = mount('en-US', '')
assert.ok(en, 'client.js mounts for English too')
assert.equal(en.props.t('panel'), 'Game Time')
console.log('standalone-check: mount OK (zh + en, main slot, dictionary fallback)')

/* ----------------------------------------------------------------- B. HTTP */

const port = 46000 + Math.floor(Math.random() * 900)
const base = 'http://127.0.0.1:' + port
const home = mkdtempSync(join(tmpdir(), 'gt-standalone-'))
const children = []

function boot() {
  const child = spawn(process.execPath, [ENTRY, '--no-open', '--port', String(port)], {
    env: Object.assign({}, process.env, { DSH_HOME: home, GAME_TIME_OPEN_BROWSER: '0' }),
    stdio: 'ignore',
  })
  children.push(child)
  return child
}

function exited(child, timeoutMs) {
  return new Promise(function (resolveExit) {
    if (child.exitCode !== null) return resolveExit(child.exitCode)
    const timer = setTimeout(function () { resolveExit('timeout') }, timeoutMs)
    child.once('exit', function (code) {
      clearTimeout(timer)
      resolveExit(code)
    })
  })
}

function sleep(ms) {
  return new Promise(function (done) { setTimeout(done, ms) })
}

async function waitForState() {
  const deadline = Date.now() + 20000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base + '/api/game-time/state')
      if (response.ok) return response.json()
    } catch {
      /* not up yet */
    }
    await sleep(250)
  }
  throw new Error('server did not answer /state within 20s')
}

const first = boot()
try {
  const state = await waitForState()
  assert.equal(state.env.standalone, true, 'env.standalone is true')
  assert.equal(state.env.autostart.supported, true, 'autostart is writable in standalone')
  assert.equal(state.env.autostart.reason, '', 'no refusal reason')

  const page = await fetch(base + '/')
  assert.equal(page.status, 200)
  assert.match(page.headers.get('content-type'), /text\/html/)
  const html = await page.text()
  assert.match(html, /游戏时长/)
  assert.match(html, /loader\.js/)
  assert.match(html, /client\.js/)
  assert.match(html, /icon\.ico/)

  const bundle = await fetch(base + '/client.js')
  assert.equal(bundle.status, 200)
  assert.ok((await bundle.text()).length > 200000, 'client.js is served whole')

  for (const asset of ['/loader.js', '/icon.ico', '/icon-256.png', '/vendor/react.production.min.js', '/vendor/react-dom.production.min.js']) {
    const response = await fetch(base + asset)
    assert.equal(response.status, 200, asset + ' is served')
  }

  const missing = await fetch(base + '/package.json')
  assert.equal(missing.status, 404, 'only whitelisted files are served')

  const second = boot()
  const code = await exited(second, 8000)
  assert.equal(code, 0, 'a second launch exits 0 instead of starting a collector')
  const still = await fetch(base + '/api/game-time/state')
  assert.equal(still.status, 200, 'the first instance is untouched')

  const wrongMethod = await fetch(base + '/api/game-time/shutdown')
  assert.equal(wrongMethod.status, 405, 'shutdown only accepts POST')

  const stopped = await fetch(base + '/api/game-time/shutdown', { method: 'POST' })
  assert.equal(stopped.status, 200)
  const cleanExit = await exited(first, 8000)
  assert.equal(cleanExit, 0, 'the tray "quit" path stops the collector cleanly')
  console.log('standalone-check: HTTP OK (state, page, bundle, assets, 404, single instance, shutdown)')
} finally {
  for (const child of children) {
    if (child.exitCode === null) child.kill()
  }
  await sleep(300)
  rmSync(home, { recursive: true, force: true })
}

#!/usr/bin/env node
/**
 * Game Time — standalone entry (no DSH required).
 *
 * Boots the DSH plugin host with a hand-made `ctx` (logger / effect / webServer),
 * serves the same `client.js` bundle as a plain web page, and puts the JSON API
 * under the same `/api/game-time` prefix. Behaviour stays in `src/host/*` — this
 * file only supplies the three DSH surfaces the host depends on.
 *
 * Runtime contract:
 *   - fixed address   http://127.0.0.1:45917
 *   - single instance one process owns the port; a second launch just opens the
 *                     browser at the running one and exits without touching data
 *   - storage         the same `%USERPROFILE%\.dsh\storages\game-time\` as DSH
 *                     (set `DSH_HOME` to move it)
 *   - shutdown        Ctrl+C / SIGTERM → server close → process.exit(), which
 *                     runs the host's synchronous `finaliseSync()` writer
 *
 * Usage:  node standalone/server.mjs [--no-open] [--port 45917]
 */
import http from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { apply } from '../src/host/main.js'
import { DIR } from '../src/host/constants.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const HOST = '127.0.0.1'

function argValue(name, fallback) {
  const index = process.argv.indexOf(name)
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1]
  return fallback
}

const PORT = Number(argValue('--port', process.env.GAME_TIME_PORT || 45917))
const BASE = 'http://' + HOST + ':' + PORT + '/'

/* The host decides whether "start at login" is writable from these two values. */
process.env.GAME_TIME_STANDALONE = '1'
if (!process.env.GAME_TIME_STANDALONE_ENTRY) {
  process.env.GAME_TIME_STANDALONE_ENTRY = fileURLToPath(import.meta.url)
}

/** Static whitelist — no directory traversal, nothing outside the plugin folder. */
const STATIC = {
  '/': ['standalone/index.html', 'text/html; charset=utf-8'],
  '/index.html': ['standalone/index.html', 'text/html; charset=utf-8'],
  '/loader.js': ['standalone/loader.js', 'text/javascript; charset=utf-8'],
  '/client.js': ['client.js', 'text/javascript; charset=utf-8'],
  '/icon.ico': ['icon.ico', 'image/x-icon'],
  '/favicon.ico': ['icon.ico', 'image/x-icon'],
  '/icon.png': ['icon.png', 'image/png'],
  '/icon-256.png': ['standalone/icon-256.png', 'image/png'],
  '/vendor/react.production.min.js': ['standalone/vendor/react.production.min.js', 'text/javascript; charset=utf-8'],
  '/vendor/react-dom.production.min.js': ['standalone/vendor/react-dom.production.min.js', 'text/javascript; charset=utf-8'],
  '/vendor/LICENSE-react.txt': ['standalone/vendor/LICENSE-react.txt', 'text/plain; charset=utf-8'],
}

let apiHandler = null
let booted = false

const server = http.createServer(function (req, res) {
  let pathname = '/'
  try {
    pathname = new URL(req.url || '/', 'http://localhost').pathname
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('bad request')
    return
  }

  // The desktop launcher's tray "quit" needs a graceful stop (server.close ->
  // process.exit -> the host's synchronous finaliseSync). Bound to loopback only.
  if (pathname === '/api/game-time/shutdown') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('method not allowed')
      return
    }
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    res.end('{"ok":true}')
    setTimeout(function () { shutdown('api') }, 120)
    return
  }

  if (pathname === '/api/game-time' || pathname.startsWith('/api/game-time/')) {
    if (!booted || !apiHandler) {
      res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' })
      res.end('starting')
      return
    }
    apiHandler(req, res)
    return
  }

  const entry = STATIC[pathname]
  if (!entry) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('not found')
    return
  }

  const file = path.join(ROOT, entry[0])
  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('missing ' + entry[0])
    return
  }

  res.writeHead(200, {
    'content-type': entry[1],
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(file).on('error', function () {
    res.destroy()
  }).pipe(res)
})

function openBrowser() {
  if (process.argv.includes('--no-open')) return
  try {
    execFile('cmd.exe', ['/c', 'start', '', BASE], { windowsHide: true }, function () {})
  } catch {
    /* no browser / no cmd — the URL is printed anyway */
  }
}

/** The host only needs these three surfaces from DSH. */
function makeCtx() {
  return {
    logger: {
      info: function () { console.log.apply(console, ['[game-time]'].concat([].slice.call(arguments))) },
      warn: function () { console.warn.apply(console, ['[game-time]'].concat([].slice.call(arguments))) },
      error: function () { console.error.apply(console, ['[game-time]'].concat([].slice.call(arguments))) },
    },
    effect(fn) {
      const dispose = typeof fn === 'function' ? fn() : null
      return typeof dispose === 'function' ? dispose : function () {}
    },
    webServer: {
      register(options) {
        if (!options || options.kind !== 'prefix') return function () {}
        apiHandler = options.handler
        return function () {
          if (apiHandler === options.handler) apiHandler = null
        }
      },
    },
  }
}

/**
 * Two collectors writing the same sessions.json is the one way to lose data.
 * Inside DSH the plugin always collects, so warn when DSH is running — the
 * user may still keep both open, but not unknowingly.
 */
function warnIfDshRunning() {
  if (process.platform !== 'win32') return
  try {
    execFile('tasklist', ['/FI', 'IMAGENAME eq DeepSeek Harness.exe', '/NH'], { windowsHide: true, timeout: 5000 }, function (error, stdout) {
      if (error || !stdout || stdout.indexOf('DeepSeek Harness.exe') < 0) return
      console.warn('[game-time] DSH is running. If the game-time plugin is installed there,')
      console.warn('[game-time] both collect the same games — keep only one collector open.')
    })
  } catch {
    /* tasklist missing — nothing to warn about */
  }
}

function shutdown(signal) {
  console.log('[game-time] shutting down (' + signal + ')')
  server.close(function () { process.exit(0) })
  /* Do not hang on keep-alive sockets; the exit hook writes synchronously. */
  setTimeout(function () { process.exit(0) }, 800).unref()
}

process.on('SIGINT', function () { shutdown('SIGINT') })
process.on('SIGTERM', function () { shutdown('SIGTERM') })

server.on('error', function (error) {
  if (error && error.code === 'EADDRINUSE') {
    console.log('[game-time] already running at ' + BASE)
    openBrowser()
    /* Never call apply() here: a second collector must not touch active.json. */
    process.exit(0)
  }
  console.error('[game-time] server error:', error)
  process.exit(1)
})

server.listen(PORT, HOST, function () {
  apply(makeCtx())
  booted = true
  console.log('[game-time] data dir: ' + DIR)
  console.log('[game-time] standalone ready at ' + BASE + '  (Ctrl+C to stop)')
  warnIfDshRunning()
  if (process.env.GAME_TIME_OPEN_BROWSER !== '0') openBrowser()
})

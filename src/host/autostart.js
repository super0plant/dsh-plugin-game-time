/**
 * Game Time — Windows "start at login" support.
 *
 * The DSH host boots this plugin itself, so a login entry written from DSH
 * could only start DSH — that decision belongs to the user's DSH install, not
 * to this plugin. The switch is therefore read-only inside DSH and is only
 * writable by the standalone entry (`GAME_TIME_STANDALONE=1`), whose launcher
 * path comes from `GAME_TIME_STANDALONE_ENTRY`.
 *
 * The registry (single source of truth) is queried on every read; the config
 * value `settings.autostart` only records the user's intent so a disabled
 * entry is not re-created on the next launch.
 */
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const RUN_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
export const RUN_VALUE = 'GameTime'

const DEFAULT_ENTRY = fileURLToPath(new URL('../../standalone/server.mjs', import.meta.url))

export function isStandaloneHost() {
  return process.platform === 'win32' && process.env.GAME_TIME_STANDALONE === '1'
}

export function autostartEntry() {
  return process.env.GAME_TIME_STANDALONE_ENTRY || DEFAULT_ENTRY
}

/** Empty string when writable, otherwise the reason shown to the user. */
export function autostartReason() {
  if (process.platform !== 'win32') return 'os'
  if (!isStandaloneHost()) return 'dsh'
  if (!existsSync(autostartEntry())) return 'missing-entry'
  return ''
}

export function buildAutostartCommand(execPath, entry) {
  return '"' + String(execPath) + '" "' + String(entry) + '"'
}

/** Parse the output of `reg query <run key> /v GameTime`. */
export function parseRegQuery(stdout) {
  const lines = String(stdout || '').split(/\r?\n/)
  const line = lines.find(function (row) {
    return row.indexOf(RUN_VALUE) >= 0 && row.indexOf('REG_SZ') >= 0
  })
  if (!line) return { enabled: false, command: '' }
  const match = line.match(/REG_SZ\s+(.+)$/)
  return { enabled: true, command: match ? match[1].trim() : '' }
}

function regRunner(args) {
  return new Promise(function (resolve) {
    try {
      execFile('reg.exe', args, { windowsHide: true, timeout: 5000 }, function (error, stdout) {
        resolve({ code: error ? 1 : 0, stdout: String(stdout || '') })
      })
    } catch {
      resolve({ code: 1, stdout: '' })
    }
  })
}

export async function readAutostart(run = regRunner) {
  const reason = autostartReason()
  if (reason) {
    return { supported: false, reason, enabled: false, target: autostartEntry(), command: '' }
  }
  const result = await run(['query', RUN_KEY, '/v', RUN_VALUE])
  const parsed = result && result.code === 0 ? parseRegQuery(result.stdout) : { enabled: false, command: '' }
  return {
    supported: true,
    reason: '',
    enabled: parsed.enabled,
    target: autostartEntry(),
    command: parsed.command,
  }
}

export async function writeAutostart(enabled, run = regRunner) {
  const reason = autostartReason()
  if (reason) return { ok: false, supported: false, reason, enabled: false }

  const args = enabled
    ? ['add', RUN_KEY, '/v', RUN_VALUE, '/t', 'REG_SZ', '/d', buildAutostartCommand(process.execPath, autostartEntry()), '/f']
    : ['delete', RUN_KEY, '/v', RUN_VALUE, '/f']

  const result = await run(args)
  if (!result || result.code !== 0) return { ok: false, supported: true, reason: 'registry', enabled: !enabled }
  return { ok: true, supported: true, reason: '', enabled: enabled }
}

/**
 * Game Time — value coercion, JSON/asset IO and path helpers.
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { ASSET_DIR, DIR } from './constants.js'

export async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return fallback
  }
}

export async function writeJson(path, value) {
  await mkdir(DIR, { recursive: true })
  const tmp = path + '.tmp'
  await writeFile(tmp, JSON.stringify(value, null, 2), 'utf8')
  await rename(tmp, path)
}

export function text(value, fallback, maxLength) {
  const out = typeof value === 'string' ? value.trim() : ''
  return (out || fallback).slice(0, maxLength || 200)
}

export function clampRange(value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

export function clamp01(value, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(1, Math.max(0, number))
}

export function bool(value, fallback) {
  return typeof value === 'boolean' ? value : fallback
}

export function colorOf(value, fallback) {
  return /^#[0-9a-fA-F]{3,8}$/.test(String(value)) ? String(value) : fallback
}

export function iconOf(value) {
  if (typeof value !== 'string') return ''
  if (value.length > 300000) return ''
  return /^data:image\/(png|jpeg|webp|gif);base64,/.test(value) ? value : ''
}

export function assetRef(value) {
  if (typeof value !== 'string') return ''
  if (/^\/api\/game-time\/asset\/[a-f0-9]{16,64}\.(png|jpg|webp)$/.test(value)) return value
  if (value.length > 300000) return ''
  return /^data:image\/(png|jpeg|webp);base64,/.test(value) ? value : ''
}

export async function saveAsset(dataUrl) {
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl))
  if (!match) return null
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length === 0 || buffer.length > 3 * 1024 * 1024) return null
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 24)
  const name = hash + '.' + ext
  await mkdir(ASSET_DIR, { recursive: true })
  await writeFile(join(ASSET_DIR, name), buffer)
  return '/api/game-time/asset/' + name
}

export function fileExists(value) {
  if (!value) return false
  try {
    return existsSync(value)
  } catch {
    return false
  }
}

export function baseName(path) {
  const parts = String(path).split(/[\\/]/)
  return parts[parts.length - 1] || ''
}

export function dirName(path) {
  const value = String(path)
  const cut = Math.max(value.lastIndexOf('\\'), value.lastIndexOf('/'))
  return cut > 0 ? value.slice(0, cut) : ''
}

export function joinPath(dir, file) {
  if (!dir) return file
  return String(dir).replace(/[\\/]+$/, '') + '\\' + file
}

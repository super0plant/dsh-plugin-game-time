/**
 * Game Time — session arithmetic (day splitting).
 */

export function splitByDay(gameId, platformId, start, end, source) {
  const out = []
  let cursor = start
  while (cursor < end) {
    const day = new Date(cursor)
    day.setHours(24, 0, 0, 0)
    const boundary = Math.min(day.getTime(), end)
    out.push({
      id: gameId + '-' + String(cursor) + '-' + String(out.length),
      gameId,
      platformId,
      source: source || null,
      start: cursor,
      end: boundary,
    })
    cursor = boundary
  }
  return out
}

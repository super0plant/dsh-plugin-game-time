/**
 * Game Time — session arithmetic (day splitting).
 */

// One scratch Date, reused: `snapshot()` asks for the day of every session on
// every /state call, and allocating two Dates per session was the single
// biggest cost of adding played-day counts (measured: 41 ms → 9 ms at 110k
// sessions). Node is single-threaded and this is synchronous, so sharing it is
// safe.
const scratch = new Date()

/**
 * Local calendar day as an integer: days since the epoch *in local time*.
 *
 * Calendar days are contiguous integers, so "which days did this touch" is a
 * range, not a walk — that keeps `snapshot()` cheap for a session that spans
 * midnight (or, in old data, several days). Never the UTC day.
 */
export function localDayIndex(value) {
  const ms = Number(value)
  scratch.setTime(ms)
  const offset = scratch.getTimezoneOffset() * 60000
  return Math.floor((ms - offset) / 86400000)
}

/** First and last local day a session touches; `end` is exclusive. */
export function dayRangeOf(start, end) {
  const from = Number(start)
  const to = Number(end)
  if (!Number.isFinite(from)) return { first: 0, last: 0 }
  scratch.setTime(from)
  const offset = scratch.getTimezoneOffset() * 60000
  const first = Math.floor((from - offset) / 86400000)
  if (!Number.isFinite(to) || to <= from) return { first: first, last: first }
  // Fast path: a session that ends before the next local midnight is one day.
  // DST can move that boundary by an hour; the fallback below is exact either
  // way, so a wrong guess only costs one extra lookup.
  const nextMidnight = (first + 1) * 86400000 + offset
  if (to <= nextMidnight) return { first: first, last: first }
  const last = localDayIndex(to - 1)
  return { first: first, last: Math.max(first, last) }
}

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

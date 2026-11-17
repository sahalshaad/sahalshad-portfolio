/**
 * Utility functions for parsing and serializing experience points/achievements.
 * Backward-compatible with:
 * - JSON string array (e.g. '["Point 1", "Point 2"]')
 * - Multi-line strings with newlines and bullets (e.g. "• Point 1\n• Point 2")
 * - Single fallback strings
 */

export function parseExperiencePoints(raw: string | null | undefined): string[] {
  if (!raw) return []
  const trimmed = raw.trim()
  if (!trimmed) return []

  // 1. Try parsing as JSON array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
          .filter((item) => item.length > 0)
        if (cleaned.length > 0) {
          return cleaned
        }
      }
    } catch {
      // Fall through to text parsing if JSON parse failed
    }
  }

  // 2. Fallback to newline / bullet parsing
  return trimmed
    .split(/\r?\n+/)
    .map((line) => line.replace(/^[\s•*.\d)-]+/, '').trim())
    .filter((line) => line.length > 0)
}

export function serializeExperiencePoints(points: string[]): string {
  const cleaned = points
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  return JSON.stringify(cleaned)
}

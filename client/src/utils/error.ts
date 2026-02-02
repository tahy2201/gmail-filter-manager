export function getErrorMessage(e: unknown, fallback?: string): string {
  if (typeof e === 'string') return e
  if (e instanceof Error) return e.message
  return fallback ?? String(e)
}

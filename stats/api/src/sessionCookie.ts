const SESSION_COOKIE_NAME = 'magies_shell_stats_session'
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60

export function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/stats-api; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/stats-api; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
}

export function readSessionToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null
  for (const item of cookieHeader.split(';')) {
    const separator = item.indexOf('=')
    if (separator < 0) continue
    const name = item.slice(0, separator).trim()
    if (name !== SESSION_COOKIE_NAME) continue
    try {
      return decodeURIComponent(item.slice(separator + 1).trim()) || null
    } catch {
      return null
    }
  }
  return null
}

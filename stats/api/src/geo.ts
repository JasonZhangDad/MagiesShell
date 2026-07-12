import geoip from 'geoip-lite'

export type GeoInfo = {
  country: string | null
  region: string | null
  city: string | null
  isp: string | null
}

function normalizeIp(ip: string | undefined | null): string | null {
  if (!ip) return null
  const cleaned = ip.trim().replace(/^::ffff:/, '')
  if (!cleaned || cleaned === '127.0.0.1' || cleaned === '::1') return cleaned
  return cleaned
}

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | null {
  const raw = headers[name]
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0].trim()) return raw[0].trim()
  return null
}

/**
 * Resolve the client IP for rate limiting / geo.
 *
 * Prefer the TCP peer by default. Only trust CF-Connecting-IP / X-Forwarded-For
 * when TRUST_CF_CONNECTING_IP=1 (set in production behind Cloudflare) AND the
 * reverse proxy has already replaced client-supplied values with a trusted
 * peer-derived IP (see deploy/shell.magies.top.conf).
 */
export function resolveClientIp(req: {
  headers: Record<string, string | string[] | undefined>
  socket?: { remoteAddress?: string }
  ip?: string
}): string {
  const trustForwarded = process.env.TRUST_CF_CONNECTING_IP === '1'
  if (trustForwarded) {
    const cf = headerValue(req.headers, 'cf-connecting-ip')
    if (cf) return normalizeIp(cf) || cf

    const realIp = headerValue(req.headers, 'x-real-ip')
    if (realIp) return normalizeIp(realIp) || realIp

    const forwarded = headerValue(req.headers, 'x-forwarded-for')
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim()
      if (first) return normalizeIp(first) || first
    }
  }

  return normalizeIp(req.ip || req.socket?.remoteAddress || '') || '0.0.0.0'
}

export function lookupGeo(ip: string): GeoInfo {
  const cleaned = normalizeIp(ip)
  if (!cleaned || cleaned === '127.0.0.1' || cleaned === '::1' || cleaned.startsWith('10.') || cleaned.startsWith('192.168.')) {
    return { country: 'Local', region: null, city: 'Local', isp: null }
  }

  const hit = geoip.lookup(cleaned)
  if (!hit) {
    return { country: 'Unknown', region: null, city: null, isp: null }
  }

  return {
    country: hit.country || 'Unknown',
    region: hit.region || null,
    city: hit.city || null,
    isp: null,
  }
}

export function maskIp(ip: string | null | undefined): string {
  if (!ip) return '-'
  if (ip.includes(':')) {
    const parts = ip.split(':')
    return `${parts.slice(0, 3).join(':')}:****`
  }
  const parts = ip.split('.')
  if (parts.length !== 4) return ip
  return `${parts[0]}.${parts[1]}.${parts[2]}.*`
}

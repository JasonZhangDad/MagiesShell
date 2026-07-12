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

export function resolveClientIp(req: {
  headers: Record<string, string | string[] | undefined>
  socket?: { remoteAddress?: string }
  ip?: string
}): string {
  const cf = req.headers['cf-connecting-ip']
  if (typeof cf === 'string' && cf.trim()) return normalizeIp(cf) || cf.trim()

  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.trim()) return normalizeIp(realIp) || realIp.trim()

  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return normalizeIp(first) || first
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

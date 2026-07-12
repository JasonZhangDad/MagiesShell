import { UAParser } from 'ua-parser-js'

export type DeviceInfo = {
  deviceType: string
  osName: string | null
  osVersion: string | null
  browser: string | null
}

function isWeakUa(ua: string): boolean {
  const trimmed = ua.trim()
  return !trimmed || trimmed.length < 24 || trimmed === 'Mozilla/5.0' || trimmed.toLowerCase() === 'curl'
}

export function pickBestUa(bodyUa?: string | null, headerUa?: string | null): string {
  const body = typeof bodyUa === 'string' ? bodyUa.trim() : ''
  const header = typeof headerUa === 'string' ? headerUa.trim() : ''
  if (!isWeakUa(body)) return body
  if (!isWeakUa(header)) return header
  return body || header || ''
}

export function parseUa(ua: string | undefined | null): DeviceInfo {
  if (!ua || isWeakUa(ua)) {
    return { deviceType: 'unknown', osName: null, osVersion: null, browser: null }
  }

  const result = new UAParser(ua).getResult()
  const osName = result.os.name || null
  const osVersion = result.os.version || null
  const browser = [result.browser.name, result.browser.version].filter(Boolean).join(' ') || null
  const model = result.device.model || null

  let deviceType = result.device.type || null
  if (!deviceType) {
    if (model && /ipad|tablet/i.test(model)) deviceType = 'tablet'
    else if (model && /iphone|android|mobile/i.test(model)) deviceType = 'mobile'
    else if (osName || browser || model) deviceType = 'desktop'
    else deviceType = 'unknown'
  }

  // Keep a readable label for Apple desktops etc.
  if (deviceType === 'desktop' && model) {
    return {
      deviceType: `${deviceType}/${model}`,
      osName,
      osVersion,
      browser,
    }
  }

  return {
    deviceType,
    osName,
    osVersion,
    browser,
  }
}

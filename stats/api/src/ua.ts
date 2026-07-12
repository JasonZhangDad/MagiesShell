import { UAParser } from 'ua-parser-js'

export type DeviceClass = 'phone' | 'tablet' | 'pc' | 'unknown'

export type DeviceInfo = {
  deviceType: DeviceClass
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

function normalizeOs(name: string | undefined): string | null {
  if (!name) return null
  const n = name.toLowerCase()
  if (n.includes('mac') || n === 'macos' || n === 'mac os') return 'macOS'
  if (n.includes('windows')) return 'Windows'
  if (n.includes('android')) return 'Android'
  if (n === 'ios' || n === 'ipados') return n === 'ipados' ? 'iPadOS' : 'iOS'
  if (n.includes('chrome os') || n === 'chromium os') return 'ChromeOS'
  if (n.includes('ubuntu') || n.includes('debian') || n.includes('fedora') || n.includes('linux') || n.includes('unix')) {
    return 'Linux'
  }
  if (n.includes('harmony')) return 'HarmonyOS'
  return name
}

function normalizeBrowser(name: string | undefined): string | null {
  if (!name) return null
  const n = name.toLowerCase()
  if (n.includes('edg')) return 'Edge'
  if (n.includes('chrome') && !n.includes('chromium')) return 'Chrome'
  if (n.includes('chromium')) return 'Chromium'
  if (n.includes('safari') && !n.includes('chrome')) return 'Safari'
  if (n.includes('firefox')) return 'Firefox'
  if (n.includes('opera')) return 'Opera'
  if (n.includes('samsung')) return 'Samsung Internet'
  if (n.includes('brave')) return 'Brave'
  if (n.includes('vivaldi')) return 'Vivaldi'
  if (n.includes('qq')) return 'QQ Browser'
  if (n.includes('ucbrowser') || n === 'uc') return 'UC Browser'
  if (n.includes('baidu')) return 'Baidu'
  if (n.includes('micromessenger') || n.includes('wechat')) return 'WeChat'
  return name
}

function detectDeviceClass(
  result: {
    device: { type?: string; model?: string }
    os: { name?: string }
    browser: { name?: string }
  },
  ua: string,
): DeviceClass {
  const type = (result.device.type || '').toLowerCase()
  const model = (result.device.model || '').toLowerCase()
  const os = (result.os.name || '').toLowerCase()
  const raw = ua.toLowerCase()

  if (type === 'tablet' || model.includes('ipad') || os.includes('ipados') || raw.includes('ipad')) {
    return 'tablet'
  }
  if (
    type === 'mobile' ||
    model.includes('iphone') ||
    model.includes('android') ||
    os === 'ios' ||
    os.includes('android') ||
    raw.includes('mobile')
  ) {
    return 'phone'
  }
  if (type === 'smarttv' || type === 'wearable' || type === 'console' || type === 'embedded') {
    return 'unknown'
  }
  if (result.os.name || result.browser.name || model.includes('macintosh')) {
    return 'pc'
  }
  return 'unknown'
}

export function parseUa(ua: string | undefined | null): DeviceInfo {
  if (!ua || isWeakUa(ua)) {
    return { deviceType: 'unknown', osName: null, osVersion: null, browser: null }
  }

  const result = new UAParser(ua).getResult()
  const deviceType = detectDeviceClass(result, ua)
  let osName = normalizeOs(result.os.name)
  if (deviceType === 'tablet' && osName === 'iOS') osName = 'iPadOS'

  return {
    deviceType,
    osName,
    osVersion: result.os.version || null,
    browser: normalizeBrowser(result.browser.name),
  }
}

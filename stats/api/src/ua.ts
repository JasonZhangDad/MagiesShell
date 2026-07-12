import { UAParser } from 'ua-parser-js'

export type DeviceInfo = {
  deviceType: string
  osName: string | null
  osVersion: string | null
  browser: string | null
}

export function parseUa(ua: string | undefined | null): DeviceInfo {
  if (!ua) {
    return { deviceType: 'unknown', osName: null, osVersion: null, browser: null }
  }

  const parser = new UAParser(ua)
  const result = parser.getResult()
  const deviceType = result.device.type || (result.os.name ? 'desktop' : 'unknown')

  return {
    deviceType,
    osName: result.os.name || null,
    osVersion: result.os.version || null,
    browser: [result.browser.name, result.browser.version].filter(Boolean).join(' ') || null,
  }
}

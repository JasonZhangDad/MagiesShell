const REPO = 'JasonZhangDad/MgTerminal-releases'
const MIRROR_BASE = 'https://dl.magies.top/stable'
const FALLBACK_VERSION = '0.5.1'
const RELEASE_CACHE_MS = 5 * 60_000

export type DownloadId =
  | 'mac-arm64'
  | 'mac-x64'
  | 'win-x64'
  | 'win-x64-portable'
  | 'win-x64-zip'
  | 'win-arm64'
  | 'win-arm64-portable'
  | 'win-arm64-zip'
  | 'linux-x64'
  | 'linux-arm64'
  | 'linux-x64-deb'
  | 'linux-arm64-deb'

type DownloadSpec = {
  id: DownloadId
  match: RegExp
  fileName: (version: string) => string
}

export const DOWNLOAD_SPECS: DownloadSpec[] = [
  {
    id: 'mac-arm64',
    match: /^MagiesTerminal-[\d.]+-mac-arm64\.dmg$/i,
    fileName: (v) => `MagiesTerminal-${v}-mac-arm64.dmg`,
  },
  {
    id: 'mac-x64',
    match: /^MagiesTerminal-[\d.]+-mac-x64\.dmg$/i,
    fileName: (v) => `MagiesTerminal-${v}-mac-x64.dmg`,
  },
  {
    id: 'win-x64',
    match: /^MagiesTerminal-[\d.]+-win-x64\.exe$/i,
    fileName: (v) => `MagiesTerminal-${v}-win-x64.exe`,
  },
  {
    id: 'win-x64-portable',
    match: /^MagiesTerminal-[\d.]+-portable-win-x64\.exe$/i,
    fileName: (v) => `MagiesTerminal-${v}-portable-win-x64.exe`,
  },
  {
    id: 'win-x64-zip',
    match: /^MagiesTerminal-[\d.]+-win-x64\.zip$/i,
    fileName: (v) => `MagiesTerminal-${v}-win-x64.zip`,
  },
  {
    id: 'win-arm64',
    match: /^MagiesTerminal-[\d.]+-win-arm64\.exe$/i,
    fileName: (v) => `MagiesTerminal-${v}-win-arm64.exe`,
  },
  {
    id: 'win-arm64-portable',
    match: /^MagiesTerminal-[\d.]+-portable-win-arm64\.exe$/i,
    fileName: (v) => `MagiesTerminal-${v}-portable-win-arm64.exe`,
  },
  {
    id: 'win-arm64-zip',
    match: /^MagiesTerminal-[\d.]+-win-arm64\.zip$/i,
    fileName: (v) => `MagiesTerminal-${v}-win-arm64.zip`,
  },
  {
    id: 'linux-x64',
    match: /^MagiesTerminal-[\d.]+-linux-x86_64\.AppImage$/i,
    fileName: (v) => `MagiesTerminal-${v}-linux-x86_64.AppImage`,
  },
  {
    id: 'linux-arm64',
    match: /^MagiesTerminal-[\d.]+-linux-arm64\.AppImage$/i,
    fileName: (v) => `MagiesTerminal-${v}-linux-arm64.AppImage`,
  },
  {
    id: 'linux-x64-deb',
    match: /^MagiesTerminal-[\d.]+-linux-amd64\.deb$/i,
    fileName: (v) => `MagiesTerminal-${v}-linux-amd64.deb`,
  },
  {
    id: 'linux-arm64-deb',
    match: /^MagiesTerminal-[\d.]+-linux-arm64\.deb$/i,
    fileName: (v) => `MagiesTerminal-${v}-linux-arm64.deb`,
  },
]

type ReleaseAsset = { name: string; browser_download_url: string }
type ReleaseInfo = { tag: string; version: string; assets: ReleaseAsset[] }

let releaseCache: { fetchedAt: number; release: ReleaseInfo } | null = null

export function isDownloadId(value: string): value is DownloadId {
  return DOWNLOAD_SPECS.some((spec) => spec.id === value)
}

export function getDownloadSpec(id: string): DownloadSpec | null {
  return DOWNLOAD_SPECS.find((spec) => spec.id === id) ?? null
}

/** Mainland China → R2 mirror; everyone else → GitHub CDN (free egress). */
export function preferMirrorForRequest(input: {
  country: string | null
  acceptLanguage: string | null
}): boolean {
  if (input.country === 'CN') return true
  const primary = input.acceptLanguage?.split(',')[0]?.trim() || ''
  return /^zh-CN\b/i.test(primary)
}

export function buildMirrorUrl(fileName: string): string {
  return `${MIRROR_BASE}/${fileName}`
}

export function buildGithubUrl(tag: string, fileName: string): string {
  return `https://github.com/${REPO}/releases/download/${tag}/${fileName}`
}

export function pickTargetUrl(input: {
  preferMirror: boolean
  tag: string
  fileName: string
}): string {
  if (input.preferMirror) return buildMirrorUrl(input.fileName)
  return buildGithubUrl(input.tag, input.fileName)
}

/** Only allow redirects to our mirror or GitHub release assets. */
export function isSafeDownloadTarget(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    if (parsed.hostname === 'dl.magies.top') {
      return parsed.pathname.startsWith('/stable/')
    }
    if (parsed.hostname === 'github.com') {
      return new RegExp(`^/${REPO}/releases/download/`, 'i').test(parsed.pathname)
    }
    return false
  } catch {
    return false
  }
}

function sanitizeReleaseTag(tag: string): string | null {
  const trimmed = tag.trim()
  if (!/^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/i.test(trimmed)) return null
  return trimmed
}

function normalizeVersion(tag: string): string {
  return tag.replace(/^v/i, '')
}

async function fetchJson(url: string, headers?: Record<string, string>): Promise<unknown> {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(6000),
  })
  if (!response.ok) throw new Error(`${url} ${response.status}`)
  return response.json()
}

async function fetchReleaseFromGithub(): Promise<ReleaseInfo> {
  const data = (await fetchJson(`https://api.github.com/repos/${REPO}/releases/latest`, {
    Accept: 'application/vnd.github+json',
  })) as {
    tag_name?: string
    assets?: Array<{ name?: string; browser_download_url?: string }>
  }
  const tag = sanitizeReleaseTag(data.tag_name || '')
  if (!tag) throw new Error('Missing or invalid tag_name')
  return {
    tag,
    version: normalizeVersion(tag),
    assets: (Array.isArray(data.assets) ? data.assets : [])
      .filter((asset): asset is { name: string; browser_download_url: string } =>
        Boolean(asset?.name && asset?.browser_download_url),
      )
      .map((asset) => ({
        name: asset.name,
        browser_download_url: asset.browser_download_url,
      })),
  }
}

async function fetchReleaseFromMirror(): Promise<ReleaseInfo> {
  const data = (await fetchJson(`${MIRROR_BASE}/release.json`)) as {
    tag?: string
    files?: Array<{ name: string; url: string }>
  }
  const tag = sanitizeReleaseTag(data.tag || '')
  if (!tag) throw new Error('Missing or invalid tag in mirror manifest')
  return {
    tag,
    version: normalizeVersion(tag),
    assets: (data.files || []).map((file) => ({
      name: file.name,
      browser_download_url: file.url,
    })),
  }
}

async function loadRelease(): Promise<ReleaseInfo> {
  const now = Date.now()
  if (releaseCache && now - releaseCache.fetchedAt < RELEASE_CACHE_MS) {
    return releaseCache.release
  }

  const sources = [fetchReleaseFromGithub, fetchReleaseFromMirror]
  let lastError: unknown
  for (const source of sources) {
    try {
      const release = await source()
      releaseCache = { fetchedAt: now, release }
      return release
    } catch (error) {
      lastError = error
    }
  }

  if (releaseCache) return releaseCache.release

  const fallback: ReleaseInfo = {
    tag: `v${FALLBACK_VERSION}`,
    version: FALLBACK_VERSION,
    assets: [],
  }
  if (lastError) {
    console.warn('download release lookup failed; using fallback version', lastError)
  }
  releaseCache = { fetchedAt: now, release: fallback }
  return fallback
}

/** Resolve the final CDN URL for a download id (GitHub overseas, R2 for CN). */
export async function resolveDownloadRedirect(input: {
  id: string
  country: string | null
  acceptLanguage: string | null
}): Promise<string | null> {
  const spec = getDownloadSpec(input.id)
  if (!spec) return null

  const release = await loadRelease()
  const asset = release.assets.find((entry) => spec.match.test(entry.name))
  const fileName = asset?.name || spec.fileName(release.version)
  const target = pickTargetUrl({
    preferMirror: preferMirrorForRequest({
      country: input.country,
      acceptLanguage: input.acceptLanguage,
    }),
    tag: release.tag,
    fileName,
  })

  return isSafeDownloadTarget(target) ? target : null
}

/** Test helper — clear in-memory release cache. */
export function clearReleaseCacheForTests(): void {
  releaseCache = null
}

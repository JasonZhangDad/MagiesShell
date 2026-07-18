import './style.css'
import {
  type Lang,
  LANGS,
  copy,
  detectLangFromNavigator,
  isLang,
  langMeta,
} from './i18n'

type OsId = 'mac' | 'win' | 'linux'

type DownloadItem = {
  id: string
  os: OsId
  match: RegExp
}

type OsOption = {
  id: OsId
  label: string
}

type ReleaseAsset = {
  name: string
  browser_download_url: string
  size?: number
}

type ReleaseInfo = {
  version: string
  tag: string
  assets: ReleaseAsset[]
}

const REPO = 'JasonZhangDad/MgTerminal-releases'
const SITE_URL = 'https://shell.magies.top'
const FALLBACK_VERSION = '0.5.1'
/**
 * Same-origin changelog snapshots only — never opens a public repo page.
 * Content follows the active UI language (see changelogCandidates).
 * - zh → /changelog.md
 * - en (+ other locales without a dedicated file) → /changelog.en.md
 * - optional per-locale files: /changelog.{lang}.md (e.g. ja, zh-TW)
 */
const CHANGELOG_LOCAL_ZH = '/changelog.md'
const CHANGELOG_LOCAL_EN = '/changelog.en.md'
/** Same support address as the desktop app “问题咨询” entry. */
const SUPPORT_EMAIL = 'hibake888@outlook.com'
// R2 mirror for mainland-China downloads (and metadata when GitHub is blocked).
// Public download buttons never point here or at github.com directly — they use
// /stats-api/download/:id which 302s to GitHub (overseas, free CDN) or this
// mirror (CN). Origin only serves a tiny redirect; file bytes stay off the VPS.
const MIRROR_BASE = 'https://dl.magies.top/stable'
/** Same-origin opaque download hop (proxied to stats API). */
const DOWNLOAD_REDIRECT_BASE = '/stats-api/download'
const CN_TIMEZONES = ['Asia/Shanghai', 'Asia/Urumqi', 'Asia/Chongqing', 'Asia/Harbin']

function preferMirror(): boolean {
  try {
    if (/^zh-CN/i.test(navigator.language)) return true
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return CN_TIMEZONES.includes(timeZone)
  } catch {
    return false
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Reject non-release tags so GitHub API content cannot inject markup. */
function sanitizeReleaseTag(tag: string): string | null {
  const trimmed = tag.trim()
  if (!/^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/i.test(trimmed)) return null
  return trimmed
}
const TRACK_API = 'https://shell.magies.top/stats-api/track'
const SESSION_KEY = 'magies-shell-session-id'

const OS_OPTIONS: OsOption[] = [
  { id: 'mac', label: 'macOS' },
  { id: 'win', label: 'Windows' },
  { id: 'linux', label: 'Linux' },
]

/** Per-UI-language OS picker hints (not zh/en only). */
const OS_HINTS: Record<OsId, Record<Lang, string>> = {
  mac: {
    zh: 'Apple Silicon / Intel',
    'zh-TW': 'Apple Silicon / Intel',
    en: 'Apple Silicon / Intel',
    ja: 'Apple Silicon / Intel',
    ko: 'Apple Silicon / Intel',
    de: 'Apple Silicon / Intel',
    fr: 'Apple Silicon / Intel',
    es: 'Apple Silicon / Intel',
    pt: 'Apple Silicon / Intel',
    ru: 'Apple Silicon / Intel',
  },
  win: {
    zh: 'x64 / ARM64 · 安装版 / 便携版 / ZIP',
    'zh-TW': 'x64 / ARM64 · 安裝版 / 可攜版 / ZIP',
    en: 'x64 / ARM64 · Installer / Portable / ZIP',
    ja: 'x64 / ARM64 · インストーラー / ポータブル / ZIP',
    ko: 'x64 / ARM64 · 설치 파일 / 포터블 / ZIP',
    de: 'x64 / ARM64 · Installer / Portable / ZIP',
    fr: 'x64 / ARM64 · Installateur / Portable / ZIP',
    es: 'x64 / ARM64 · Instalador / Portable / ZIP',
    pt: 'x64 / ARM64 · Instalador / Portátil / ZIP',
    ru: 'x64 / ARM64 · Установщик / Portable / ZIP',
  },
  linux: {
    zh: 'AppImage / deb · x64 / ARM64',
    'zh-TW': 'AppImage / deb · x64 / ARM64',
    en: 'AppImage / deb · x64 / ARM64',
    ja: 'AppImage / deb · x64 / ARM64',
    ko: 'AppImage / deb · x64 / ARM64',
    de: 'AppImage / deb · x64 / ARM64',
    fr: 'AppImage / deb · x64 / ARM64',
    es: 'AppImage / deb · x64 / ARM64',
    pt: 'AppImage / deb · x64 / ARM64',
    ru: 'AppImage / deb · x64 / ARM64',
  },
}

/** Per-UI-language download package labels. */
const DOWNLOAD_DETAILS: Record<string, Record<Lang, string>> = {
  'mac-arm64': {
    zh: 'Apple Silicon · DMG',
    'zh-TW': 'Apple Silicon · DMG',
    en: 'Apple Silicon · DMG',
    ja: 'Apple Silicon · DMG',
    ko: 'Apple Silicon · DMG',
    de: 'Apple Silicon · DMG',
    fr: 'Apple Silicon · DMG',
    es: 'Apple Silicon · DMG',
    pt: 'Apple Silicon · DMG',
    ru: 'Apple Silicon · DMG',
  },
  'mac-x64': {
    zh: 'Intel · DMG',
    'zh-TW': 'Intel · DMG',
    en: 'Intel · DMG',
    ja: 'Intel · DMG',
    ko: 'Intel · DMG',
    de: 'Intel · DMG',
    fr: 'Intel · DMG',
    es: 'Intel · DMG',
    pt: 'Intel · DMG',
    ru: 'Intel · DMG',
  },
  'win-x64': {
    zh: 'x64 · 安装版',
    'zh-TW': 'x64 · 安裝版',
    en: 'x64 · Installer',
    ja: 'x64 · インストーラー',
    ko: 'x64 · 설치 파일',
    de: 'x64 · Installer',
    fr: 'x64 · Installateur',
    es: 'x64 · Instalador',
    pt: 'x64 · Instalador',
    ru: 'x64 · Установщик',
  },
  'win-x64-portable': {
    zh: 'x64 · 便携版',
    'zh-TW': 'x64 · 可攜版',
    en: 'x64 · Portable',
    ja: 'x64 · ポータブル',
    ko: 'x64 · 포터블',
    de: 'x64 · Portable',
    fr: 'x64 · Portable',
    es: 'x64 · Portable',
    pt: 'x64 · Portátil',
    ru: 'x64 · Portable',
  },
  'win-x64-zip': {
    zh: 'x64 · ZIP 压缩包',
    'zh-TW': 'x64 · ZIP 壓縮包',
    en: 'x64 · ZIP archive',
    ja: 'x64 · ZIP アーカイブ',
    ko: 'x64 · ZIP 아카이브',
    de: 'x64 · ZIP-Archiv',
    fr: 'x64 · Archive ZIP',
    es: 'x64 · Archivo ZIP',
    pt: 'x64 · Arquivo ZIP',
    ru: 'x64 · ZIP-архив',
  },
  'win-arm64': {
    zh: 'ARM64 · 安装版',
    'zh-TW': 'ARM64 · 安裝版',
    en: 'ARM64 · Installer',
    ja: 'ARM64 · インストーラー',
    ko: 'ARM64 · 설치 파일',
    de: 'ARM64 · Installer',
    fr: 'ARM64 · Installateur',
    es: 'ARM64 · Instalador',
    pt: 'ARM64 · Instalador',
    ru: 'ARM64 · Установщик',
  },
  'win-arm64-portable': {
    zh: 'ARM64 · 便携版',
    'zh-TW': 'ARM64 · 可攜版',
    en: 'ARM64 · Portable',
    ja: 'ARM64 · ポータブル',
    ko: 'ARM64 · 포터블',
    de: 'ARM64 · Portable',
    fr: 'ARM64 · Portable',
    es: 'ARM64 · Portable',
    pt: 'ARM64 · Portátil',
    ru: 'ARM64 · Portable',
  },
  'win-arm64-zip': {
    zh: 'ARM64 · ZIP 压缩包',
    'zh-TW': 'ARM64 · ZIP 壓縮包',
    en: 'ARM64 · ZIP archive',
    ja: 'ARM64 · ZIP アーカイブ',
    ko: 'ARM64 · ZIP 아카이브',
    de: 'ARM64 · ZIP-Archiv',
    fr: 'ARM64 · Archive ZIP',
    es: 'ARM64 · Archivo ZIP',
    pt: 'ARM64 · Arquivo ZIP',
    ru: 'ARM64 · ZIP-архив',
  },
  'linux-x64': {
    zh: 'x64 · AppImage',
    'zh-TW': 'x64 · AppImage',
    en: 'x64 · AppImage',
    ja: 'x64 · AppImage',
    ko: 'x64 · AppImage',
    de: 'x64 · AppImage',
    fr: 'x64 · AppImage',
    es: 'x64 · AppImage',
    pt: 'x64 · AppImage',
    ru: 'x64 · AppImage',
  },
  'linux-arm64': {
    zh: 'ARM64 · AppImage',
    'zh-TW': 'ARM64 · AppImage',
    en: 'ARM64 · AppImage',
    ja: 'ARM64 · AppImage',
    ko: 'ARM64 · AppImage',
    de: 'ARM64 · AppImage',
    fr: 'ARM64 · AppImage',
    es: 'ARM64 · AppImage',
    pt: 'ARM64 · AppImage',
    ru: 'ARM64 · AppImage',
  },
  'linux-x64-deb': {
    zh: 'x64 · deb',
    'zh-TW': 'x64 · deb',
    en: 'x64 · deb',
    ja: 'x64 · deb',
    ko: 'x64 · deb',
    de: 'x64 · deb',
    fr: 'x64 · deb',
    es: 'x64 · deb',
    pt: 'x64 · deb',
    ru: 'x64 · deb',
  },
  'linux-arm64-deb': {
    zh: 'ARM64 · deb',
    'zh-TW': 'ARM64 · deb',
    en: 'ARM64 · deb',
    ja: 'ARM64 · deb',
    ko: 'ARM64 · deb',
    de: 'ARM64 · deb',
    fr: 'ARM64 · deb',
    es: 'ARM64 · deb',
    pt: 'ARM64 · deb',
    ru: 'ARM64 · deb',
  },
}

const DOWNLOADS: DownloadItem[] = [
  { id: 'mac-arm64', os: 'mac', match: /^MagiesTerminal-[\d.]+-mac-arm64\.dmg$/i },
  { id: 'mac-x64', os: 'mac', match: /^MagiesTerminal-[\d.]+-mac-x64\.dmg$/i },
  { id: 'win-x64', os: 'win', match: /^MagiesTerminal-[\d.]+-win-x64\.exe$/i },
  { id: 'win-x64-portable', os: 'win', match: /^MagiesTerminal-[\d.]+-portable-win-x64\.exe$/i },
  { id: 'win-x64-zip', os: 'win', match: /^MagiesTerminal-[\d.]+-win-x64\.zip$/i },
  { id: 'win-arm64', os: 'win', match: /^MagiesTerminal-[\d.]+-win-arm64\.exe$/i },
  { id: 'win-arm64-portable', os: 'win', match: /^MagiesTerminal-[\d.]+-portable-win-arm64\.exe$/i },
  { id: 'win-arm64-zip', os: 'win', match: /^MagiesTerminal-[\d.]+-win-arm64\.zip$/i },
  { id: 'linux-x64', os: 'linux', match: /^MagiesTerminal-[\d.]+-linux-x86_64\.AppImage$/i },
  { id: 'linux-arm64', os: 'linux', match: /^MagiesTerminal-[\d.]+-linux-arm64\.AppImage$/i },
  { id: 'linux-x64-deb', os: 'linux', match: /^MagiesTerminal-[\d.]+-linux-amd64\.deb$/i },
  { id: 'linux-arm64-deb', os: 'linux', match: /^MagiesTerminal-[\d.]+-linux-arm64\.deb$/i },
]

function localizedDownloadDetail(id: string, lang: Lang): string {
  const map = DOWNLOAD_DETAILS[id]
  if (!map) return id
  return map[lang] ?? map.en
}

function localizedOsHint(os: OsId, lang: Lang): string {
  return OS_HINTS[os][lang] ?? OS_HINTS[os].en
}


const OS_ICONS: Record<OsId, string> = {
  mac: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.7 12.6c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.7 1.1 8.9.8 1.1 1.7 2.3 2.9 2.2 1.2-.1 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.4-.9-2.4-3.5zm-2.2-6.4c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.9-.9 3 1 .1 2-.5 2.6-1.4z"/></svg>`,
  win: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5.2 10.2 4.2v7.1H3V5.2zm0 13.6v-7.1h7.2v8.1L3 18.8zM11.3 4l9.7-1.4v8.7h-9.7V4zm0 16.4V12.3h9.7v8.7L11.3 20.4z"/></svg>`,
  linux: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.1 2.1c-.7 0-1.4.5-1.7 1.3-.2.5-.1 1.2.2 2.1-.8.3-1.4.9-1.7 1.7-.5 1.3-.1 2.8.9 3.7l-.4 1.2c-.8.3-1.7.9-2.1 1.8-.6 1.3-.2 2.9.9 3.7.3.2.6.4 1 .5-.1.6-.1 1.3.1 2 .4 1.4 1.4 2.5 2.7 2.9.4.1.8.2 1.2.2.5 0 1-.1 1.5-.3.5.5 1.2.8 1.9.8.3 0 .6-.1.9-.2 1.4-.5 2.3-1.8 2.3-3.3 0-.4-.1-.8-.2-1.1.7-.4 1.2-1.1 1.4-1.9.3-1.1 0-2.3-.8-3.1.5-.8.6-1.8.3-2.7-.3-1-.9-1.7-1.8-2.1.1-.5.1-1 0-1.5-.3-1.2-1.2-2.1-2.3-2.3-.2-1-.8-1.8-1.7-2.1-.3-.1-.6-.2-.9-.2zm0 1.5c.3 0 .6.1.8.3.3.3.5.7.5 1.2v.3l-.2.1c-.5.2-1 .6-1.2 1.1l-.1.3-.3-.1c-.3-.1-.5-.4-.5-.8 0-.4.2-.8.5-1 .2-.3.4-.4.5-.4zm2.1 1.1c.4.1.7.5.8 1 0 .3-.1.6-.2.8l-.2.3-.3-.2c-.4-.3-.7-.7-.8-1.2l-.1-.3.3-.1c.1-.2.3-.3.5-.3zm-4.3 2.2c.3 0 .5.1.7.3.5.4.7 1.1.5 1.7-.1.4-.4.7-.7.9l-.3.1-.2-.3c-.3-.5-.3-1.1 0-1.6.1-.3.4-.6.7-.7.1 0 .2-.1.3-.1.1 0 .1 0 .2 0zm4.4.3c.3-.1.7 0 1 .2.5.4.7 1.1.5 1.7-.1.3-.3.6-.6.8l-.3.1-.2-.2c-.4-.5-.4-1.2 0-1.7.1-.2.3-.4.5-.5.1 0 .1-.1.2-.1.1 0 .1 0 .1 0zm-2.2 1.5c.6 0 1.1.2 1.5.5.7.6 1 1.5.8 2.4-.1.5-.4.9-.8 1.2l-.2.1v.4c0 .6-.2 1.1-.5 1.5-.4.5-.9.8-1.5.8-.4 0-.8-.1-1.1-.4-.5-.4-.8-1-.8-1.7v-.5l-.3-.2c-.5-.3-.9-.8-1-1.4-.2-.8.1-1.6.7-2.1.5-.4 1.1-.6 1.7-.6zm0 1.4c-.3 0-.6.1-.8.3-.3.3-.5.7-.4 1.1 0 .3.2.6.5.8l.4.2.1.4c0 .3.1.5.3.7.1.1.3.2.5.2.3 0 .5-.1.7-.4.2-.2.3-.5.3-.8v-.5l.3-.2c.2-.1.4-.4.4-.6.1-.4-.1-.8-.4-1-.3-.2-.6-.3-.9-.3z"/></svg>`,
}

let selectedOs: OsId | null = null
let releaseInfo: ReleaseInfo | null = null
let releaseLoading = true
let currentLang: Lang = 'en'

function normalizeVersion(tag: string): string {
  return tag.replace(/^v/i, '')
}

function findAsset(item: DownloadItem): ReleaseAsset | undefined {
  return releaseInfo?.assets.find((asset) => item.match.test(asset.name))
}

/**
 * Landing-page href only — never github.com or the raw mirror URL.
 * Stats API 302s to GitHub (overseas) or R2 (CN) so file traffic leaves our VPS.
 */
function downloadUrl(item: DownloadItem): string | null {
  if (findAsset(item) || !releaseLoading) {
    return `${DOWNLOAD_REDIRECT_BASE}/${item.id}`
  }
  return null
}

function displayVersion(): string {
  if (releaseLoading && !releaseInfo) return '…'
  return escapeHtml(releaseInfo?.version ?? FALLBACK_VERSION)
}

function formatFileSize(bytes: number | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return ''
  const mb = bytes / (1024 * 1024)
  if (mb >= 100) return `${Math.round(mb)} MB`
  if (mb >= 10) return `${mb.toFixed(0)} MB`
  return `${mb.toFixed(1)} MB`
}

function assetSizeLabel(item: DownloadItem): string {
  return formatFileSize(findAsset(item)?.size)
}

function detectOs(): OsId {
  const ua = navigator.userAgent
  const platform = navigator.platform || ''
  if (/Mac|iPhone|iPad|iPod/i.test(ua) || /Mac/i.test(platform)) return 'mac'
  if (/Win/i.test(ua) || /Win/i.test(platform)) return 'win'
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'linux'
  return 'mac'
}

function detectRecommendedId(os: OsId): string {
  const ua = navigator.userAgent
  const platform = navigator.platform || ''
  const isArm = /arm|aarch64/i.test(`${ua} ${platform}`)
  if (os === 'mac') return 'mac-arm64'
  if (os === 'win') return isArm ? 'win-arm64' : 'win-x64'
  return isArm ? 'linux-arm64' : 'linux-x64'
}

function renderOsPicker(lang: Lang): string {
  const detected = detectOs()
  return OS_OPTIONS.map((os) => {
    const label = os.label
    const hint = localizedOsHint(os.id, lang)
    const recommended = os.id === detected
    return `
      <button
        type="button"
        class="os-card${recommended ? ' is-recommended' : ''}"
        data-select-os="${os.id}"
      >
        <span class="download-icon">${OS_ICONS[os.id]}</span>
        <span class="download-meta">
          <span class="download-os">${label}</span>
          <span class="download-detail">${hint}</span>
        </span>
        ${recommended ? `<span class="download-badge">${copy[lang].recommended}</span>` : ''}
      </button>`
  }).join('')
}

function renderUnsignedNotice(lang: Lang, os: OsId): string {
  if (os !== 'mac' && os !== 'win') return ''
  const t = copy[lang]
  const notice = os === 'mac' ? t.unsignedMac : t.unsignedWin

  if (os === 'mac' && 'command' in notice) {
    return `
    <aside class="unsigned-notice" data-reveal>
      <p class="unsigned-title">${t.unsignedTitle}</p>
      <p class="unsigned-lead">${notice.lead}</p>
      <div class="unsigned-command-row">
        <pre class="unsigned-command"><code data-install-command>${notice.command}</code></pre>
        <button type="button" class="btn btn-ghost unsigned-copy" data-copy-install-command>${notice.copyLabel}</button>
      </div>
    </aside>`
  }

  if (!('steps' in notice)) return ''

  return `
    <aside class="unsigned-notice" data-reveal>
      <p class="unsigned-title">${t.unsignedTitle}</p>
      <p class="unsigned-lead">${notice.lead}</p>
      <ol class="unsigned-steps">
        ${notice.steps.map((step) => `<li>${step}</li>`).join('')}
      </ol>
    </aside>`
}

function renderVersionList(lang: Lang, os: OsId): string {
  const t = copy[lang]
  const recommendedId = detectRecommendedId(os)
  const osLabel = OS_OPTIONS.find((item) => item.id === os)
  const title = osLabel?.label
  const version = displayVersion()

  return `
    <div class="version-panel" data-reveal>
      <div class="version-panel-head">
        <div class="version-panel-title">
          <span class="download-icon">${OS_ICONS[os]}</span>
          <div>
            <p class="version-kicker">${t.pickVersion}</p>
            <h3>${title}</h3>
          </div>
        </div>
        <button type="button" class="btn btn-ghost version-back" data-change-os>${t.changeOs}</button>
      </div>
      <div class="version-grid">
        ${DOWNLOADS.filter((item) => item.os === os)
          .map((item) => {
            const detail = localizedDownloadDetail(item.id, lang)
            const recommended = item.id === recommendedId
            const href = downloadUrl(item)
            const disabled = !href
            const tag = disabled
              ? 'span'
              : 'a'
            const attrs = disabled
              ? `class="download-card is-disabled${recommended ? ' is-recommended' : ''}" aria-disabled="true"`
              : `class="download-card${recommended ? ' is-recommended' : ''}" href="${href}" download data-track-download="${item.id}" data-download-file="${item.id}"`

            const sizeLabel = assetSizeLabel(item)
            const detailLine = disabled
              ? t.unavailable
              : sizeLabel
                ? `v${version} · ${sizeLabel}`
                : `v${version}`

            return `
              <${tag} ${attrs}>
                <span class="download-meta">
                  <span class="download-os">${detail}</span>
                  <span class="download-detail">${detailLine}</span>
                </span>
                ${recommended ? `<span class="download-badge">${t.recommended}</span>` : ''}
              </${tag}>`
          })
          .join('')}
      </div>
      ${os === 'mac' ? `<p class="download-arch-hint">${t.macIntelHint}</p>` : ''}
      ${renderUnsignedNotice(lang, os)}
    </div>`
}

function renderCnSpeedHint(lang: Lang): string {
  // Only mainland-China visitors download through the mirror, whose
  // single-thread speed is limited; a multi-threaded downloader helps a lot
  // (the mirror supports Range requests for exactly this).
  if (!preferMirror()) return ''
  return `<p class="download-cn-hint">${copy[lang].cnSpeedHint}</p>`
}

function renderDownloadSection(lang: Lang): string {
  const t = copy[lang]
  if (!selectedOs) {
    return `
      <p class="download-step">${t.selectOs}</p>
      <div class="os-grid" data-reveal>
        ${renderOsPicker(lang)}
      </div>`
  }
  return renderVersionList(lang, selectedOs) + renderCnSpeedHint(lang)
}

function renderDownloadLead(lang: Lang): string {
  const t = copy[lang]
  if (releaseLoading && !releaseInfo) return t.downloadLeadLoading
  return t.downloadLead(displayVersion())
}

function render(lang: Lang): string {
  const t = copy[lang]
  return `
    <a class="skip-link" href="#main">${t.skipToContent}</a>
    <header class="site-header" data-header>
      <a class="brand-mark" href="#top" aria-label="MagiesTerminal">
        <img src="/icon.png" alt="MagiesTerminal" width="28" height="28" />
        <span>MagiesTerminal</span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        <a href="#why">${t.navWhy}</a>
        <a href="#features">${t.navFeatures}</a>
        <a href="#platform">${t.navPlatform}</a>
        <a href="#agent">${t.navAgent}</a>
        <a href="#download">${t.navDownload}</a>
      </nav>
      <div class="nav-actions">
        <label class="lang-select-wrap">
          <span class="visually-hidden">${t.langAria}</span>
          <select class="lang-select" data-lang-select aria-label="${t.langAria}">
            ${LANGS.map(
              (item) =>
                `<option value="${item.id}"${item.id === lang ? ' selected' : ''}>${item.label}</option>`,
            ).join('')}
          </select>
        </label>
      </div>
    </header>

    <main id="main">
      <section class="hero" id="top" aria-label="MagiesTerminal">
        <div class="hero-copy">
          <h1 class="brand-hero">MagiesTerminal<span class="cursor-blink" aria-hidden="true"></span></h1>
          <p class="hero-headline">${t.headline}</p>
          <p class="hero-sub">${t.sub}</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="#download">${t.ctaDownload}</a>
          </div>
          <ul class="trust-row" data-reveal>
            ${t.trustItems.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="hero-stage" aria-hidden="true">
          <img
            src="/screenshots/hero-workspace-v2.webp"
            alt=""
            width="1360"
            height="752"
            fetchpriority="high"
            decoding="async"
          />
        </div>
      </section>

      <section class="section gallery" id="gallery" aria-label="MagiesTerminal gallery">
        <div class="gallery-grid">
          <figure class="gallery-card" data-reveal>
            <img src="/screenshots/gallery-1-v4.webp" alt="${t.galleryAlt1}" width="1200" height="900" loading="lazy" decoding="async" />
          </figure>
          <figure class="gallery-card" data-reveal>
            <img src="/screenshots/gallery-2-v4.webp" alt="${t.galleryAlt2}" width="1200" height="900" loading="lazy" decoding="async" />
          </figure>
          <figure class="gallery-card" data-reveal>
            <img src="/screenshots/gallery-3-v4.webp" alt="${t.galleryAlt3}" width="1200" height="900" loading="lazy" decoding="async" />
          </figure>
          <figure class="gallery-card" data-reveal>
            <img src="/screenshots/gallery-4-v4.webp" alt="${t.galleryAlt4}" width="1200" height="900" loading="lazy" decoding="async" />
          </figure>
        </div>
      </section>

      <section class="section why" id="why">
        <p class="section-label">${t.whyLabel}</p>
        <h2 class="section-title">${t.whyTitle}</h2>
        <p class="section-lead">${t.whyLead}</p>
        <div class="why-grid">
          ${t.whyItems
            .map(
              (item) => `
            <article class="why-card" data-reveal>
              <h3>${item.title}</h3>
              <p>${item.body}</p>
            </article>`,
            )
            .join('')}
        </div>
      </section>

      <section class="section" id="features">
        <p class="section-label">${t.featuresLabel}</p>
        <h2 class="section-title">${t.featuresTitle}</h2>
        <p class="section-lead">${t.featuresLead}</p>
        <div class="feature-rail">
          ${t.features
            .map(
              (item) => `
            <article class="feature-item" data-reveal>
              <h3>${item.title}</h3>
              <p>${item.body}</p>
            </article>`,
            )
            .join('')}
        </div>
      </section>

      <section class="section platform" id="platform">
        <p class="section-label">${t.platformLabel}</p>
        <h2 class="section-title">${t.platformTitle}</h2>
        <p class="section-lead">${t.platformLead}</p>
        <div class="platform-grid">
          ${t.platformItems
            .map(
              (item) => `
            <article class="platform-card" data-reveal>
              <h3>${item.title}</h3>
              <p>${item.body}</p>
            </article>`,
            )
            .join('')}
        </div>
      </section>

      <section class="section agent" id="agent">
        <p class="section-label">${t.agentLabel}</p>
        <h2 class="section-title">${t.agentTitle}</h2>
        <p class="section-lead">${t.agentLead}</p>
        <ul class="agent-points">
          ${t.agentPoints
            .map(
              (item) => `
            <li data-reveal>
              <strong>${item.title}</strong>
              <span>${item.body}</span>
            </li>`,
            )
            .join('')}
        </ul>
        <figure class="shot-frame" data-reveal>
          <img
            src="/screenshots/agent-live-v1.webp"
            alt="${t.agentShotAlt}"
            width="1600"
            height="916"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </section>

      <section class="section download" id="download">
        <p class="section-label">${t.downloadLabel}</p>
        <h2 class="section-title">${t.downloadTitle}</h2>
        <p class="section-lead" data-download-lead>${renderDownloadLead(lang)}</p>
        <div class="download-flow" data-download-root>
          ${renderDownloadSection(lang)}
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <span>${t.footerNote}</span>
        <nav class="footer-links" aria-label="Footer">
          <button type="button" class="footer-link-btn" data-open-changelog>${t.releasesLabel}</button>
          <button type="button" class="footer-link-btn" data-open-contact>${t.contactLabel}</button>
          <a class="footer-link-btn" href="/privacy.html?lang=${lang}">${t.legalPrivacy}</a>
          <a class="footer-link-btn" href="/terms.html?lang=${lang}">${t.legalTerms}</a>
        </nav>
        <span class="footer-copyright">${t.footerCopyright}</span>
      </div>
    </footer>

    <div class="changelog-modal" data-changelog-modal hidden>
      <div class="changelog-backdrop" data-close-changelog tabindex="-1"></div>
      <div
        class="changelog-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="changelog-title"
      >
        <header class="changelog-header">
          <h2 id="changelog-title">${t.releasesLabel}</h2>
          <button type="button" class="changelog-close" data-close-changelog aria-label="${t.changelogClose}">
            ×
          </button>
        </header>
        <div class="changelog-body" data-changelog-body>
          <p class="changelog-status">${t.changelogLoading}</p>
        </div>
      </div>
    </div>

    <div class="changelog-modal contact-modal" data-contact-modal hidden>
      <div class="changelog-backdrop" data-close-contact tabindex="-1"></div>
      <div
        class="changelog-dialog contact-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
      >
        <header class="changelog-header">
          <h2 id="contact-title">${t.contactTitle}</h2>
          <button type="button" class="changelog-close" data-close-contact aria-label="${t.changelogClose}">
            ×
          </button>
        </header>
        <div class="contact-body">
          <p class="contact-lead">${t.contactLead}</p>
          <div class="contact-email-row">
            <a class="contact-email" href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
            <button type="button" class="btn btn-primary contact-copy" data-copy-contact-email>
              ${t.contactCopy}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function applyMeta(lang: Lang): void {
  const t = copy[lang]
  const meta = langMeta(lang)
  const htmlLang = meta.htmlLang
  const ogLocale = meta.ogLocale
  const ogImage = `${SITE_URL}/screenshots/hero-workspace-v2.webp`
  const alternateLocales = LANGS.filter((l) => l.id !== lang).map((l) => l.ogLocale)

  document.documentElement.lang = htmlLang
  document.title = t.metaTitle
  upsertMeta('name', 'description', t.metaDesc)
  upsertMeta('name', 'theme-color', '#071018')
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', 'MagiesTerminal')
  upsertMeta('property', 'og:url', `${SITE_URL}/`)
  upsertMeta('property', 'og:title', t.metaTitle)
  upsertMeta('property', 'og:description', t.metaDesc)
  upsertMeta('property', 'og:image', ogImage)
  upsertMeta('property', 'og:locale', ogLocale)
  // Keep one alternate tag updated; full set is in hreflang links below.
  if (alternateLocales[0]) {
    upsertMeta('property', 'og:locale:alternate', alternateLocales[0])
  }
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', t.metaTitle)
  upsertMeta('name', 'twitter:description', t.metaDesc)
  upsertMeta('name', 'twitter:image', ogImage)

  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', `${SITE_URL}/`)

  // Single-page site: all hreflang variants share the same URL (language is client-side).
  const hreflangs = [
    ...LANGS.map((l) => ({ hreflang: l.htmlLang, href: `${SITE_URL}/` })),
    { hreflang: 'x-default', href: `${SITE_URL}/` },
  ]
  for (const { hreflang, href } of hreflangs) {
    let link = document.head.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`)
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'alternate')
      link.setAttribute('hreflang', hreflang)
      document.head.appendChild(link)
    }
    link.setAttribute('href', href)
  }

  const jsonLd = document.getElementById('json-ld')
  if (jsonLd) {
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'MagiesTerminal',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Windows, Linux',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      url: `${SITE_URL}/`,
      downloadUrl: `${SITE_URL}/#download`,
      description: t.metaDesc,
      image: ogImage,
      softwareVersion: releaseInfo?.version ?? FALLBACK_VERSION,
      inLanguage: LANGS.map((l) => l.htmlLang),
      email: SUPPORT_EMAIL,
      publisher: {
        '@type': 'Organization',
        name: 'Magies Technology',
        url: SITE_URL,
        email: SUPPORT_EMAIL,
      },
    })
  }
}

function refreshDownload(lang: Lang): void {
  const lead = document.querySelector('[data-download-lead]')
  if (lead instanceof HTMLElement) lead.textContent = renderDownloadLead(lang)

  const root = document.querySelector('[data-download-root]')
  if (!(root instanceof HTMLElement)) return
  root.innerHTML = renderDownloadSection(lang)
  bindDownload(root, lang)
  root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'))
}

/** Minimal safe markdown for CHANGELOG.md (no raw HTML). */
function renderChangelogMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const html: string[] = []
  let inList = false

  const closeList = () => {
    if (inList) {
      html.push('</ul>')
      inList = false
    }
  }

  const formatInline = (text: string): string => {
    let s = text
    // Markdown links → label only (never emit <a href>)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    // Drop any remaining URLs (github or otherwise)
    s = s.replace(/https?:\/\/[^\s)<\]>]+/g, '')
    s = escapeHtml(s)
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
    s = s.replace(/\s+by\s+@[\w-]+\s+in\s*$/i, '')
    s = s.replace(/\s{2,}/g, ' ').trim()
    return s
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      closeList()
      continue
    }
    // Do not surface GitHub / external-repo wording in the public changelog UI.
    if (/github/i.test(line)) continue

    if (/^#\s+/.test(line)) {
      closeList()
      html.push(`<h2>${formatInline(line.replace(/^#\s+/, ''))}</h2>`)
      continue
    }
    if (/^##\s+/.test(line)) {
      closeList()
      html.push(`<h3>${formatInline(line.replace(/^##\s+/, ''))}</h3>`)
      continue
    }
    if (/^###\s+/.test(line)) {
      closeList()
      html.push(`<h4>${formatInline(line.replace(/^###\s+/, ''))}</h4>`)
      continue
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${formatInline(line.replace(/^[-*]\s+/, ''))}</li>`)
      continue
    }
    closeList()
    html.push(`<p>${formatInline(line)}</p>`)
  }
  closeList()
  return html.join('\n')
}

/** Path → markdown cache (same-origin files only). */
const changelogCache: Partial<Record<string, string>> = {}
/** Monotonic token so a late fetch cannot paint the wrong language. */
let changelogLoadToken = 0
/** UI language whose changelog is currently shown (or loading) in the modal. */
let changelogShownLang: Lang | null = null

/**
 * Candidate changelog paths for a UI language, most-specific first.
 * Ship zh + en today; optional /changelog.{lang}.md is picked up automatically.
 */
function changelogCandidates(lang: Lang): string[] {
  if (lang === 'zh') return [CHANGELOG_LOCAL_ZH]
  if (lang === 'zh-TW') return ['/changelog.zh-TW.md', CHANGELOG_LOCAL_ZH]
  if (lang === 'en') return [CHANGELOG_LOCAL_EN]
  // ja / ko / de / fr / es / pt / ru — dedicated file if present, else English
  return [`/changelog.${lang}.md`, CHANGELOG_LOCAL_EN]
}

function cachedChangelogForLang(lang: Lang): string | null {
  for (const path of changelogCandidates(lang)) {
    const hit = changelogCache[path]
    if (hit) return hit
  }
  return null
}

async function fetchTextWithTimeout(url: string, headers?: Record<string, string>): Promise<string> {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`${url} ${response.status}`)
  const text = (await response.text()).trim()
  if (!text) throw new Error(`empty ${url}`)
  return text
}

async function fetchChangelogMarkdown(lang: Lang): Promise<string> {
  const cached = cachedChangelogForLang(lang)
  if (cached) return cached

  // Try language-specific snapshots first, then fallback (e.g. en for ja).
  let lastError: unknown
  for (const path of changelogCandidates(lang)) {
    if (changelogCache[path]) return changelogCache[path]!
    try {
      const text = await fetchTextWithTimeout(path)
      changelogCache[path] = text
      return text
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error('changelog unavailable')
}

function setChangelogBody(html: string, lang: Lang): void {
  const body = document.querySelector('[data-changelog-body]')
  if (!(body instanceof HTMLElement)) return
  body.innerHTML = html
  body.dataset.changelogLang = lang
}

function isChangelogModalOpen(): boolean {
  const modal = document.querySelector('[data-changelog-modal]')
  return modal instanceof HTMLElement && !modal.hidden
}

function openChangelogModal(lang: Lang = currentLang): void {
  closeContactModal()
  const modal = document.querySelector('[data-changelog-modal]')
  if (!(modal instanceof HTMLElement)) return
  modal.hidden = false
  document.body.classList.add('changelog-open')
  const t = copy[lang]
  changelogShownLang = lang
  const token = ++changelogLoadToken

  const applyMarkdown = (md: string): void => {
    if (token !== changelogLoadToken || changelogShownLang !== lang) return
    const rendered = renderChangelogMarkdown(md)
    setChangelogBody(rendered || `<p class="changelog-status">${t.changelogEmpty}</p>`, lang)
  }

  const cached = cachedChangelogForLang(lang)
  if (cached) {
    applyMarkdown(cached)
  } else {
    setChangelogBody(`<p class="changelog-status">${t.changelogLoading}</p>`, lang)
    void fetchChangelogMarkdown(lang)
      .then((md) => {
        applyMarkdown(md)
      })
      .catch(() => {
        if (token !== changelogLoadToken || changelogShownLang !== lang) return
        setChangelogBody(`<p class="changelog-status is-error">${t.changelogError}</p>`, lang)
      })
  }

  const closeBtn = modal.querySelector<HTMLButtonElement>('.changelog-close')
  closeBtn?.focus()
}

function closeChangelogModal(): void {
  const modal = document.querySelector('[data-changelog-modal]')
  if (!(modal instanceof HTMLElement)) return
  modal.hidden = true
  document.body.classList.remove('changelog-open')
  changelogShownLang = null
  // Invalidate in-flight paints so a late response cannot reopen stale content.
  changelogLoadToken += 1
}

function bindChangelog(root: HTMLElement): void {
  root.querySelectorAll('[data-open-changelog]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault()
      // Always use live UI language so content tracks the language switcher.
      openChangelogModal(currentLang)
    })
  })
  root.querySelectorAll('[data-close-changelog]').forEach((el) => {
    el.addEventListener('click', () => closeChangelogModal())
  })
  const dialog = root.querySelector('.changelog-dialog')
  dialog?.addEventListener('click', (event) => event.stopPropagation())

  // Never navigate away from the site from inside the modal (no repo links).
  const body = root.querySelector('[data-changelog-body]')
  body?.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const anchor = target.closest('a')
    if (anchor) {
      event.preventDefault()
      event.stopPropagation()
    }
  })

  // Escape to close (single listener via property flag)
  if (!root.dataset.changelogEscBound) {
    root.dataset.changelogEscBound = '1'
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return
      if (isContactModalOpen()) closeContactModal()
      else closeChangelogModal()
    })
  }
}

function isContactModalOpen(): boolean {
  const modal = document.querySelector('[data-contact-modal]')
  return modal instanceof HTMLElement && !modal.hidden
}

function openContactModal(lang: Lang = currentLang): void {
  closeChangelogModal()
  const modal = document.querySelector('[data-contact-modal]')
  if (!(modal instanceof HTMLElement)) return
  modal.hidden = false
  document.body.classList.add('changelog-open')
  const copyBtn = modal.querySelector<HTMLButtonElement>('[data-copy-contact-email]')
  if (copyBtn) copyBtn.textContent = copy[lang].contactCopy
  copyBtn?.focus()
}

function closeContactModal(): void {
  const modal = document.querySelector('[data-contact-modal]')
  if (!(modal instanceof HTMLElement)) return
  modal.hidden = true
  if (!isChangelogModalOpen()) document.body.classList.remove('changelog-open')
}

async function copyTextToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    document.body.removeChild(area)
  }
}

async function copySupportEmail(btn: HTMLButtonElement, lang: Lang): Promise<void> {
  const t = copy[lang]
  await copyTextToClipboard(SUPPORT_EMAIL)
  const prev = btn.textContent
  btn.textContent = t.contactCopied
  window.setTimeout(() => {
    btn.textContent = prev || t.contactCopy
  }, 1600)
}

function bindContact(root: HTMLElement, lang: Lang): void {
  root.querySelectorAll('[data-open-contact]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault()
      openContactModal(currentLang)
    })
  })
  root.querySelectorAll('[data-close-contact]').forEach((el) => {
    el.addEventListener('click', () => closeContactModal())
  })
  const dialog = root.querySelector('.contact-dialog')
  dialog?.addEventListener('click', (event) => event.stopPropagation())

  root.querySelectorAll<HTMLButtonElement>('[data-copy-contact-email]').forEach((btn) => {
    btn.addEventListener('click', () => {
      void copySupportEmail(btn, lang)
    })
  })
}

function getSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `s-${Date.now()}-${Math.random().toString(16).slice(2)}`
  sessionStorage.setItem(SESSION_KEY, id)
  return id
}

function trackEvent(
  eventType: 'page_view' | 'download',
  extra: {
    downloadOs?: string | null
    downloadArch?: string | null
    downloadFile?: string | null
  } = {},
): void {
  const payload = {
    eventType,
    path: location.pathname + location.hash,
    referrer: document.referrer || null,
    ua: navigator.userAgent,
    sessionId: getSessionId(),
    downloadOs: extra.downloadOs || null,
    downloadArch: extra.downloadArch || null,
    downloadFile: extra.downloadFile || null,
  }

  const body = JSON.stringify(payload)
  void fetch(TRACK_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
    mode: 'cors',
  }).catch(() => undefined)
}

function bindDownload(root: HTMLElement, lang: Lang): void {
  root.querySelectorAll<HTMLButtonElement>('[data-select-os]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedOs = btn.dataset.selectOs as OsId
      refreshDownload(lang)
    })
  })

  root.querySelectorAll<HTMLButtonElement>('[data-change-os]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedOs = null
      refreshDownload(lang)
    })
  })

  root.querySelectorAll<HTMLAnchorElement>('[data-track-download]').forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.dataset.trackDownload || ''
      const item = DOWNLOADS.find((entry) => entry.id === id)
      const [os, arch] = id.split('-')
      const asset = item ? findAsset(item) : undefined
      trackEvent('download', {
        downloadOs: os || null,
        downloadArch: arch || null,
        downloadFile: asset?.name || link.getAttribute('href') || id,
      })
    })
  })

  root.querySelectorAll<HTMLButtonElement>('[data-copy-install-command]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const command =
        root.querySelector<HTMLElement>('[data-install-command]')?.textContent?.trim() || ''
      if (!command) return
      const t = copy[lang].unsignedMac
      try {
        await navigator.clipboard.writeText(command)
        btn.textContent = t.copiedLabel
      } catch {
        // Fallback for older browsers / insecure contexts
        const area = document.createElement('textarea')
        area.value = command
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.left = '-9999px'
        document.body.appendChild(area)
        area.select()
        document.execCommand('copy')
        document.body.removeChild(area)
        btn.textContent = t.copiedLabel
      }
      window.setTimeout(() => {
        btn.textContent = t.copyLabel
      }, 1600)
    })
  })
}

function bindInteractions(root: HTMLElement, lang: Lang): void {
  const header = root.querySelector('[data-header]')
  const onScroll = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24)
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  root.querySelectorAll<HTMLSelectElement>('[data-lang-select]').forEach((select) => {
    select.addEventListener('change', () => {
      const next = select.value
      if (isLang(next)) setLang(next)
    })
  })

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.2 },
  )

  root.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))

  const downloadRoot = root.querySelector('[data-download-root]')
  if (downloadRoot instanceof HTMLElement) bindDownload(downloadRoot, lang)

  bindChangelog(root)
  bindContact(root, lang)
}

function syncLangToUrl(lang: Lang): void {
  try {
    const url = new URL(location.href)
    if (url.searchParams.get('lang') === lang) return
    url.searchParams.set('lang', lang)
    history.replaceState(null, '', url.pathname + url.search + url.hash)
  } catch {
    /* ignore */
  }
}

function setLang(lang: Lang): void {
  const keepChangelogOpen = isChangelogModalOpen()
  currentLang = lang
  try {
    localStorage.setItem('magies-shell-lang', lang)
  } catch {
    /* ignore private mode */
  }
  syncLangToUrl(lang)
  applyMeta(lang)
  const app = document.getElementById('app')
  if (!app) return
  app.innerHTML = render(lang)
  bindInteractions(app, lang)
  // Switching language reloads changelog body to match the new UI locale.
  if (keepChangelogOpen) openChangelogModal(lang)
}

function initialLang(): Lang {
  // 1) URL ?lang=  2) localStorage  3) browser language
  try {
    const fromQuery = new URLSearchParams(location.search).get('lang')
    if (isLang(fromQuery)) return fromQuery
  } catch {
    /* ignore */
  }
  try {
    const saved = localStorage.getItem('magies-shell-lang')
    if (isLang(saved)) return saved
    // Legacy value from two-language era
    if (saved === 'zh') return 'zh'
  } catch {
    /* ignore */
  }
  try {
    return detectLangFromNavigator(navigator.language || 'en')
  } catch {
    return 'en'
  }
}

async function fetchJsonWithTimeout(url: string, headers?: Record<string, string>): Promise<unknown> {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(6000) })
  if (!response.ok) throw new Error(`${url} ${response.status}`)
  return response.json()
}

async function fetchReleaseFromGithub(): Promise<ReleaseInfo> {
  const data = (await fetchJsonWithTimeout(`https://api.github.com/repos/${REPO}/releases/latest`, {
    Accept: 'application/vnd.github+json',
  })) as {
    tag_name?: string
    assets?: Array<{ name?: string; browser_download_url?: string; size?: number }>
  }
  const tag = sanitizeReleaseTag(data.tag_name || '')
  if (!tag) throw new Error('Missing or invalid tag_name')
  return {
    tag,
    version: normalizeVersion(tag),
    assets: (Array.isArray(data.assets) ? data.assets : [])
      .filter((asset): asset is { name: string; browser_download_url: string; size?: number } =>
        Boolean(asset?.name && asset?.browser_download_url),
      )
      .map((asset) => ({
        name: asset.name,
        browser_download_url: asset.browser_download_url,
        size: typeof asset.size === 'number' ? asset.size : undefined,
      })),
  }
}

async function fetchReleaseFromMirror(): Promise<ReleaseInfo> {
  const data = (await fetchJsonWithTimeout(`${MIRROR_BASE}/release.json`)) as {
    tag?: string
    files?: Array<{ name: string; url: string; size?: number }>
  }
  const tag = sanitizeReleaseTag(data.tag || '')
  if (!tag) throw new Error('Missing or invalid tag in mirror manifest')
  return {
    tag,
    version: normalizeVersion(tag),
    assets: (data.files || []).map((file) => ({
      name: file.name,
      browser_download_url: file.url,
      size: typeof file.size === 'number' ? file.size : undefined,
    })),
  }
}

async function fetchLatestRelease(): Promise<void> {
  releaseLoading = true
  // Mainland-China visitors query the mirror first; everyone else GitHub
  // first. Either source falls back to the other on failure.
  const sources = preferMirror()
    ? [fetchReleaseFromMirror, fetchReleaseFromGithub]
    : [fetchReleaseFromGithub, fetchReleaseFromMirror]
  try {
    for (const fetchRelease of sources) {
      try {
        releaseInfo = await fetchRelease()
        return
      } catch (error) {
        console.warn('Failed to fetch latest MagiesTerminal release from source', error)
      }
    }
    if (!releaseInfo) {
      releaseInfo = {
        tag: `v${FALLBACK_VERSION}`,
        version: FALLBACK_VERSION,
        assets: [],
      }
    }
  } finally {
    releaseLoading = false
    applyMeta(currentLang)
    refreshDownload(currentLang)
  }
}

currentLang = initialLang()
setLang(currentLang)
trackEvent('page_view')
void fetchLatestRelease()

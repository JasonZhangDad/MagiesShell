import './style.css'

type Lang = 'zh' | 'en'
type OsId = 'mac' | 'win' | 'linux'

type DownloadItem = {
  id: string
  os: OsId
  detailZh: string
  detailEn: string
  match: RegExp
}

type OsOption = {
  id: OsId
  labelZh: string
  labelEn: string
  hintZh: string
  hintEn: string
}

type ReleaseAsset = {
  name: string
  browser_download_url: string
}

type ReleaseInfo = {
  version: string
  tag: string
  assets: ReleaseAsset[]
}

const REPO = 'JasonZhangDad/MgTerminal'
const FALLBACK_VERSION = '0.2.3'
const TRACK_API = 'https://stats.shell.magies.top/api/track'
const SESSION_KEY = 'magies-shell-session-id'

const OS_OPTIONS: OsOption[] = [
  {
    id: 'mac',
    labelZh: 'macOS',
    labelEn: 'macOS',
    hintZh: 'Apple Silicon / Intel',
    hintEn: 'Apple Silicon / Intel',
  },
  {
    id: 'win',
    labelZh: 'Windows',
    labelEn: 'Windows',
    hintZh: 'x64 / ARM64',
    hintEn: 'x64 / ARM64',
  },
  {
    id: 'linux',
    labelZh: 'Linux',
    labelEn: 'Linux',
    hintZh: 'AppImage x64 / ARM64',
    hintEn: 'AppImage x64 / ARM64',
  },
]

const DOWNLOADS: DownloadItem[] = [
  {
    id: 'mac-arm64',
    os: 'mac',
    detailZh: 'Apple Silicon · DMG',
    detailEn: 'Apple Silicon · DMG',
    match: /^MagiesTerminal-[\d.]+-mac-arm64\.dmg$/i,
  },
  {
    id: 'mac-x64',
    os: 'mac',
    detailZh: 'Intel · DMG',
    detailEn: 'Intel · DMG',
    match: /^MagiesTerminal-[\d.]+-mac-x64\.dmg$/i,
  },
  {
    id: 'win-x64',
    os: 'win',
    detailZh: 'x64 · Setup',
    detailEn: 'x64 · Setup',
    match: /^MagiesTerminal-[\d.]+-win-x64\.exe$/i,
  },
  {
    id: 'win-arm64',
    os: 'win',
    detailZh: 'ARM64 · Setup',
    detailEn: 'ARM64 · Setup',
    match: /^MagiesTerminal-[\d.]+-win-arm64\.exe$/i,
  },
  {
    id: 'linux-x64',
    os: 'linux',
    detailZh: 'x64 · AppImage',
    detailEn: 'x64 · AppImage',
    match: /^MagiesTerminal-[\d.]+-linux-x86_64\.AppImage$/i,
  },
  {
    id: 'linux-arm64',
    os: 'linux',
    detailZh: 'ARM64 · AppImage',
    detailEn: 'ARM64 · AppImage',
    match: /^MagiesTerminal-[\d.]+-linux-arm64\.AppImage$/i,
  },
]

const copy = {
  zh: {
    metaTitle: 'MagiesShell — AI 驱动的 SSH 工作空间',
    metaDesc:
      'MagiesShell 是现代化的跨平台 SSH 客户端、SFTP 浏览器与终端工作空间。内置 AI Agent，让运维与多主机协作更高效。',
    headline: '把服务器舰队装进一个工作空间',
    sub: 'AI 驱动的 SSH 客户端、SFTP 浏览器与终端管理器。分屏、Vault、多主机编排，为日常运维而生。',
    ctaDownload: '立即下载',
    featuresLabel: '工作空间',
    featuresTitle: '为长期运维流设计',
    featuresLead: '不是单一终端窗口，而是可持续驻留的服务器工作台。',
    features: [
      {
        title: 'Vault 主机库',
        body: '网格 / 列表 / 树形视图，快速搜索与分组，让成百上千台主机仍然好找。',
      },
      {
        title: '分屏终端',
        body: '水平与垂直分割、标签页与会话恢复，多连接并排推进任务。',
      },
      {
        title: 'SFTP + 编辑器',
        body: '拖拽上传下载，内置编辑器就地改文件，文件流与终端流在同一处。',
      },
    ],
    agentLabel: 'MagiesShell Agent',
    agentTitle: '用自然语言指挥服务器',
    agentLead: '内置 AI 搭档理解你的环境，执行命令、诊断问题，并跨多台主机协同操作。',
    agentPoints: [
      { title: '自然语言运维', body: '直接说出需求，不再死记命令与参数。' },
      { title: '实时诊断', body: '检查状态、翻日志、盯资源，几秒给出清晰结论。' },
      { title: '多主机编排', body: '一次对话完成集群初始化、部署与节点协同。' },
    ],
    downloadLabel: '开始使用',
    downloadTitle: '下载 MagiesShell',
    downloadLead: (version: string) => `当前版本 ${version} · 先选择系统，再下载对应版本`,
    downloadLeadLoading: '正在获取最新版本…',
    selectOs: '选择系统',
    pickVersion: '选择版本下载',
    changeOs: '重新选择系统',
    recommended: '推荐',
    unavailable: '暂无该资源',
    unsignedTitle: '未签名版本注意事项',
    unsignedMac: {
      lead: '当前 macOS 安装包尚未公证签名，首次打开可能被系统拦截，可按以下任一方式授权：',
      steps: [
        '在「访达」中右键点击 App → 选择「打开」→ 再点「打开」。',
        '或打开「系统设置 → 隐私与安全性」，在被拦截提示处点击「仍要打开」。',
        '或在终端执行（将路径换成实际位置）：',
      ],
      command: 'xattr -cr /Applications/MagiesTerminal.app',
    },
    unsignedWin: {
      lead: '当前 Windows 安装包尚未代码签名，SmartScreen 可能提示“未知发布者”，可按以下方式继续：',
      steps: [
        '在 SmartScreen 提示中点击「更多信息」→「仍要运行」。',
        '或右键安装包 →「属性」→ 勾选「解除锁定」→「应用」后再运行。',
        '若被 Defender 隔离，可在「病毒和威胁防护 → 保护历史记录」中允许该文件。',
      ],
    },
    footerNote: 'MagiesShell · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
  },
  en: {
    metaTitle: 'MagiesShell — AI-Powered SSH Workspace',
    metaDesc:
      'MagiesShell is a modern cross-platform SSH client, SFTP browser, and terminal workspace with a built-in AI agent for multi-host ops.',
    headline: 'Your server fleet, in one workspace',
    sub: 'An AI-powered SSH client, SFTP browser, and terminal manager. Splits, Vault, and multi-host orchestration built for daily ops.',
    ctaDownload: 'Download',
    featuresLabel: 'Workspace',
    featuresTitle: 'Built for long-running ops',
    featuresLead: 'Not a single terminal window — a workspace you stay in all day.',
    features: [
      {
        title: 'Host Vault',
        body: 'Grid, list, and tree views with fast search and grouping — even when you manage hundreds of hosts.',
      },
      {
        title: 'Split terminals',
        body: 'Horizontal and vertical splits, tabs, and session restore for side-by-side workflows.',
      },
      {
        title: 'SFTP + editor',
        body: 'Drag-and-drop transfers and an in-app editor so files and shells share one surface.',
      },
    ],
    agentLabel: 'MagiesShell Agent',
    agentTitle: 'Talk to your servers',
    agentLead:
      'A built-in AI partner that understands your environment, runs commands, diagnoses issues, and coordinates across hosts.',
    agentPoints: [
      { title: 'Natural-language ops', body: 'Say what you need — stop memorizing flags.' },
      { title: 'Live diagnostics', body: 'Check health, inspect logs, and summarize resources in seconds.' },
      { title: 'Multi-host orchestration', body: 'Spin up clusters and deployments in one conversation.' },
    ],
    downloadLabel: 'Get started',
    downloadTitle: 'Download MagiesShell',
    downloadLead: (version: string) => `Version ${version} · Choose your OS, then pick a build`,
    downloadLeadLoading: 'Fetching the latest release…',
    selectOs: 'Choose your OS',
    pickVersion: 'Choose a build to download',
    changeOs: 'Change OS',
    recommended: 'Recommended',
    unavailable: 'Unavailable',
    unsignedTitle: 'Unsigned build notice',
    unsignedMac: {
      lead: 'The macOS build is not notarized yet. Gatekeeper may block the first launch — authorize it with any of these steps:',
      steps: [
        'In Finder, Control-click the app → Open → Open again.',
        'Or go to System Settings → Privacy & Security, then click Open Anyway.',
        'Or run this in Terminal (adjust the path if needed):',
      ],
      command: 'xattr -cr /Applications/MagiesTerminal.app',
    },
    unsignedWin: {
      lead: 'The Windows build is not code-signed yet. SmartScreen may warn about an unknown publisher — continue with:',
      steps: [
        'In SmartScreen, click More info → Run anyway.',
        'Or right-click the installer → Properties → check Unblock → Apply, then run again.',
        'If Defender quarantined it, allow the file under Virus & threat protection → Protection history.',
      ],
    },
    footerNote: 'MagiesShell · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
  },
} as const

const OS_ICONS: Record<OsId, string> = {
  mac: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.7 12.6c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.7 1.1 8.9.8 1.1 1.7 2.3 2.9 2.2 1.2-.1 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.4-.9-2.4-3.5zm-2.2-6.4c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.9-.9 3 1 .1 2-.5 2.6-1.4z"/></svg>`,
  win: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5.2 10.2 4.2v7.1H3V5.2zm0 13.6v-7.1h7.2v8.1L3 18.8zM11.3 4l9.7-1.4v8.7h-9.7V4zm0 16.4V12.3h9.7v8.7L11.3 20.4z"/></svg>`,
  linux: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.1 2.1c-.7 0-1.4.5-1.7 1.3-.2.5-.1 1.2.2 2.1-.8.3-1.4.9-1.7 1.7-.5 1.3-.1 2.8.9 3.7l-.4 1.2c-.8.3-1.7.9-2.1 1.8-.6 1.3-.2 2.9.9 3.7.3.2.6.4 1 .5-.1.6-.1 1.3.1 2 .4 1.4 1.4 2.5 2.7 2.9.4.1.8.2 1.2.2.5 0 1-.1 1.5-.3.5.5 1.2.8 1.9.8.3 0 .6-.1.9-.2 1.4-.5 2.3-1.8 2.3-3.3 0-.4-.1-.8-.2-1.1.7-.4 1.2-1.1 1.4-1.9.3-1.1 0-2.3-.8-3.1.5-.8.6-1.8.3-2.7-.3-1-.9-1.7-1.8-2.1.1-.5.1-1 0-1.5-.3-1.2-1.2-2.1-2.3-2.3-.2-1-.8-1.8-1.7-2.1-.3-.1-.6-.2-.9-.2zm0 1.5c.3 0 .6.1.8.3.3.3.5.7.5 1.2v.3l-.2.1c-.5.2-1 .6-1.2 1.1l-.1.3-.3-.1c-.3-.1-.5-.4-.5-.8 0-.4.2-.8.5-1 .2-.3.4-.4.5-.4zm2.1 1.1c.4.1.7.5.8 1 0 .3-.1.6-.2.8l-.2.3-.3-.2c-.4-.3-.7-.7-.8-1.2l-.1-.3.3-.1c.1-.2.3-.3.5-.3zm-4.3 2.2c.3 0 .5.1.7.3.5.4.7 1.1.5 1.7-.1.4-.4.7-.7.9l-.3.1-.2-.3c-.3-.5-.3-1.1 0-1.6.1-.3.4-.6.7-.7.1 0 .2-.1.3-.1.1 0 .1 0 .2 0zm4.4.3c.3-.1.7 0 1 .2.5.4.7 1.1.5 1.7-.1.3-.3.6-.6.8l-.3.1-.2-.2c-.4-.5-.4-1.2 0-1.7.1-.2.3-.4.5-.5.1 0 .1-.1.2-.1.1 0 .1 0 .1 0zm-2.2 1.5c.6 0 1.1.2 1.5.5.7.6 1 1.5.8 2.4-.1.5-.4.9-.8 1.2l-.2.1v.4c0 .6-.2 1.1-.5 1.5-.4.5-.9.8-1.5.8-.4 0-.8-.1-1.1-.4-.5-.4-.8-1-.8-1.7v-.5l-.3-.2c-.5-.3-.9-.8-1-1.4-.2-.8.1-1.6.7-2.1.5-.4 1.1-.6 1.7-.6zm0 1.4c-.3 0-.6.1-.8.3-.3.3-.5.7-.4 1.1 0 .3.2.6.5.8l.4.2.1.4c0 .3.1.5.3.7.1.1.3.2.5.2.3 0 .5-.1.7-.4.2-.2.3-.5.3-.8v-.5l.3-.2c.2-.1.4-.4.4-.6.1-.4-.1-.8-.4-1-.3-.2-.6-.3-.9-.3z"/></svg>`,
}

let selectedOs: OsId | null = null
let releaseInfo: ReleaseInfo | null = null
let releaseLoading = true
let currentLang: Lang = 'zh'

function normalizeVersion(tag: string): string {
  return tag.replace(/^v/i, '')
}

function findAsset(item: DownloadItem): ReleaseAsset | undefined {
  return releaseInfo?.assets.find((asset) => item.match.test(asset.name))
}

function fallbackDownloadUrl(item: DownloadItem): string {
  const version = releaseInfo?.version ?? FALLBACK_VERSION
  const tag = releaseInfo?.tag ?? `v${version}`
  const fileMap: Record<string, string> = {
    'mac-arm64': `MagiesTerminal-${version}-mac-arm64.dmg`,
    'mac-x64': `MagiesTerminal-${version}-mac-x64.dmg`,
    'win-x64': `MagiesTerminal-${version}-win-x64.exe`,
    'win-arm64': `MagiesTerminal-${version}-win-arm64.exe`,
    'linux-x64': `MagiesTerminal-${version}-linux-x86_64.AppImage`,
    'linux-arm64': `MagiesTerminal-${version}-linux-arm64.AppImage`,
  }
  return `https://github.com/${REPO}/releases/download/${tag}/${fileMap[item.id]}`
}

function downloadUrl(item: DownloadItem): string | null {
  const asset = findAsset(item)
  if (asset) return asset.browser_download_url
  if (!releaseLoading) return fallbackDownloadUrl(item)
  return null
}

function displayVersion(): string {
  if (releaseLoading && !releaseInfo) return '…'
  return releaseInfo?.version ?? FALLBACK_VERSION
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
    const label = lang === 'zh' ? os.labelZh : os.labelEn
    const hint = lang === 'zh' ? os.hintZh : os.hintEn
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
  const command =
    'command' in notice
      ? `<pre class="unsigned-command"><code>${notice.command}</code></pre>`
      : ''

  return `
    <aside class="unsigned-notice" data-reveal>
      <p class="unsigned-title">${t.unsignedTitle}</p>
      <p class="unsigned-lead">${notice.lead}</p>
      <ol class="unsigned-steps">
        ${notice.steps.map((step) => `<li>${step}</li>`).join('')}
      </ol>
      ${command}
    </aside>`
}

function renderVersionList(lang: Lang, os: OsId): string {
  const t = copy[lang]
  const recommendedId = detectRecommendedId(os)
  const osLabel = OS_OPTIONS.find((item) => item.id === os)
  const title = lang === 'zh' ? osLabel?.labelZh : osLabel?.labelEn
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
            const detail = lang === 'zh' ? item.detailZh : item.detailEn
            const recommended = item.id === recommendedId
            const href = downloadUrl(item)
            const disabled = !href
            const tag = disabled
              ? 'span'
              : 'a'
            const attrs = disabled
              ? `class="download-card is-disabled${recommended ? ' is-recommended' : ''}" aria-disabled="true"`
              : `class="download-card${recommended ? ' is-recommended' : ''}" href="${href}" download data-track-download="${item.id}" data-download-file="${item.id}"`

            return `
              <${tag} ${attrs}>
                <span class="download-meta">
                  <span class="download-os">${detail}</span>
                  <span class="download-detail">${disabled ? t.unavailable : `v${version}`}</span>
                </span>
                ${recommended ? `<span class="download-badge">${t.recommended}</span>` : ''}
              </${tag}>`
          })
          .join('')}
      </div>
      ${renderUnsignedNotice(lang, os)}
    </div>`
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
  return renderVersionList(lang, selectedOs)
}

function renderDownloadLead(lang: Lang): string {
  const t = copy[lang]
  if (releaseLoading && !releaseInfo) return t.downloadLeadLoading
  return t.downloadLead(displayVersion())
}

function render(lang: Lang): string {
  const t = copy[lang]
  return `
    <header class="site-header" data-header>
      <a class="brand-mark" href="#top" aria-label="MagiesShell">
        <img src="/icon.png" alt="" width="28" height="28" />
        <span>MagiesShell</span>
      </a>
      <div class="nav-actions">
        <div class="lang-toggle" role="group" aria-label="Language">
          <button type="button" data-lang="zh" class="${lang === 'zh' ? 'is-active' : ''}">中文</button>
          <button type="button" data-lang="en" class="${lang === 'en' ? 'is-active' : ''}">EN</button>
        </div>
      </div>
    </header>

    <main id="top">
      <section class="hero" aria-label="MagiesShell">
        <div class="hero-copy">
          <h1 class="brand-hero">MagiesShell<span class="cursor-blink" aria-hidden="true"></span></h1>
          <p class="hero-headline">${t.headline}</p>
          <p class="hero-sub">${t.sub}</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="#download">${t.ctaDownload}</a>
          </div>
        </div>
        <div class="hero-stage" aria-hidden="true">
          <img src="/screenshots/hero-workspace.png" alt="" width="1672" height="941" />
        </div>
      </section>

      <section class="section gallery" id="gallery" aria-label="MagiesShell gallery">
        <div class="gallery-grid">
          <figure class="gallery-card" data-reveal>
            <img src="/screenshots/gallery-1.png" alt="" width="1448" height="1086" loading="lazy" />
          </figure>
          <figure class="gallery-card" data-reveal>
            <img src="/screenshots/gallery-2.png" alt="" width="1448" height="1086" loading="lazy" />
          </figure>
          <figure class="gallery-card" data-reveal>
            <img src="/screenshots/gallery-3.png" alt="" width="1448" height="1086" loading="lazy" />
          </figure>
          <figure class="gallery-card" data-reveal>
            <img src="/screenshots/gallery-4.png" alt="" width="1448" height="1086" loading="lazy" />
          </figure>
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
          <img src="/screenshots/agent-settings.png" alt="" width="1586" height="992" loading="lazy" />
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
        <span class="footer-copyright">${t.footerCopyright}</span>
      </div>
    </footer>
  `
}

function applyMeta(lang: Lang): void {
  const t = copy[lang]
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  document.title = t.metaTitle
  const desc = document.querySelector('meta[name="description"]')
  if (desc) desc.setAttribute('content', t.metaDesc)
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
}

function bindInteractions(root: HTMLElement, lang: Lang): void {
  const header = root.querySelector('[data-header]')
  const onScroll = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24)
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  root.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.lang as Lang
      setLang(next)
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
}

function setLang(lang: Lang): void {
  currentLang = lang
  localStorage.setItem('magies-shell-lang', lang)
  applyMeta(lang)
  const app = document.getElementById('app')
  if (!app) return
  app.innerHTML = render(lang)
  bindInteractions(app, lang)
}

function initialLang(): Lang {
  const saved = localStorage.getItem('magies-shell-lang')
  if (saved === 'zh' || saved === 'en') return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

async function fetchLatestRelease(): Promise<void> {
  releaseLoading = true
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!response.ok) throw new Error(`GitHub API ${response.status}`)
    const data = (await response.json()) as {
      tag_name?: string
      assets?: ReleaseAsset[]
    }
    const tag = data.tag_name?.trim()
    if (!tag) throw new Error('Missing tag_name')
    releaseInfo = {
      tag,
      version: normalizeVersion(tag),
      assets: Array.isArray(data.assets) ? data.assets : [],
    }
  } catch (error) {
    console.warn('Failed to fetch latest MagiesTerminal release', error)
    if (!releaseInfo) {
      releaseInfo = {
        tag: `v${FALLBACK_VERSION}`,
        version: FALLBACK_VERSION,
        assets: [],
      }
    }
  } finally {
    releaseLoading = false
    refreshDownload(currentLang)
  }
}

currentLang = initialLang()
setLang(currentLang)
trackEvent('page_view')
void fetchLatestRelease()

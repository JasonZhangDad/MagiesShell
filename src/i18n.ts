export type Lang = 'zh' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'de' | 'fr' | 'es' | 'pt' | 'ru'

export type CopyBundle = {
  metaTitle: string
  metaDesc: string
  headline: string
  sub: string
  ctaDownload: string
  navFeatures: string
  navPlatform: string
  navAgent: string
  navDownload: string
  galleryAlt1: string
  galleryAlt2: string
  galleryAlt3: string
  galleryAlt4: string
  agentShotAlt: string
  macIntelHint: string
  releasesLabel: string
  changelogClose: string
  changelogLoading: string
  changelogError: string
  changelogEmpty: string
  contactLabel: string
  contactTitle: string
  contactLead: string
  contactCopy: string
  contactCopied: string
  navWhy: string
  whyLabel: string
  whyTitle: string
  whyLead: string
  whyItems: ReadonlyArray<{ title: string; body: string }>
  trustItems: readonly string[]
  legalPrivacy: string
  legalTerms: string
  featuresLabel: string
  featuresTitle: string
  featuresLead: string
  features: ReadonlyArray<{ title: string; body: string }>
  platformLabel: string
  platformTitle: string
  platformLead: string
  platformItems: ReadonlyArray<{ title: string; body: string }>
  agentLabel: string
  agentTitle: string
  agentLead: string
  agentPoints: ReadonlyArray<{ title: string; body: string }>
  downloadLabel: string
  downloadTitle: string
  downloadLead: (version: string) => string
  downloadLeadLoading: string
  selectOs: string
  pickVersion: string
  changeOs: string
  recommended: string
  unavailable: string
  unsignedTitle: string
  unsignedMac: {
    lead: string
    command: string
    copyLabel: string
    copiedLabel: string
  }
  unsignedWin: {
    lead: string
    steps: readonly string[]
  }
  androidSideload: {
    title: string
    lead: string
    steps: readonly string[]
  }
  cnSpeedHint: string
  footerNote: string
  footerCopyright: string
  langAria: string
  skipToContent: string
}

export type LangMeta = {
  id: Lang
  /** Native label in language switcher */
  label: string
  /** BCP 47 for documentElement.lang */
  htmlLang: string
  /** Open Graph locale, e.g. zh_CN */
  ogLocale: string
}

export const LANGS: readonly LangMeta[] = [
  { id: 'zh', label: '简体中文', htmlLang: 'zh-CN', ogLocale: 'zh_CN' },
  { id: 'zh-TW', label: '繁體中文', htmlLang: 'zh-TW', ogLocale: 'zh_TW' },
  { id: 'en', label: 'English', htmlLang: 'en', ogLocale: 'en_US' },
  { id: 'ja', label: '日本語', htmlLang: 'ja', ogLocale: 'ja_JP' },
  { id: 'ko', label: '한국어', htmlLang: 'ko', ogLocale: 'ko_KR' },
  { id: 'de', label: 'Deutsch', htmlLang: 'de', ogLocale: 'de_DE' },
  { id: 'fr', label: 'Français', htmlLang: 'fr', ogLocale: 'fr_FR' },
  { id: 'es', label: 'Español', htmlLang: 'es', ogLocale: 'es_ES' },
  { id: 'pt', label: 'Português', htmlLang: 'pt', ogLocale: 'pt_BR' },
  { id: 'ru', label: 'Русский', htmlLang: 'ru', ogLocale: 'ru_RU' },
] as const

const LANG_IDS = new Set<string>(LANGS.map((l) => l.id))

export function isLang(value: string | null | undefined): value is Lang {
  return Boolean(value && LANG_IDS.has(value))
}

export function langMeta(lang: Lang): LangMeta {
  return LANGS.find((l) => l.id === lang) ?? LANGS[2]!
}

/** Map browser language tags to our Lang ids. */
export function detectLangFromNavigator(navLang: string): Lang {
  const raw = navLang.toLowerCase().replace('_', '-')
  if (raw.startsWith('zh-tw') || raw.startsWith('zh-hk') || raw.startsWith('zh-mo') || raw === 'zh-hant') {
    return 'zh-TW'
  }
  if (raw.startsWith('zh')) return 'zh'
  if (raw.startsWith('ja')) return 'ja'
  if (raw.startsWith('ko')) return 'ko'
  if (raw.startsWith('de')) return 'de'
  if (raw.startsWith('fr')) return 'fr'
  if (raw.startsWith('es')) return 'es'
  if (raw.startsWith('pt')) return 'pt'
  if (raw.startsWith('ru')) return 'ru'
  if (raw.startsWith('en')) return 'en'
  return 'en'
}

const macCmd =
  'sudo xattr -cr /Applications/MagiesTerminal.app && open /Applications/MagiesTerminal.app'

export const copy: Record<Lang, CopyBundle> = {
  zh: {
    metaTitle: 'MagiesTerminal — AI 驱动的 SSH 工作空间',
    metaDesc:
      'MagiesTerminal 是现代化的跨平台 SSH 客户端、SFTP 浏览器与终端工作空间。支持 Mosh / Telnet、端口转发、主机 Vault 与内置 AI Agent，让运维与多主机协作更高效。',
    headline: '把服务器舰队装进一个工作空间',
    sub: 'AI 驱动的 SSH 客户端、SFTP 浏览器与终端管理器。Vault、分屏、端口转发、Mosh，以及内置 Agent，为日常运维而生。',
    ctaDownload: '立即下载',
    navFeatures: '功能',
    navPlatform: '可靠',
    navAgent: 'Agent',
    navDownload: '下载',
    galleryAlt1: 'MagiesTerminal 工作区界面截图',
    galleryAlt2: 'MagiesTerminal 分屏与会话界面截图',
    galleryAlt3: 'MagiesTerminal SFTP 与文件管理截图',
    galleryAlt4: 'MagiesTerminal 主机库与连接管理截图',
    agentShotAlt: 'MagiesTerminal Agent 分析服务器的界面截图',
    macIntelHint: 'Intel Mac 请选择「Intel · DMG」。',
    releasesLabel: '更新日志',
    changelogClose: '关闭',
    changelogLoading: '正在加载更新日志…',
    changelogError: '暂时无法获取更新日志，请稍后再试。',
    changelogEmpty: '暂无更新记录。',
    contactLabel: '问题咨询',
    contactTitle: '问题咨询',
    contactLead: '如有问题，请发送邮件联系我们。点击下方按钮可复制邮箱地址。',
    contactCopy: '复制邮箱',
    contactCopied: '邮箱已复制',
    navWhy: '为什么选择',
    whyLabel: '对比',
    whyTitle: '比「多开几个终端」多走一步',
    whyLead: '面向长期运维：主机、文件、会话与 AI 在同一工作空间，而不是窗口堆叠。',
    whyItems: [
      { title: '主机 Vault', body: '搜索、分组、标签与健康快照，成百上千台主机仍一眼找到。' },
      { title: '终端 + SFTP 同屏', body: '改配置、看日志、传文件不必在工具间来回跳。' },
      { title: 'AI 运维搭档', body: '自然语言排查与编排，可接入主流模型与 Cursor Agent。' },
      { title: '多协议 · 跨平台', body: 'SSH / Mosh / Telnet / 串口；macOS · Windows · Linux 免费使用。' },
    ],
    trustItems: ['SSH · Mosh · Telnet', 'SFTP', 'AI Agent', '端口转发', '免费下载'],
    legalPrivacy: '隐私政策',
    legalTerms: '使用条款',
    skipToContent: '跳到主要内容',
    featuresLabel: '工作空间',
    featuresTitle: '为长期运维流设计',
    featuresLead: '不是单一终端窗口，而是可持续驻留的服务器工作台——主机、文件、隧道与 AI 都在这里。',
    features: [
      {
        title: 'Vault 主机库',
        body: '网格 / 列表 / 树形视图，分组与标签、连接诊断与批量健康快照，成百上千台主机仍然好找。',
      },
      {
        title: '分屏终端',
        body: '水平与垂直分割、标签页、会话恢复、广播输入与代码片段，多连接并排推进任务。',
      },
      {
        title: 'SFTP + 编辑器',
        body: '双窗格浏览与拖拽传输，断点续传 / 自动重试 / 校验，内置编辑器就地改文件。',
      },
      {
        title: '多协议连接',
        body: 'SSH、Telnet、Mosh、串口与本地终端；跳板机、代理与 SSH Agent 一站式接入。',
      },
      {
        title: '端口转发',
        body: '本地 / 动态端口转发，自动复用已认证 SSH 会话，免二次密码与 2FA。',
      },
      {
        title: '主题与快捷操作',
        body: '界面与终端主题预览选择、关键词高亮、命令面板，十种界面语言开箱可用。',
      },
    ],
    platformLabel: '可靠与安全',
    platformTitle: '装上就能长期驻留',
    platformLead: '自动更新、凭据加密与主机侧运维面板都内置，少折腾工具链。',
    platformItems: [
      {
        title: '全平台自动更新',
        body: '启动后自动检查新版本，下载完成后一键重启安装；进度在设置页可见，macOS / Windows / Linux 均可升级。',
      },
      {
        title: '凭据本地加密',
        body: 'API Key 与主机密码走系统钥匙串或本地加密保险箱，不回退明文；SSH 主机密钥默认校验，降低中间人风险。',
      },
      {
        title: '系统管理面板',
        body: '概览 CPU / 内存 / 磁盘 / 延迟，管理进程、Docker 容器与 tmux 会话，不必另开监控工具。',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: '用自然语言指挥服务器',
    agentLead:
      '内置 AI 搭档理解你的环境，可接入主流模型与 Cursor Agent；执行命令、诊断问题，并跨多台主机协同操作。',
    agentPoints: [
      { title: '自然语言运维', body: '直接说出需求，不再死记命令与参数；按需联网检索补充上下文。' },
      { title: '实时诊断', body: '检查状态、翻日志、盯资源，几秒给出清晰结论与下一步建议。' },
      { title: '多主机编排', body: '一次对话完成集群初始化、部署与节点协同，侧栏与终端同屏协作。' },
    ],
    downloadLabel: '开始使用',
    downloadTitle: '下载 MagiesTerminal',
    downloadLead: (version) => `当前版本 ${version} · 先选择系统，再下载对应版本`,
    downloadLeadLoading: '正在获取最新版本…',
    selectOs: '选择系统',
    pickVersion: '选择版本下载',
    changeOs: '重新选择系统',
    recommended: '推荐',
    unavailable: '暂无该资源',
    unsignedTitle: '安装后首次打开',
    unsignedMac: {
      lead: '拖入「应用程序」后，在「终端」执行下面这一条即可（新系统通常没有「仍要打开」）：',
      command: macCmd,
      copyLabel: '复制命令',
      copiedLabel: '已复制',
    },
    unsignedWin: {
      lead: '当前 Windows 安装包尚未代码签名，SmartScreen 可能提示“未知发布者”，可按以下方式继续：',
      steps: [
        '在 SmartScreen 提示中点击「更多信息」→「仍要运行」。',
        '或右键安装包 →「属性」→ 勾选「解除锁定」→「应用」后再运行。',
        '若被 Defender 隔离，可在「病毒和威胁防护 → 保护历史记录」中允许该文件。',
      ],
    },
    androidSideload: {
      title: 'Android APK',
      lead: 'Companion app (sideload, no store required).',
      steps: [
        'Download the APK',
        'Allow unknown sources if prompted',
        'Open the APK to install',
      ],
    },
    cnSpeedHint:
      '提示：下载速度较慢时，可复制下载链接到支持多线程的下载工具（如 IDM、NDM、迅雷）加速。',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: '语言',
  },
  'zh-TW': {
    metaTitle: 'MagiesTerminal — AI 驅動的 SSH 工作空間',
    metaDesc:
      'MagiesTerminal 是現代化的跨平台 SSH 用戶端、SFTP 瀏覽器與終端工作空間。支援 Mosh / Telnet、連接埠轉發、主機 Vault 與內建 AI Agent，讓維運與多主機協作更有效率。',
    headline: '把伺服器艦隊裝進一個工作空間',
    sub: 'AI 驅動的 SSH 用戶端、SFTP 瀏覽器與終端管理器。Vault、分割畫面、連接埠轉發、Mosh，以及內建 Agent，為日常維運而生。',
    ctaDownload: '立即下載',
    navFeatures: '功能',
    navPlatform: '可靠',
    navAgent: 'Agent',
    navDownload: '下載',
    galleryAlt1: 'MagiesTerminal 工作區介面截圖',
    galleryAlt2: 'MagiesTerminal 分割終端介面截圖',
    galleryAlt3: 'MagiesTerminal SFTP 與檔案管理截圖',
    galleryAlt4: 'MagiesTerminal 主機庫與連線管理截圖',
    agentShotAlt: 'Magies Agent 設定介面截圖',
    macIntelHint: 'Intel Mac 請選擇「Intel · DMG」。',
    releasesLabel: '更新日誌',
    changelogClose: '關閉',
    changelogLoading: '正在載入更新日誌…',
    changelogError: '暫時無法取得更新日誌，請稍後再試。',
    changelogEmpty: '暫無更新記錄。',
    contactLabel: '問題諮詢',
    contactTitle: '問題諮詢',
    contactLead: '如有問題，請寄信聯絡我們。點下方按鈕可複製信箱地址。',
    contactCopy: '複製信箱',
    contactCopied: '信箱已複製',
    navWhy: '為什麼選擇',
    whyLabel: '對比',
    whyTitle: '比「多開幾個終端」多走一步',
    whyLead: '面向長期維運：主機、檔案、工作階段與 AI 在同一工作空間，而不是視窗堆疊。',
    whyItems: [
      { title: '主機 Vault', body: '搜尋、分組、標籤與健康快照，成百上千台主機仍一眼找到。' },
      { title: '終端 + SFTP 同屏', body: '改設定、看日誌、傳檔不必在工具間來回跳。' },
      { title: 'AI 維運搭檔', body: '自然語言排查與編排，可接入主流模型與 Cursor Agent。' },
      { title: '多協定 · 跨平台', body: 'SSH / Mosh / Telnet / 序列埠；macOS · Windows · Linux 免費使用。' },
    ],
    trustItems: ['SSH · Mosh · Telnet', 'SFTP', 'AI Agent', '連接埠轉發', '免費下載'],
    legalPrivacy: '隱私權政策',
    legalTerms: '使用條款',
    skipToContent: '跳到主要內容',
    featuresLabel: '工作空間',
    featuresTitle: '為長期維運流設計',
    featuresLead: '不是單一終端視窗，而是可持續駐留的伺服器工作台——主機、檔案、通道與 AI 都在這裡。',
    features: [
      {
        title: 'Vault 主機庫',
        body: '網格 / 列表 / 樹狀檢視，分組與標籤、連線診斷與批次健康快照，成百上千台主機依然好找。',
      },
      {
        title: '分割終端',
        body: '水平與垂直分割、分頁、工作階段還原、廣播輸入與程式碼片段，多連線並排推進任務。',
      },
      {
        title: 'SFTP + 編輯器',
        body: '雙窗格瀏覽與拖放傳輸，斷點續傳 / 自動重試 / 校驗，內建編輯器就地改檔。',
      },
      {
        title: '多協定連線',
        body: 'SSH、Telnet、Mosh、序列埠與本機終端；跳板機、代理與 SSH Agent 一站式接入。',
      },
      {
        title: '連接埠轉發',
        body: '本機 / 動態連接埠轉發，自動重用已驗證的 SSH 工作階段，免二次密碼與 2FA。',
      },
      {
        title: '主題與快捷操作',
        body: '介面與終端主題預覽選擇、關鍵字高亮、命令面板，十種介面語言開箱可用。',
      },
    ],
    platformLabel: '可靠與安全',
    platformTitle: '裝上就能長期駐留',
    platformLead: '自動更新、憑證加密與主機側維運面板都內建，少折騰工具鏈。',
    platformItems: [
      {
        title: '全平台自動更新',
        body: '啟動後自動檢查新版本，下載完成後一鍵重啟安裝；進度在設定頁可見，macOS / Windows / Linux 均可升級。',
      },
      {
        title: '憑證本機加密',
        body: 'API Key 與主機密碼走系統鑰匙圈或本機加密保險箱，不回退明文；SSH 主機金鑰預設校驗，降低中間人風險。',
      },
      {
        title: '系統管理面板',
        body: '概覽 CPU / 記憶體 / 磁碟 / 延遲，管理行程、Docker 容器與 tmux 工作階段，不必另開監控工具。',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: '用自然語言指揮伺服器',
    agentLead:
      '內建 AI 夥伴理解你的環境，可接入主流模型與 Cursor Agent；執行命令、診斷問題，並跨多台主機協同操作。',
    agentPoints: [
      { title: '自然語言維運', body: '直接說出需求，不必死記命令與參數；可依需要連網檢索補充脈絡。' },
      { title: '即時診斷', body: '檢查狀態、翻日誌、盯資源，幾秒給出清楚結論與下一步建議。' },
      { title: '多主機編排', body: '一次對話完成叢集初始化、部署與節點協同，側欄與終端同屏協作。' },
    ],
    downloadLabel: '開始使用',
    downloadTitle: '下載 MagiesTerminal',
    downloadLead: (version) => `目前版本 ${version} · 先選擇系統，再下載對應版本`,
    downloadLeadLoading: '正在取得最新版本…',
    selectOs: '選擇系統',
    pickVersion: '選擇版本下載',
    changeOs: '重新選擇系統',
    recommended: '推薦',
    unavailable: '暫無該資源',
    unsignedTitle: '安裝後首次開啟',
    unsignedMac: {
      lead: '拖入「應用程式」後，在「終端機」執行下面這一條即可（新系統通常沒有「仍要打開」）：',
      command: macCmd,
      copyLabel: '複製指令',
      copiedLabel: '已複製',
    },
    unsignedWin: {
      lead: '目前 Windows 安裝包尚未程式碼簽章，SmartScreen 可能提示「未知發行者」，可依下列方式繼續：',
      steps: [
        '在 SmartScreen 提示中點「更多資訊」→「仍要執行」。',
        '或右鍵安裝包 →「內容」→ 勾選「解除封鎖」→「套用」後再執行。',
        '若被 Defender 隔離，可在「病毒與威脅防護 → 保護記錄」中允許該檔案。',
      ],
    },
    androidSideload: {
      title: 'Android APK',
      lead: 'Companion app (sideload, no store required).',
      steps: [
        'Download the APK',
        'Allow unknown sources if prompted',
        'Open the APK to install',
      ],
    },
    cnSpeedHint: '提示：下載速度較慢時，可複製下載連結到支援多執行緒的下載工具加速。',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: '語言',
  },
  en: {
    metaTitle: 'MagiesTerminal — AI-Powered SSH Workspace',
    metaDesc:
      'MagiesTerminal is a modern cross-platform SSH client, SFTP browser, and terminal workspace with Mosh/Telnet, port forwarding, host Vault, and a built-in AI agent for multi-host ops.',
    headline: 'Your server fleet, in one workspace',
    sub: 'An AI-powered SSH client, SFTP browser, and terminal manager. Vault, splits, port forwarding, Mosh, and a built-in Agent — built for daily ops.',
    ctaDownload: 'Download',
    navFeatures: 'Features',
    navPlatform: 'Reliability',
    navAgent: 'Agent',
    navDownload: 'Download',
    galleryAlt1: 'MagiesTerminal workspace screenshot',
    galleryAlt2: 'MagiesTerminal split terminal screenshot',
    galleryAlt3: 'MagiesTerminal SFTP and file manager screenshot',
    galleryAlt4: 'MagiesTerminal host vault screenshot',
    agentShotAlt: 'MagiesTerminal Agent analyzing a server',
    macIntelHint: 'On Intel Macs, choose Intel · DMG.',
    releasesLabel: 'Changelog',
    changelogClose: 'Close',
    changelogLoading: 'Loading changelog…',
    changelogError: 'Could not load the changelog. Please try again later.',
    changelogEmpty: 'No release notes yet.',
    contactLabel: 'Contact',
    contactTitle: 'Contact',
    contactLead: 'Questions? Email us — use the button below to copy the address.',
    contactCopy: 'Copy email',
    contactCopied: 'Email copied',
    navWhy: 'Why',
    whyLabel: 'Why MagiesTerminal',
    whyTitle: 'More than another terminal window',
    whyLead: 'Built for daily ops: hosts, files, sessions, and AI in one workspace — not a pile of windows.',
    whyItems: [
      { title: 'Host Vault', body: 'Search, groups, tags, and health snapshots — find any host in seconds.' },
      { title: 'Shell + SFTP together', body: 'Edit configs, watch logs, and move files without switching apps.' },
      { title: 'AI ops partner', body: 'Diagnose and orchestrate in natural language; plug in major models or Cursor Agent.' },
      { title: 'Multi-protocol · free', body: 'SSH / Mosh / Telnet / serial on macOS, Windows, and Linux — free to download.' },
    ],
    trustItems: ['SSH · Mosh · Telnet', 'SFTP', 'AI Agent', 'Port forwarding', 'Free download'],
    legalPrivacy: 'Privacy',
    legalTerms: 'Terms',
    skipToContent: 'Skip to content',
    featuresLabel: 'Workspace',
    featuresTitle: 'Built for long-running ops',
    featuresLead: 'Not a single terminal window — a server desk for hosts, files, tunnels, and AI all day.',
    features: [
      {
        title: 'Host Vault',
        body: 'Grid, list, and tree views with groups, tags, connection diagnostics, and batch health snapshots — even for hundreds of hosts.',
      },
      {
        title: 'Split terminals',
        body: 'Horizontal and vertical splits, tabs, session restore, broadcast input, and snippets for side-by-side workflows.',
      },
      {
        title: 'SFTP + editor',
        body: 'Dual-pane browsing, drag-and-drop transfers with resume / auto-retry / checksum, and an in-app editor.',
      },
      {
        title: 'Multi-protocol',
        body: 'SSH, Telnet, Mosh, serial, and local terminals — with jump hosts, proxies, and SSH Agent in one place.',
      },
      {
        title: 'Port forwarding',
        body: 'Local and dynamic tunnels that reuse an authenticated SSH session — no second password or 2FA.',
      },
      {
        title: 'Themes & quick actions',
        body: 'UI and terminal theme previews, keyword highlights, command palette, and ten interface languages.',
      },
    ],
    platformLabel: 'Reliable by design',
    platformTitle: 'Built to stay installed',
    platformLead: 'Auto-updates, encrypted credentials, and an on-host ops panel — less toolchain juggling.',
    platformItems: [
      {
        title: 'Auto-update everywhere',
        body: 'Checks for updates after launch, downloads in the background, then one-click restart to install. Progress shows in Settings on macOS, Windows, and Linux.',
      },
      {
        title: 'Local credential encryption',
        body: 'API keys and host secrets use the OS keychain or a local encrypted vault — never plain text. SSH host-key checks stay on by default against MITM risk.',
      },
      {
        title: 'System manager panel',
        body: 'Overview of CPU, memory, disk, and latency; manage processes, Docker containers, and tmux sessions without another monitor app.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Talk to your servers',
    agentLead:
      'A built-in AI partner that understands your environment, works with major models and Cursor Agent, runs commands, diagnoses issues, and coordinates across hosts.',
    agentPoints: [
      { title: 'Natural-language ops', body: 'Say what you need — stop memorizing flags. Optional web search for extra context.' },
      { title: 'Live diagnostics', body: 'Check health, inspect logs, and summarize resources with clear next steps in seconds.' },
      { title: 'Multi-host orchestration', body: 'Spin up clusters and deployments in one conversation, side-by-side with your shell.' },
    ],
    downloadLabel: 'Get started',
    downloadTitle: 'Download MagiesTerminal',
    downloadLead: (version) => `Version ${version} · Choose your OS, then pick a build`,
    downloadLeadLoading: 'Fetching the latest release…',
    selectOs: 'Choose your OS',
    pickVersion: 'Choose a build to download',
    changeOs: 'Change OS',
    recommended: 'Recommended',
    unavailable: 'Unavailable',
    unsignedTitle: 'After installing',
    unsignedMac: {
      lead: 'After dragging into Applications, run this one command in Terminal (newer macOS often has no Open Anyway):',
      command: macCmd,
      copyLabel: 'Copy command',
      copiedLabel: 'Copied',
    },
    unsignedWin: {
      lead: 'The Windows build is not code-signed yet. SmartScreen may warn about an unknown publisher — continue with:',
      steps: [
        'In SmartScreen, click More info → Run anyway.',
        'Or right-click the installer → Properties → check Unblock → Apply, then run again.',
        'If Defender quarantined it, allow the file under Virus & threat protection → Protection history.',
      ],
    },
    androidSideload: {
      title: 'Android APK install',
      lead: 'Companion app — no Play Store required. Allow installs from this source after download.',
      steps: [
        'Download the APK to your phone',
        'Allow install from this source in system settings',
        'Open the APK to install',
      ],
    },
    cnSpeedHint:
      'Tip: if the download is slow, copy the link into a multi-threaded download manager (IDM, NDM, etc.) for much faster speeds.',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Language',
  },
  ja: {
    metaTitle: 'MagiesTerminal — AI 駆動 SSH ワークスペース',
    metaDesc:
      'MagiesTerminal は、Mosh / Telnet、ポート転送、ホスト Vault、組み込み AI エージェントを備えた最新のクロスプラットフォーム SSH クライアント、SFTP ブラウザ、ターミナルワークスペースです。',
    headline: 'サーバー艦隊を、ひとつのワークスペースに',
    sub: 'AI 駆動の SSH クライアント、SFTP ブラウザ、ターミナル管理。Vault、分割表示、ポート転送、Mosh、組み込み Agent で日常運用を支えます。',
    ctaDownload: 'ダウンロード',
    navFeatures: '機能',
    navPlatform: '信頼性',
    navAgent: 'Agent',
    navDownload: 'DL',
    galleryAlt1: 'MagiesTerminal ワークスペースのスクリーンショット',
    galleryAlt2: 'MagiesTerminal 分割ターミナルのスクリーンショット',
    galleryAlt3: 'MagiesTerminal SFTP とファイル管理のスクリーンショット',
    galleryAlt4: 'MagiesTerminal ホスト保管庫のスクリーンショット',
    agentShotAlt: 'Magies Agent 設定のスクリーンショット',
    macIntelHint: 'Intel Mac では「Intel · DMG」を選択してください。',
    releasesLabel: '更新履歴',
    changelogClose: '閉じる',
    changelogLoading: '更新履歴を読み込み中…',
    changelogError: '更新履歴を取得できませんでした。後でもう一度お試しください。',
    changelogEmpty: '更新履歴はまだありません。',
    contactLabel: 'お問い合わせ',
    contactTitle: 'お問い合わせ',
    contactLead: 'ご質問はメールでご連絡ください。下のボタンでメールアドレスをコピーできます。',
    contactCopy: 'メールをコピー',
    contactCopied: 'メールをコピーしました',
    navWhy: '選ぶ理由',
    whyLabel: '比較',
    whyTitle: 'ただのターミナルウィンドウではありません',
    whyLead: '日常運用向け：ホスト・ファイル・セッション・AI を一つのワークスペースに。',
    whyItems: [
      { title: 'ホスト Vault', body: '検索・グループ・タグ・ヘルススナップショットで数百台でも迷いません。' },
      { title: 'シェル + SFTP 一体', body: '設定変更・ログ確認・転送をアプリを切り替えずに。' },
      { title: 'AI 運用パートナー', body: '自然言語で診断と編成。主要モデルや Cursor Agent に接続可能。' },
      { title: '多プロトコル · 無料', body: 'SSH / Mosh / Telnet / シリアル。macOS · Windows · Linux で無料。' },
    ],
    trustItems: ['SSH · Mosh · Telnet', 'SFTP', 'AI Agent', 'ポート転送', '無料'],
    legalPrivacy: 'プライバシー',
    legalTerms: '利用規約',
    skipToContent: '本文へスキップ',
    featuresLabel: 'ワークスペース',
    featuresTitle: '長時間の運用のために',
    featuresLead: '単なるターミナルではなく、ホスト・ファイル・トンネル・AI が揃う一日中使える作業台です。',
    features: [
      {
        title: 'ホスト Vault',
        body: 'グリッド / リスト / ツリー、グループとタグ、接続診断と一括ヘルス確認で、数百台でも迷いません。',
      },
      {
        title: '分割ターミナル',
        body: '水平・垂直分割、タブ、セッション復元、ブロードキャスト入力とスニペットで複数接続を並べて進めます。',
      },
      {
        title: 'SFTP + エディタ',
        body: 'デュアルペイン、ドラッグ＆ドロップ、再開 / 自動再試行 / チェックサム、アプリ内編集。',
      },
      {
        title: '多プロトコル接続',
        body: 'SSH、Telnet、Mosh、シリアル、ローカル端末。ジャンプホスト、プロキシ、SSH Agent を一か所で。',
      },
      {
        title: 'ポート転送',
        body: 'ローカル / ダイナミック転送。認証済み SSH セッションを再利用し、再パスワードや 2FA を避けます。',
      },
      {
        title: 'テーマとクイック操作',
        body: 'UI / ターミナルテーマのプレビュー、キーワード強調、コマンドパレット、10 の UI 言語。',
      },
    ],
    platformLabel: '信頼性とセキュリティ',
    platformTitle: '長く使い続けられる設計',
    platformLead: '自動更新、資格情報の暗号化、ホスト側の運用パネルを内蔵。ツールの切り替えを減らします。',
    platformItems: [
      {
        title: '全プラットフォーム自動更新',
        body: '起動後に更新を確認し、ダウンロード後はワンクリックで再起動インストール。進捗は設定で確認でき、macOS / Windows / Linux に対応。',
      },
      {
        title: '資格情報のローカル暗号化',
        body: 'API キーとホスト秘密情報は OS キーチェーンまたはローカル暗号化ボルトで保護し、平文には戻しません。SSH ホスト鍵検証は既定で有効。',
      },
      {
        title: 'システム管理パネル',
        body: 'CPU / メモリ / ディスク / 遅延の概要。プロセス、Docker、tmux を別アプリなしで管理できます。',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: '自然言語でサーバーを操作',
    agentLead:
      '環境を理解する AI パートナーが、主要モデルや Cursor Agent と連携し、コマンド実行・診断・複数ホスト連携を支援します。',
    agentPoints: [
      { title: '自然言語オペレーション', body: 'やりたいことを話すだけ。必要なら Web 検索で文脈を補えます。' },
      { title: 'ライブ診断', body: '状態、ログ、リソースを数秒で要約し、次の一手を示します。' },
      { title: 'マルチホスト編成', body: 'クラスター初期化やデプロイを一つの会話で。サイドバーとシェルが並びます。' },
    ],
    downloadLabel: 'はじめに',
    downloadTitle: 'MagiesTerminal をダウンロード',
    downloadLead: (version) => `バージョン ${version} · OS を選び、ビルドを選択`,
    downloadLeadLoading: '最新リリースを取得中…',
    selectOs: 'OS を選択',
    pickVersion: 'ビルドを選択してダウンロード',
    changeOs: 'OS を変更',
    recommended: '推奨',
    unavailable: '利用不可',
    unsignedTitle: 'インストール後の初回起動',
    unsignedMac: {
      lead: 'アプリケーションにドラッグした後、ターミナルで次のコマンドを実行してください（新しい macOS では「このまま開く」が無い場合があります）：',
      command: macCmd,
      copyLabel: 'コマンドをコピー',
      copiedLabel: 'コピーしました',
    },
    unsignedWin: {
      lead: 'Windows ビルドはまだコード署名されていません。SmartScreen が不明な発行元と警告する場合は、次のように続行できます：',
      steps: [
        'SmartScreen で「詳細情報」→「実行」をクリック。',
        'またはインストーラーを右クリック → プロパティ →「ブロックの解除」→ 適用してから実行。',
        'Defender が隔離した場合は「ウイルスと脅威の防止 → 保護の履歴」で許可。',
      ],
    },
    androidSideload: {
      title: 'Android APK',
      lead: 'Companion app (sideload, no store required).',
      steps: [
        'Download the APK',
        'Allow unknown sources if prompted',
        'Open the APK to install',
      ],
    },
    cnSpeedHint:
      'ヒント：ダウンロードが遅い場合は、リンクをマルチスレッド対応ダウンローダー（IDM など）に貼ると高速化できます。',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: '言語',
  },
  ko: {
    metaTitle: 'MagiesTerminal — AI 기반 SSH 워크스페이스',
    metaDesc:
      'MagiesTerminal은 Mosh / Telnet, 포트 포워딩, 호스트 Vault, 내장 AI 에이전트가 있는 최신 크로스플랫폼 SSH 클라이언트, SFTP 브라우저, 터미널 워크스페이스입니다.',
    headline: '서버 함대를 하나의 워크스페이스에',
    sub: 'AI 기반 SSH 클라이언트, SFTP 브라우저, 터미널 관리자. Vault, 분할, 포트 포워딩, Mosh, 내장 Agent로 일상 운영을 지원합니다.',
    ctaDownload: '다운로드',
    navFeatures: '기능',
    navPlatform: '안정성',
    navAgent: 'Agent',
    navDownload: '다운로드',
    galleryAlt1: 'MagiesTerminal 워크스페이스 스크린샷',
    galleryAlt2: 'MagiesTerminal 분할 터미널 스크린샷',
    galleryAlt3: 'MagiesTerminal SFTP 및 파일 관리 스크린샷',
    galleryAlt4: 'MagiesTerminal 호스트 보관함 스크린샷',
    agentShotAlt: 'Magies Agent 설정 스크린샷',
    macIntelHint: 'Intel Mac에서는 「Intel · DMG」를 선택하세요.',
    releasesLabel: '변경 로그',
    changelogClose: '닫기',
    changelogLoading: '변경 로그를 불러오는 중…',
    changelogError: '변경 로그를 불러올 수 없습니다. 잠시 후 다시 시도하세요.',
    changelogEmpty: '아직 변경 기록이 없습니다.',
    contactLabel: '문의',
    contactTitle: '문의',
    contactLead: '문의 사항은 이메일로 연락해 주세요. 아래 버튼으로 주소를 복사할 수 있습니다.',
    contactCopy: '이메일 복사',
    contactCopied: '이메일이 복사됨',
    navWhy: '선택 이유',
    whyLabel: '비교',
    whyTitle: '또 하나의 터미널 창이 아닙니다',
    whyLead: '일상 운영을 위해: 호스트, 파일, 세션, AI를 한 워크스페이스에.',
    whyItems: [
      { title: '호스트 Vault', body: '검색·그룹·태그·헬스 스냅샷으로 수백 대도 바로 찾습니다.' },
      { title: '셸 + SFTP 통합', body: '설정, 로그, 전송을 앱 전환 없이 처리합니다.' },
      { title: 'AI 운영 파트너', body: '자연어로 진단·오케스트레이션. 주요 모델 또는 Cursor Agent 연동.' },
      { title: '다중 프로토콜 · 무료', body: 'SSH / Mosh / Telnet / 시리얼. macOS · Windows · Linux 무료.' },
    ],
    trustItems: ['SSH · Mosh · Telnet', 'SFTP', 'AI Agent', '포트 포워딩', '무료'],
    legalPrivacy: '개인정보',
    legalTerms: '이용약관',
    skipToContent: '본문으로 건너뛰기',
    featuresLabel: '워크스페이스',
    featuresTitle: '장시간 운영을 위해',
    featuresLead: '단일 터미널이 아니라 호스트·파일·터널·AI가 모인 하루 종일 쓰는 서버 작업대입니다.',
    features: [
      {
        title: '호스트 Vault',
        body: '그리드 / 목록 / 트리, 그룹·태그, 연결 진단과 일괄 헬스 스냅샷으로 수백 대도 쉽게 찾습니다.',
      },
      {
        title: '분할 터미널',
        body: '수평·수직 분할, 탭, 세션 복원, 브로드캐스트 입력과 스니펫으로 여러 연결을 나란히 진행합니다.',
      },
      {
        title: 'SFTP + 편집기',
        body: '듀얼 페인, 드래그 앤 드롭, 이어받기 / 자동 재시도 / 체크섬, 앱 내 편집.',
      },
      {
        title: '다중 프로토콜',
        body: 'SSH, Telnet, Mosh, 시리얼, 로컬 터미널. 점프 호스트, 프록시, SSH Agent를 한곳에서.',
      },
      {
        title: '포트 포워딩',
        body: '로컬 / 동적 터널이 이미 인증된 SSH 세션을 재사용해 두 번째 비밀번호·2FA가 필요 없습니다.',
      },
      {
        title: '테마와 빠른 작업',
        body: 'UI·터미널 테마 미리보기, 키워드 강조, 명령 팔레트, 10개 인터페이스 언어.',
      },
    ],
    platformLabel: '안정성과 보안',
    platformTitle: '오래 쓸 수 있게 설계',
    platformLead: '자동 업데이트, 자격 증명 암호화, 호스트 측 운영 패널을 내장해 도구 전환을 줄입니다.',
    platformItems: [
      {
        title: '전 플랫폼 자동 업데이트',
        body: '실행 후 업데이트를 확인하고, 다운로드가 끝나면 원클릭 재시작으로 설치합니다. 진행 상황은 설정에서 보이며 macOS / Windows / Linux를 지원합니다.',
      },
      {
        title: '로컬 자격 증명 암호화',
        body: 'API 키와 호스트 비밀은 OS 키체인 또는 로컬 암호화 볼트로 보호하며 평문으로 되돌리지 않습니다. SSH 호스트 키 검증은 기본 켜짐입니다.',
      },
      {
        title: '시스템 관리 패널',
        body: 'CPU / 메모리 / 디스크 / 지연 개요. 프로세스, Docker, tmux를 다른 모니터 앱 없이 관리합니다.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: '자연어로 서버를 지휘',
    agentLead:
      '환경을 이해하는 AI 파트너가 주요 모델과 Cursor Agent와 함께 명령 실행, 진단, 다중 호스트 협업을 돕습니다.',
    agentPoints: [
      { title: '자연어 운영', body: '필요한 것을 말하세요. 필요 시 웹 검색으로 맥락을 보강합니다.' },
      { title: '실시간 진단', body: '상태, 로그, 리소스를 수 초 만에 요약하고 다음 단계를 제시합니다.' },
      { title: '멀티 호스트 오케스트레이션', body: '클러스터 초기화와 배포를 한 대화로. 사이드바와 셸이 나란히.' },
    ],
    downloadLabel: '시작하기',
    downloadTitle: 'MagiesTerminal 다운로드',
    downloadLead: (version) => `버전 ${version} · OS를 선택한 뒤 빌드를 고르세요`,
    downloadLeadLoading: '최신 릴리스를 가져오는 중…',
    selectOs: 'OS 선택',
    pickVersion: '빌드를 선택하여 다운로드',
    changeOs: 'OS 변경',
    recommended: '추천',
    unavailable: '없음',
    unsignedTitle: '설치 후 첫 실행',
    unsignedMac: {
      lead: '응용 프로그램으로 드래그한 뒤, 터미널에서 다음 명령을 실행하세요(최신 macOS에는 ‘계속 열기’가 없을 수 있음):',
      command: macCmd,
      copyLabel: '명령 복사',
      copiedLabel: '복사됨',
    },
    unsignedWin: {
      lead: 'Windows 빌드는 아직 코드 서명이 없습니다. SmartScreen이 알 수 없는 게시자로 경고할 수 있습니다. 다음처럼 계속하세요:',
      steps: [
        'SmartScreen에서 추가 정보 → 실행을 클릭합니다.',
        '또는 설치 파일을 우클릭 → 속성 → 차단 해제 → 적용 후 실행합니다.',
        'Defender가 격리했다면 바이러스 및 위협 방지 → 보호 기록에서 허용합니다.',
      ],
    },
    androidSideload: {
      title: 'Android APK',
      lead: 'Companion app (sideload, no store required).',
      steps: [
        'Download the APK',
        'Allow unknown sources if prompted',
        'Open the APK to install',
      ],
    },
    cnSpeedHint:
      '팁: 다운로드가 느리면 링크를 다중 스레드 다운로드 도구(IDM 등)에 붙여 넣으면 훨씬 빨라집니다.',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: '언어',
  },
  de: {
    metaTitle: 'MagiesTerminal — KI-gestützter SSH-Arbeitsplatz',
    metaDesc:
      'MagiesTerminal ist ein moderner plattformübergreifender SSH-Client, SFTP-Browser und Terminal-Arbeitsplatz mit Mosh/Telnet, Portweiterleitung, Host-Vault und integriertem KI-Agenten.',
    headline: 'Ihre Serverflotte in einem Arbeitsplatz',
    sub: 'KI-gestützter SSH-Client, SFTP-Browser und Terminal-Manager. Vault, Splits, Portweiterleitung, Mosh und integrierter Agent für den Alltag.',
    ctaDownload: 'Herunterladen',
    navFeatures: 'Funktionen',
    navPlatform: 'Zuverlässig',
    navAgent: 'Agent',
    navDownload: 'Download',
    galleryAlt1: 'MagiesTerminal-Arbeitsplatz-Screenshot',
    galleryAlt2: 'MagiesTerminal Split-Terminal-Screenshot',
    galleryAlt3: 'MagiesTerminal SFTP- und Dateimanager-Screenshot',
    galleryAlt4: 'MagiesTerminal Host-Vault-Screenshot',
    agentShotAlt: 'Magies-Agent-Einstellungen-Screenshot',
    macIntelHint: 'Auf Intel-Macs „Intel · DMG“ wählen.',
    releasesLabel: 'Änderungsprotokoll',
    changelogClose: 'Schließen',
    changelogLoading: 'Änderungsprotokoll wird geladen…',
    changelogError: 'Änderungsprotokoll konnte nicht geladen werden. Bitte später erneut versuchen.',
    changelogEmpty: 'Noch keine Einträge.',
    contactLabel: 'Kontakt',
    contactTitle: 'Kontakt',
    contactLead: 'Fragen? Schreiben Sie uns — kopieren Sie die Adresse mit dem Button unten.',
    contactCopy: 'E-Mail kopieren',
    contactCopied: 'E-Mail kopiert',
    navWhy: 'Warum',
    whyLabel: 'Vergleich',
    whyTitle: 'Mehr als ein weiteres Terminalfenster',
    whyLead: 'Für den Ops-Alltag: Hosts, Dateien, Sitzungen und KI in einem Arbeitsplatz.',
    whyItems: [
      { title: 'Host-Vault', body: 'Suche, Gruppen, Tags und Health-Snapshots — Hunderte Hosts im Blick.' },
      { title: 'Shell + SFTP zusammen', body: 'Configs, Logs und Transfers ohne App-Wechsel.' },
      { title: 'KI-Ops-Partner', body: 'Diagnose und Orchestrierung in natürlicher Sprache; große Modelle oder Cursor Agent.' },
      { title: 'Multi-Protokoll · kostenlos', body: 'SSH / Mosh / Telnet / seriell auf macOS, Windows und Linux.' },
    ],
    trustItems: ['SSH · Mosh · Telnet', 'SFTP', 'AI Agent', 'Portweiterleitung', 'Kostenlos'],
    legalPrivacy: 'Datenschutz',
    legalTerms: 'Nutzungsbedingungen',
    skipToContent: 'Zum Inhalt springen',
    featuresLabel: 'Arbeitsplatz',
    featuresTitle: 'Für den Dauerbetrieb gebaut',
    featuresLead: 'Kein einzelnes Terminal — ein Schreibtisch für Hosts, Dateien, Tunnel und KI den ganzen Tag.',
    features: [
      {
        title: 'Host-Vault',
        body: 'Raster-, Listen- und Baumansicht mit Gruppen, Tags, Verbindungsdiagnose und Batch-Health-Snapshots — auch bei Hunderten Hosts.',
      },
      {
        title: 'Split-Terminals',
        body: 'Horizontale und vertikale Splits, Tabs, Sitzungswiederherstellung, Broadcast-Eingabe und Snippets für parallele Abläufe.',
      },
      {
        title: 'SFTP + Editor',
        body: 'Zweipaneelige Ansicht, Drag-and-Drop mit Fortsetzen / Auto-Retry / Prüfsumme und In-App-Editor.',
      },
      {
        title: 'Multi-Protokoll',
        body: 'SSH, Telnet, Mosh, seriell und lokale Terminals — mit Jump-Hosts, Proxys und SSH Agent an einem Ort.',
      },
      {
        title: 'Portweiterleitung',
        body: 'Lokale und dynamische Tunnel nutzen die authentifizierte SSH-Sitzung — kein zweites Passwort oder 2FA.',
      },
      {
        title: 'Themes & Schnellaktionen',
        body: 'UI- und Terminal-Theme-Vorschauen, Keyword-Highlights, Befehlspalette und zehn UI-Sprachen.',
      },
    ],
    platformLabel: 'Zuverlässig & sicher',
    platformTitle: 'Gebaut für den Dauerbetrieb',
    platformLead: 'Auto-Updates, verschlüsselte Zugangsdaten und ein Host-Ops-Panel — weniger Tool-Wechsel.',
    platformItems: [
      {
        title: 'Auto-Update auf allen Plattformen',
        body: 'Prüft nach dem Start auf Updates, lädt im Hintergrund und installiert per Neustart. Fortschritt in den Einstellungen auf macOS, Windows und Linux.',
      },
      {
        title: 'Lokale Credential-Verschlüsselung',
        body: 'API-Keys und Host-Geheimnisse nutzen die OS-Keychain oder einen lokalen Tresor — nie Klartext. SSH-Host-Key-Prüfung standardmäßig aktiv gegen MITM.',
      },
      {
        title: 'System-Manager-Panel',
        body: 'Überblick über CPU, Speicher, Festplatte und Latenz; Prozesse, Docker und tmux ohne extra Monitor-App verwalten.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Mit Servern sprechen',
    agentLead:
      'Ein integrierter KI-Partner versteht Ihre Umgebung, arbeitet mit großen Modellen und Cursor Agent, führt Befehle aus, diagnostiziert und orchestriert Hosts.',
    agentPoints: [
      { title: 'Natürliche Sprache', body: 'Sagen Sie, was Sie brauchen — optional mit Websuche für mehr Kontext.' },
      { title: 'Live-Diagnose', body: 'Status, Logs und Ressourcen in Sekunden mit klaren nächsten Schritten.' },
      { title: 'Multi-Host-Orchestrierung', body: 'Cluster und Deployments in einem Gespräch — Sidebar und Shell nebeneinander.' },
    ],
    downloadLabel: 'Loslegen',
    downloadTitle: 'MagiesTerminal herunterladen',
    downloadLead: (version) => `Version ${version} · OS wählen, dann Build laden`,
    downloadLeadLoading: 'Neueste Version wird geladen…',
    selectOs: 'Betriebssystem wählen',
    pickVersion: 'Build zum Download wählen',
    changeOs: 'OS ändern',
    recommended: 'Empfohlen',
    unavailable: 'Nicht verfügbar',
    unsignedTitle: 'Nach der Installation',
    unsignedMac: {
      lead: 'Nach dem Ziehen in Programme diesen Befehl im Terminal ausführen (neuere macOS haben oft kein „Trotzdem öffnen“):',
      command: macCmd,
      copyLabel: 'Befehl kopieren',
      copiedLabel: 'Kopiert',
    },
    unsignedWin: {
      lead: 'Der Windows-Build ist noch nicht signiert. SmartScreen kann vor einem unbekannten Herausgeber warnen — so fortfahren:',
      steps: [
        'In SmartScreen „Weitere Informationen“ → „Trotzdem ausführen“.',
        'Oder Installer rechtsklicken → Eigenschaften → „Zulassen“ → Übernehmen, dann starten.',
        'Bei Defender-Quarantäne unter „Viren- & Bedrohungsschutz → Schutzverlauf“ zulassen.',
      ],
    },
    androidSideload: {
      title: 'Android APK',
      lead: 'Companion app (sideload, no store required).',
      steps: [
        'Download the APK',
        'Allow unknown sources if prompted',
        'Open the APK to install',
      ],
    },
    cnSpeedHint:
      'Tipp: Bei langsamem Download den Link in einen Multithread-Downloader (IDM, NDM usw.) kopieren.',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Sprache',
  },
  fr: {
    metaTitle: 'MagiesTerminal — Espace de travail SSH piloté par l’IA',
    metaDesc:
      'MagiesTerminal est un client SSH multiplateforme moderne, un navigateur SFTP et un espace terminal avec Mosh/Telnet, transfert de ports, coffre d’hôtes et agent IA intégré.',
    headline: 'Votre flotte de serveurs, un seul espace',
    sub: 'Client SSH, navigateur SFTP et gestionnaire de terminaux pilotés par l’IA. Vault, splits, transfert de ports, Mosh et Agent intégré pour le quotidien.',
    ctaDownload: 'Télécharger',
    navFeatures: 'Fonctions',
    navPlatform: 'Fiabilité',
    navAgent: 'Agent',
    navDownload: 'Télécharger',
    galleryAlt1: 'Capture de l’espace de travail MagiesTerminal',
    galleryAlt2: 'Capture du terminal scindé MagiesTerminal',
    galleryAlt3: 'Capture SFTP et gestion de fichiers MagiesTerminal',
    galleryAlt4: 'Capture du coffre d’hôtes MagiesTerminal',
    agentShotAlt: 'Capture des réglages Magies Agent',
    macIntelHint: 'Sur Mac Intel, choisissez « Intel · DMG ».',
    releasesLabel: 'Journal des versions',
    changelogClose: 'Fermer',
    changelogLoading: 'Chargement du journal…',
    changelogError: 'Impossible de charger le journal. Réessayez plus tard.',
    changelogEmpty: 'Aucune note de version pour le moment.',
    contactLabel: 'Contact',
    contactTitle: 'Contact',
    contactLead: 'Des questions ? Écrivez-nous — copiez l’adresse avec le bouton ci-dessous.',
    contactCopy: 'Copier l’e-mail',
    contactCopied: 'E-mail copié',
    navWhy: 'Pourquoi',
    whyLabel: 'Comparaison',
    whyTitle: 'Plus qu’une autre fenêtre de terminal',
    whyLead: 'Pour l’ops au quotidien : hôtes, fichiers, sessions et IA dans un seul espace.',
    whyItems: [
      { title: 'Coffre d’hôtes', body: 'Recherche, groupes, tags et instantanés de santé — des centaines d’hôtes sans vous perdre.' },
      { title: 'Shell + SFTP ensemble', body: 'Configs, logs et transferts sans changer d’app.' },
      { title: 'Partenaire ops IA', body: 'Diagnostiquez et orchestrez en langage naturel ; modèles majeurs ou Cursor Agent.' },
      { title: 'Multi-protocole · gratuit', body: 'SSH / Mosh / Telnet / série sur macOS, Windows et Linux.' },
    ],
    trustItems: ['SSH · Mosh · Telnet', 'SFTP', 'AI Agent', 'Transfert de ports', 'Gratuit'],
    legalPrivacy: 'Confidentialité',
    legalTerms: 'Conditions',
    skipToContent: 'Aller au contenu',
    featuresLabel: 'Espace de travail',
    featuresTitle: 'Conçu pour l’exploitation au long cours',
    featuresLead: 'Pas une simple fenêtre de terminal — un bureau pour hôtes, fichiers, tunnels et IA toute la journée.',
    features: [
      {
        title: 'Coffre d’hôtes',
        body: 'Vues grille, liste et arbre avec groupes, tags, diagnostic de connexion et instantanés de santé par lot — même pour des centaines d’hôtes.',
      },
      {
        title: 'Terminaux scindés',
        body: 'Splits horizontaux et verticaux, onglets, restauration de session, saisie diffusée et extraits pour travailler côte à côte.',
      },
      {
        title: 'SFTP + éditeur',
        body: 'Double volet, transferts glisser-déposer avec reprise / nouvelle tentative / somme de contrôle, éditeur intégré.',
      },
      {
        title: 'Multi-protocole',
        body: 'SSH, Telnet, Mosh, série et terminaux locaux — jump hosts, proxys et SSH Agent au même endroit.',
      },
      {
        title: 'Transfert de ports',
        body: 'Tunnels locaux et dynamiques qui réutilisent la session SSH authentifiée — sans second mot de passe ni 2FA.',
      },
      {
        title: 'Thèmes et actions rapides',
        body: 'Aperçus de thèmes UI et terminal, surlignage de mots-clés, palette de commandes et dix langues d’interface.',
      },
    ],
    platformLabel: 'Fiable et sûr',
    platformTitle: 'Conçu pour rester installé',
    platformLead: 'Mises à jour auto, identifiants chiffrés et panneau d’ops sur l’hôte — moins d’outils à jongler.',
    platformItems: [
      {
        title: 'Mise à jour auto partout',
        body: 'Vérifie les mises à jour au lancement, télécharge en arrière-plan, puis redémarrage en un clic. Progression dans Réglages sur macOS, Windows et Linux.',
      },
      {
        title: 'Chiffrement local des secrets',
        body: 'Clés API et secrets d’hôte via le trousseau OS ou un coffre local chiffré — jamais en clair. Vérification des clés SSH hôtes activée par défaut contre le MITM.',
      },
      {
        title: 'Panneau gestion système',
        body: 'Vue d’ensemble CPU, mémoire, disque et latence ; processus, Docker et tmux sans autre outil de monitoring.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Parlez à vos serveurs',
    agentLead:
      'Un partenaire IA intégré comprend votre environnement, s’appuie sur les grands modèles et Cursor Agent, exécute des commandes, diagnostique et coordonne les hôtes.',
    agentPoints: [
      { title: 'Ops en langage naturel', body: 'Dites ce dont vous avez besoin — recherche web optionnelle pour plus de contexte.' },
      { title: 'Diagnostic en direct', body: 'État, journaux et ressources résumés en quelques secondes avec les prochaines étapes.' },
      { title: 'Orchestration multi-hôtes', body: 'Clusters et déploiements en une conversation, panneau latéral et shell côte à côte.' },
    ],
    downloadLabel: 'Commencer',
    downloadTitle: 'Télécharger MagiesTerminal',
    downloadLead: (version) => `Version ${version} · Choisissez l’OS, puis le build`,
    downloadLeadLoading: 'Récupération de la dernière version…',
    selectOs: 'Choisir le système',
    pickVersion: 'Choisir un build à télécharger',
    changeOs: 'Changer d’OS',
    recommended: 'Recommandé',
    unavailable: 'Indisponible',
    unsignedTitle: 'Après l’installation',
    unsignedMac: {
      lead: 'Après l’avoir glissé dans Applications, exécutez cette commande dans Terminal (les macOS récents n’ont souvent pas « Ouvrir quand même ») :',
      command: macCmd,
      copyLabel: 'Copier la commande',
      copiedLabel: 'Copié',
    },
    unsignedWin: {
      lead: 'Le build Windows n’est pas encore signé. SmartScreen peut signaler un éditeur inconnu — continuez ainsi :',
      steps: [
        'Dans SmartScreen, cliquez Infos complémentaires → Exécuter quand même.',
        'Ou clic droit sur l’installateur → Propriétés → Débloquer → Appliquer, puis relancer.',
        'Si Defender l’a mis en quarantaine, autorisez-le sous Protection contre les virus → Historique.',
      ],
    },
    androidSideload: {
      title: 'Android APK',
      lead: 'Companion app (sideload, no store required).',
      steps: [
        'Download the APK',
        'Allow unknown sources if prompted',
        'Open the APK to install',
      ],
    },
    cnSpeedHint:
      'Astuce : si le téléchargement est lent, copiez le lien dans un gestionnaire multi-thread (IDM, NDM, etc.).',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Langue',
  },
  es: {
    metaTitle: 'MagiesTerminal — Espacio de trabajo SSH con IA',
    metaDesc:
      'MagiesTerminal es un cliente SSH multiplataforma moderno, navegador SFTP y espacio de terminal con Mosh/Telnet, reenvío de puertos, vault de hosts y un agente de IA integrado.',
    headline: 'Tu flota de servidores, en un solo espacio',
    sub: 'Cliente SSH, navegador SFTP y gestor de terminales con IA. Vault, divisiones, reenvío de puertos, Mosh y Agent integrado para el día a día.',
    ctaDownload: 'Descargar',
    navFeatures: 'Funciones',
    navPlatform: 'Fiable',
    navAgent: 'Agent',
    navDownload: 'Descargar',
    galleryAlt1: 'Captura del espacio de trabajo MagiesTerminal',
    galleryAlt2: 'Captura del terminal dividido MagiesTerminal',
    galleryAlt3: 'Captura de SFTP y gestión de archivos MagiesTerminal',
    galleryAlt4: 'Captura del vault de hosts MagiesTerminal',
    agentShotAlt: 'Captura de ajustes de Magies Agent',
    macIntelHint: 'En Mac Intel, elige «Intel · DMG».',
    releasesLabel: 'Registro de cambios',
    changelogClose: 'Cerrar',
    changelogLoading: 'Cargando registro…',
    changelogError: 'No se pudo cargar el registro. Inténtalo más tarde.',
    changelogEmpty: 'Aún no hay notas de versión.',
    contactLabel: 'Contacto',
    contactTitle: 'Contacto',
    contactLead: '¿Dudas? Escríbenos — copia la dirección con el botón de abajo.',
    contactCopy: 'Copiar correo',
    contactCopied: 'Correo copiado',
    navWhy: 'Por qué',
    whyLabel: 'Comparación',
    whyTitle: 'Más que otra ventana de terminal',
    whyLead: 'Para el ops diario: hosts, archivos, sesiones e IA en un solo espacio.',
    whyItems: [
      { title: 'Vault de hosts', body: 'Búsqueda, grupos, etiquetas e instantáneas de salud: cientos de hosts sin perderte.' },
      { title: 'Shell + SFTP juntos', body: 'Configs, logs y transferencias sin cambiar de app.' },
      { title: 'Socio de ops con IA', body: 'Diagnostica y orquesta en lenguaje natural; modelos principales o Cursor Agent.' },
      { title: 'Multiprotocolo · gratis', body: 'SSH / Mosh / Telnet / serie en macOS, Windows y Linux.' },
    ],
    trustItems: ['SSH · Mosh · Telnet', 'SFTP', 'AI Agent', 'Reenvío de puertos', 'Gratis'],
    legalPrivacy: 'Privacidad',
    legalTerms: 'Términos',
    skipToContent: 'Saltar al contenido',
    featuresLabel: 'Espacio de trabajo',
    featuresTitle: 'Hecho para operaciones prolongadas',
    featuresLead: 'No es una sola ventana de terminal: un puesto para hosts, archivos, túneles e IA todo el día.',
    features: [
      {
        title: 'Vault de hosts',
        body: 'Cuadrícula, lista y árbol con grupos, etiquetas, diagnóstico de conexión e instantáneas de salud por lotes, incluso con cientos de hosts.',
      },
      {
        title: 'Terminales divididos',
        body: 'Divisiones horizontales y verticales, pestañas, restauración de sesión, entrada en difusión y fragmentos para trabajar en paralelo.',
      },
      {
        title: 'SFTP + editor',
        body: 'Doble panel, transferencias arrastrar y soltar con reanudación / reintento / suma de verificación, y editor integrado.',
      },
      {
        title: 'Multiprotocolo',
        body: 'SSH, Telnet, Mosh, serie y terminales locales: jump hosts, proxies y SSH Agent en un solo lugar.',
      },
      {
        title: 'Reenvío de puertos',
        body: 'Túneles locales y dinámicos que reutilizan la sesión SSH autenticada: sin segunda contraseña ni 2FA.',
      },
      {
        title: 'Temas y acciones rápidas',
        body: 'Vistas previas de temas de UI y terminal, resaltado de palabras clave, paleta de comandos y diez idiomas de interfaz.',
      },
    ],
    platformLabel: 'Fiable y seguro',
    platformTitle: 'Hecho para quedarse instalado',
    platformLead: 'Actualizaciones auto, credenciales cifradas y panel de ops en el host: menos herramientas que alternar.',
    platformItems: [
      {
        title: 'Actualización auto en todas las plataformas',
        body: 'Comprueba actualizaciones al iniciar, descarga en segundo plano y reinicia con un clic. El progreso se ve en Ajustes en macOS, Windows y Linux.',
      },
      {
        title: 'Cifrado local de credenciales',
        body: 'Claves API y secretos del host usan el llavero del SO o un vault cifrado local — nunca en texto plano. La verificación de claves SSH del host va activada por defecto contra MITM.',
      },
      {
        title: 'Panel de gestión del sistema',
        body: 'Resumen de CPU, memoria, disco y latencia; gestiona procesos, Docker y tmux sin otra app de monitorización.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Habla con tus servidores',
    agentLead:
      'Un socio de IA integrado entiende tu entorno, trabaja con modelos principales y Cursor Agent, ejecuta comandos, diagnostica y coordina hosts.',
    agentPoints: [
      { title: 'Ops en lenguaje natural', body: 'Di lo que necesitas: búsqueda web opcional para más contexto.' },
      { title: 'Diagnóstico en vivo', body: 'Estado, logs y recursos resumidos en segundos con siguientes pasos claros.' },
      { title: 'Orquestación multihost', body: 'Clústeres y despliegues en una conversación, barra lateral y shell juntos.' },
    ],
    downloadLabel: 'Empezar',
    downloadTitle: 'Descargar MagiesTerminal',
    downloadLead: (version) => `Versión ${version} · Elige el SO y luego el build`,
    downloadLeadLoading: 'Obteniendo la última versión…',
    selectOs: 'Elegir sistema',
    pickVersion: 'Elegir un build para descargar',
    changeOs: 'Cambiar SO',
    recommended: 'Recomendado',
    unavailable: 'No disponible',
    unsignedTitle: 'Tras instalar',
    unsignedMac: {
      lead: 'Tras arrastrarlo a Aplicaciones, ejecuta este comando en Terminal (en macOS recientes a menudo no hay «Abrir de todos modos»):',
      command: macCmd,
      copyLabel: 'Copiar comando',
      copiedLabel: 'Copiado',
    },
    unsignedWin: {
      lead: 'El build de Windows aún no está firmado. SmartScreen puede avisar de un editor desconocido — continúa así:',
      steps: [
        'En SmartScreen, Más información → Ejecutar de todos modos.',
        'O clic derecho en el instalador → Propiedades → Desbloquear → Aplicar, y vuelve a ejecutar.',
        'Si Defender lo puso en cuarentena, permítelo en Protección frente a virus → Historial.',
      ],
    },
    androidSideload: {
      title: 'Android APK',
      lead: 'Companion app (sideload, no store required).',
      steps: [
        'Download the APK',
        'Allow unknown sources if prompted',
        'Open the APK to install',
      ],
    },
    cnSpeedHint:
      'Consejo: si la descarga es lenta, copia el enlace en un gestor multiproceso (IDM, NDM, etc.).',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Idioma',
  },
  pt: {
    metaTitle: 'MagiesTerminal — Espaço de trabalho SSH com IA',
    metaDesc:
      'MagiesTerminal é um cliente SSH multiplataforma moderno, navegador SFTP e espaço de terminal com Mosh/Telnet, encaminhamento de portas, vault de hosts e agente de IA integrado.',
    headline: 'Sua frota de servidores, em um só espaço',
    sub: 'Cliente SSH, navegador SFTP e gerenciador de terminais com IA. Vault, divisões, encaminhamento de portas, Mosh e Agent integrado para o dia a dia.',
    ctaDownload: 'Baixar',
    navFeatures: 'Recursos',
    navPlatform: 'Confiável',
    navAgent: 'Agent',
    navDownload: 'Baixar',
    galleryAlt1: 'Captura do espaço de trabalho MagiesTerminal',
    galleryAlt2: 'Captura do terminal dividido MagiesTerminal',
    galleryAlt3: 'Captura de SFTP e gestão de arquivos MagiesTerminal',
    galleryAlt4: 'Captura do vault de hosts MagiesTerminal',
    agentShotAlt: 'Captura das configurações do Magies Agent',
    macIntelHint: 'Em Macs Intel, escolha «Intel · DMG».',
    releasesLabel: 'Notas de versão',
    changelogClose: 'Fechar',
    changelogLoading: 'Carregando notas…',
    changelogError: 'Não foi possível carregar as notas. Tente novamente mais tarde.',
    changelogEmpty: 'Ainda não há notas de versão.',
    contactLabel: 'Contato',
    contactTitle: 'Contato',
    contactLead: 'Dúvidas? Envie um e-mail — use o botão abaixo para copiar o endereço.',
    contactCopy: 'Copiar e-mail',
    contactCopied: 'E-mail copiado',
    navWhy: 'Por quê',
    whyLabel: 'Comparação',
    whyTitle: 'Mais do que outra janela de terminal',
    whyLead: 'Para o ops do dia a dia: hosts, arquivos, sessões e IA num só espaço.',
    whyItems: [
      { title: 'Vault de hosts', body: 'Busca, grupos, tags e snapshots de saúde — centenas de hosts sem se perder.' },
      { title: 'Shell + SFTP juntos', body: 'Configs, logs e transferências sem trocar de app.' },
      { title: 'Parceiro de ops com IA', body: 'Diagnostique e orquestre em linguagem natural; modelos principais ou Cursor Agent.' },
      { title: 'Multiprotocolo · grátis', body: 'SSH / Mosh / Telnet / serial no macOS, Windows e Linux.' },
    ],
    trustItems: ['SSH · Mosh · Telnet', 'SFTP', 'AI Agent', 'Encaminhamento de portas', 'Grátis'],
    legalPrivacy: 'Privacidade',
    legalTerms: 'Termos',
    skipToContent: 'Ir para o conteúdo',
    featuresLabel: 'Espaço de trabalho',
    featuresTitle: 'Feito para operação contínua',
    featuresLead: 'Não é uma única janela de terminal — uma bancada para hosts, arquivos, túneis e IA o dia inteiro.',
    features: [
      {
        title: 'Vault de hosts',
        body: 'Grade, lista e árvore com grupos, tags, diagnóstico de conexão e snapshots de saúde em lote — mesmo com centenas de hosts.',
      },
      {
        title: 'Terminais divididos',
        body: 'Divisões horizontais e verticais, abas, restauração de sessão, entrada em broadcast e snippets para fluxos lado a lado.',
      },
      {
        title: 'SFTP + editor',
        body: 'Painel duplo, transferências arrastar e soltar com retomada / nova tentativa / checksum, e editor no app.',
      },
      {
        title: 'Multiprotocolo',
        body: 'SSH, Telnet, Mosh, serial e terminais locais — jump hosts, proxies e SSH Agent num só lugar.',
      },
      {
        title: 'Encaminhamento de portas',
        body: 'Túneis locais e dinâmicos que reutilizam a sessão SSH autenticada — sem segunda senha ou 2FA.',
      },
      {
        title: 'Temas e ações rápidas',
        body: 'Prévia de temas de UI e terminal, destaque de palavras-chave, paleta de comandos e dez idiomas de interface.',
      },
    ],
    platformLabel: 'Confiável e seguro',
    platformTitle: 'Feito para ficar instalado',
    platformLead: 'Atualizações auto, credenciais criptografadas e painel de ops no host — menos troca de ferramentas.',
    platformItems: [
      {
        title: 'Atualização automática em todas as plataformas',
        body: 'Verifica atualizações ao iniciar, baixa em segundo plano e instala com um reinício. Progresso em Configurações no macOS, Windows e Linux.',
      },
      {
        title: 'Criptografia local de credenciais',
        body: 'Chaves de API e segredos do host usam o keychain do SO ou um vault criptografado local — nunca em texto puro. Verificação de host key SSH ativa por padrão contra MITM.',
      },
      {
        title: 'Painel de gerenciamento do sistema',
        body: 'Visão de CPU, memória, disco e latência; gerencie processos, Docker e tmux sem outro app de monitoramento.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Fale com seus servidores',
    agentLead:
      'Um parceiro de IA integrado entende seu ambiente, trabalha com modelos principais e Cursor Agent, executa comandos, diagnostica e coordena hosts.',
    agentPoints: [
      { title: 'Ops em linguagem natural', body: 'Diga o que precisa — busca web opcional para mais contexto.' },
      { title: 'Diagnóstico ao vivo', body: 'Saúde, logs e recursos resumidos em segundos com próximos passos claros.' },
      { title: 'Orquestração multihost', body: 'Clusters e deploys em uma conversa, barra lateral e shell lado a lado.' },
    ],
    downloadLabel: 'Começar',
    downloadTitle: 'Baixar MagiesTerminal',
    downloadLead: (version) => `Versão ${version} · Escolha o SO e depois o build`,
    downloadLeadLoading: 'Buscando a versão mais recente…',
    selectOs: 'Escolher sistema',
    pickVersion: 'Escolher um build para baixar',
    changeOs: 'Trocar SO',
    recommended: 'Recomendado',
    unavailable: 'Indisponível',
    unsignedTitle: 'Após instalar',
    unsignedMac: {
      lead: 'Depois de arrastar para Aplicativos, execute este comando no Terminal (macOS mais novos muitas vezes não têm “Abrir mesmo assim”):',
      command: macCmd,
      copyLabel: 'Copiar comando',
      copiedLabel: 'Copiado',
    },
    unsignedWin: {
      lead: 'O build Windows ainda não é assinado. O SmartScreen pode avisar sobre editor desconhecido — continue assim:',
      steps: [
        'No SmartScreen, Mais informações → Executar mesmo assim.',
        'Ou clique com o botão direito no instalador → Propriedades → Desbloquear → Aplicar e execute de novo.',
        'Se o Defender colocou em quarentena, permita em Proteção contra vírus → Histórico.',
      ],
    },
    androidSideload: {
      title: 'Android APK',
      lead: 'Companion app (sideload, no store required).',
      steps: [
        'Download the APK',
        'Allow unknown sources if prompted',
        'Open the APK to install',
      ],
    },
    cnSpeedHint:
      'Dica: se o download estiver lento, copie o link para um gerenciador multithread (IDM, NDM etc.).',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Idioma',
  },
  ru: {
    metaTitle: 'MagiesTerminal — SSH-рабочее место с ИИ',
    metaDesc:
      'MagiesTerminal — современный кроссплатформенный SSH-клиент, SFTP-браузер и терминальное рабочее место с Mosh/Telnet, пробросом портов, хранилищем хостов и встроенным ИИ-агентом.',
    headline: 'Ваш флот серверов — в одном рабочем месте',
    sub: 'SSH-клиент, SFTP-браузер и менеджер терминалов с ИИ. Vault, сплиты, проброс портов, Mosh и встроенный Agent для ежедневной работы.',
    ctaDownload: 'Скачать',
    navFeatures: 'Возможности',
    navPlatform: 'Надёжность',
    navAgent: 'Agent',
    navDownload: 'Скачать',
    galleryAlt1: 'Скриншот рабочего места MagiesTerminal',
    galleryAlt2: 'Скриншот разделённого терминала MagiesTerminal',
    galleryAlt3: 'Скриншот SFTP и файлового менеджера MagiesTerminal',
    galleryAlt4: 'Скриншот хранилища хостов MagiesTerminal',
    agentShotAlt: 'Скриншот настроек Magies Agent',
    macIntelHint: 'На Intel Mac выберите «Intel · DMG».',
    releasesLabel: 'История изменений',
    changelogClose: 'Закрыть',
    changelogLoading: 'Загрузка истории…',
    changelogError: 'Не удалось загрузить историю. Попробуйте позже.',
    changelogEmpty: 'Пока нет записей об изменениях.',
    contactLabel: 'Связаться',
    contactTitle: 'Связаться',
    contactLead: 'Вопросы? Напишите нам — скопируйте адрес кнопкой ниже.',
    contactCopy: 'Копировать email',
    contactCopied: 'Email скопирован',
    navWhy: 'Почему',
    whyLabel: 'Сравнение',
    whyTitle: 'Больше, чем ещё одно окно терминала',
    whyLead: 'Для ежедневных ops: хосты, файлы, сессии и ИИ в одном рабочем месте.',
    whyItems: [
      { title: 'Хранилище хостов', body: 'Поиск, группы, теги и снимки здоровья — сотни хостов без путаницы.' },
      { title: 'Shell + SFTP вместе', body: 'Конфиги, логи и передачи без смены приложений.' },
      { title: 'ИИ-партнёр для ops', body: 'Диагностика и оркестрация на естественном языке; крупные модели или Cursor Agent.' },
      { title: 'Мультипротокол · бесплатно', body: 'SSH / Mosh / Telnet / serial на macOS, Windows и Linux.' },
    ],
    trustItems: ['SSH · Mosh · Telnet', 'SFTP', 'AI Agent', 'Проброс портов', 'Бесплатно'],
    legalPrivacy: 'Конфиденциальность',
    legalTerms: 'Условия',
    skipToContent: 'К содержимому',
    featuresLabel: 'Рабочее место',
    featuresTitle: 'Для долгой эксплуатации',
    featuresLead: 'Не одно окно терминала — стол для хостов, файлов, туннелей и ИИ на весь день.',
    features: [
      {
        title: 'Хранилище хостов',
        body: 'Сетка, список и дерево с группами, тегами, диагностикой подключения и пакетными снимками здоровья — даже для сотен хостов.',
      },
      {
        title: 'Разделённые терминалы',
        body: 'Горизонтальные и вертикальные сплиты, вкладки, восстановление сессий, broadcast-ввод и сниппеты для параллельной работы.',
      },
      {
        title: 'SFTP + редактор',
        body: 'Двойная панель, drag-and-drop с возобновлением / автоповтором / контрольной суммой и встроенный редактор.',
      },
      {
        title: 'Мультипротокол',
        body: 'SSH, Telnet, Mosh, serial и локальные терминалы — jump hosts, прокси и SSH Agent в одном месте.',
      },
      {
        title: 'Проброс портов',
        body: 'Локальные и динамические туннели переиспользуют аутентифицированную SSH-сессию — без второго пароля и 2FA.',
      },
      {
        title: 'Темы и быстрые действия',
        body: 'Превью тем UI и терминала, подсветка ключевых слов, палитра команд и десять языков интерфейса.',
      },
    ],
    platformLabel: 'Надёжность и безопасность',
    platformTitle: 'Сделано, чтобы оставаться установленным',
    platformLead: 'Автообновления, шифрование учётных данных и панель ops на хосте — меньше переключений между инструментами.',
    platformItems: [
      {
        title: 'Автообновление на всех платформах',
        body: 'Проверяет обновления после запуска, скачивает в фоне и ставит одним перезапуском. Прогресс виден в Настройках на macOS, Windows и Linux.',
      },
      {
        title: 'Локальное шифрование секретов',
        body: 'API-ключи и секреты хостов — в связке ключей ОС или локальном зашифрованном хранилище, без отката в plaintext. Проверка SSH host key включена по умолчанию против MITM.',
      },
      {
        title: 'Панель системного управления',
        body: 'Обзор CPU, памяти, диска и задержки; процессы, Docker и tmux без отдельного мониторинга.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Говорите с серверами',
    agentLead:
      'Встроенный ИИ-партнёр понимает окружение, работает с крупными моделями и Cursor Agent, выполняет команды, диагностирует и координирует хосты.',
    agentPoints: [
      { title: 'Операции на естественном языке', body: 'Скажите, что нужно — при необходимости веб-поиск дополнит контекст.' },
      { title: 'Живая диагностика', body: 'Состояние, логи и ресурсы за секунды с понятными следующими шагами.' },
      { title: 'Мультихост-оркестрация', body: 'Кластеры и деплои в одном диалоге — боковая панель и shell рядом.' },
    ],
    downloadLabel: 'Начать',
    downloadTitle: 'Скачать MagiesTerminal',
    downloadLead: (version) => `Версия ${version} · Выберите ОС, затем сборку`,
    downloadLeadLoading: 'Получение последней версии…',
    selectOs: 'Выберите систему',
    pickVersion: 'Выберите сборку для загрузки',
    changeOs: 'Сменить ОС',
    recommended: 'Рекомендуется',
    unavailable: 'Недоступно',
    unsignedTitle: 'После установки',
    unsignedMac: {
      lead: 'После перетаскивания в «Программы» выполните в Terminal одну команду (в новых macOS часто нет «Всё равно открыть»):',
      command: macCmd,
      copyLabel: 'Копировать команду',
      copiedLabel: 'Скопировано',
    },
    unsignedWin: {
      lead: 'Сборка Windows ещё не подписана. SmartScreen может предупредить о неизвестном издателе — продолжайте так:',
      steps: [
        'В SmartScreen: Подробнее → Выполнить в любом случае.',
        'Или ПКМ по установщику → Свойства → Разблокировать → Применить, затем запустите снова.',
        'Если Defender поместил в карантин, разрешите файл в Защита от вирусов → Журнал.',
      ],
    },
    androidSideload: {
      title: 'Android APK',
      lead: 'Companion app (sideload, no store required).',
      steps: [
        'Download the APK',
        'Allow unknown sources if prompted',
        'Open the APK to install',
      ],
    },
    cnSpeedHint:
      'Подсказка: если загрузка медленная, скопируйте ссылку в многопоточный менеджер (IDM, NDM и т.п.).',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Язык',
  },
}

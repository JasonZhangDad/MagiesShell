export type Lang = 'zh' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'de' | 'fr' | 'es' | 'pt' | 'ru'

export type CopyBundle = {
  metaTitle: string
  metaDesc: string
  headline: string
  sub: string
  ctaDownload: string
  navFeatures: string
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
  contactCopied: string
  featuresLabel: string
  featuresTitle: string
  featuresLead: string
  features: ReadonlyArray<{ title: string; body: string }>
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
  cnSpeedHint: string
  footerNote: string
  footerCopyright: string
  langAria: string
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
      'MagiesTerminal 是现代化的跨平台 SSH 客户端、SFTP 浏览器与终端工作空间。内置 AI Agent，让运维与多主机协作更高效。',
    headline: '把服务器舰队装进一个工作空间',
    sub: 'AI 驱动的 SSH 客户端、SFTP 浏览器与终端管理器。分屏、Vault、多主机编排，为日常运维而生。',
    ctaDownload: '立即下载',
    navFeatures: '功能',
    navAgent: 'Agent',
    navDownload: '下载',
    galleryAlt1: 'MagiesTerminal 工作区界面截图',
    galleryAlt2: 'MagiesTerminal 分屏与会话界面截图',
    galleryAlt3: 'MagiesTerminal SFTP 与文件管理截图',
    galleryAlt4: 'MagiesTerminal 主机库与连接管理截图',
    agentShotAlt: 'Magies Agent 设置界面截图',
    macIntelHint: 'Intel Mac 请选择「Intel · DMG」。',
    releasesLabel: '更新日志',
    changelogClose: '关闭',
    changelogLoading: '正在加载更新日志…',
    changelogError: '暂时无法获取更新日志，请稍后再试。',
    changelogEmpty: '暂无更新记录。',
    contactLabel: '问题咨询',
    contactCopied: '邮箱已复制',
    featuresLabel: '工作空间',
    featuresTitle: '为长期运维流设计',
    featuresLead: '不是单一终端窗口，而是可持续驻留的服务器工作台。',
    features: [
      { title: 'Vault 主机库', body: '网格 / 列表 / 树形视图，快速搜索与分组，让成百上千台主机仍然好找。' },
      { title: '分屏终端', body: '水平与垂直分割、标签页与会话恢复，多连接并排推进任务。' },
      { title: 'SFTP + 编辑器', body: '拖拽上传下载，内置编辑器就地改文件，文件流与终端流在同一处。' },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: '用自然语言指挥服务器',
    agentLead: '内置 AI 搭档理解你的环境，执行命令、诊断问题，并跨多台主机协同操作。',
    agentPoints: [
      { title: '自然语言运维', body: '直接说出需求，不再死记命令与参数。' },
      { title: '实时诊断', body: '检查状态、翻日志、盯资源，几秒给出清晰结论。' },
      { title: '多主机编排', body: '一次对话完成集群初始化、部署与节点协同。' },
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
    cnSpeedHint:
      '提示：下载速度较慢时，可复制下载链接到支持多线程的下载工具（如 IDM、NDM、迅雷）加速。',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: '语言',
  },
  'zh-TW': {
    metaTitle: 'MagiesTerminal — AI 驅動的 SSH 工作空間',
    metaDesc:
      'MagiesTerminal 是現代化的跨平台 SSH 用戶端、SFTP 瀏覽器與終端工作空間。內建 AI Agent，讓維運與多主機協作更有效率。',
    headline: '把伺服器艦隊裝進一個工作空間',
    sub: 'AI 驅動的 SSH 用戶端、SFTP 瀏覽器與終端管理器。分割畫面、Vault、多主機編排，為日常維運而生。',
    ctaDownload: '立即下載',
    navFeatures: '功能',
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
    contactCopied: '信箱已複製',
    featuresLabel: '工作空間',
    featuresTitle: '為長期維運流設計',
    featuresLead: '不是單一終端視窗，而是可持續駐留的伺服器工作台。',
    features: [
      { title: 'Vault 主機庫', body: '網格 / 列表 / 樹狀檢視，快速搜尋與分組，成百上千台主機依然好找。' },
      { title: '分割終端', body: '水平與垂直分割、分頁與工作階段還原，多連線並排推進任務。' },
      { title: 'SFTP + 編輯器', body: '拖放上傳下載，內建編輯器就地改檔，檔案流與終端流在同一處。' },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: '用自然語言指揮伺服器',
    agentLead: '內建 AI 夥伴理解你的環境，執行命令、診斷問題，並跨多台主機協同操作。',
    agentPoints: [
      { title: '自然語言維運', body: '直接說出需求，不必死記命令與參數。' },
      { title: '即時診斷', body: '檢查狀態、翻日誌、盯資源，幾秒給出清楚結論。' },
      { title: '多主機編排', body: '一次對話完成叢集初始化、部署與節點協同。' },
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
    cnSpeedHint: '提示：下載速度較慢時，可複製下載連結到支援多執行緒的下載工具加速。',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: '語言',
  },
  en: {
    metaTitle: 'MagiesTerminal — AI-Powered SSH Workspace',
    metaDesc:
      'MagiesTerminal is a modern cross-platform SSH client, SFTP browser, and terminal workspace with a built-in AI agent for multi-host ops.',
    headline: 'Your server fleet, in one workspace',
    sub: 'An AI-powered SSH client, SFTP browser, and terminal manager. Splits, Vault, and multi-host orchestration built for daily ops.',
    ctaDownload: 'Download',
    navFeatures: 'Features',
    navAgent: 'Agent',
    navDownload: 'Download',
    galleryAlt1: 'MagiesTerminal workspace screenshot',
    galleryAlt2: 'MagiesTerminal split terminal screenshot',
    galleryAlt3: 'MagiesTerminal SFTP and file manager screenshot',
    galleryAlt4: 'MagiesTerminal host vault screenshot',
    agentShotAlt: 'Magies Agent settings screenshot',
    macIntelHint: 'On Intel Macs, choose Intel · DMG.',
    releasesLabel: 'Changelog',
    changelogClose: 'Close',
    changelogLoading: 'Loading changelog…',
    changelogError: 'Could not load the changelog. Please try again later.',
    changelogEmpty: 'No release notes yet.',
    contactLabel: 'Contact',
    contactCopied: 'Email copied',
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
    agentLabel: 'Magies Agent',
    agentTitle: 'Talk to your servers',
    agentLead:
      'A built-in AI partner that understands your environment, runs commands, diagnoses issues, and coordinates across hosts.',
    agentPoints: [
      { title: 'Natural-language ops', body: 'Say what you need — stop memorizing flags.' },
      { title: 'Live diagnostics', body: 'Check health, inspect logs, and summarize resources in seconds.' },
      { title: 'Multi-host orchestration', body: 'Spin up clusters and deployments in one conversation.' },
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
    cnSpeedHint:
      'Tip: if the download is slow, copy the link into a multi-threaded download manager (IDM, NDM, etc.) for much faster speeds.',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Language',
  },
  ja: {
    metaTitle: 'MagiesTerminal — AI 駆動 SSH ワークスペース',
    metaDesc:
      'MagiesTerminal は、組み込み AI エージェントを備えた最新のクロスプラットフォーム SSH クライアント、SFTP ブラウザ、ターミナルワークスペースです。',
    headline: 'サーバー艦隊を、ひとつのワークスペースに',
    sub: 'AI 駆動の SSH クライアント、SFTP ブラウザ、ターミナル管理。分割表示、Vault、マルチホスト編成で日常運用を支えます。',
    ctaDownload: 'ダウンロード',
    navFeatures: '機能',
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
    contactCopied: 'メールをコピーしました',
    featuresLabel: 'ワークスペース',
    featuresTitle: '長時間の運用のために',
    featuresLead: '単なるターミナルウィンドウではなく、一日中使えるサーバー作業台です。',
    features: [
      { title: 'ホスト Vault', body: 'グリッド / リスト / ツリー表示と高速検索・グループ化で、数百台でも迷いません。' },
      { title: '分割ターミナル', body: '水平・垂直分割、タブ、セッション復元で複数接続を並べて進められます。' },
      { title: 'SFTP + エディタ', body: 'ドラッグ＆ドロップ転送とアプリ内編集で、ファイルとシェルが同じ場所に。' },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: '自然言語でサーバーを操作',
    agentLead: '環境を理解する AI パートナーが、コマンド実行・診断・複数ホスト連携を支援します。',
    agentPoints: [
      { title: '自然言語オペレーション', body: 'やりたいことを話すだけ。フラグを暗記する必要はありません。' },
      { title: 'ライブ診断', body: '状態確認、ログ、リソースを数秒で要約します。' },
      { title: 'マルチホスト編成', body: 'クラスター初期化やデプロイを一つの会話で。' },
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
    cnSpeedHint:
      'ヒント：ダウンロードが遅い場合は、リンクをマルチスレッド対応ダウンローダー（IDM など）に貼ると高速化できます。',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: '言語',
  },
  ko: {
    metaTitle: 'MagiesTerminal — AI 기반 SSH 워크스페이스',
    metaDesc:
      'MagiesTerminal은 내장 AI 에이전트가 있는 최신 크로스플랫폼 SSH 클라이언트, SFTP 브라우저, 터미널 워크스페이스입니다.',
    headline: '서버 함대를 하나의 워크스페이스에',
    sub: 'AI 기반 SSH 클라이언트, SFTP 브라우저, 터미널 관리자. 분할, Vault, 멀티 호스트 오케스트레이션으로 일상 운영을 지원합니다.',
    ctaDownload: '다운로드',
    navFeatures: '기능',
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
    contactCopied: '이메일이 복사됨',
    featuresLabel: '워크스페이스',
    featuresTitle: '장시간 운영을 위해',
    featuresLead: '단일 터미널 창이 아니라, 하루 종일 머무는 서버 작업대입니다.',
    features: [
      { title: '호스트 Vault', body: '그리드 / 목록 / 트리 보기와 빠른 검색·그룹화로 수백 대도 쉽게 찾습니다.' },
      { title: '분할 터미널', body: '수평·수직 분할, 탭, 세션 복원으로 여러 연결을 나란히 진행합니다.' },
      { title: 'SFTP + 편집기', body: '드래그 앤 드롭 전송과 앱 내 편집으로 파일과 셸이 한곳에.' },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: '자연어로 서버를 지휘',
    agentLead: '환경을 이해하는 AI 파트너가 명령 실행, 진단, 다중 호스트 협업을 돕습니다.',
    agentPoints: [
      { title: '자연어 운영', body: '필요한 것을 말하세요. 플래그를 외울 필요 없습니다.' },
      { title: '실시간 진단', body: '상태, 로그, 리소스를 수 초 만에 요약합니다.' },
      { title: '멀티 호스트 오케스트레이션', body: '클러스터 초기화와 배포를 한 대화로.' },
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
    cnSpeedHint:
      '팁: 다운로드가 느리면 링크를 다중 스레드 다운로드 도구(IDM 등)에 붙여 넣으면 훨씬 빨라집니다.',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: '언어',
  },
  de: {
    metaTitle: 'MagiesTerminal — KI-gestützter SSH-Arbeitsplatz',
    metaDesc:
      'MagiesTerminal ist ein moderner plattformübergreifender SSH-Client, SFTP-Browser und Terminal-Arbeitsplatz mit integriertem KI-Agenten.',
    headline: 'Ihre Serverflotte in einem Arbeitsplatz',
    sub: 'KI-gestützter SSH-Client, SFTP-Browser und Terminal-Manager. Splits, Vault und Multi-Host-Orchestrierung für den Alltag.',
    ctaDownload: 'Herunterladen',
    navFeatures: 'Funktionen',
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
    contactCopied: 'E-Mail kopiert',
    featuresLabel: 'Arbeitsplatz',
    featuresTitle: 'Für den Dauerbetrieb gebaut',
    featuresLead: 'Kein einzelnes Terminalfenster — ein Arbeitsplatz, in dem man den Tag verbringt.',
    features: [
      {
        title: 'Host-Vault',
        body: 'Raster-, Listen- und Baumansicht mit schneller Suche und Gruppierung — auch bei Hunderten Hosts.',
      },
      {
        title: 'Split-Terminals',
        body: 'Horizontale und vertikale Splits, Tabs und Sitzungswiederherstellung für parallele Abläufe.',
      },
      {
        title: 'SFTP + Editor',
        body: 'Drag-and-Drop-Transfers und In-App-Editor — Dateien und Shells an einem Ort.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Mit Servern sprechen',
    agentLead:
      'Ein integrierter KI-Partner versteht Ihre Umgebung, führt Befehle aus, diagnostiziert und orchestriert Hosts.',
    agentPoints: [
      { title: 'Natürliche Sprache', body: 'Sagen Sie, was Sie brauchen — Flags auswendig lernen entfällt.' },
      { title: 'Live-Diagnose', body: 'Status, Logs und Ressourcen in Sekunden zusammenfassen.' },
      { title: 'Multi-Host-Orchestrierung', body: 'Cluster und Deployments in einem Gespräch.' },
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
    cnSpeedHint:
      'Tipp: Bei langsamem Download den Link in einen Multithread-Downloader (IDM, NDM usw.) kopieren.',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Sprache',
  },
  fr: {
    metaTitle: 'MagiesTerminal — Espace de travail SSH piloté par l’IA',
    metaDesc:
      'MagiesTerminal est un client SSH multiplateforme moderne, un navigateur SFTP et un espace terminal avec un agent IA intégré.',
    headline: 'Votre flotte de serveurs, un seul espace',
    sub: 'Client SSH, navigateur SFTP et gestionnaire de terminaux pilotés par l’IA. Splits, Vault et orchestration multi-hôtes pour le quotidien.',
    ctaDownload: 'Télécharger',
    navFeatures: 'Fonctions',
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
    contactCopied: 'E-mail copié',
    featuresLabel: 'Espace de travail',
    featuresTitle: 'Conçu pour l’exploitation au long cours',
    featuresLead: 'Pas une simple fenêtre de terminal — un poste serveur où l’on reste toute la journée.',
    features: [
      {
        title: 'Coffre d’hôtes',
        body: 'Vues grille, liste et arbre avec recherche et regroupement rapides — même pour des centaines d’hôtes.',
      },
      {
        title: 'Terminaux scindés',
        body: 'Splits horizontaux et verticaux, onglets et restauration de session pour travailler côte à côte.',
      },
      {
        title: 'SFTP + éditeur',
        body: 'Transferts glisser-déposer et éditeur intégré : fichiers et shells au même endroit.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Parlez à vos serveurs',
    agentLead:
      'Un partenaire IA intégré comprend votre environnement, exécute des commandes, diagnostique et coordonne les hôtes.',
    agentPoints: [
      { title: 'Ops en langage naturel', body: 'Dites ce dont vous avez besoin — plus besoin d’apprendre les flags.' },
      { title: 'Diagnostic en direct', body: 'État, journaux et ressources résumés en quelques secondes.' },
      { title: 'Orchestration multi-hôtes', body: 'Clusters et déploiements en une conversation.' },
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
    cnSpeedHint:
      'Astuce : si le téléchargement est lent, copiez le lien dans un gestionnaire multi-thread (IDM, NDM, etc.).',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Langue',
  },
  es: {
    metaTitle: 'MagiesTerminal — Espacio de trabajo SSH con IA',
    metaDesc:
      'MagiesTerminal es un cliente SSH multiplataforma moderno, navegador SFTP y espacio de terminal con un agente de IA integrado.',
    headline: 'Tu flota de servidores, en un solo espacio',
    sub: 'Cliente SSH, navegador SFTP y gestor de terminales con IA. Divisiones, Vault y orquestación multihost para el día a día.',
    ctaDownload: 'Descargar',
    navFeatures: 'Funciones',
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
    contactCopied: 'Correo copiado',
    featuresLabel: 'Espacio de trabajo',
    featuresTitle: 'Hecho para operaciones prolongadas',
    featuresLead: 'No es una sola ventana de terminal: es un puesto de servidor donde pasas el día.',
    features: [
      {
        title: 'Vault de hosts',
        body: 'Vistas de cuadrícula, lista y árbol con búsqueda y agrupación rápidas, incluso con cientos de hosts.',
      },
      {
        title: 'Terminales divididos',
        body: 'Divisiones horizontales y verticales, pestañas y restauración de sesión para trabajar en paralelo.',
      },
      {
        title: 'SFTP + editor',
        body: 'Transferencias arrastrar y soltar y editor integrado: archivos y shells en un solo lugar.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Habla con tus servidores',
    agentLead:
      'Un socio de IA integrado entiende tu entorno, ejecuta comandos, diagnostica y coordina hosts.',
    agentPoints: [
      { title: 'Ops en lenguaje natural', body: 'Di lo que necesitas: deja de memorizar flags.' },
      { title: 'Diagnóstico en vivo', body: 'Estado, logs y recursos resumidos en segundos.' },
      { title: 'Orquestación multihost', body: 'Clústeres y despliegues en una conversación.' },
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
    cnSpeedHint:
      'Consejo: si la descarga es lenta, copia el enlace en un gestor multiproceso (IDM, NDM, etc.).',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Idioma',
  },
  pt: {
    metaTitle: 'MagiesTerminal — Espaço de trabalho SSH com IA',
    metaDesc:
      'MagiesTerminal é um cliente SSH multiplataforma moderno, navegador SFTP e espaço de terminal com agente de IA integrado.',
    headline: 'Sua frota de servidores, em um só espaço',
    sub: 'Cliente SSH, navegador SFTP e gerenciador de terminais com IA. Divisões, Vault e orquestração multihost para o dia a dia.',
    ctaDownload: 'Baixar',
    navFeatures: 'Recursos',
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
    contactCopied: 'E-mail copiado',
    featuresLabel: 'Espaço de trabalho',
    featuresTitle: 'Feito para operação contínua',
    featuresLead: 'Não é uma única janela de terminal — é uma bancada de servidores para o dia inteiro.',
    features: [
      {
        title: 'Vault de hosts',
        body: 'Grade, lista e árvore com busca e agrupamento rápidos — mesmo com centenas de hosts.',
      },
      {
        title: 'Terminais divididos',
        body: 'Divisões horizontais e verticais, abas e restauração de sessão para fluxos lado a lado.',
      },
      {
        title: 'SFTP + editor',
        body: 'Transferências arrastar e soltar e editor no app: arquivos e shells no mesmo lugar.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Fale com seus servidores',
    agentLead:
      'Um parceiro de IA integrado entende seu ambiente, executa comandos, diagnostica e coordena hosts.',
    agentPoints: [
      { title: 'Ops em linguagem natural', body: 'Diga o que precisa — pare de decorar flags.' },
      { title: 'Diagnóstico ao vivo', body: 'Saúde, logs e recursos resumidos em segundos.' },
      { title: 'Orquestração multihost', body: 'Clusters e deploys em uma conversa.' },
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
    cnSpeedHint:
      'Dica: se o download estiver lento, copie o link para um gerenciador multithread (IDM, NDM etc.).',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Idioma',
  },
  ru: {
    metaTitle: 'MagiesTerminal — SSH-рабочее место с ИИ',
    metaDesc:
      'MagiesTerminal — современный кроссплатформенный SSH-клиент, SFTP-браузер и терминальное рабочее место со встроенным ИИ-агентом.',
    headline: 'Ваш флот серверов — в одном рабочем месте',
    sub: 'SSH-клиент, SFTP-браузер и менеджер терминалов с ИИ. Разделения, Vault и оркестрация множества хостов для ежедневной работы.',
    ctaDownload: 'Скачать',
    navFeatures: 'Возможности',
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
    contactCopied: 'Email скопирован',
    featuresLabel: 'Рабочее место',
    featuresTitle: 'Для долгой эксплуатации',
    featuresLead: 'Не одно окно терминала — а серверная станция, в которой вы проводите весь день.',
    features: [
      {
        title: 'Хранилище хостов',
        body: 'Сетка, список и дерево с быстрым поиском и группировкой — даже для сотен хостов.',
      },
      {
        title: 'Разделённые терминалы',
        body: 'Горизонтальные и вертикальные сплиты, вкладки и восстановление сессий для параллельной работы.',
      },
      {
        title: 'SFTP + редактор',
        body: 'Передачи drag-and-drop и встроенный редактор: файлы и shell в одном месте.',
      },
    ],
    agentLabel: 'Magies Agent',
    agentTitle: 'Говорите с серверами',
    agentLead:
      'Встроенный ИИ-партнёр понимает окружение, выполняет команды, диагностирует и координирует хосты.',
    agentPoints: [
      { title: 'Операции на естественном языке', body: 'Скажите, что нужно — не заучивайте флаги.' },
      { title: 'Живая диагностика', body: 'Состояние, логи и ресурсы за секунды.' },
      { title: 'Мультихост-оркестрация', body: 'Кластеры и деплои в одном диалоге.' },
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
    cnSpeedHint:
      'Подсказка: если загрузка медленная, скопируйте ссылку в многопоточный менеджер (IDM, NDM и т.п.).',
    footerNote: 'MagiesTerminal · AI-Powered SSH Workspace',
    footerCopyright: '© 2026 Magies Technology All rights reserved.',
    langAria: 'Язык',
  },
}

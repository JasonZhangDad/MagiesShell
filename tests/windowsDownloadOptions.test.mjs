import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

test('Windows users can choose installer, portable, or ZIP x64 downloads', () => {
  assert.match(source, /'win-x64':\s*\{[\s\S]*zh: 'x64 · 安装版\(\.exe\)'/)
  assert.match(source, /'win-x64-portable':\s*\{[\s\S]*zh: 'x64 · 便携版\(单文件 \.exe,免安装\)'/)
  assert.match(source, /'win-x64-zip':\s*\{[\s\S]*zh: 'x64 · ZIP\(解压即用\)'/)
  assert.match(source, /'win-x64':\s*\{[\s\S]*ja: 'x64 · インストーラー\(\.exe\)'/)
  // 0.5.x also ships Windows ARM64 packages
  assert.match(source, /id: 'win-arm64'/)
  assert.match(source, /id: 'win-arm64-portable'/)
  assert.match(source, /id: 'win-arm64-zip'/)
  assert.match(source, /'win-arm64':\s*\{[\s\S]*zh: 'ARM64 · 安装版\(\.exe\)'/)
})

test('Linux users can choose AppImage and deb packages', () => {
  assert.match(source, /id: 'linux-x64'/)
  assert.match(source, /id: 'linux-arm64'/)
  assert.match(source, /id: 'linux-x64-deb'/)
  assert.match(source, /id: 'linux-arm64-deb'/)
  // Labels must say what each package format is for (deb → Debian/Ubuntu,
  // AppImage → universal no-install), not just the bare format name.
  assert.match(source, /'linux-x64':\s*\{[\s\S]*zh: 'x64 · AppImage\(通用,免安装\)'/)
  assert.match(source, /'linux-x64-deb':\s*\{[\s\S]*zh: 'x64 · deb\(Debian \/ Ubuntu\)'/)
  assert.match(source, /'linux-x64-deb':\s*\{[\s\S]*en: 'x64 · deb \(Debian \/ Ubuntu\)'/)
  assert.match(source, /'linux-arm64-deb':\s*\{[\s\S]*zh: 'ARM64 · deb\(Debian \/ Ubuntu\)'/)
  // OS picker hint also names the deb target distros.
  assert.match(source, /zh: 'AppImage \/ deb\(Debian、Ubuntu\) · x64 \/ ARM64'/)
  assert.match(source, /match: \/\^MagiesTerminal-\[\\d\.\]\+-linux-amd64\\.deb\$\/i/)
})

test('site language drives full UI including downloads and legal links', () => {
  assert.match(source, /function localizedDownloadDetail/)
  assert.match(source, /function localizedOsHint/)
  assert.match(source, /function syncLangToUrl/)
  assert.match(source, /function initialLang/)
  assert.match(source, /URLSearchParams\(location\.search\)\.get\('lang'\)/)
  assert.match(source, /privacy\.html\?lang=\$\{lang\}/)
  assert.match(source, /terms\.html\?lang=\$\{lang\}/)
  // No remaining zh/en-only branch for package labels.
  assert.doesNotMatch(source, /useZhDetail/)
  assert.doesNotMatch(source, /detailZh:/)
  assert.doesNotMatch(source, /detailEn:/)
})

test('site exposes nav anchors, changelog modal, contact, and OG helpers', () => {
  assert.match(source, /href="#features"/)
  assert.match(source, /href="#platform"/)
  assert.match(source, /id="platform"/)
  assert.match(source, /href="#agent"/)
  assert.match(source, /href="#download"/)
  assert.doesNotMatch(source, /GITHUB_REPO_URL/)
  assert.doesNotMatch(source, /GITHUB_RELEASES_URL/)
  assert.doesNotMatch(source, /CHANGELOG_API/)
  assert.match(source, /data-open-changelog/)
  assert.match(source, /function openChangelogModal/)
  assert.match(source, /function fetchChangelogMarkdown/)
  assert.match(source, /CHANGELOG_LOCAL_ZH = '\/changelog\.md'/)
  assert.match(source, /CHANGELOG_LOCAL_EN = '\/changelog\.en\.md'/)
  assert.match(source, /function changelogCandidates/)
  // Changelog body follows the live UI language (not a bind-time snapshot).
  assert.match(source, /openChangelogModal\(currentLang\)/)
  assert.match(source, /keepChangelogOpen/)
  // zh → Chinese snapshot; non-Chinese UI → English (or dedicated locale file).
  assert.match(source, /if \(lang === 'zh'\) return \[CHANGELOG_LOCAL_ZH\]/)
  assert.match(source, /if \(lang === 'en'\) return \[CHANGELOG_LOCAL_EN\]/)
  assert.match(source, /`\/changelog\.\$\{lang\}\.md`/)
  assert.match(source, /SUPPORT_EMAIL/)
  assert.match(source, /data-open-contact/)
  assert.match(source, /data-contact-modal/)
  assert.match(source, /data-copy-contact-email/)
  assert.match(source, /function openContactModal/)
  assert.match(source, /closest\('a'\)/)
  assert.match(source, /github\/i\.test\(line\)/)
  assert.match(source, /function formatFileSize/)
  assert.match(source, /data-lang-select/)
  assert.match(source, /detectLangFromNavigator/)
  assert.match(source, /upsertMeta/)
  assert.match(source, /hreflang/)
  assert.match(source, /id="why"/)
  assert.match(source, /skip-link/)
  assert.match(source, /privacy\.html\?lang=\$\{lang\}/)
  assert.match(source, /terms\.html\?lang=\$\{lang\}/)
  assert.match(source, /hero-workspace-v2\.webp/)
})

test('i18n packs cover multi-country locales', () => {
  const i18n = readFileSync(new URL('../src/i18n.ts', import.meta.url), 'utf8')
  for (const id of ['zh', 'zh-TW', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'ru']) {
    assert.match(i18n, new RegExp(`id: '${id}'`))
  }
  assert.match(i18n, /'zh-TW':\s*\{/)
  assert.match(i18n, /\ben:\s*\{/)
  assert.match(i18n, /\bja:\s*\{/)
  assert.match(i18n, /\bru:\s*\{/)
  assert.match(i18n, /function detectLangFromNavigator/)
  assert.match(i18n, /cnSpeedHint/)
})

test('legal pages localize to the active UI language', () => {
  const legalJs = readFileSync(new URL('../public/legal.js', import.meta.url), 'utf8')
  const privacy = readFileSync(new URL('../public/privacy.html', import.meta.url), 'utf8')
  const terms = readFileSync(new URL('../public/terms.html', import.meta.url), 'utf8')
  assert.match(legalJs, /magies-shell-lang/)
  assert.match(legalJs, /function contentLocale/)
  assert.match(legalJs, /data-legal-block/)
  assert.match(privacy, /data-legal-page="privacy"/)
  assert.match(privacy, /legal\.js/)
  assert.match(terms, /data-legal-page="terms"/)
  // Full body for every UI language (not zh/en only).
  for (const id of ['zh', 'zh-TW', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'ru']) {
    assert.match(privacy, new RegExp(`data-legal-block="${id}"`))
    assert.match(terms, new RegExp(`data-legal-block="${id}"`))
  }
})

test('changelog files exist for every UI language', () => {
  const pub = join(dirname(fileURLToPath(import.meta.url)), '../public')
  // zh uses changelog.md; en uses changelog.en.md; others changelog.{lang}.md
  assert.equal(existsSync(join(pub, 'changelog.md')), true)
  assert.equal(existsSync(join(pub, 'changelog.en.md')), true)
  for (const id of ['zh-TW', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'ru']) {
    assert.equal(existsSync(join(pub, `changelog.${id}.md`)), true, `missing changelog.${id}.md`)
  }
  assert.match(source, /`\/changelog\.\$\{lang\}\.md`/)
})

test('landing copy introduces expanded client capabilities', () => {
  const i18n = readFileSync(new URL('../src/i18n.ts', import.meta.url), 'utf8')
  // zh marketing pack should surface protocol / tunnel / theme product pillars
  assert.match(i18n, /title: '多协议连接'/)
  assert.match(i18n, /title: '端口转发'/)
  assert.match(i18n, /title: '主题与快捷操作'/)
  assert.match(i18n, /title: 'Multi-protocol'/)
  assert.match(i18n, /title: 'Port forwarding'/)
  assert.match(i18n, /Cursor Agent/)
  assert.match(i18n, /SSH · Mosh · Telnet/)
  // reliability section: auto-update / credential encryption / system manager
  assert.match(i18n, /platformItems:/)
  assert.match(i18n, /title: '全平台自动更新'/)
  assert.match(i18n, /title: '凭据本地加密'/)
  assert.match(i18n, /title: '系统管理面板'/)
  assert.match(i18n, /title: 'Auto-update everywhere'/)
  assert.match(i18n, /title: 'Local credential encryption'/)
  assert.match(i18n, /title: 'System manager panel'/)
  assert.match(i18n, /navPlatform:/)
})

test('Windows download cards resolve via opaque redirect ids', () => {
  assert.match(source, /const FALLBACK_VERSION = '\d+\.\d+\.\d+'/)
  assert.match(source, /id: 'win-x64'/)
  assert.match(source, /id: 'win-x64-portable'/)
  assert.match(source, /id: 'win-x64-zip'/)
  assert.match(source, /DOWNLOAD_REDIRECT_BASE/)
})

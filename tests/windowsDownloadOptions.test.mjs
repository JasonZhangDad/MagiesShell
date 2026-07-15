import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

test('Windows users can choose installer, portable, or ZIP x64 downloads', () => {
  assert.match(source, /id: 'win-x64'[\s\S]*detailZh: 'x64 · 安装版'/)
  assert.match(source, /id: 'win-x64-portable'[\s\S]*detailZh: 'x64 · 便携版'/)
  assert.match(source, /id: 'win-x64-zip'[\s\S]*detailZh: 'x64 · ZIP 压缩包'/)
  assert.doesNotMatch(source, /id: 'win-arm64'/)
})

test('Linux users can choose AppImage and deb packages', () => {
  assert.match(source, /id: 'linux-x64'[\s\S]*detailZh: 'x64 · AppImage'/)
  assert.match(source, /id: 'linux-arm64'[\s\S]*detailZh: 'ARM64 · AppImage'/)
  assert.match(source, /id: 'linux-x64-deb'[\s\S]*detailZh: 'x64 · deb'/)
  assert.match(source, /id: 'linux-arm64-deb'[\s\S]*detailZh: 'ARM64 · deb'/)
  assert.match(source, /'linux-x64-deb': `MagiesTerminal-\$\{version\}-linux-amd64\.deb`/)
})

test('site exposes nav anchors, GitHub links, and OG helpers', () => {
  assert.match(source, /href="#features"/)
  assert.match(source, /href="#agent"/)
  assert.match(source, /href="#download"/)
  assert.match(source, /GITHUB_REPO_URL/)
  assert.match(source, /GITHUB_RELEASES_URL/)
  assert.match(source, /function formatFileSize/)
  assert.match(source, /macIntelHint/)
  assert.match(source, /upsertMeta/)
})

test('Windows download fallbacks target the published fallback-version x64 assets', () => {
  assert.match(source, /const FALLBACK_VERSION = '0\.4\.6'/)
  assert.match(source, /'win-x64': `MagiesTerminal-\$\{version\}-win-x64\.exe`/)
  assert.match(source, /'win-x64-portable': `MagiesTerminal-\$\{version\}-portable-win-x64\.exe`/)
  assert.match(source, /'win-x64-zip': `MagiesTerminal-\$\{version\}-win-x64\.zip`/)
})

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

test('Windows download fallbacks target the published v0.2.7 x64 assets', () => {
  assert.match(source, /const FALLBACK_VERSION = '0\.2\.7'/)
  assert.match(source, /'win-x64': `MagiesTerminal-\$\{version\}-win-x64\.exe`/)
  assert.match(source, /'win-x64-portable': `MagiesTerminal-\$\{version\}-portable-win-x64\.exe`/)
  assert.match(source, /'win-x64-zip': `MagiesTerminal-\$\{version\}-win-x64\.zip`/)
})

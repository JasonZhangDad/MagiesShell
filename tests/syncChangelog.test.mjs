import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { after, test } from 'node:test'

const SCRIPT = fileURLToPath(new URL('../scripts/sync-changelog.mjs', import.meta.url))

// Temp fixtures: a fake client repo (upstream) + a fake site public dir.
const work = mkdtempSync(join(tmpdir(), 'sync-changelog-'))
after(() => rmSync(work, { recursive: true, force: true }))

const clientRoot = join(work, 'MgTerminal')
const i18nDir = join(clientRoot, 'application/i18n/changelog')
const outDir = join(work, 'public')
mkdirSync(i18nDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

writeFileSync(
  join(clientRoot, 'CHANGELOG.md'),
  '# Changelog\n\n## [9.9.9] - 2026-01-01\n\n### 修复\n- 中文更新条目\n- see github release notes\n',
  'utf8',
)
// Provide every locale source so the run stays offline (no GitHub fallback).
for (const lang of ['en', 'zh-TW', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'ru']) {
  writeFileSync(
    join(i18nDir, `${lang}.md`),
    `# Changelog\n\n## [9.9.9] - 2026-01-01\n\n### Fixes\n- ${lang} entry\n- see github release notes\n`,
    'utf8',
  )
}
// A stale localized site file that predates the fixture translation.
writeFileSync(
  join(outDir, 'changelog.en.md'),
  '# Changelog\n\n## [0.5.1] - 2026-07-18\n\n### Release\n- old\n',
  'utf8',
)

execFileSync('node', [SCRIPT], {
  env: { ...process.env, SYNC_CLIENT_ROOT: clientRoot, SYNC_OUT_DIR: outDir },
  stdio: 'pipe',
})

test('zh snapshot is pulled from the client root CHANGELOG.md', () => {
  const zh = readFileSync(join(outDir, 'changelog.md'), 'utf8')
  assert.match(zh, /\[9\.9\.9\]/)
  assert.match(zh, /中文更新条目/)
})

test('localized snapshot is pulled from the client i18n changelog, not left stale', () => {
  const en = readFileSync(join(outDir, 'changelog.en.md'), 'utf8')
  assert.match(en, /\[9\.9\.9\]/)
  assert.match(en, /en entry/)
  assert.doesNotMatch(en, /\[0\.5\.1\]/)
})

test('github lines are filtered from every synced snapshot', () => {
  const zh = readFileSync(join(outDir, 'changelog.md'), 'utf8')
  const en = readFileSync(join(outDir, 'changelog.en.md'), 'utf8')
  assert.doesNotMatch(zh, /github/i)
  assert.doesNotMatch(en, /github/i)
})

test('falls back to the GitHub contents API for locales when no client checkout (CI cron)', () => {
  const script = readFileSync(new URL('../scripts/sync-changelog.mjs', import.meta.url), 'utf8')
  // Locale loop must fetch application/i18n/changelog/{lang}.md over the API,
  // not merely re-filter the stale existing snapshot.
  assert.match(script, /fetchFromGithub\(`application\/i18n\/changelog\/\$\{src\}`\)/)
  assert.match(script, /contents\/\$\{repoPath\}/)
})

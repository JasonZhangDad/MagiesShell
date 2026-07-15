#!/usr/bin/env node
/**
 * Pull upstream CHANGELOG.md, drop GitHub-related lines, write public snapshots.
 *
 * - public/changelog.md     — Chinese (upstream language)
 * - public/changelog.en.md  — kept if present; not auto-translated
 *
 * Usage: npm run sync:changelog
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = 'JasonZhangDad/MgTerminal'
const API = `https://api.github.com/repos/${REPO}/contents/CHANGELOG.md`
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_ZH = join(__dirname, '../public/changelog.md')
const OUT_EN = join(__dirname, '../public/changelog.en.md')

function filterGithubLines(md) {
  return (
    md
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter((line) => !/github/i.test(line))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  )
}

async function main() {
  const res = await fetch(API, {
    headers: {
      Accept: 'application/vnd.github.raw+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'magies-shell-site-sync-changelog',
    },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch changelog: ${res.status} ${res.statusText}`)
  }
  const raw = await res.text()
  if (!raw.trim()) throw new Error('Upstream changelog is empty')

  const filtered = filterGithubLines(raw)
  mkdirSync(dirname(OUT_ZH), { recursive: true })
  writeFileSync(OUT_ZH, filtered, 'utf8')
  const removed = raw.split('\n').length - filtered.split('\n').length
  console.log(`Wrote ${OUT_ZH} (${filtered.length} bytes, filtered ~${Math.max(0, removed)} lines)`)

  if (existsSync(OUT_EN)) {
    const en = filterGithubLines(readFileSync(OUT_EN, 'utf8'))
    writeFileSync(OUT_EN, en, 'utf8')
    console.log(`Refreshed filter on existing ${OUT_EN}`)
  } else {
    console.warn(`No ${OUT_EN} yet — add/maintain English notes for non-Chinese UI locales.`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

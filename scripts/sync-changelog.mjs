#!/usr/bin/env node
/**
 * Pull upstream CHANGELOG.md, drop GitHub-related lines, write public/changelog.md.
 *
 * Usage: node scripts/sync-changelog.mjs
 *        npm run sync:changelog
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = 'JasonZhangDad/MgTerminal'
const API = `https://api.github.com/repos/${REPO}/contents/CHANGELOG.md`
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../public/changelog.md')

function filterGithubLines(md) {
  return md
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => !/github/i.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n'
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
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, filtered, 'utf8')
  const removed = raw.split('\n').length - filtered.split('\n').length
  console.log(`Wrote ${OUT} (${filtered.length} bytes, filtered ~${Math.max(0, removed)} lines)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

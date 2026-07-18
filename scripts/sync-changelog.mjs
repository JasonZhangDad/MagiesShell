#!/usr/bin/env node
/**
 * Pull upstream CHANGELOG.md, drop GitHub-related lines, write public snapshots.
 *
 * - public/changelog.md — Chinese (upstream language); site UI lang `zh`
 * - public/changelog.en.md and public/changelog.{lang}.md — kept if present
 *   (not auto-translated; only GitHub lines re-filtered)
 *
 * Prefer local sibling MgTerminal/CHANGELOG.md when present (offline / private),
 * else fetch from GitHub following redirects (repo may have moved).
 *
 * Usage: npm run sync:changelog
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPOS = ['Zhangwei930/MgTerminal', 'JasonZhangDad/MgTerminal']
const __dirname = dirname(fileURLToPath(import.meta.url))
const LOCAL_UPSTREAM = join(__dirname, '../../MgTerminal/CHANGELOG.md')
const OUT_ZH = join(__dirname, '../public/changelog.md')
const OUT_EN = join(__dirname, '../public/changelog.en.md')
const OUT_LANG_GLOB = join(__dirname, '../public')

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

async function fetchUpstreamFromGithub() {
  let lastErr
  for (const repo of REPOS) {
    const api = `https://api.github.com/repos/${repo}/contents/CHANGELOG.md`
    try {
      const res = await fetch(api, {
        headers: {
          Accept: 'application/vnd.github.raw+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'magies-shell-site-sync-changelog',
        },
        // Follow redirects (Moved Permanently after repo rename/transfer).
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        lastErr = new Error(`${repo}: ${res.status} ${res.statusText}`)
        continue
      }
      const raw = await res.text()
      if (!raw.trim() || raw.startsWith('{')) {
        lastErr = new Error(`${repo}: empty or non-markdown response`)
        continue
      }
      console.log(`Fetched upstream CHANGELOG from ${repo}`)
      return raw
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Failed to fetch upstream CHANGELOG')
}

async function main() {
  let raw
  if (existsSync(LOCAL_UPSTREAM)) {
    raw = readFileSync(LOCAL_UPSTREAM, 'utf8')
    console.log(`Using local upstream ${LOCAL_UPSTREAM}`)
  } else {
    raw = await fetchUpstreamFromGithub()
  }
  if (!raw.trim()) throw new Error('Upstream changelog is empty')

  const filtered = filterGithubLines(raw)
  mkdirSync(dirname(OUT_ZH), { recursive: true })
  writeFileSync(OUT_ZH, filtered, 'utf8')
  const removed = raw.split('\n').length - filtered.split('\n').length
  console.log(`Wrote ${OUT_ZH} (${filtered.length} bytes, filtered ~${Math.max(0, removed)} lines)`)
  const top = [...filtered.matchAll(/^## \[([^\]]+)\]/gm)].slice(0, 3).map((m) => m[1])
  console.log(`Top versions: ${top.join(', ')}`)

  // Re-filter existing localized snapshots (do not auto-translate).
  for (const name of [
    'changelog.en.md',
    'changelog.zh-TW.md',
    'changelog.ja.md',
    'changelog.ko.md',
    'changelog.de.md',
    'changelog.fr.md',
    'changelog.es.md',
    'changelog.pt.md',
    'changelog.ru.md',
  ]) {
    const path = join(OUT_LANG_GLOB, name)
    if (!existsSync(path)) continue
    const next = filterGithubLines(readFileSync(path, 'utf8'))
    writeFileSync(path, next, 'utf8')
    console.log(`Refreshed filter on ${path}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

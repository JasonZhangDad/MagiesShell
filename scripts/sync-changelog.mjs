#!/usr/bin/env node
/**
 * Pull upstream CHANGELOG.md, drop GitHub-related lines, write public snapshots.
 *
 * - public/changelog.md — Chinese (upstream language); site UI lang `zh`;
 *   sourced from the client root CHANGELOG.md
 * - public/changelog.{lang}.md — sourced from the client's already-translated
 *   application/i18n/changelog/{lang}.md (en/ja/de/…)
 *
 * Each source prefers a local sibling MgTerminal checkout when present
 * (offline / private), else the GitHub contents API following redirects (repo
 * may have moved; the daily CI cron has no client checkout). GitHub-related
 * lines are stripped from every snapshot.
 *
 * Usage: npm run sync:changelog
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPOS = ['Zhangwei930/MgTerminal', 'JasonZhangDad/MgTerminal']
const __dirname = dirname(fileURLToPath(import.meta.url))
// Client repo root and site public/ dir are overridable (tests / non-sibling checkouts).
const CLIENT_ROOT = process.env.SYNC_CLIENT_ROOT || join(__dirname, '../../MgTerminal')
const OUT_LANG_GLOB = process.env.SYNC_OUT_DIR || join(__dirname, '../public')
const LOCAL_UPSTREAM = join(CLIENT_ROOT, 'CHANGELOG.md')
const I18N_CHANGELOG_DIR = join(CLIENT_ROOT, 'application/i18n/changelog')
const OUT_ZH = join(OUT_LANG_GLOB, 'changelog.md')

// Site localized snapshot -> client i18n changelog source file.
const LOCALES = [
  ['changelog.en.md', 'en.md'],
  ['changelog.zh-TW.md', 'zh-TW.md'],
  ['changelog.ja.md', 'ja.md'],
  ['changelog.ko.md', 'ko.md'],
  ['changelog.de.md', 'de.md'],
  ['changelog.fr.md', 'fr.md'],
  ['changelog.es.md', 'es.md'],
  ['changelog.pt.md', 'pt.md'],
  ['changelog.ru.md', 'ru.md'],
]

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

// Fetch one markdown file from the client repo via the GitHub contents API,
// trying each known repo path (repo may have been renamed/transferred).
async function fetchFromGithub(repoPath) {
  let lastErr
  for (const repo of REPOS) {
    const api = `https://api.github.com/repos/${repo}/contents/${repoPath}`
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
        lastErr = new Error(`${repo}/${repoPath}: ${res.status} ${res.statusText}`)
        continue
      }
      const raw = await res.text()
      if (!raw.trim() || raw.startsWith('{')) {
        lastErr = new Error(`${repo}/${repoPath}: empty or non-markdown response`)
        continue
      }
      console.log(`Fetched ${repoPath} from ${repo}`)
      return raw
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`Failed to fetch ${repoPath}`)
}

async function main() {
  let raw
  if (existsSync(LOCAL_UPSTREAM)) {
    raw = readFileSync(LOCAL_UPSTREAM, 'utf8')
    console.log(`Using local upstream ${LOCAL_UPSTREAM}`)
  } else {
    raw = await fetchFromGithub('CHANGELOG.md')
  }
  if (!raw.trim()) throw new Error('Upstream changelog is empty')

  const filtered = filterGithubLines(raw)
  mkdirSync(dirname(OUT_ZH), { recursive: true })
  writeFileSync(OUT_ZH, filtered, 'utf8')
  const removed = raw.split('\n').length - filtered.split('\n').length
  console.log(`Wrote ${OUT_ZH} (${filtered.length} bytes, filtered ~${Math.max(0, removed)} lines)`)
  const top = [...filtered.matchAll(/^## \[([^\]]+)\]/gm)].slice(0, 3).map((m) => m[1])
  console.log(`Top versions: ${top.join(', ')}`)

  // Pull each localized snapshot from the client's i18n changelog (already
  // translated and maintained there): prefer a local sibling checkout, else
  // the GitHub contents API (the daily CI cron has no client checkout). Only
  // when both are unavailable, fall back to re-filtering the existing snapshot
  // so we never blank it out.
  for (const [name, src] of LOCALES) {
    const path = join(OUT_LANG_GLOB, name)
    const srcPath = join(I18N_CHANGELOG_DIR, src)
    let sourced
    if (existsSync(srcPath)) {
      sourced = readFileSync(srcPath, 'utf8')
      console.log(`Sourced ${name} from ${srcPath}`)
    } else {
      try {
        sourced = await fetchFromGithub(`application/i18n/changelog/${src}`)
      } catch (err) {
        console.warn(`Could not source ${name}: ${err.message}`)
      }
    }
    if (sourced) {
      const next = filterGithubLines(sourced)
      writeFileSync(path, next, 'utf8')
      const ver = next.match(/^## \[([^\]]+)\]/m)?.[1] ?? '?'
      console.log(`Wrote ${path} (top ${ver})`)
    } else if (existsSync(path)) {
      writeFileSync(path, filterGithubLines(readFileSync(path, 'utf8')), 'utf8')
      console.log(`Refreshed filter on ${path} (no upstream source)`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

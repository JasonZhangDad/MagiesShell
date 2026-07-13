import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8')

test('mirror base points at the R2 download domain', () => {
  assert.match(source, /const MIRROR_BASE = 'https:\/\/dl\.magies\.top\/stable'/)
})

test('mainland-China visitors are detected via locale or timezone', () => {
  assert.match(source, /function preferMirror\(\)/)
  assert.match(source, /zh-CN/)
  assert.match(source, /Asia\/Shanghai/)
})

test('release lookup tries both GitHub and the mirror manifest', () => {
  assert.match(source, /release\.json/)
  assert.match(source, /api\.github\.com\/repos/)
  // Ordered fallback: whichever source is preferred, the other is retried.
  assert.match(source, /preferMirror\(\)\s*\?\s*\[fetchReleaseFromMirror,\s*fetchReleaseFromGithub\]\s*:\s*\[fetchReleaseFromGithub,\s*fetchReleaseFromMirror\]/)
})

test('download fallback URLs follow the preferred source', () => {
  assert.match(source, /preferMirror\(\)[\s\S]{0,120}\$\{MIRROR_BASE\}\/\$\{fileMap\[item\.id\]\}/)
  assert.match(source, /github\.com\/\$\{REPO\}\/releases\/download/)
})

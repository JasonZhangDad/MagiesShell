import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../web/src/main.ts', import.meta.url), 'utf8')

test('stats web relies on HttpOnly cookies instead of browser token storage', () => {
  assert.doesNotMatch(source, /localStorage/)
  assert.doesNotMatch(source, /Authorization/)
  assert.doesNotMatch(source, /Bearer/)
})

test('stats web calls the logout endpoint', () => {
  assert.match(source, /stats-api\/logout/)
})

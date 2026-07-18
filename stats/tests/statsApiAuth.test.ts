import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const serverSource = readFileSync(new URL('../api/src/server.ts', import.meta.url), 'utf8')
const authSource = readFileSync(new URL('../api/src/auth.ts', import.meta.url), 'utf8')

test('login compares credentials in constant time, not with ===/!==', () => {
  assert.match(serverSource, /timingSafeEqual/)
  assert.match(serverSource, /safeEqual\(username, env\.statsUsername\)/)
  assert.match(serverSource, /safeEqual\(password, env\.statsPassword\)/)
  assert.doesNotMatch(serverSource, /password !== env\.statsPassword/)
})

test('JWT is signed and verified with a pinned HS256 algorithm', () => {
  assert.match(authSource, /algorithm: 'HS256'/)
  assert.match(authSource, /algorithms: \['HS256'\]/)
})

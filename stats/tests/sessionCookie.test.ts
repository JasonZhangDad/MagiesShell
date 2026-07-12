import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildSessionCookie,
  clearSessionCookie,
  readSessionToken,
} from '../api/src/sessionCookie.ts'

test('session cookies are HttpOnly, secure, strict and short lived', () => {
  const cookie = buildSessionCookie('signed.token')

  assert.match(cookie, /^magies_shell_stats_session=signed\.token;/)
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /Secure/)
  assert.match(cookie, /SameSite=Strict/)
  assert.match(cookie, /Max-Age=43200/)
  assert.match(cookie, /Path=\/stats-api(?:;|$)/)
})

test('session tokens are read only from the dedicated cookie', () => {
  assert.equal(
    readSessionToken('other=value; magies_shell_stats_session=signed.token; last=value'),
    'signed.token',
  )
  assert.equal(readSessionToken(undefined), null)
})

test('logout expires the session cookie immediately', () => {
  assert.match(clearSessionCookie(), /Max-Age=0/)
})

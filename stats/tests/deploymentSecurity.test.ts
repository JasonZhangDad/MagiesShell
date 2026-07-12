import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const nginxConfig = readFileSync(
  new URL('../deploy/shell.magies.top.conf', import.meta.url),
  'utf8',
)

test('website nginx config sends browser security headers', () => {
  assert.match(nginxConfig, /Strict-Transport-Security/)
  assert.match(nginxConfig, /Content-Security-Policy/)
  assert.match(nginxConfig, /X-Content-Type-Options/)
  assert.match(nginxConfig, /Referrer-Policy/)
  assert.match(nginxConfig, /Permissions-Policy/)
  assert.match(nginxConfig, /frame-ancestors 'none'/)
})

test('obsolete standalone stats domain config is removed', () => {
  assert.equal(
    existsSync(new URL('../deploy/shell-stats.magies.top.conf', import.meta.url)),
    false,
  )
})

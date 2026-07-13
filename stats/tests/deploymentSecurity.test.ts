import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const nginxConfig = readFileSync(
  new URL('../deploy/shell.magies.top.conf', import.meta.url),
  'utf8',
)
const releaseSyncScript = readFileSync(
  new URL('../../scripts/sync-github-releases.sh', import.meta.url),
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

test('website nginx config exposes official release mirror without SPA fallback', () => {
  assert.match(nginxConfig, /location \^~ \/releases\//)
  assert.match(nginxConfig, /alias \/var\/www\/shell\.magies\.top\/releases\//)
  assert.match(nginxConfig, /default_type application\/octet-stream/)
})

test('release mirror sync includes electron-updater metadata assets', () => {
  assert.match(releaseSyncScript, /for asset in data\.get\('assets'\) or \[\]/)
  assert.doesNotMatch(releaseSyncScript, /name\.startswith\(prefix\)/)
})

test('release mirror sync skips unchanged releases and stores assets once', () => {
  assert.match(releaseSyncScript, /already synced/)
  assert.match(releaseSyncScript, /ln -s "\$\{tag\}"/)
  assert.doesNotMatch(releaseSyncScript, /cp -a "\$\{version_dir\}\/\."/)
})

test('obsolete standalone stats domain config is removed', () => {
  assert.equal(
    existsSync(new URL('../deploy/shell-stats.magies.top.conf', import.meta.url)),
    false,
  )
})

test('stats API proxy does not forward client-supplied CF-Connecting-IP', () => {
  assert.match(nginxConfig, /include \/etc\/nginx\/cloudflare-realip\.conf/)
  assert.match(nginxConfig, /real_ip_header CF-Connecting-IP/)
  assert.match(nginxConfig, /proxy_set_header CF-Connecting-IP \$remote_addr/)
  assert.doesNotMatch(nginxConfig, /proxy_set_header CF-Connecting-IP \$http_cf_connecting_ip/)
  assert.equal(
    existsSync(new URL('../deploy/cloudflare-realip.conf', import.meta.url)),
    true,
  )
})

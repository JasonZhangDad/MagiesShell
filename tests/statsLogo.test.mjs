import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../stats/web/src/main.ts', import.meta.url), 'utf8')
const index = readFileSync(new URL('../stats/web/index.html', import.meta.url), 'utf8')

test('stats login and dashboard use the cache-busted galaxy logo with center star', () => {
  const references = source.match(/logo-galaxy-v4\.png/g) ?? []
  assert.equal(references.length, 2)
  assert.doesNotMatch(source, /logo-galaxy\.png/)
  assert.match(index, /href="\/stats\/logo-galaxy-v4\.png"/)
  assert.doesNotMatch(index, /href="\/stats\/logo-galaxy\.png"/)

  const logo = readFileSync(
    new URL('../stats/web/public/logo-galaxy-v4.png', import.meta.url),
  )
  assert.equal(logo.subarray(1, 4).toString(), 'PNG')
  assert.equal(logo[25], 6, 'stats logo must be an RGBA PNG without a baked black background')
})

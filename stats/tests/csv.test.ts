import assert from 'node:assert/strict'
import test from 'node:test'
import { toCsv } from '../web/src/csv.ts'

test('toCsv escapes commas quotes and newlines', () => {
  const csv = toCsv(
    ['name', 'note'],
    [
      ['alpha', 'hello, world'],
      ['beta', 'say "hi"'],
      ['gamma', 'line1\nline2'],
    ],
  )
  assert.match(csv, /"hello, world"/)
  assert.match(csv, /"say ""hi"""/)
  assert.match(csv, /"line1\nline2"/)
  assert.ok(csv.endsWith('\n'))
})

test('toCsv renders empty cells for nullish values', () => {
  const csv = toCsv(['a', 'b'], [[null, undefined], [0, '']])
  assert.equal(csv, 'a,b\n,\n0,\n')
})

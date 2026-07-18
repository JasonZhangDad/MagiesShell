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

test('toCsv neutralizes spreadsheet formula-injection payloads', () => {
  const rows = toCsv(
    ['file'],
    [
      ['=cmd|"/c calc"!A1'],
      ['+1+2'],
      ['-1+2'],
      ['@SUM(A1)'],
      ['=HYPERLINK("http://evil","x")'],
      ['\tleading tab'],
    ],
  )
    .split('\n')
    .slice(1) // drop header

  // A cell that starts with = + - @ tab or CR must be prefixed with ' so a
  // spreadsheet (Excel / Sheets / WPS) never interprets it as a formula.
  const dangerous = ['=', '+', '-', '@', '\t', '\r']
  for (const line of rows) {
    if (!line) continue
    const cell = line.startsWith('"') ? line.slice(1) : line
    assert.ok(
      !dangerous.includes(cell[0]),
      `cell was not neutralized: ${JSON.stringify(line)}`,
    )
  }
  // The formula text itself is preserved (only prefixed), not dropped.
  assert.match(rows.join('\n'), /cmd\|/)
})

test('toCsv leaves ordinary and numeric cells unchanged', () => {
  const csv = toCsv(['a', 'b'], [['plain', 'MagiesTerminal-0.5.1-mac-arm64.dmg'], [42, -5]])
  assert.match(csv, /^plain,MagiesTerminal-0\.5\.1-mac-arm64\.dmg$/m)
  assert.match(csv, /^42,-5$/m)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { clampRangeDays } from '../api/src/rangeDays.ts'

test('clampRangeDays accepts 7 / 30 / 90 only', () => {
  assert.equal(clampRangeDays(7), 7)
  assert.equal(clampRangeDays('30'), 30)
  assert.equal(clampRangeDays(90), 90)
  assert.equal(clampRangeDays(14), 30)
  assert.equal(clampRangeDays('nope'), 30)
  assert.equal(clampRangeDays(undefined, 7), 7)
})

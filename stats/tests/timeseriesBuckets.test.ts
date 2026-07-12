import assert from 'node:assert/strict'
import test from 'node:test'
import { fillTimeseriesBuckets } from '../api/src/timeseriesBuckets.ts'

test('fillTimeseriesBuckets pads empty days across the requested window', () => {
  const now = new Date(2026, 6, 12, 15, 30, 0)
  const filled = fillTimeseriesBuckets([{ bucket: '2026-07-12', count: 28 }], 'day', 5, now)
  assert.deepEqual(filled, [
    { bucket: '2026-07-08', count: 0 },
    { bucket: '2026-07-09', count: 0 },
    { bucket: '2026-07-10', count: 0 },
    { bucket: '2026-07-11', count: 0 },
    { bucket: '2026-07-12', count: 28 },
  ])
})

test('fillTimeseriesBuckets pads empty months across the last 12 months', () => {
  const now = new Date(2026, 6, 12)
  const filled = fillTimeseriesBuckets([{ bucket: '2026-07', count: 6 }], 'month', 30, now)
  assert.equal(filled.length, 12)
  assert.equal(filled[0]?.bucket, '2025-08')
  assert.equal(filled[11]?.bucket, '2026-07')
  assert.equal(filled[11]?.count, 6)
  assert.equal(filled[10]?.count, 0)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { FixedWindowRateLimiter } from '../api/src/rateLimit.ts'

test('rate limiter blocks requests over the configured limit', () => {
  const limiter = new FixedWindowRateLimiter({ limit: 2, windowMs: 1_000 })

  assert.equal(limiter.allow('203.0.113.1', 0), true)
  assert.equal(limiter.allow('203.0.113.1', 1), true)
  assert.equal(limiter.allow('203.0.113.1', 2), false)
  assert.equal(limiter.allow('203.0.113.1', 1_001), true)
})

test('rate limiter bounds memory and evicts expired buckets', () => {
  const limiter = new FixedWindowRateLimiter({ limit: 1, windowMs: 100, maxBuckets: 2 })

  limiter.allow('one', 0)
  limiter.allow('two', 0)
  limiter.allow('three', 1)
  assert.equal(limiter.size, 2)

  limiter.allow('four', 101)
  assert.equal(limiter.size, 1)
})

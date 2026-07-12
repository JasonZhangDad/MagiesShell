import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveClientIp } from '../api/src/geo.ts'

test('resolveClientIp prefers TCP peer when CF trust is disabled', () => {
  const previous = process.env.TRUST_CF_CONNECTING_IP
  delete process.env.TRUST_CF_CONNECTING_IP
  try {
    const ip = resolveClientIp({
      headers: {
        'cf-connecting-ip': '203.0.113.9',
        'x-forwarded-for': '198.51.100.7',
      },
      socket: { remoteAddress: '192.0.2.10' },
    })
    assert.equal(ip, '192.0.2.10')
  } finally {
    if (previous === undefined) delete process.env.TRUST_CF_CONNECTING_IP
    else process.env.TRUST_CF_CONNECTING_IP = previous
  }
})

test('resolveClientIp trusts CF-Connecting-IP only when enabled', () => {
  const previous = process.env.TRUST_CF_CONNECTING_IP
  process.env.TRUST_CF_CONNECTING_IP = '1'
  try {
    const ip = resolveClientIp({
      headers: {
        'cf-connecting-ip': '203.0.113.9',
      },
      socket: { remoteAddress: '192.0.2.10' },
    })
    assert.equal(ip, '203.0.113.9')
  } finally {
    if (previous === undefined) delete process.env.TRUST_CF_CONNECTING_IP
    else process.env.TRUST_CF_CONNECTING_IP = previous
  }
})

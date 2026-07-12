import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeTrackInput } from '../api/src/trackInput.ts'

test('anonymous tracking fields are type checked and length limited', () => {
  const input = normalizeTrackInput({
    eventType: 'download',
    ua: 'u'.repeat(4_000),
    downloadOs: 'o'.repeat(100),
    downloadArch: 'a'.repeat(100),
    downloadFile: 'f'.repeat(1_000),
    path: 'p'.repeat(1_000),
    referrer: 'r'.repeat(1_000),
    sessionId: 's'.repeat(1_000),
  })

  assert.equal(input.eventType, 'download')
  assert.equal(input.ua?.length, 1_024)
  assert.equal(input.downloadOs?.length, 32)
  assert.equal(input.downloadArch?.length, 32)
  assert.equal(input.downloadFile?.length, 255)
  assert.equal(input.path.length, 300)
  assert.equal(input.referrer?.length, 500)
  assert.equal(input.sessionId?.length, 80)
})

test('anonymous tracking fields reject non-string values', () => {
  const input = normalizeTrackInput({
    eventType: 'unexpected',
    downloadFile: { html: '<img>' },
    path: 123,
  })

  assert.equal(input.eventType, 'page_view')
  assert.equal(input.downloadFile, null)
  assert.equal(input.path, '/')
})

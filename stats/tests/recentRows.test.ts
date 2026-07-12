import assert from 'node:assert/strict'
import test from 'node:test'
import { renderRecentRows } from '../web/src/recentRows.ts'

test('recent event rows escape anonymous tracking data before inserting HTML', () => {
  const html = renderRecentRows(
    [
      {
        ts: '2026-07-11T00:00:00.000Z',
        event_type: 'download',
        ip: '203.0.113.*',
        country: '<img src=x onerror=alert(1)>',
        region: null,
        city: null,
        device_type: 'pc',
        os_name: 'Linux',
        browser: 'Browser',
        download_os: 'linux',
        download_arch: 'x64',
        download_file: '<img src=x onerror=alert(1)>',
      },
    ],
    () => 'safe date',
  )

  assert.doesNotMatch(html, /<img/i)
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/)
})

test('recent event rows safely render page views and missing optional data', () => {
  const html = renderRecentRows([
    {
      ts: '2026-07-11T00:00:00.000Z',
      event_type: 'page_view',
      ip: '-',
      country: null,
      region: null,
      city: null,
      device_type: 'desktop/custom',
      os_name: null,
      browser: 'Browser & "quoted"',
      download_os: null,
      download_arch: null,
      download_file: null,
    },
  ])

  assert.match(html, /PC · Browser &amp; &quot;quoted&quot;/)
  assert.match(html, /<td>-<\/td>/)
})

test('recent event rows treat unknown device labels as text', () => {
  const html = renderRecentRows(
    [{
      ts: '2026-07-11T00:00:00.000Z',
      event_type: 'page_view',
      ip: '-',
      country: 'US',
      region: 'CA',
      city: 'San Francisco',
      device_type: '<server>',
      os_name: null,
      browser: null,
      download_os: null,
      download_arch: null,
      download_file: null,
    }],
    () => "date's value",
  )

  assert.match(html, /date&#39;s value/)
  assert.match(html, /&lt;server&gt;/)
})

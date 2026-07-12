export type RecentRow = {
  ts: string
  event_type: string
  ip: string
  country: string | null
  region: string | null
  city: string | null
  device_type: string | null
  os_name: string | null
  browser: string | null
  download_os: string | null
  download_arch: string | null
  download_file: string | null
}

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character])
}

function formatDeviceRow(row: RecentRow): string {
  const deviceMap: Record<string, string> = {
    phone: '手机',
    mobile: '手机',
    tablet: '平板',
    pc: 'PC',
    desktop: 'PC',
    unknown: '未知',
  }
  const raw = row.device_type || 'unknown'
  const device = deviceMap[raw] || (raw.startsWith('desktop') ? 'PC' : raw)
  return [device, row.os_name, row.browser].filter(Boolean).join(' · ') || '未知'
}

export function renderRecentRows(
  rows: RecentRow[],
  formatDate: (value: string) => string = (value) => new Date(value).toLocaleString(),
): string {
  return rows.map((row) => {
    const place = [row.country, row.region, row.city].filter(Boolean).join(' / ') || '-'
    const detail = row.event_type === 'download'
      ? `${row.download_os || '-'}/${row.download_arch || '-'} ${row.download_file || ''}`
      : row.browser || '-'

    return `<tr>
      <td>${escapeHtml(formatDate(row.ts))}</td>
      <td><span class="badge ${row.event_type === 'download' ? 'download' : ''}">${escapeHtml(row.event_type)}</span></td>
      <td>${escapeHtml(row.ip)}</td>
      <td>${escapeHtml(place)}</td>
      <td>${escapeHtml(formatDeviceRow(row))}</td>
      <td>${escapeHtml(detail)}</td>
    </tr>`
  }).join('')
}

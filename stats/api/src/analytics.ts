import { query } from './db.js'

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

async function countEvents(eventType: string, from: Date, to: Date): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM shell_events
     WHERE event_type = $1 AND ts >= $2 AND ts < $3`,
    [eventType, from.toISOString(), to.toISOString()],
  )
  return Number(result.rows[0]?.count || 0)
}

async function countAll(eventType: string): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM shell_events WHERE event_type = $1`,
    [eventType],
  )
  return Number(result.rows[0]?.count || 0)
}

function startOfDay(date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(date = new Date()): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export async function getOverview() {
  const now = new Date()
  const today = startOfDay(now)
  const tomorrow = addDays(today, 1)
  const yesterday = addDays(today, -1)
  const dayLastYear = addDays(today, -365)
  const dayLastYearEnd = addDays(dayLastYear, 1)

  const monthStart = startOfMonth(now)
  const nextMonth = addMonths(monthStart, 1)
  const prevMonthStart = addMonths(monthStart, -1)
  const monthLastYear = addMonths(monthStart, -12)
  const monthLastYearEnd = addMonths(monthLastYear, 1)

  const [
    visitsToday,
    downloadsToday,
    visitsYesterday,
    downloadsYesterday,
    visitsTodayLy,
    downloadsTodayLy,
    visitsMonth,
    downloadsMonth,
    visitsPrevMonth,
    downloadsPrevMonth,
    visitsMonthLy,
    downloadsMonthLy,
    visitsTotal,
    downloadsTotal,
  ] = await Promise.all([
    countEvents('page_view', today, tomorrow),
    countEvents('download', today, tomorrow),
    countEvents('page_view', yesterday, today),
    countEvents('download', yesterday, today),
    countEvents('page_view', dayLastYear, dayLastYearEnd),
    countEvents('download', dayLastYear, dayLastYearEnd),
    countEvents('page_view', monthStart, nextMonth),
    countEvents('download', monthStart, nextMonth),
    countEvents('page_view', prevMonthStart, monthStart),
    countEvents('download', prevMonthStart, monthStart),
    countEvents('page_view', monthLastYear, monthLastYearEnd),
    countEvents('download', monthLastYear, monthLastYearEnd),
    countAll('page_view'),
    countAll('download'),
  ])

  return {
    visits: {
      today: visitsToday,
      month: visitsMonth,
      total: visitsTotal,
      dod: pctChange(visitsToday, visitsYesterday),
      yoyDay: pctChange(visitsToday, visitsTodayLy),
      mom: pctChange(visitsMonth, visitsPrevMonth),
      yoyMonth: pctChange(visitsMonth, visitsMonthLy),
    },
    downloads: {
      today: downloadsToday,
      month: downloadsMonth,
      total: downloadsTotal,
      dod: pctChange(downloadsToday, downloadsYesterday),
      yoyDay: pctChange(downloadsToday, downloadsTodayLy),
      mom: pctChange(downloadsMonth, downloadsPrevMonth),
      yoyMonth: pctChange(downloadsMonth, downloadsMonthLy),
    },
  }
}

export async function getTimeseries(metric: 'visits' | 'downloads', grain: 'day' | 'month', days = 30) {
  const eventType = metric === 'visits' ? 'page_view' : 'download'
  if (grain === 'day') {
    const result = await query<{ bucket: string; count: string }>(
      `SELECT to_char(date_trunc('day', ts), 'YYYY-MM-DD') AS bucket, COUNT(*)::text AS count
       FROM shell_events
       WHERE event_type = $1 AND ts >= NOW() - ($2 || ' days')::interval
       GROUP BY 1
       ORDER BY 1`,
      [eventType, String(days)],
    )
    return result.rows.map((row) => ({ bucket: row.bucket, count: Number(row.count) }))
  }

  const result = await query<{ bucket: string; count: string }>(
    `SELECT to_char(date_trunc('month', ts), 'YYYY-MM') AS bucket, COUNT(*)::text AS count
     FROM shell_events
     WHERE event_type = $1 AND ts >= NOW() - INTERVAL '12 months'
     GROUP BY 1
     ORDER BY 1`,
    [eventType],
  )
  return result.rows.map((row) => ({ bucket: row.bucket, count: Number(row.count) }))
}

export async function getGeo(type: 'visit' | 'download') {
  const eventType = type === 'visit' ? 'page_view' : 'download'
  const result = await query<{ country: string; region: string; city: string; count: string }>(
    `SELECT COALESCE(country, 'Unknown') AS country,
            COALESCE(region, '-') AS region,
            COALESCE(city, '-') AS city,
            COUNT(*)::text AS count
     FROM shell_events
     WHERE event_type = $1
     GROUP BY 1, 2, 3
     ORDER BY COUNT(*) DESC
     LIMIT 20`,
    [eventType],
  )
  return result.rows.map((row) => ({
    country: row.country,
    region: row.region,
    city: row.city,
    count: Number(row.count),
  }))
}

export async function getDevices() {
  const [os, device, browser] = await Promise.all([
    query<{ name: string; count: string }>(
      `SELECT COALESCE(os_name, 'Unknown') AS name, COUNT(*)::text AS count
       FROM shell_events WHERE event_type = 'page_view'
       GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 12`,
    ),
    query<{ name: string; count: string }>(
      `SELECT COALESCE(device_type, 'unknown') AS name, COUNT(*)::text AS count
       FROM shell_events WHERE event_type = 'page_view'
       GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 12`,
    ),
    query<{ name: string; count: string }>(
      `SELECT COALESCE(browser, 'Unknown') AS name, COUNT(*)::text AS count
       FROM shell_events WHERE event_type = 'page_view'
       GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 12`,
    ),
  ])

  const mapRows = (rows: { name: string; count: string }[]) =>
    rows.map((row) => ({ name: row.name, count: Number(row.count) }))

  return {
    os: mapRows(os.rows),
    device: mapRows(device.rows),
    browser: mapRows(browser.rows),
  }
}

export async function getDownloadBreakdown() {
  const result = await query<{ download_os: string; download_arch: string; count: string }>(
    `SELECT COALESCE(download_os, 'unknown') AS download_os,
            COALESCE(download_arch, 'unknown') AS download_arch,
            COUNT(*)::text AS count
     FROM shell_events
     WHERE event_type = 'download'
     GROUP BY 1, 2
     ORDER BY COUNT(*) DESC`,
  )
  return result.rows.map((row) => ({
    os: row.download_os,
    arch: row.download_arch,
    count: Number(row.count),
  }))
}

export async function getRecent(limit = 40) {
  const result = await query<{
    ts: Date
    event_type: string
    ip: string | null
    country: string | null
    region: string | null
    city: string | null
    device_type: string | null
    os_name: string | null
    browser: string | null
    download_os: string | null
    download_arch: string | null
    download_file: string | null
  }>(
    `SELECT ts, event_type, ip, country, region, city, device_type, os_name, browser,
            download_os, download_arch, download_file
     FROM shell_events
     ORDER BY ts DESC
     LIMIT $1`,
    [limit],
  )
  return result.rows
}

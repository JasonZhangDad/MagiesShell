import { query } from './db.js'
import { fillTimeseriesBuckets } from './timeseriesBuckets.js'
import type { RangeDays } from './rangeDays.js'

export type { RangeDays } from './rangeDays.js'
export { clampRangeDays, RANGE_DAYS } from './rangeDays.js'

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

async function countEventsSince(eventType: string, days: number): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM shell_events
     WHERE event_type = $1 AND ts >= NOW() - ($2 || ' days')::interval`,
    [eventType, String(days)],
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

function mapNamed(rows: { name: string; count: string }[]) {
  return rows.map((row) => ({ name: row.name, count: Number(row.count) }))
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

export async function getConversion(days: number = 30) {
  const [visits, downloads, visitSessions, downloadSessions] = await Promise.all([
    countEventsSince('page_view', days),
    countEventsSince('download', days),
    query<{ count: string }>(
      `SELECT COUNT(DISTINCT session_id)::text AS count
       FROM shell_events
       WHERE event_type = 'page_view'
         AND session_id IS NOT NULL
         AND session_id <> ''
         AND ts >= NOW() - ($1 || ' days')::interval`,
      [String(days)],
    ),
    query<{ count: string }>(
      `SELECT COUNT(DISTINCT session_id)::text AS count
       FROM shell_events
       WHERE event_type = 'download'
         AND session_id IS NOT NULL
         AND session_id <> ''
         AND ts >= NOW() - ($1 || ' days')::interval`,
      [String(days)],
    ),
  ])

  const sessionsVisited = Number(visitSessions.rows[0]?.count || 0)
  const sessionsDownloaded = Number(downloadSessions.rows[0]?.count || 0)
  const eventRate = visits === 0 ? null : Number(((downloads / visits) * 100).toFixed(2))
  const sessionRate =
    sessionsVisited === 0 ? null : Number(((sessionsDownloaded / sessionsVisited) * 100).toFixed(2))

  return {
    days,
    visits,
    downloads,
    eventRate,
    sessionsVisited,
    sessionsDownloaded,
    sessionRate,
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
    return fillTimeseriesBuckets(
      result.rows.map((row) => ({ bucket: row.bucket, count: Number(row.count) })),
      'day',
      days,
    )
  }

  const result = await query<{ bucket: string; count: string }>(
    `SELECT to_char(date_trunc('month', ts), 'YYYY-MM') AS bucket, COUNT(*)::text AS count
     FROM shell_events
     WHERE event_type = $1 AND ts >= NOW() - INTERVAL '12 months'
     GROUP BY 1
     ORDER BY 1`,
    [eventType],
  )
  return fillTimeseriesBuckets(
    result.rows.map((row) => ({ bucket: row.bucket, count: Number(row.count) })),
    'month',
  )
}

/** 近 24 小时按小时桶（访问 + 下载）。 */
export async function getHourly() {
  const [visits, downloads] = await Promise.all([
    query<{ bucket: string; count: string }>(
      `SELECT to_char(date_trunc('hour', ts), 'YYYY-MM-DD HH24:00') AS bucket, COUNT(*)::text AS count
       FROM shell_events
       WHERE event_type = 'page_view' AND ts >= NOW() - INTERVAL '24 hours'
       GROUP BY 1
       ORDER BY 1`,
    ),
    query<{ bucket: string; count: string }>(
      `SELECT to_char(date_trunc('hour', ts), 'YYYY-MM-DD HH24:00') AS bucket, COUNT(*)::text AS count
       FROM shell_events
       WHERE event_type = 'download' AND ts >= NOW() - INTERVAL '24 hours'
       GROUP BY 1
       ORDER BY 1`,
    ),
  ])

  const visitMap = new Map(visits.rows.map((r) => [r.bucket, Number(r.count)]))
  const downloadMap = new Map(downloads.rows.map((r) => [r.bucket, Number(r.count)]))
  const buckets: string[] = []
  const end = new Date()
  end.setMinutes(0, 0, 0)
  for (let i = 23; i >= 0; i -= 1) {
    const d = new Date(end)
    d.setHours(end.getHours() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    buckets.push(`${y}-${m}-${day} ${h}:00`)
  }

  return buckets.map((bucket) => ({
    bucket,
    visits: visitMap.get(bucket) || 0,
    downloads: downloadMap.get(bucket) || 0,
  }))
}

/** 选定范围内按一天中小时分布（0–23）。 */
export async function getHourOfDay(days = 30) {
  const result = await query<{ hour: string; event_type: string; count: string }>(
    `SELECT EXTRACT(HOUR FROM ts)::int::text AS hour,
            event_type,
            COUNT(*)::text AS count
     FROM shell_events
     WHERE ts >= NOW() - ($1 || ' days')::interval
     GROUP BY 1, 2
     ORDER BY 1`,
    [String(days)],
  )
  const visitMap = new Map<number, number>()
  const downloadMap = new Map<number, number>()
  for (const row of result.rows) {
    const hour = Number(row.hour)
    const count = Number(row.count)
    if (row.event_type === 'page_view') visitMap.set(hour, count)
    else if (row.event_type === 'download') downloadMap.set(hour, count)
  }
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    visits: visitMap.get(hour) || 0,
    downloads: downloadMap.get(hour) || 0,
  }))
}

export async function getGeo(type: 'visit' | 'download', days = 30) {
  const eventType = type === 'visit' ? 'page_view' : 'download'
  const result = await query<{ country: string; region: string; city: string; count: string }>(
    `SELECT COALESCE(country, 'Unknown') AS country,
            COALESCE(region, '-') AS region,
            COALESCE(city, '-') AS city,
            COUNT(*)::text AS count
     FROM shell_events
     WHERE event_type = $1
       AND ts >= NOW() - ($2 || ' days')::interval
     GROUP BY 1, 2, 3
     ORDER BY COUNT(*) DESC
     LIMIT 20`,
    [eventType, String(days)],
  )
  return result.rows.map((row) => ({
    country: row.country,
    region: row.region,
    city: row.city,
    count: Number(row.count),
  }))
}

export async function getDevices(days = 30) {
  const since = String(days)
  const [device, pcOs, browser, pcBrowser] = await Promise.all([
    query<{ name: string; count: string }>(
      `SELECT CASE
          WHEN device_type IN ('phone', 'mobile') THEN 'phone'
          WHEN device_type = 'tablet' THEN 'tablet'
          WHEN device_type IN ('pc', 'desktop') OR device_type LIKE 'desktop/%' THEN 'pc'
          ELSE 'unknown'
        END AS name,
        COUNT(*)::text AS count
       FROM shell_events
       WHERE event_type = 'page_view'
         AND ts >= NOW() - ($1 || ' days')::interval
       GROUP BY 1
       ORDER BY COUNT(*) DESC`,
      [since],
    ),
    query<{ name: string; count: string }>(
      `SELECT COALESCE(os_name, 'Unknown') AS name, COUNT(*)::text AS count
       FROM shell_events
       WHERE event_type = 'page_view'
         AND ts >= NOW() - ($1 || ' days')::interval
         AND (
           device_type IN ('pc', 'desktop')
           OR device_type LIKE 'desktop/%'
           OR os_name IN ('macOS', 'Windows', 'Linux', 'ChromeOS')
         )
         AND COALESCE(os_name, '') NOT IN ('iOS', 'iPadOS', 'Android')
       GROUP BY 1
       ORDER BY COUNT(*) DESC
       LIMIT 12`,
      [since],
    ),
    query<{ name: string; count: string }>(
      `SELECT COALESCE(browser, 'Unknown') AS name, COUNT(*)::text AS count
       FROM shell_events
       WHERE event_type = 'page_view'
         AND ts >= NOW() - ($1 || ' days')::interval
       GROUP BY 1
       ORDER BY COUNT(*) DESC
       LIMIT 12`,
      [since],
    ),
    query<{ name: string; count: string }>(
      `SELECT COALESCE(browser, 'Unknown') AS name, COUNT(*)::text AS count
       FROM shell_events
       WHERE event_type = 'page_view'
         AND ts >= NOW() - ($1 || ' days')::interval
         AND (
           device_type IN ('pc', 'desktop')
           OR device_type LIKE 'desktop/%'
           OR os_name IN ('macOS', 'Windows', 'Linux', 'ChromeOS')
         )
         AND COALESCE(device_type, '') NOT IN ('phone', 'mobile', 'tablet')
       GROUP BY 1
       ORDER BY COUNT(*) DESC
       LIMIT 12`,
      [since],
    ),
  ])

  return {
    device: mapNamed(device.rows),
    pcOs: mapNamed(pcOs.rows),
    browser: mapNamed(browser.rows),
    pcBrowser: mapNamed(pcBrowser.rows),
    // backward compatible aliases
    os: mapNamed(pcOs.rows),
  }
}

export async function getDownloadBreakdown(days = 30) {
  const result = await query<{ download_os: string; download_arch: string; count: string }>(
    `SELECT COALESCE(download_os, 'unknown') AS download_os,
            COALESCE(download_arch, 'unknown') AS download_arch,
            COUNT(*)::text AS count
     FROM shell_events
     WHERE event_type = 'download'
       AND ts >= NOW() - ($1 || ' days')::interval
     GROUP BY 1, 2
     ORDER BY COUNT(*) DESC`,
    [String(days)],
  )
  return result.rows.map((row) => ({
    os: row.download_os,
    arch: row.download_arch,
    count: Number(row.count),
  }))
}

export async function getDownloadFiles(days = 30) {
  const result = await query<{ name: string; count: string }>(
    `SELECT COALESCE(NULLIF(download_file, ''), 'unknown') AS name, COUNT(*)::text AS count
     FROM shell_events
     WHERE event_type = 'download'
       AND ts >= NOW() - ($1 || ' days')::interval
     GROUP BY 1
     ORDER BY COUNT(*) DESC
     LIMIT 20`,
    [String(days)],
  )
  return mapNamed(result.rows)
}

export async function getReferrers(days = 30) {
  const result = await query<{ name: string; count: string }>(
    `SELECT CASE
        WHEN referrer IS NULL OR btrim(referrer) = '' THEN '(direct)'
        ELSE left(referrer, 120)
      END AS name,
      COUNT(*)::text AS count
     FROM shell_events
     WHERE event_type = 'page_view'
       AND ts >= NOW() - ($1 || ' days')::interval
     GROUP BY 1
     ORDER BY COUNT(*) DESC
     LIMIT 15`,
    [String(days)],
  )
  return mapNamed(result.rows)
}

export type RecentFilter = 'all' | 'page_view' | 'download'

export async function getRecent(
  limit = 40,
  options: { offset?: number; eventType?: RecentFilter } = {},
) {
  const safeLimit = Math.min(Math.max(Number(limit) || 40, 1), 200)
  const offset = Math.max(Number(options.offset) || 0, 0)
  const eventType = options.eventType || 'all'
  const params: unknown[] = [safeLimit, offset]
  let typeClause = ''
  if (eventType === 'page_view' || eventType === 'download') {
    typeClause = 'WHERE event_type = $3'
    params.push(eventType)
  }

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
     ${typeClause}
     ORDER BY ts DESC
     LIMIT $1 OFFSET $2`,
    params,
  )
  return result.rows
}

export async function getDashboard(days: RangeDays = 30) {
  const [
    overview,
    conversion,
    visitDay,
    downloadDay,
    visitMonth,
    downloadMonth,
    hourly,
    hourOfDay,
    geoVisit,
    geoDownload,
    devices,
    breakdown,
    downloadFiles,
    referrers,
    recent,
  ] = await Promise.all([
    getOverview(),
    getConversion(days),
    getTimeseries('visits', 'day', days),
    getTimeseries('downloads', 'day', days),
    getTimeseries('visits', 'month'),
    getTimeseries('downloads', 'month'),
    getHourly(),
    getHourOfDay(days),
    getGeo('visit', days),
    getGeo('download', days),
    getDevices(days),
    getDownloadBreakdown(days),
    getDownloadFiles(days),
    getReferrers(days),
    getRecent(50),
  ])

  return {
    generatedAt: new Date().toISOString(),
    rangeDays: days,
    overview,
    conversion,
    timeseries: {
      visitDay,
      downloadDay,
      visitMonth,
      downloadMonth,
    },
    hourly,
    hourOfDay,
    geo: {
      visit: geoVisit,
      download: geoDownload,
    },
    devices,
    breakdown,
    downloadFiles,
    referrers,
    recent,
  }
}

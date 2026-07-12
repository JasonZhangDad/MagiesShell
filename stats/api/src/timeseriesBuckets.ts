export type TimeseriesPoint = { bucket: string; count: number }

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function ymd(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function ym(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`
}

/** 补齐近 N 日 / 近 12 月空桶，避免横轴只剩单个日期。 */
export function fillTimeseriesBuckets(
  rows: TimeseriesPoint[],
  grain: 'day' | 'month',
  days = 30,
  now = new Date(),
): TimeseriesPoint[] {
  const map = new Map(rows.map((row) => [row.bucket, row.count]))
  const out: TimeseriesPoint[] = []

  if (grain === 'day') {
    const end = new Date(now)
    end.setHours(0, 0, 0, 0)
    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const day = new Date(end)
      day.setDate(end.getDate() - offset)
      const bucket = ymd(day)
      out.push({ bucket, count: map.get(bucket) || 0 })
    }
    return out
  }

  const end = new Date(now.getFullYear(), now.getMonth(), 1)
  for (let offset = 11; offset >= 0; offset -= 1) {
    const month = new Date(end.getFullYear(), end.getMonth() - offset, 1)
    const bucket = ym(month)
    out.push({ bucket, count: map.get(bucket) || 0 })
  }
  return out
}

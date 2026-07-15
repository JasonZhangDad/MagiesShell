export const RANGE_DAYS = [7, 30, 90] as const
export type RangeDays = (typeof RANGE_DAYS)[number]

export function clampRangeDays(raw: unknown, fallback: RangeDays = 30): RangeDays {
  const n = typeof raw === 'string' || typeof raw === 'number' ? Number(raw) : NaN
  if (n === 7 || n === 30 || n === 90) return n
  return fallback
}

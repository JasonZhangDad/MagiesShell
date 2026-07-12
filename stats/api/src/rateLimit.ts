type RateLimiterOptions = {
  limit: number
  windowMs: number
  maxBuckets?: number
}

type Bucket = {
  count: number
  resetAt: number
}

export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, Bucket>()
  private readonly limit: number
  private readonly windowMs: number
  private readonly maxBuckets: number

  constructor({ limit, windowMs, maxBuckets = 10_000 }: RateLimiterOptions) {
    this.limit = limit
    this.windowMs = windowMs
    this.maxBuckets = maxBuckets
  }

  get size(): number {
    return this.buckets.size
  }

  allow(key: string, now = Date.now()): boolean {
    const current = this.buckets.get(key)
    if (current && current.resetAt > now) {
      if (current.count >= this.limit) return false
      current.count += 1
      return true
    }

    this.removeExpired(now)
    while (this.buckets.size >= this.maxBuckets) {
      const oldestKey = this.buckets.keys().next().value
      if (typeof oldestKey !== 'string') break
      this.buckets.delete(oldestKey)
    }
    this.buckets.set(key, { count: 1, resetAt: now + this.windowMs })
    return true
  }

  private removeExpired(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key)
    }
  }
}

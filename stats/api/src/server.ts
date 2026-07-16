import express from 'express'
import cors from 'cors'
import { env } from './env.js'
import { query } from './db.js'
import { requireAuth, signToken } from './auth.js'
import { lookupGeo, maskIp, resolveClientIp } from './geo.js'
import { parseUa, pickBestUa } from './ua.js'
import { normalizeTrackInput } from './trackInput.js'
import { FixedWindowRateLimiter } from './rateLimit.js'
import { buildSessionCookie, clearSessionCookie } from './sessionCookie.js'
import { resolveDownloadRedirect } from './downloadRedirect.js'
import {
  clampRangeDays,
  getConversion,
  getDashboard,
  getDownloadBreakdown,
  getDownloadFiles,
  getDevices,
  getGeo,
  getHourly,
  getHourOfDay,
  getOverview,
  getRecent,
  getReferrers,
  getTimeseries,
  type RecentFilter,
} from './analytics.js'

const app = express()
app.set('trust proxy', true)
app.disable('x-powered-by')
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
  }),
)
app.use(express.json({ limit: '32kb' }))

const loginLimiter = new FixedWindowRateLimiter({ limit: 5, windowMs: 15 * 60_000, maxBuckets: 5_000 })
const trackLimiter = new FixedWindowRateLimiter({ limit: 60, windowMs: 60_000 })
const downloadLimiter = new FixedWindowRateLimiter({ limit: 30, windowMs: 60_000 })

function enforceRateLimit(limiter: FixedWindowRateLimiter) {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (!limiter.allow(resolveClientIp(req))) {
      res.status(429).json({ error: 'Too many requests' })
      return
    }
    next()
  }
}

function parseRecentFilter(raw: unknown): RecentFilter {
  if (raw === 'page_view' || raw === 'download') return raw
  return 'all'
}

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1')
    res.json({ ok: true, db: true })
  } catch (error) {
    console.error('health db error', error)
    res.status(503).json({ ok: false, db: false })
  }
})

/**
 * Opaque download hop for the marketing site.
 * Landing-page hrefs stay on shell.magies.top; this endpoint 302s to GitHub
 * (overseas, free CDN) or the R2 mirror (CN). Origin only sends a tiny redirect.
 */
app.get('/api/download/:id', enforceRateLimit(downloadLimiter), async (req, res) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : ''
    const ip = resolveClientIp(req)
    const geo = lookupGeo(ip)
    const acceptLanguage =
      typeof req.headers['accept-language'] === 'string' ? req.headers['accept-language'] : null
    const target = await resolveDownloadRedirect({
      id,
      country: geo.country,
      acceptLanguage,
    })
    if (!target) {
      res.status(404).json({ error: 'Unknown download' })
      return
    }
    res.setHeader('Cache-Control', 'private, no-store')
    res.redirect(302, target)
  } catch (error) {
    console.error('download redirect error', error)
    res.status(500).json({ error: 'Failed to resolve download' })
  }
})

app.post('/api/login', enforceRateLimit(loginLimiter), (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (username !== env.statsUsername || password !== env.statsPassword) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }
  res.setHeader('Set-Cookie', buildSessionCookie(signToken()))
  res.json({ ok: true })
})

app.post('/api/logout', (_req, res) => {
  res.setHeader('Set-Cookie', clearSessionCookie())
  res.status(204).send()
})

app.post('/api/track', enforceRateLimit(trackLimiter), async (req, res) => {
  try {
    const ip = resolveClientIp(req)
    const input = normalizeTrackInput(req.body)
    const ua = pickBestUa(
      input.ua,
      typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null,
    )
    const device = parseUa(ua)
    const geo = lookupGeo(ip)

    await query(
      `INSERT INTO shell_events (
        event_type, ip, country, region, city, isp, ua,
        device_type, os_name, os_version, browser,
        download_os, download_arch, download_file,
        path, referrer, session_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,
        $12,$13,$14,
        $15,$16,$17
      )`,
      [
        input.eventType,
        ip,
        geo.country,
        geo.region,
        geo.city,
        geo.isp,
        ua || null,
        device.deviceType,
        device.osName,
        device.osVersion,
        device.browser,
        input.downloadOs,
        input.downloadArch,
        input.downloadFile,
        input.path,
        input.referrer,
        input.sessionId,
      ],
    )

    res.json({ ok: true })
  } catch (error) {
    console.error('track error', error)
    res.status(500).json({ error: 'Failed to track' })
  }
})

app.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    const days = clampRangeDays(req.query.days)
    const data = await getDashboard(days)
    res.json({
      ...data,
      recent: data.recent.map((row) => ({
        ...row,
        ip: maskIp(row.ip),
      })),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

app.get('/api/overview', requireAuth, async (_req, res) => {
  try {
    res.json(await getOverview())
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load overview' })
  }
})

app.get('/api/conversion', requireAuth, async (req, res) => {
  try {
    const days = clampRangeDays(req.query.days)
    res.json(await getConversion(days))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load conversion' })
  }
})

app.get('/api/timeseries', requireAuth, async (req, res) => {
  try {
    const metric = req.query.metric === 'downloads' ? 'downloads' : 'visits'
    const grain = req.query.grain === 'month' ? 'month' : 'day'
    const days = clampRangeDays(req.query.days, 30)
    res.json(await getTimeseries(metric, grain, days))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load timeseries' })
  }
})

app.get('/api/hourly', requireAuth, async (_req, res) => {
  try {
    res.json(await getHourly())
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load hourly' })
  }
})

app.get('/api/hour-of-day', requireAuth, async (req, res) => {
  try {
    const days = clampRangeDays(req.query.days)
    res.json(await getHourOfDay(days))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load hour-of-day' })
  }
})

app.get('/api/geo', requireAuth, async (req, res) => {
  try {
    const type = req.query.type === 'download' ? 'download' : 'visit'
    const days = clampRangeDays(req.query.days)
    res.json(await getGeo(type, days))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load geo' })
  }
})

app.get('/api/devices', requireAuth, async (req, res) => {
  try {
    const days = clampRangeDays(req.query.days)
    res.json(await getDevices(days))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load devices' })
  }
})

app.get('/api/downloads/breakdown', requireAuth, async (req, res) => {
  try {
    const days = clampRangeDays(req.query.days)
    res.json(await getDownloadBreakdown(days))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load download breakdown' })
  }
})

app.get('/api/downloads/files', requireAuth, async (req, res) => {
  try {
    const days = clampRangeDays(req.query.days)
    res.json(await getDownloadFiles(days))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load download files' })
  }
})

app.get('/api/referrers', requireAuth, async (req, res) => {
  try {
    const days = clampRangeDays(req.query.days)
    res.json(await getReferrers(days))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load referrers' })
  }
})

app.get('/api/recent', requireAuth, async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50)
    const offset = Number(req.query.offset || 0)
    const eventType = parseRecentFilter(req.query.type)
    const rows = await getRecent(Number.isFinite(limit) ? limit : 50, {
      offset: Number.isFinite(offset) ? offset : 0,
      eventType,
    })
    res.json(
      rows.map((row) => ({
        ...row,
        ip: maskIp(row.ip),
      })),
    )
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load recent events' })
  }
})

app.listen(env.port, '127.0.0.1', () => {
  console.log(`MagiesTerminal stats API on 127.0.0.1:${env.port}`)
})

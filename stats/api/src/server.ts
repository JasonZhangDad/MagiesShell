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
import {
  getDownloadBreakdown,
  getDevices,
  getGeo,
  getOverview,
  getRecent,
  getTimeseries,
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

function enforceRateLimit(limiter: FixedWindowRateLimiter) {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (!limiter.allow(resolveClientIp(req))) {
      res.status(429).json({ error: 'Too many requests' })
      return
    }
    next()
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
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

app.get('/api/overview', requireAuth, async (_req, res) => {
  try {
    res.json(await getOverview())
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load overview' })
  }
})

app.get('/api/timeseries', requireAuth, async (req, res) => {
  try {
    const metric = req.query.metric === 'downloads' ? 'downloads' : 'visits'
    const grain = req.query.grain === 'month' ? 'month' : 'day'
    const days = Number(req.query.days || 30)
    res.json(await getTimeseries(metric, grain, Number.isFinite(days) ? days : 30))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load timeseries' })
  }
})

app.get('/api/geo', requireAuth, async (req, res) => {
  try {
    const type = req.query.type === 'download' ? 'download' : 'visit'
    res.json(await getGeo(type))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load geo' })
  }
})

app.get('/api/devices', requireAuth, async (_req, res) => {
  try {
    res.json(await getDevices())
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load devices' })
  }
})

app.get('/api/downloads/breakdown', requireAuth, async (_req, res) => {
  try {
    res.json(await getDownloadBreakdown())
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load download breakdown' })
  }
})

app.get('/api/recent', requireAuth, async (_req, res) => {
  try {
    const rows = await getRecent(50)
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
  console.log(`MagiesShell stats API on 127.0.0.1:${env.port}`)
})

import express from 'express'
import cors from 'cors'
import { env } from './env.js'
import { query } from './db.js'
import { requireAuth, signToken } from './auth.js'
import { lookupGeo, maskIp, resolveClientIp } from './geo.js'
import { parseUa } from './ua.js'
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

const trackBuckets = new Map<string, { count: number; resetAt: number }>()

function rateLimit(ip: string, limit = 60): boolean {
  const now = Date.now()
  const current = trackBuckets.get(ip)
  if (!current || current.resetAt < now) {
    trackBuckets.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (current.count >= limit) return false
  current.count += 1
  return true
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/login', (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (username !== env.statsUsername || password !== env.statsPassword) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }
  res.json({ token: signToken() })
})

app.post('/api/track', async (req, res) => {
  try {
    const ip = resolveClientIp(req)
    if (!rateLimit(ip)) {
      res.status(429).json({ error: 'Too many requests' })
      return
    }

    const eventType = req.body?.eventType === 'download' ? 'download' : 'page_view'
    const ua = typeof req.body?.ua === 'string' ? req.body.ua : req.headers['user-agent'] || ''
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
        eventType,
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
        typeof req.body?.downloadOs === 'string' ? req.body.downloadOs : null,
        typeof req.body?.downloadArch === 'string' ? req.body.downloadArch : null,
        typeof req.body?.downloadFile === 'string' ? req.body.downloadFile : null,
        typeof req.body?.path === 'string' ? req.body.path.slice(0, 300) : '/',
        typeof req.body?.referrer === 'string' ? req.body.referrer.slice(0, 500) : null,
        typeof req.body?.sessionId === 'string' ? req.body.sessionId.slice(0, 80) : null,
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

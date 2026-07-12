import './style.css'
import * as echarts from 'echarts'

type Overview = {
  visits: MetricBlock
  downloads: MetricBlock
}

type MetricBlock = {
  today: number
  month: number
  total: number
  dod: number | null
  yoyDay: number | null
  mom: number | null
  yoyMonth: number | null
}

type SeriesPoint = { bucket: string; count: number }
type NamedCount = { name: string; count: number }
type GeoRow = { country: string; region: string; city: string; count: number }
type Breakdown = { os: string; arch: string; count: number }
type RecentRow = {
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

const TOKEN_KEY = 'magies-shell-stats-token'
const API_BASE = '/stats-api'

let token = localStorage.getItem(TOKEN_KEY) || ''
const charts: echarts.ECharts[] = []

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!(init?.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (response.status === 401) {
    token = ''
    localStorage.removeItem(TOKEN_KEY)
    renderLogin('登录已过期，请重新登录')
    throw new Error('Unauthorized')
  }
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `HTTP ${response.status}`)
  }
  return response.json() as Promise<T>
}

function formatDelta(value: number | null, label: string): string {
  if (value === null) return `${label} —`
  const cls = value > 0 ? 'up' : value < 0 ? 'down' : ''
  const sign = value > 0 ? '+' : ''
  return `<span class="${cls}">${label} ${sign}${value}%</span>`
}

function kpiCard(label: string, value: number, deltas: string): string {
  return `
    <article class="kpi-card">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value.toLocaleString()}</div>
      <div class="kpi-delta">${deltas}</div>
    </article>`
}

function renderLogin(error = ''): void {
  disposeCharts()
  const app = document.getElementById('app')
  if (!app) return
  app.innerHTML = `
    <div class="login-page">
      <form class="login-card" data-login>
        <h1>MagiesShell Stats</h1>
        <p>输入用户名和密码进入运营大屏</p>
        <p class="login-error">${error}</p>
        <input type="text" name="username" placeholder="Username" autocomplete="username" required />
        <input type="password" name="password" placeholder="Password" autocomplete="current-password" required />
        <button type="submit">进入大屏</button>
      </form>
    </div>`

  app.querySelector('[data-login]')?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const data = new FormData(form)
    const username = data.get('username')
    const password = data.get('password')
    try {
      const result = await api<{ token: string }>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      token = result.token
      localStorage.setItem(TOKEN_KEY, token)
      await renderDashboard()
    } catch {
      renderLogin('用户名或密码错误')
    }
  })
}

function disposeCharts(): void {
  while (charts.length) charts.pop()?.dispose()
}

function mountChart(el: HTMLElement, option: echarts.EChartsOption): void {
  const chart = echarts.init(el)
  chart.setOption(option)
  charts.push(chart)
}

function lineOption(title: string, visits: SeriesPoint[], downloads: SeriesPoint[]): echarts.EChartsOption {
  const buckets = Array.from(new Set([...visits.map((i) => i.bucket), ...downloads.map((i) => i.bucket)])).sort()
  const visitMap = new Map(visits.map((i) => [i.bucket, i.count]))
  const downloadMap = new Map(downloads.map((i) => [i.bucket, i.count]))
  return {
    color: ['#2ad4c8', '#c6ff4d'],
    tooltip: { trigger: 'axis' },
    legend: { data: ['访问', '下载'], textStyle: { color: '#8aa0b5' } },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: buckets, axisLabel: { color: '#8aa0b5' } },
    yAxis: { type: 'value', axisLabel: { color: '#8aa0b5' }, splitLine: { lineStyle: { color: 'rgba(142,186,210,0.12)' } } },
    series: [
      { name: '访问', type: 'line', smooth: true, data: buckets.map((b) => visitMap.get(b) || 0) },
      { name: '下载', type: 'line', smooth: true, data: buckets.map((b) => downloadMap.get(b) || 0) },
    ],
  }
}

function barOption(title: string, rows: NamedCount[]): echarts.EChartsOption {
  return {
    color: ['#3d7bff'],
    tooltip: { trigger: 'axis' },
    grid: { left: 80, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { color: '#8aa0b5' }, splitLine: { lineStyle: { color: 'rgba(142,186,210,0.12)' } } },
    yAxis: {
      type: 'category',
      data: rows.map((r) => r.name).reverse(),
      axisLabel: { color: '#8aa0b5' },
    },
    series: [
      {
        type: 'bar',
        data: rows.map((r) => r.count).reverse(),
        barWidth: 14,
        itemStyle: { borderRadius: [0, 8, 8, 0] },
      },
    ],
  }
}

function pieOption(rows: NamedCount[]): echarts.EChartsOption {
  return {
    color: ['#2ad4c8', '#c6ff4d', '#3d7bff', '#8aa0b5', '#ff9f43', '#a29bfe'],
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '68%'],
        data: rows.map((r) => ({ name: r.name, value: r.count })),
        label: { color: '#8aa0b5' },
      },
    ],
  }
}

async function renderDashboard(): Promise<void> {
  const app = document.getElementById('app')
  if (!app) return
  disposeCharts()
  app.innerHTML = `<div class="dashboard"><p class="meta">加载中…</p></div>`

  try {
    const [overview, visitDay, downloadDay, visitMonth, downloadMonth, geoVisit, geoDownload, devices, breakdown, recent] =
      await Promise.all([
        api<Overview>('/api/overview'),
        api<SeriesPoint[]>('/api/timeseries?metric=visits&grain=day&days=30'),
        api<SeriesPoint[]>('/api/timeseries?metric=downloads&grain=day&days=30'),
        api<SeriesPoint[]>('/api/timeseries?metric=visits&grain=month'),
        api<SeriesPoint[]>('/api/timeseries?metric=downloads&grain=month'),
        api<GeoRow[]>('/api/geo?type=visit'),
        api<GeoRow[]>('/api/geo?type=download'),
        api<{ os: NamedCount[]; device: NamedCount[]; browser: NamedCount[] }>('/api/devices'),
        api<Breakdown[]>('/api/downloads/breakdown'),
        api<RecentRow[]>('/api/recent'),
      ])

    app.innerHTML = `
      <div class="dashboard">
        <header class="dash-header">
          <div>
            <h1>MagiesShell 数据运营大屏</h1>
            <div class="meta">shell.magies.top/stats · 自动刷新 60s</div>
          </div>
          <button type="button" class="ghost-btn" data-logout>退出</button>
        </header>

        <section class="kpi-grid">
          ${kpiCard('今日访问', overview.visits.today, `${formatDelta(overview.visits.dod, '环比')} · ${formatDelta(overview.visits.yoyDay, '同比')}`)}
          ${kpiCard('今日下载', overview.downloads.today, `${formatDelta(overview.downloads.dod, '环比')} · ${formatDelta(overview.downloads.yoyDay, '同比')}`)}
          ${kpiCard('本月访问', overview.visits.month, `${formatDelta(overview.visits.mom, '环比')} · ${formatDelta(overview.visits.yoyMonth, '同比')}`)}
          ${kpiCard('本月下载', overview.downloads.month, `${formatDelta(overview.downloads.mom, '环比')} · ${formatDelta(overview.downloads.yoyMonth, '同比')}`)}
          ${kpiCard('总计访问', overview.visits.total, '累计 page view')}
          ${kpiCard('总计下载', overview.downloads.total, '累计 download')}
        </section>

        <section class="chart-grid">
          <article class="panel">
            <h2>近 30 日访问 / 下载趋势</h2>
            <div class="chart" data-chart="day"></div>
          </article>
          <article class="panel">
            <h2>近 12 月访问量（柱状）</h2>
            <div class="chart" data-chart="month"></div>
          </article>
        </section>

        <section class="chart-grid">
          <article class="panel">
            <h2>访问地域 TOP</h2>
            <div class="chart" data-chart="geo-visit"></div>
          </article>
          <article class="panel">
            <h2>下载地域 TOP</h2>
            <div class="chart" data-chart="geo-download"></div>
          </article>
        </section>

        <section class="chart-grid">
          <article class="panel">
            <h2>设备 / 系统分布</h2>
            <div class="chart" data-chart="os"></div>
          </article>
          <article class="panel">
            <h2>下载包类型分布</h2>
            <div class="chart" data-chart="breakdown"></div>
          </article>
        </section>

        <section class="bottom-grid">
          <article class="panel">
            <h2>浏览器分布</h2>
            <div class="chart" data-chart="browser"></div>
          </article>
          <article class="panel">
            <h2>最近事件</h2>
            <div class="scroll-panel">
              <table class="recent-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>类型</th>
                    <th>IP</th>
                    <th>地域</th>
                    <th>设备</th>
                    <th>详情</th>
                  </tr>
                </thead>
                <tbody>
                  ${recent
                    .map((row) => {
                      const place = [row.country, row.region, row.city].filter(Boolean).join(' / ') || '-'
                      const detail =
                        row.event_type === 'download'
                          ? `${row.download_os || '-'}/${row.download_arch || '-'} ${row.download_file || ''}`
                          : row.browser || '-'
                      return `<tr>
                        <td>${new Date(row.ts).toLocaleString()}</td>
                        <td><span class="badge ${row.event_type === 'download' ? 'download' : ''}">${row.event_type}</span></td>
                        <td>${row.ip}</td>
                        <td>${place}</td>
                        <td>${row.os_name || row.device_type || '-'}</td>
                        <td>${detail}</td>
                      </tr>`
                    })
                    .join('')}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>`

    app.querySelector('[data-logout]')?.addEventListener('click', () => {
      token = ''
      localStorage.removeItem(TOKEN_KEY)
      renderLogin()
    })

    const dayEl = app.querySelector('[data-chart="day"]') as HTMLElement
    const monthEl = app.querySelector('[data-chart="month"]') as HTMLElement
    const geoVisitEl = app.querySelector('[data-chart="geo-visit"]') as HTMLElement
    const geoDownloadEl = app.querySelector('[data-chart="geo-download"]') as HTMLElement
    const osEl = app.querySelector('[data-chart="os"]') as HTMLElement
    const breakdownEl = app.querySelector('[data-chart="breakdown"]') as HTMLElement
    const browserEl = app.querySelector('[data-chart="browser"]') as HTMLElement

    mountChart(dayEl, lineOption('day', visitDay, downloadDay))
    mountChart(
      monthEl,
      {
        color: ['#2ad4c8', '#c6ff4d'],
        tooltip: { trigger: 'axis' },
        legend: { data: ['访问', '下载'], textStyle: { color: '#8aa0b5' } },
        grid: { left: 40, right: 20, top: 40, bottom: 30 },
        xAxis: {
          type: 'category',
          data: Array.from(new Set([...visitMonth.map((i) => i.bucket), ...downloadMonth.map((i) => i.bucket)])).sort(),
          axisLabel: { color: '#8aa0b5' },
        },
        yAxis: { type: 'value', axisLabel: { color: '#8aa0b5' }, splitLine: { lineStyle: { color: 'rgba(142,186,210,0.12)' } } },
        series: [
          {
            name: '访问',
            type: 'bar',
            data: Array.from(new Set([...visitMonth.map((i) => i.bucket), ...downloadMonth.map((i) => i.bucket)]))
              .sort()
              .map((b) => visitMonth.find((i) => i.bucket === b)?.count || 0),
          },
          {
            name: '下载',
            type: 'bar',
            data: Array.from(new Set([...visitMonth.map((i) => i.bucket), ...downloadMonth.map((i) => i.bucket)]))
              .sort()
              .map((b) => downloadMonth.find((i) => i.bucket === b)?.count || 0),
          },
        ],
      },
    )
    mountChart(
      geoVisitEl,
      barOption(
        'geo',
        geoVisit.map((r) => ({ name: `${r.country} ${r.city}`, count: r.count })),
      ),
    )
    mountChart(
      geoDownloadEl,
      barOption(
        'geo',
        geoDownload.map((r) => ({ name: `${r.country} ${r.city}`, count: r.count })),
      ),
    )
    mountChart(osEl, pieOption(devices.os))
    mountChart(
      breakdownEl,
      barOption(
        'breakdown',
        breakdown.map((r) => ({ name: `${r.os}-${r.arch}`, count: r.count })),
      ),
    )
    mountChart(browserEl, pieOption(devices.browser))

    window.addEventListener('resize', () => charts.forEach((c) => c.resize()), { once: true })
  } catch (error) {
    console.error(error)
    app.innerHTML = `<div class="dashboard"><p>加载失败，请刷新重试</p><button class="ghost-btn" data-retry>重试</button></div>`
    app.querySelector('[data-retry]')?.addEventListener('click', () => void renderDashboard())
  }
}

async function boot(): Promise<void> {
  if (!token) {
    renderLogin()
    return
  }
  try {
    await api('/api/overview')
    await renderDashboard()
    window.setInterval(() => {
      if (token) void renderDashboard()
    }, 60_000)
  } catch {
    renderLogin()
  }
}

void boot()

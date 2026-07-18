import './style.css'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ECharts, EChartsOption } from 'echarts'
import { renderRecentRows, type RecentRow } from './recentRows'
import { downloadCsv, toCsv } from './csv'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
])

type MetricBlock = {
  today: number
  month: number
  total: number
  dod: number | null
  yoyDay: number | null
  mom: number | null
  yoyMonth: number | null
}

type Overview = {
  visits: MetricBlock
  downloads: MetricBlock
}

type SeriesPoint = { bucket: string; count: number }
type NamedCount = { name: string; count: number }
type GeoRow = { country: string; region: string; city: string; count: number }
type Breakdown = { os: string; arch: string; count: number }
type HourlyPoint = { bucket: string; visits: number; downloads: number }
type HourOfDay = { hour: number; visits: number; downloads: number }

type Conversion = {
  days: number
  visits: number
  downloads: number
  eventRate: number | null
  sessionsVisited: number
  sessionsDownloaded: number
  sessionRate: number | null
}

type DashboardPayload = {
  generatedAt: string
  rangeDays: number
  overview: Overview
  conversion: Conversion
  timeseries: {
    visitDay: SeriesPoint[]
    downloadDay: SeriesPoint[]
    visitMonth: SeriesPoint[]
    downloadMonth: SeriesPoint[]
  }
  hourly: HourlyPoint[]
  hourOfDay: HourOfDay[]
  geo: { visit: GeoRow[]; download: GeoRow[] }
  devices: {
    device: NamedCount[]
    pcOs: NamedCount[]
    browser: NamedCount[]
    pcBrowser: NamedCount[]
    os: NamedCount[]
  }
  breakdown: Breakdown[]
  downloadFiles: NamedCount[]
  referrers: NamedCount[]
  recent: RecentRow[]
}

type RangeDays = 7 | 30 | 90
type RecentFilter = 'all' | 'page_view' | 'download'

const API_BASE = '/stats-api'
const REFRESH_SEC = 60
const RECENT_PAGE_SIZE = 25

let signedIn = false
let rangeDays: RangeDays = 30
let paused = false
let countdown = REFRESH_SEC
let recentFilter: RecentFilter = 'all'
let recentPage = 0
let payload: DashboardPayload | null = null
let recentRows: RecentRow[] = []
let shellReady = false
let loading = false
let refreshTimer: number | null = null
let resizeBound = false

const chartMap = new Map<string, ECharts>()

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (!(init?.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      credentials: 'same-origin',
      redirect: 'manual',
    })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : '网络请求失败')
  }
  if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
    throw new Error('CLOUDFLARE_ACCESS')
  }
  if (response.status === 401) {
    signedIn = false
    stopRefreshLoop()
    renderLogin('登录已过期，请重新登录')
    throw new Error('Unauthorized')
  }
  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()
  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`)
  }
  if (!contentType.includes('application/json')) {
    if (text.includes('cloudflare') || text.includes('Cloudflare Access')) {
      throw new Error('CLOUDFLARE_ACCESS')
    }
    throw new Error(`Unexpected response (${contentType || 'unknown'})`)
  }
  return JSON.parse(text) as T
}

function formatDelta(value: number | null, label: string): string {
  if (value === null) return `${label} —`
  const cls = value > 0 ? 'up' : value < 0 ? 'down' : ''
  const sign = value > 0 ? '+' : ''
  return `<span class="${cls}">${label} ${sign}${value}%</span>`
}

function formatRate(value: number | null): string {
  if (value === null) return '—'
  return `${value}%`
}

function disposeCharts(): void {
  for (const chart of chartMap.values()) chart.dispose()
  chartMap.clear()
}

function ensureChart(key: string, el: HTMLElement): ECharts {
  let chart = chartMap.get(key)
  if (!chart || chart.getDom() !== el) {
    chart?.dispose()
    chart = echarts.init(el)
    chartMap.set(key, chart)
  }
  return chart
}

function setChart(key: string, el: HTMLElement | null, option: EChartsOption, empty: boolean): void {
  if (!el) return
  const emptyEl = el.parentElement?.querySelector<HTMLElement>('.chart-empty')
  if (empty) {
    emptyEl?.classList.add('visible')
    const existing = chartMap.get(key)
    existing?.clear()
    return
  }
  emptyEl?.classList.remove('visible')
  ensureChart(key, el).setOption(option, { notMerge: true })
}

function isEmptyNamed(rows: NamedCount[]): boolean {
  return rows.length === 0 || rows.every((r) => r.count === 0)
}

function isEmptySeries(a: SeriesPoint[], b: SeriesPoint[]): boolean {
  return [...a, ...b].every((p) => p.count === 0)
}

function formatAxisTooltip(
  params: unknown,
  formatLabel: (bucket: string) => string,
): string {
  const items = (Array.isArray(params) ? params : [params]) as Array<{
    axisValue?: string | number
    marker?: string
    seriesName?: string
    value?: string | number
  }>
  const axis = String(items[0]?.axisValue ?? '')
  const head = formatLabel(axis)
  const lines = items.map((item) => `${item.marker ?? ''}${item.seriesName ?? ''}: ${item.value ?? 0}`)
  return [head, ...lines].join('<br/>')
}

function formatDayLabel(bucket: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bucket)
  if (!match) return bucket
  return `${Number(match[2])}月${Number(match[3])}日`
}

function formatMonthLabel(bucket: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(bucket)
  if (!match) return bucket
  return `${match[1]}年${Number(match[2])}月`
}

function formatHourBucket(bucket: string): string {
  const match = /(\d{2}):00$/.exec(bucket)
  if (!match) return bucket
  return `${Number(match[1])}时`
}

function lineOption(visits: SeriesPoint[], downloads: SeriesPoint[]): EChartsOption {
  const buckets = Array.from(new Set([...visits.map((i) => i.bucket), ...downloads.map((i) => i.bucket)])).sort()
  const visitMap = new Map(visits.map((i) => [i.bucket, i.count]))
  const downloadMap = new Map(downloads.map((i) => [i.bucket, i.count]))
  return {
    color: ['#2ad4c8', '#c6ff4d'],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => formatAxisTooltip(params, formatDayLabel),
    },
    legend: {
      data: ['访问', '下载'],
      bottom: 0,
      itemGap: 20,
      textStyle: { color: '#8aa0b5' },
    },
    grid: { left: 40, right: 20, top: 24, bottom: 72 },
    xAxis: {
      type: 'category',
      data: buckets,
      axisLabel: {
        color: '#8aa0b5',
        hideOverlap: true,
        margin: 12,
        rotate: buckets.length > 14 ? 40 : 0,
        formatter: (value: string) => formatDayLabel(value),
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8aa0b5' },
      splitLine: { lineStyle: { color: 'rgba(142,186,210,0.12)' } },
    },
    series: [
      { name: '访问', type: 'line', smooth: true, showSymbol: false, data: buckets.map((b) => visitMap.get(b) || 0) },
      { name: '下载', type: 'line', smooth: true, showSymbol: false, data: buckets.map((b) => downloadMap.get(b) || 0) },
    ],
  }
}

function barOption(rows: NamedCount[]): EChartsOption {
  return {
    color: ['#3d7bff'],
    tooltip: { trigger: 'axis' },
    grid: { left: 90, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#8aa0b5' },
      splitLine: { lineStyle: { color: 'rgba(142,186,210,0.12)' } },
    },
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

function pieOption(rows: NamedCount[]): EChartsOption {
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

function dualBarOption(
  labels: string[],
  visits: number[],
  downloads: number[],
  labelFmt?: (v: string) => string,
): EChartsOption {
  return {
    color: ['#2ad4c8', '#c6ff4d'],
    tooltip: {
      trigger: 'axis',
      formatter: labelFmt
        ? (params) => formatAxisTooltip(params, labelFmt)
        : undefined,
    },
    legend: {
      data: ['访问', '下载'],
      bottom: 0,
      itemGap: 20,
      textStyle: { color: '#8aa0b5' },
    },
    grid: { left: 40, right: 20, top: 24, bottom: 72 },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        color: '#8aa0b5',
        hideOverlap: true,
        margin: 12,
        rotate: labels.length > 14 ? 35 : 0,
        formatter: labelFmt,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8aa0b5' },
      splitLine: { lineStyle: { color: 'rgba(142,186,210,0.12)' } },
    },
    series: [
      { name: '访问', type: 'bar', data: visits },
      { name: '下载', type: 'bar', data: downloads },
    ],
  }
}

function labelDevice(name: string): string {
  if (name === 'phone' || name === 'mobile') return '手机'
  if (name === 'tablet') return '平板'
  if (name === 'pc' || name === 'desktop' || name.startsWith('desktop/')) return 'PC'
  if (name === 'unknown') return '未知'
  return name
}

function renderLogin(error = ''): void {
  disposeCharts()
  shellReady = false
  payload = null
  const app = document.getElementById('app')
  if (!app) return
  app.innerHTML = `
    <div class="login-page">
      <form class="login-card" data-login>
        <h1>MagiesTerminal Stats</h1>
        <p>输入用户名和密码进入运营大屏</p>
        <p class="login-error" role="alert" data-login-error></p>
        <label class="sr-only" for="login-username">用户名</label>
        <input id="login-username" type="text" name="username" placeholder="Username" autocomplete="username" required />
        <div class="password-field">
          <label class="sr-only" for="login-password">密码</label>
          <input id="login-password" type="password" name="password" placeholder="Password" autocomplete="current-password" required data-password />
          <button type="button" class="toggle-password" data-toggle-password aria-label="显示密码">显示</button>
        </div>
        <button type="submit">进入大屏</button>
      </form>
    </div>`

  // textContent (never innerHTML) so an error string can never inject markup.
  const errorEl = app.querySelector<HTMLElement>('[data-login-error]')
  if (errorEl) errorEl.textContent = error

  const passwordInput = app.querySelector<HTMLInputElement>('[data-password]')
  const toggleBtn = app.querySelector<HTMLButtonElement>('[data-toggle-password]')
  toggleBtn?.addEventListener('click', () => {
    if (!passwordInput || !toggleBtn) return
    const show = passwordInput.type === 'password'
    passwordInput.type = show ? 'text' : 'password'
    toggleBtn.textContent = show ? '隐藏' : '显示'
    toggleBtn.setAttribute('aria-label', show ? '隐藏密码' : '显示密码')
  })

  app.querySelector('[data-login]')?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')
    const data = new FormData(form)
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = '登录中…'
    }
    try {
      await api<{ ok: true }>('/login', {
        method: 'POST',
        body: JSON.stringify({
          username: data.get('username'),
          password: data.get('password'),
        }),
      })
      signedIn = true
      await openDashboard()
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : ''
      if (message === 'CLOUDFLARE_ACCESS') {
        renderLogin('登录接口被 Cloudflare Access 拦截。请在 Zero Trust 中对 /stats-api/* 设置 Bypass，或关闭 /stats 相关 Access 应用后重试。')
      } else {
        renderLogin('用户名或密码错误')
      }
    }
  })
}

function buildShell(): void {
  const app = document.getElementById('app')
  if (!app) return
  disposeCharts()
  app.innerHTML = `
    <div class="dashboard" data-dashboard>
      <header class="dash-header">
        <div>
          <h1>MagiesTerminal 数据运营大屏</h1>
          <div class="meta" data-meta>加载中…</div>
        </div>
        <div class="header-actions" role="toolbar" aria-label="大屏控制">
          <div class="seg" role="group" aria-label="时间范围">
            <button type="button" class="seg-btn" data-range="7" aria-pressed="false">7 日</button>
            <button type="button" class="seg-btn" data-range="30" aria-pressed="true">30 日</button>
            <button type="button" class="seg-btn" data-range="90" aria-pressed="false">90 日</button>
          </div>
          <span class="countdown" data-countdown aria-live="polite">60s</span>
          <button type="button" class="tool-btn" data-pause aria-pressed="false">暂停</button>
          <button type="button" class="tool-btn" data-refresh>刷新</button>
          <button type="button" class="tool-btn" data-export>导出 CSV</button>
          <button type="button" class="tool-btn" data-fullscreen>全屏</button>
          <button type="button" class="ghost-btn" data-logout>退出</button>
        </div>
      </header>

      <div class="loading-banner" data-loading>同步中…</div>
      <div class="error-banner" data-error role="alert">
        <span data-error-text></span>
        <button type="button" class="tool-btn" data-retry>重试</button>
      </div>

      <section class="kpi-grid" aria-label="核心指标">
        <article class="kpi-card"><div class="kpi-label">今日访问</div><div class="kpi-value" data-kpi="v-today">—</div><div class="kpi-delta" data-kpi-delta="v-today"></div></article>
        <article class="kpi-card"><div class="kpi-label">今日下载</div><div class="kpi-value" data-kpi="d-today">—</div><div class="kpi-delta" data-kpi-delta="d-today"></div></article>
        <article class="kpi-card"><div class="kpi-label">本月访问</div><div class="kpi-value" data-kpi="v-month">—</div><div class="kpi-delta" data-kpi-delta="v-month"></div></article>
        <article class="kpi-card"><div class="kpi-label">本月下载</div><div class="kpi-value" data-kpi="d-month">—</div><div class="kpi-delta" data-kpi-delta="d-month"></div></article>
      </section>

      <section class="kpi-grid secondary" aria-label="转化与累计">
        <article class="kpi-card"><div class="kpi-label">区间访问</div><div class="kpi-value" data-kpi="range-visits">—</div><div class="kpi-delta">选定时间范围</div></article>
        <article class="kpi-card"><div class="kpi-label">区间下载</div><div class="kpi-value" data-kpi="range-downloads">—</div><div class="kpi-delta">选定时间范围</div></article>
        <article class="kpi-card"><div class="kpi-label">事件转化率</div><div class="kpi-value" data-kpi="event-rate">—</div><div class="kpi-delta">下载 / 访问</div></article>
        <article class="kpi-card"><div class="kpi-label">会话转化率</div><div class="kpi-value" data-kpi="session-rate">—</div><div class="kpi-delta" data-kpi-delta="session-hint">有下载的会话 / 有访问的会话</div></article>
      </section>

      <section class="kpi-grid secondary" aria-label="累计">
        <article class="kpi-card"><div class="kpi-label">总计访问</div><div class="kpi-value" data-kpi="v-total">—</div><div class="kpi-delta">累计 page view</div></article>
        <article class="kpi-card"><div class="kpi-label">总计下载</div><div class="kpi-value" data-kpi="d-total">—</div><div class="kpi-delta">累计 download</div></article>
        <article class="kpi-card"><div class="kpi-label">访问会话</div><div class="kpi-value" data-kpi="sessions-v">—</div><div class="kpi-delta">区间 unique session</div></article>
        <article class="kpi-card"><div class="kpi-label">下载会话</div><div class="kpi-value" data-kpi="sessions-d">—</div><div class="kpi-delta">区间 unique session</div></article>
      </section>

      <section class="chart-grid">
        <article class="panel wide">
          <h2 data-day-title>近 30 日访问 / 下载趋势</h2>
          <div class="chart tall" data-chart="day" role="img" aria-label="日趋势图"></div>
          <div class="chart-empty">暂无趋势数据</div>
        </article>
        <article class="panel">
          <h2>近 12 月访问 / 下载</h2>
          <div class="chart" data-chart="month" role="img" aria-label="月趋势图"></div>
          <div class="chart-empty">暂无月度数据</div>
        </article>
      </section>

      <section class="chart-grid equal">
        <article class="panel">
          <h2>近 24 小时（按小时）</h2>
          <div class="chart" data-chart="hourly" role="img" aria-label="24小时图"></div>
          <div class="chart-empty">近 24 小时暂无数据</div>
        </article>
        <article class="panel">
          <h2 data-hod-title>时段分布（0–23 时）</h2>
          <div class="chart" data-chart="hod" role="img" aria-label="时段分布图"></div>
          <div class="chart-empty">暂无时段数据</div>
        </article>
      </section>

      <section class="chart-grid equal">
        <article class="panel">
          <h2>访问地域 TOP</h2>
          <div class="chart" data-chart="geo-visit" role="img" aria-label="访问地域"></div>
          <div class="chart-empty">暂无地域数据</div>
        </article>
        <article class="panel">
          <h2>下载地域 TOP</h2>
          <div class="chart" data-chart="geo-download" role="img" aria-label="下载地域"></div>
          <div class="chart-empty">暂无地域数据</div>
        </article>
      </section>

      <section class="chart-grid triple">
        <article class="panel">
          <h2>设备类型</h2>
          <div class="chart" data-chart="device" role="img" aria-label="设备类型"></div>
          <div class="chart-empty">暂无设备数据</div>
        </article>
        <article class="panel">
          <h2>PC 系统</h2>
          <div class="chart" data-chart="pc-os" role="img" aria-label="PC系统"></div>
          <div class="chart-empty">暂无系统数据</div>
        </article>
        <article class="panel">
          <h2>浏览器分布</h2>
          <div class="chart" data-chart="browser" role="img" aria-label="浏览器"></div>
          <div class="chart-empty">暂无浏览器数据</div>
        </article>
      </section>

      <section class="chart-grid triple">
        <article class="panel">
          <h2>来源 Referrer</h2>
          <div class="chart" data-chart="referrers" role="img" aria-label="来源"></div>
          <div class="chart-empty">暂无来源数据</div>
        </article>
        <article class="panel">
          <h2>下载包 OS / Arch</h2>
          <div class="chart" data-chart="breakdown" role="img" aria-label="下载包类型"></div>
          <div class="chart-empty">暂无下载分布</div>
        </article>
        <article class="panel">
          <h2>下载文件 TOP</h2>
          <div class="chart" data-chart="files" role="img" aria-label="下载文件"></div>
          <div class="chart-empty">暂无文件数据</div>
        </article>
      </section>

      <section class="chart-grid">
        <article class="panel" style="grid-column: 1 / -1">
          <div class="panel-toolbar">
            <h2>最近事件</h2>
            <div class="recent-controls">
              <label class="sr-only" for="recent-filter">事件类型</label>
              <select id="recent-filter" data-recent-filter aria-label="事件类型筛选">
                <option value="all">全部</option>
                <option value="page_view">访问</option>
                <option value="download">下载</option>
              </select>
              <button type="button" class="tool-btn" data-recent-prev>上一页</button>
              <span class="countdown" data-recent-page>1</span>
              <button type="button" class="tool-btn" data-recent-next>下一页</button>
            </div>
          </div>
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
              <tbody data-recent-body>
                <tr><td colspan="6" class="recent-empty">加载中…</td></tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>`

  shellReady = true
  bindShellEvents(app)
  ensureResizeHandler()
}

function bindShellEvents(app: HTMLElement): void {
  app.querySelectorAll<HTMLButtonElement>('[data-range]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = Number(btn.dataset.range) as RangeDays
      if (next === rangeDays) return
      rangeDays = next
      app.querySelectorAll<HTMLButtonElement>('[data-range]').forEach((b) => {
        b.setAttribute('aria-pressed', String(Number(b.dataset.range) === rangeDays))
      })
      void refreshDashboard(true)
    })
  })

  app.querySelector('[data-pause]')?.addEventListener('click', () => {
    paused = !paused
    const btn = app.querySelector<HTMLButtonElement>('[data-pause]')
    if (btn) {
      btn.textContent = paused ? '继续' : '暂停'
      btn.setAttribute('aria-pressed', String(paused))
    }
    updateCountdownUi()
  })

  app.querySelector('[data-refresh]')?.addEventListener('click', () => {
    void refreshDashboard(true)
  })

  app.querySelector('[data-retry]')?.addEventListener('click', () => {
    void refreshDashboard(true)
  })

  app.querySelector('[data-export]')?.addEventListener('click', () => {
    exportCsv()
  })

  app.querySelector('[data-fullscreen]')?.addEventListener('click', () => {
    void toggleFullscreen()
  })

  app.querySelector('[data-logout]')?.addEventListener('click', () => {
    signedIn = false
    stopRefreshLoop()
    void fetch('/stats-api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    }).finally(() => renderLogin())
  })

  app.querySelector('[data-recent-filter]')?.addEventListener('change', (event) => {
    const value = (event.target as HTMLSelectElement).value as RecentFilter
    recentFilter = value
    recentPage = 0
    void loadRecent()
  })

  app.querySelector('[data-recent-prev]')?.addEventListener('click', () => {
    if (recentPage <= 0) return
    recentPage -= 1
    void loadRecent()
  })

  app.querySelector('[data-recent-next]')?.addEventListener('click', () => {
    recentPage += 1
    void loadRecent()
  })
}

function ensureResizeHandler(): void {
  if (resizeBound) return
  resizeBound = true
  window.addEventListener('resize', () => {
    for (const chart of chartMap.values()) chart.resize()
  })
  document.addEventListener('fullscreenchange', () => {
    document.body.classList.toggle('kiosk', Boolean(document.fullscreenElement))
    for (const chart of chartMap.values()) chart.resize()
  })
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch (error) {
    console.error(error)
  }
}

function setLoading(on: boolean): void {
  loading = on
  const el = document.querySelector('[data-loading]')
  el?.classList.toggle('visible', on)
  const refreshBtn = document.querySelector<HTMLButtonElement>('[data-refresh]')
  if (refreshBtn) refreshBtn.disabled = on
}

function setError(message: string | null): void {
  const banner = document.querySelector('[data-error]')
  const text = document.querySelector('[data-error-text]')
  if (!banner || !text) return
  if (message) {
    text.textContent = message
    banner.classList.add('visible')
  } else {
    text.textContent = ''
    banner.classList.remove('visible')
  }
}

function updateCountdownUi(): void {
  const el = document.querySelector('[data-countdown]')
  if (!el) return
  if (paused) {
    el.textContent = '已暂停'
    el.classList.add('paused')
  } else {
    el.textContent = `${countdown}s`
    el.classList.remove('paused')
  }
}

function updateMeta(generatedAt: string): void {
  const el = document.querySelector('[data-meta]')
  if (!el) return
  const time = new Date(generatedAt).toLocaleString()
  el.textContent = `范围 ${rangeDays} 日 · 更新于 ${time} · 自动刷新 ${REFRESH_SEC}s`
}

function paintKpis(data: DashboardPayload): void {
  const o = data.overview
  const c = data.conversion
  const set = (key: string, value: string) => {
    const el = document.querySelector(`[data-kpi="${key}"]`)
    if (el) el.textContent = value
  }
  const setHtml = (key: string, html: string) => {
    const el = document.querySelector(`[data-kpi-delta="${key}"]`)
    if (el) el.innerHTML = html
  }

  set('v-today', o.visits.today.toLocaleString())
  set('d-today', o.downloads.today.toLocaleString())
  set('v-month', o.visits.month.toLocaleString())
  set('d-month', o.downloads.month.toLocaleString())
  set('v-total', o.visits.total.toLocaleString())
  set('d-total', o.downloads.total.toLocaleString())
  set('range-visits', c.visits.toLocaleString())
  set('range-downloads', c.downloads.toLocaleString())
  set('event-rate', formatRate(c.eventRate))
  set('session-rate', formatRate(c.sessionRate))
  set('sessions-v', c.sessionsVisited.toLocaleString())
  set('sessions-d', c.sessionsDownloaded.toLocaleString())

  setHtml('v-today', `${formatDelta(o.visits.dod, '环比')} · ${formatDelta(o.visits.yoyDay, '同比')}`)
  setHtml('d-today', `${formatDelta(o.downloads.dod, '环比')} · ${formatDelta(o.downloads.yoyDay, '同比')}`)
  setHtml('v-month', `${formatDelta(o.visits.mom, '环比')} · ${formatDelta(o.visits.yoyMonth, '同比')}`)
  setHtml('d-month', `${formatDelta(o.downloads.mom, '环比')} · ${formatDelta(o.downloads.yoyMonth, '同比')}`)
}

function paintCharts(data: DashboardPayload): void {
  const dayTitle = document.querySelector('[data-day-title]')
  if (dayTitle) dayTitle.textContent = `近 ${data.rangeDays} 日访问 / 下载趋势`
  const hodTitle = document.querySelector('[data-hod-title]')
  if (hodTitle) hodTitle.textContent = `时段分布（近 ${data.rangeDays} 日 · 0–23 时）`

  const q = (key: string) => document.querySelector<HTMLElement>(`[data-chart="${key}"]`)

  const { visitDay, downloadDay, visitMonth, downloadMonth } = data.timeseries
  setChart('day', q('day'), lineOption(visitDay, downloadDay), isEmptySeries(visitDay, downloadDay))

  const monthBuckets = Array.from(
    new Set([...visitMonth.map((i) => i.bucket), ...downloadMonth.map((i) => i.bucket)]),
  ).sort()
  const monthVisits = monthBuckets.map((b) => visitMonth.find((i) => i.bucket === b)?.count || 0)
  const monthDownloads = monthBuckets.map((b) => downloadMonth.find((i) => i.bucket === b)?.count || 0)
  setChart(
    'month',
    q('month'),
    dualBarOption(monthBuckets, monthVisits, monthDownloads, formatMonthLabel),
    monthVisits.every((n) => n === 0) && monthDownloads.every((n) => n === 0),
  )

  const hourlyEmpty = data.hourly.every((h) => h.visits === 0 && h.downloads === 0)
  setChart(
    'hourly',
    q('hourly'),
    dualBarOption(
      data.hourly.map((h) => h.bucket),
      data.hourly.map((h) => h.visits),
      data.hourly.map((h) => h.downloads),
      formatHourBucket,
    ),
    hourlyEmpty,
  )

  const hodEmpty = data.hourOfDay.every((h) => h.visits === 0 && h.downloads === 0)
  setChart(
    'hod',
    q('hod'),
    dualBarOption(
      data.hourOfDay.map((h) => `${h.hour}`),
      data.hourOfDay.map((h) => h.visits),
      data.hourOfDay.map((h) => h.downloads),
      (v) => `${v}时`,
    ),
    hodEmpty,
  )

  const geoVisit = data.geo.visit.map((r) => ({ name: `${r.country} ${r.city}`, count: r.count }))
  const geoDownload = data.geo.download.map((r) => ({ name: `${r.country} ${r.city}`, count: r.count }))
  setChart('geo-visit', q('geo-visit'), barOption(geoVisit), isEmptyNamed(geoVisit))
  setChart('geo-download', q('geo-download'), barOption(geoDownload), isEmptyNamed(geoDownload))

  const devices = data.devices.device.map((r) => ({ ...r, name: labelDevice(r.name) }))
  const pcOs = (data.devices.pcOs || data.devices.os).map((r) => ({
    ...r,
    name: r.name === 'Unknown' ? '未知' : r.name,
  }))
  const browsers = data.devices.browser.map((r) => ({
    ...r,
    name: r.name === 'Unknown' ? '未知' : r.name,
  }))
  setChart('device', q('device'), pieOption(devices), isEmptyNamed(devices))
  setChart('pc-os', q('pc-os'), pieOption(pcOs), isEmptyNamed(pcOs))
  setChart('browser', q('browser'), pieOption(browsers), isEmptyNamed(browsers))

  const referrers = data.referrers.map((r) => ({
    ...r,
    name: r.name === '(direct)' ? '直接访问' : r.name,
  }))
  const breakdown = data.breakdown.map((r) => ({ name: `${r.os}-${r.arch}`, count: r.count }))
  setChart('referrers', q('referrers'), barOption(referrers), isEmptyNamed(referrers))
  setChart('breakdown', q('breakdown'), barOption(breakdown), isEmptyNamed(breakdown))
  setChart('files', q('files'), barOption(data.downloadFiles), isEmptyNamed(data.downloadFiles))
}

function paintRecent(rows: RecentRow[]): void {
  const body = document.querySelector('[data-recent-body]')
  if (!body) return
  if (rows.length === 0) {
    body.innerHTML = `<tr><td colspan="6" class="recent-empty">暂无事件</td></tr>`
  } else {
    body.innerHTML = renderRecentRows(rows)
  }
  const pageEl = document.querySelector('[data-recent-page]')
  if (pageEl) pageEl.textContent = String(recentPage + 1)
  const prev = document.querySelector<HTMLButtonElement>('[data-recent-prev]')
  if (prev) prev.disabled = recentPage <= 0
  const next = document.querySelector<HTMLButtonElement>('[data-recent-next]')
  if (next) next.disabled = rows.length < RECENT_PAGE_SIZE
}

async function loadRecent(): Promise<void> {
  try {
    const typeQ = recentFilter === 'all' ? '' : `&type=${recentFilter}`
    const rows = await api<RecentRow[]>(
      `/recent?limit=${RECENT_PAGE_SIZE}&offset=${recentPage * RECENT_PAGE_SIZE}${typeQ}`,
    )
    recentRows = rows
    paintRecent(rows)
  } catch (error) {
    console.error(error)
    const body = document.querySelector('[data-recent-body]')
    if (body) body.innerHTML = `<tr><td colspan="6" class="recent-empty">最近事件加载失败</td></tr>`
  }
}

function exportCsv(): void {
  if (!payload) return
  const c = payload.conversion
  const o = payload.overview
  const summary = toCsv(
    ['metric', 'value'],
    [
      ['range_days', payload.rangeDays],
      ['generated_at', payload.generatedAt],
      ['visits_today', o.visits.today],
      ['downloads_today', o.downloads.today],
      ['visits_month', o.visits.month],
      ['downloads_month', o.downloads.month],
      ['visits_total', o.visits.total],
      ['downloads_total', o.downloads.total],
      ['range_visits', c.visits],
      ['range_downloads', c.downloads],
      ['event_rate_pct', c.eventRate ?? ''],
      ['session_rate_pct', c.sessionRate ?? ''],
      ['sessions_visited', c.sessionsVisited],
      ['sessions_downloaded', c.sessionsDownloaded],
    ],
  )
  const daySeries = toCsv(
    ['bucket', 'visits', 'downloads'],
    payload.timeseries.visitDay.map((v, i) => [
      v.bucket,
      v.count,
      payload!.timeseries.downloadDay[i]?.count ?? 0,
    ]),
  )
  const recentCsv = toCsv(
    ['ts', 'event_type', 'ip', 'country', 'region', 'city', 'device_type', 'os_name', 'browser', 'download_os', 'download_arch', 'download_file'],
    recentRows.map((r) => [
      r.ts,
      r.event_type,
      r.ip,
      r.country,
      r.region,
      r.city,
      r.device_type,
      r.os_name,
      r.browser,
      r.download_os,
      r.download_arch,
      r.download_file,
    ]),
  )
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  downloadCsv(`magies-stats-summary-${stamp}.csv`, summary)
  downloadCsv(`magies-stats-daily-${stamp}.csv`, daySeries)
  downloadCsv(`magies-stats-recent-${stamp}.csv`, recentCsv)
}

async function refreshDashboard(resetCountdown = false): Promise<void> {
  if (!signedIn || loading) return
  if (!shellReady) buildShell()
  setLoading(true)
  setError(null)
  try {
    const data = await api<DashboardPayload>(`/dashboard?days=${rangeDays}`)
    payload = data
    paintKpis(data)
    paintCharts(data)
    updateMeta(data.generatedAt)
    await loadRecent()
    if (resetCountdown) countdown = REFRESH_SEC
    updateCountdownUi()
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : '加载失败'
    if (message === 'Unauthorized') return
    if (message === 'CLOUDFLARE_ACCESS') {
      stopRefreshLoop()
      renderLogin('页面 API 被 Cloudflare Access 拦截。请先在 Zero Trust 放行 /stats-api/*，否则无法进入大屏。')
      return
    }
    setError(`加载失败：${message}`)
  } finally {
    setLoading(false)
  }
}

function stopRefreshLoop(): void {
  if (refreshTimer != null) {
    window.clearInterval(refreshTimer)
    refreshTimer = null
  }
}

function startRefreshLoop(): void {
  stopRefreshLoop()
  countdown = REFRESH_SEC
  updateCountdownUi()
  refreshTimer = window.setInterval(() => {
    if (!signedIn) return
    if (paused) {
      updateCountdownUi()
      return
    }
    countdown -= 1
    if (countdown <= 0) {
      countdown = REFRESH_SEC
      void refreshDashboard(false)
    }
    updateCountdownUi()
  }, 1000)
}

async function openDashboard(): Promise<void> {
  buildShell()
  await refreshDashboard(true)
  startRefreshLoop()
}

async function boot(): Promise<void> {
  try {
    await api('/overview')
    signedIn = true
    await openDashboard()
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message === 'CLOUDFLARE_ACCESS') {
      renderLogin('页面 API 被 Cloudflare Access 拦截。请先在 Zero Trust 放行 /stats-api/*，否则无法进入大屏。')
      return
    }
    renderLogin()
  }
}

void boot()

import { pool } from './db.js'

const sql = `
CREATE TABLE IF NOT EXISTS shell_events (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'download')),
  ip TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  isp TEXT,
  ua TEXT,
  device_type TEXT,
  os_name TEXT,
  os_version TEXT,
  browser TEXT,
  download_os TEXT,
  download_arch TEXT,
  download_file TEXT,
  path TEXT,
  referrer TEXT,
  session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_shell_events_ts ON shell_events (ts DESC);
CREATE INDEX IF NOT EXISTS idx_shell_events_type_ts ON shell_events (event_type, ts DESC);
CREATE INDEX IF NOT EXISTS idx_shell_events_ip ON shell_events (ip);
CREATE INDEX IF NOT EXISTS idx_shell_events_session ON shell_events (session_id);
CREATE INDEX IF NOT EXISTS idx_shell_events_referrer_ts ON shell_events (referrer, ts DESC)
  WHERE event_type = 'page_view';
CREATE INDEX IF NOT EXISTS idx_shell_events_dl_file_ts ON shell_events (download_file, ts DESC)
  WHERE event_type = 'download';
CREATE INDEX IF NOT EXISTS idx_shell_events_country_ts ON shell_events (country, ts DESC);
`

async function main() {
  await pool.query(sql)
  console.log('Migration complete')
  await pool.end()
}

main().catch(async (error) => {
  console.error(error)
  await pool.end()
  process.exit(1)
})

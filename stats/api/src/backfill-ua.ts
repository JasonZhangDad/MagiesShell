import { query, pool } from './db.js'
import { parseUa } from './ua.js'

async function main() {
  const result = await query<{ id: string; ua: string | null }>(
    `SELECT id::text AS id, ua FROM shell_events WHERE ua IS NOT NULL`,
  )

  let updated = 0
  for (const row of result.rows) {
    const info = parseUa(row.ua)
    await query(
      `UPDATE shell_events
       SET device_type = $2,
           os_name = $3,
           os_version = $4,
           browser = $5
       WHERE id = $1`,
      [row.id, info.deviceType, info.osName, info.osVersion, info.browser],
    )
    updated += 1
  }

  console.log(`Backfilled ${updated} events`)
  await pool.end()
}

main().catch(async (error) => {
  console.error(error)
  await pool.end()
  process.exit(1)
})

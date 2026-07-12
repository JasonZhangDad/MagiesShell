import dotenv from 'dotenv'

dotenv.config()

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`Missing env ${name}`)
  return value
}

export const env = {
  port: Number(process.env.PORT || 8787),
  databaseUrl: required(
    'DATABASE_URL',
    'postgres://magies_shell:magies_shell@127.0.0.1:5432/magies_shell_stats',
  ),
  statsPassword: required('STATS_PASSWORD', 'MagiesStats2026!'),
  jwtSecret: required('JWT_SECRET', 'magies-shell-stats-jwt-change-me'),
  corsOrigins: (process.env.CORS_ORIGINS || 'https://shell.magies.top,https://shell-stats.magies.top,http://localhost:5174,http://localhost:5175')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
}

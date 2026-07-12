import dotenv from 'dotenv'

dotenv.config()

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env ${name}`)
  return value
}

export const env = {
  port: Number(process.env.PORT || 8787),
  databaseUrl: required('DATABASE_URL'),
  statsUsername: required('STATS_USERNAME'),
  statsPassword: required('STATS_PASSWORD'),
  jwtSecret: required('JWT_SECRET'),
  corsOrigins: (process.env.CORS_ORIGINS || 'https://shell.magies.top,https://shell-stats.magies.top,http://localhost:5174,http://localhost:5175')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
}

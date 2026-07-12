import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const apiDirectory = fileURLToPath(new URL('../api/', import.meta.url))
const envModuleUrl = new URL('../api/src/env.ts', import.meta.url).href

const requiredEnvironment = {
  DATABASE_URL: 'postgres://localhost/test',
  STATS_USERNAME: 'admin',
  STATS_PASSWORD: 'a-unique-test-password',
  JWT_SECRET: 'a-unique-test-jwt-secret',
}

for (const missingName of Object.keys(requiredEnvironment)) {
  test(`stats API refuses to start without ${missingName}`, () => {
    const childEnv = {
      ...process.env,
      ...requiredEnvironment,
    }
    delete childEnv[missingName]

    const result = spawnSync(
      process.execPath,
      ['--import', 'tsx', '--input-type=module', '--eval', `await import(${JSON.stringify(envModuleUrl)})`],
      {
        cwd: apiDirectory,
        encoding: 'utf8',
        env: childEnv,
      },
    )

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, new RegExp(`Missing env ${missingName}`))
  })
}

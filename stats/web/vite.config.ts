import { defineConfig } from 'vite'

export default defineConfig({
  base: '/stats/',
  server: { port: 5175 },
  preview: { port: 5175 },
})

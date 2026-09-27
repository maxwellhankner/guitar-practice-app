import fs from 'node:fs'
import path from 'node:path'
import { createLogger, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const logger = createLogger()
const logInfo = logger.info.bind(logger)
logger.info = (msg, options) => {
  if (typeof msg === 'string' && /\bready in \d+ ms\b/.test(msg)) {
    return
  }
  logInfo(msg, options)
}

// GitHub Pages serves this repo at /guitar-practice-app/. Local dev does not.
const pagesBase = '/guitar-practice-app/'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  customLogger: logger,
  base: command === 'build' || isPreview ? pagesBase : '/',
  plugins: [
    react(),
    {
      name: 'github-pages-spa-fallback',
      apply: 'build',
      closeBundle() {
        const dist = path.resolve('dist')
        fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'))
      },
    },
  ],
  server: {
    open: true,
    // Listen on LAN so you can open the Network URL on a phone on the same Wi‑Fi
    host: true,
    proxy: {
      // Same-origin API in dev — phone uses Mac IP :5173 only; Vite forwards to json-server
      '/api': {
        // Avoid 3001 — Cursor often binds it locally and hangs proxied requests.
        target: `http://127.0.0.1:${process.env.DEV_API_PORT ?? 3101}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
}))

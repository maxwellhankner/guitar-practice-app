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

// https://vite.dev/config/
export default defineConfig({
  customLogger: logger,
  base: '/guitar-practice-app/',
  plugins: [react()],
  server: {
    open: true,
    // Listen on LAN so you can open the Network URL on a phone on the same Wi‑Fi
    host: true,
    proxy: {
      // Same-origin API in dev — phone uses Mac IP :5173 only; Vite forwards to json-server
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

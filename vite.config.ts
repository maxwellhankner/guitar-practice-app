import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    // Listen on LAN so you can open http://<your-mac-ip>:5173 on a phone on the same Wi‑Fi
    host: true,
  },
})

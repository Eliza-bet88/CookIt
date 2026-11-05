import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/ы
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['cookit-app.eikwick.id.lv'],
  },
})

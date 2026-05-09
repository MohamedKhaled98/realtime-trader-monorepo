import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const GATEWAY_URL = process.env.VITE_GATEWAY_URL ?? 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/v1': {
        target: GATEWAY_URL,
        changeOrigin: true,
      },
      '/ws': {
        target: GATEWAY_URL,
        changeOrigin: true,
        ws: true,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/pdf': 'http://127.0.0.1:8000',
      '^/verify/$': 'http://127.0.0.1:8000',
      '^/verify/logs': 'http://127.0.0.1:8000',
      '/students': 'http://127.0.0.1:8000',
      '/documents': 'http://127.0.0.1:8000',
      '/auth': 'http://127.0.0.1:8000'
    }
  }
})

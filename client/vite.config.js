import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ask': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      // 🟢 ADD THIS BLOCK FOR LIVE DATA
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
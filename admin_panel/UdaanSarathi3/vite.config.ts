import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@api/generated': path.resolve(__dirname, './src/api/generated'),
      '@api/types': path.resolve(__dirname, './src/api/types')
    }
  }
})

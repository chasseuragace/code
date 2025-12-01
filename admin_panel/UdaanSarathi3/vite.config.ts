import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/api': path.resolve(__dirname, './src/api'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/usecases': path.resolve(__dirname, './src/usecases'),
      '@/routing': path.resolve(__dirname, './src/routing'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types')
    }
  }
})

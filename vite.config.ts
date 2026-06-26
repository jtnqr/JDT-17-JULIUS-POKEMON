/// <reference types="vitest/config" />

import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: true,
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react/') ||
              id.includes('react-dom/') ||
              id.includes('react-router-dom/') ||
              id.includes('@remix-run/')
            ) {
              return 'react'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query'
            }
            if (id.includes('@dnd-kit')) {
              return 'dndkit'
            }
            if (id.includes('zustand')) {
              return 'zustand'
            }
            if (id.includes('lucide-react')) {
              return 'lucide'
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})

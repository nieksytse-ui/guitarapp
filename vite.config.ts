/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  // base: relatief pad zodat de build ook werkt op GitHub Pages-subpaden.
  base: './',
  plugins: [react()],
  // Eigen, vaste poort voor FretFlow zodat hij niet botst met andere projecten
  // (de standaard 5173) of met gecachte pagina's/favicons daarvan.
  server: {
    port: 5273,
    strictPort: true,
    open: false,
  },
  preview: {
    port: 5273,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Splits zware libs af in eigen chunks: betere caching (Tone.js verandert
        // zelden) en het houdt de hoofd-bundle behapbaar.
        manualChunks: {
          tone: ['tone'],
          tonal: ['tonal'],
          motion: ['framer-motion'],
          svguitar: ['svguitar'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})

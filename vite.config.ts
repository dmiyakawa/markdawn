import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000, // Adjust the limit as needed (e.g., 1000 KB)
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 подключается через Vite-плагин
  ],
  server: {
    host: '0.0.0.0', // нужно для Docker
    port: 5173,
  },
})
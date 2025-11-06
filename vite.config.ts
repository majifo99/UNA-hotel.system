import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@core': '/src/core',
      '@shared': '/src/shared',
      '@modules': '/src/modules',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://backendhotelt.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

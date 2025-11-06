import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  
  return {
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
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})

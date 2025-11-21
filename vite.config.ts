import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  const isDev = mode === 'development'
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@core': '/src/core',
        '@shared': '/src/shared',
        '@modules': '/src/modules',
        '@config': '/src/config',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            // Validar que VITE_BACKEND_URL esté definido
            if (!env.VITE_BACKEND_URL) {
              throw new Error('VITE_BACKEND_URL environment variable is required for development proxy');
            }

            proxy.on('error', (err) => {
              console.error('[Proxy Error]:', err.message);
            });

            // Solo loggear en desarrollo
            if (isDev) {
              proxy.on('proxyReq', (_proxyReq, req) => {
                console.log('[Proxy Request]', req.method, req.url);
              });
              proxy.on('proxyRes', (proxyRes, req) => {
                console.log('[Proxy Response]', proxyRes.statusCode, req.url);
              });
            }
          },
        },
      },
    },
    preview: {
      allowedHosts: process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.split(',') : [],
    },
  }
})
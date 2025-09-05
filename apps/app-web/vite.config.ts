import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG || 'lichtara',
      project: process.env.SENTRY_PROJECT || 'app-web',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: process.env.SENTRY_RELEASE },
      sourcemaps: {
        assets: './dist/assets/**',
      },
      telemetry: false,
    }),
  ],
  build: {
    sourcemap: true,
  },
  server: {
    fs: { allow: ['..'] },
    proxy: {
      // Proxy para serviço syntaris-harmony durante desenvolvimento
      '/api/syntaris': {
        target: process.env.VITE_SYNTARIS_DEV_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/syntaris/, ''),
      },
    },
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig(() => {
  const plugins = [react()]

  if (process.env.CI && process.env.SENTRY_AUTH_TOKEN) {
    plugins.push(
      sentryVitePlugin({
        org: process.env.SENTRY_ORG || 'lichtara',
        project: process.env.SENTRY_PROJECT || 'app-web',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: { name: process.env.SENTRY_RELEASE },
        sourcemaps: {
          assets: './dist/assets/**',
        },
        telemetry: false,
      })
    )
  }

  return {
    plugins,
    build: {
      sourcemap: true,
    },
    server: {
      fs: { allow: ['..'] }
    },
  }
})

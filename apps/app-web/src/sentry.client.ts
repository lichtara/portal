import * as Sentry from '@sentry/react'
import { useEffect } from 'react'
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom'

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined

function parseList(envVal: unknown): string[] | undefined {
  if (!envVal) return undefined
  const s = String(envVal)
  const arr = s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  return arr.length ? arr : undefined
}

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: (import.meta.env.VITE_SENTRY_RELEASE as string | undefined) || undefined,
    normalizeDepth: 5,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? (import.meta.env.MODE === 'production' ? 0.1 : 0)),
    replaysSessionSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0),
    replaysOnErrorSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? 0),
    allowUrls: parseList(import.meta.env.VITE_SENTRY_ALLOW_URLS) || [
      // Defaults: current origin + localhost
      (typeof window !== 'undefined' ? window.location.origin : ''),
      'localhost',
    ],
    denyUrls: parseList(import.meta.env.VITE_SENTRY_DENY_URLS),
    beforeSend(event) {
      // Scrub Authorization headers if present
      if (event.request && event.request.headers) {
        const headers = event.request.headers as Record<string, unknown>
        for (const k of Object.keys(headers)) {
          if (k.toLowerCase() === 'authorization') {
            headers[k] = '[Filtered]'
          }
        }
      }
      return event
    },
  })
}

export { Sentry }

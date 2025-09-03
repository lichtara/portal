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
          if (k.toLowerCase() === 'authorization') headers[k] = '[Filtered]'
        }
      }

      const emailRe = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
      const cpfRe = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g
      const redact = (s: string) => s.replace(emailRe, '[redacted-email]').replace(cpfRe, '[redacted-cpf]')

      // Redact tokens in URLs
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url)
          for (const key of u.searchParams.keys()) {
            if (/token|key|secret|password/i.test(key)) u.searchParams.set(key, '[Filtered]')
          }
          event.request.url = u.toString()
        } catch {}
      }

      const sanitize = (val: unknown): unknown => {
        if (!val) return val
        if (typeof val === 'string') return redact(val)
        if (Array.isArray(val)) return val.map(sanitize)
        if (typeof val === 'object') {
          const out: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
            out[k] = sanitize(v)
          }
          return out
        }
        return val
      }

      // Sanitize user, tags, extra, contexts
      if (event.user) {
        const s = sanitize(event.user) as typeof event.user
        event.user = s
      }
      if (event.extra) {
        const s = sanitize(event.extra) as typeof event.extra
        event.extra = s
      }
      if (event.tags) {
        const s = sanitize(event.tags) as typeof event.tags
        event.tags = s
      }
      if (event.contexts) {
        const s = sanitize(event.contexts) as typeof event.contexts
        event.contexts = s
      }

      return event
    },
  })
}

export { Sentry }

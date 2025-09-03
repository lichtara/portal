import express from 'express'
import pino from 'pino'
import client from 'prom-client'

const service = process.env.SERVICE_NAME || 'syntaris-harmony'
const env = process.env.NODE_ENV || 'dev'
const version = process.env.APP_VERSION || 'dev'
const port = Number(process.env.PORT || 3000)

const log = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()

// Prometheus registry and metrics
const register = new client.Registry()
client.collectDefaultMetrics({ register })

const httpReqs = new client.Counter({
  name: 'http_requests_total',
  help: 'Requests count',
  labelNames: ['service', 'method', 'route', 'status'],
})
const httpDur = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration seconds',
  labelNames: ['service', 'method', 'route', 'status'],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
})
const inflight = new client.Gauge({
  name: 'http_inflight_requests',
  help: 'Inflight requests',
  labelNames: ['service'],
})
const heartbeat = new client.Counter({
  name: 'lunara_heartbeat_total',
  help: 'Heartbeat por serviço',
  labelNames: ['service'],
})

register.registerMetric(httpReqs)
register.registerMetric(httpDur)
register.registerMetric(inflight)
register.registerMetric(heartbeat)

// Extract trace info from W3C traceparent if present
function getTraceIds(req) {
  const tp = req.headers['traceparent']
  if (typeof tp === 'string') {
    // traceparent: version-traceid-spanid-flags
    const parts = tp.split('-')
    if (parts.length >= 4) {
      return { traceId: parts[1], spanId: parts[2] }
    }
  }
  return { traceId: undefined, spanId: undefined }
}

// Request metrics + logs
app.use((req, res, next) => {
  inflight.inc({ service })
  const start = process.hrtime.bigint()
  const labels = { service, method: req.method, route: req.path }

  res.on('finish', () => {
    const end = process.hrtime.bigint()
    const durSeconds = Number(end - start) / 1e9
    const status = res.statusCode
    httpDur.observe({ ...labels, status }, durSeconds)
    httpReqs.inc({ ...labels, status })
    inflight.dec({ service })

    const { traceId, spanId } = getTraceIds(req)
    log.info({
      msg: 'request',
      service,
      env,
      version,
      traceId,
      spanId,
      http: {
        method: req.method,
        path: req.originalUrl || req.url,
        status,
        duration_ms: Math.round(durSeconds * 1000),
      },
    })
  })

  next()
})

// Health endpoints
app.get('/healthz', (_req, res) => res.status(200).send('ok'))
app.get('/readyz', async (_req, res) => {
  const depsOk = true // TODO: check db/cache/queues
  res.status(depsOk ? 200 : 503).send(depsOk ? 'ready' : 'not-ready')
})

// Metrics endpoint
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

// Example root
app.get('/', (_req, res) => {
  res.json({ service, env, version, ok: true })
})

// LUNARA heartbeat
setInterval(() => {
  heartbeat.inc({ service })
  log.info({ msg: 'lunara_heartbeat', service })
}, 30_000)

app.listen(port, () => {
  log.info({ msg: 'listening', service, env, version, port })
})


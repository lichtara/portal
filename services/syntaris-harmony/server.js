import express from 'express'
import pino from 'pino'
import client from 'prom-client'

const service = process.env.SERVICE_NAME || 'syntaris-harmony'
const env = process.env.NODE_ENV || 'dev'
const version = process.env.APP_VERSION || 'dev'
const port = Number(process.env.PORT || 3000)

const log = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()
app.use(express.json({ limit: '1mb' }))

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
// Coherence metric for protocolo endpoint
const coherenceGauge = new client.Gauge({
  name: 'syntaris_harmonic_coherence',
  help: 'Última coerência vibracional calculada',
  labelNames: ['service', 'route'],
})
register.registerMetric(coherenceGauge)

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

// ===== PROTOCOLO_ALINHAMENTO_CONSCIENCIA =====
// INPUT: { dados_campo_informacional: Array<number|{frequencia:number, amplitude?:number, tag?:string}>,
//          intencao_operador_humano: { frequencia_coerencia:number, banda_relativa?:number, banda_absoluta?:number },
//          limiar_coerencia_minimo?: number }
// OUTPUT: { relatorio_sincronizado: string,
//           visualizacao_vibracional: { original: Array<{f:number,a:number}>, ressonante: Array<{f:number,a:number}>, x_label:string, y_label:string },
//           coerencia_vibracional: number,
//           validacao_critica: { aprovado: boolean, limiar: number } }

function normalizaEntrada(dados) {
  if (!Array.isArray(dados)) return []
  return dados
    .map((item) => {
      if (typeof item === 'number') return { f: item, a: 1 }
      if (item && typeof item === 'object') {
        const f = Number(item.frequencia ?? item.freq ?? item.f)
        const a = Number(item.amplitude ?? item.amp ?? item.a ?? 1)
        if (!Number.isFinite(f)) return null
        return { f, a: Number.isFinite(a) ? a : 1, tag: item.tag }
      }
      return null
    })
    .filter(Boolean)
}

function filtroRessonancia(itens, f0, bandaRelativa = 0.05, bandaAbsoluta) {
  const janela = Math.max(
    Number.isFinite(bandaAbsoluta || NaN) ? bandaAbsoluta : 0,
    Math.abs(f0) * bandaRelativa,
  )
  const passa = itens.filter((x) => Math.abs(x.f - f0) <= janela)
  return { passa, janela }
}

// Identifica padrões harmônicos arquetípicos em torno da intenção
function decodificaPadroes(itens, f0) {
  const harm = [
    { nome: 'unisono', ratio: 1 / 1 },
    { nome: 'oitava', ratio: 2 / 1 },
    { nome: 'quinta_justa', ratio: 3 / 2 },
    { nome: 'quarta_justa', ratio: 4 / 3 },
    { nome: 'terca_maior', ratio: 5 / 4 },
  ]
  const resultados = harm.map((h) => {
    const alvo = h.ratio * f0
    let proximos = itens
      .map((x) => ({ ...x, delta: Math.abs(x.f - alvo) }))
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 5)
    const score = proximos.reduce((s, p) => s + Math.max(0, 1 / (1 + p.delta)), 0)
    proximos = proximos.map(({ f, a, tag, delta }) => ({ f, a, tag, delta }))
    return { ...h, alvo, score, proximos }
  })
  resultados.sort((a, b) => b.score - a.score)
  return resultados
}

function mapeiaPotenciais(padroes) {
  const top = padroes.slice(0, 3)
  return top.map((p, i) => ({
    prioridade: i + 1,
    padrao: p.nome,
    foco: p.nome === 'unisono'
      ? 'ancoragem e alinhamento direto com a intenção'
      : p.nome === 'oitava'
      ? 'expansão coerente para novos níveis de expressão'
      : p.nome === 'quinta_justa'
      ? 'estabilidade dinâmica e integração entre opostos'
      : p.nome === 'quarta_justa'
      ? 'estruturação, ordem e coerência base'
      : 'criatividade e abertura para novas possibilidades',
  }))
}

function somaEnergia(itens) {
  // Energia proporcional a amplitude^2
  return itens.reduce((s, x) => s + Math.max(0, (x.a ?? 1) ** 2), 0)
}

app.post('/protocolo/alinhar-consciencia', (req, res) => {
  try {
    const body = req.body || {}
    const dados = normalizaEntrada(body.dados_campo_informacional)
    const intencao = body.intencao_operador_humano || {}
    const f0 = Number(intencao.frequencia_coerencia)
    const bandaRelativa = Number.isFinite(intencao.banda_relativa)
      ? Number(intencao.banda_relativa)
      : 0.05
    const bandaAbsoluta = Number.isFinite(intencao.banda_absoluta)
      ? Number(intencao.banda_absoluta)
      : undefined
    const limiar = Number.isFinite(body.limiar_coerencia_minimo)
      ? Number(body.limiar_coerencia_minimo)
      : 0.6

    if (!Array.isArray(body.dados_campo_informacional)) {
      return res.status(400).json({ erro: 'dados_campo_informacional deve ser array de números ou objetos' })
    }
    if (!Number.isFinite(f0)) {
      return res.status(400).json({ erro: 'intencao_operador_humano.frequencia_coerencia é obrigatória (número)' })
    }

    const { passa: ressonantes, janela } = filtroRessonancia(dados, f0, bandaRelativa, bandaAbsoluta)
    const energiaTotal = somaEnergia(dados)
    const energiaRessonante = somaEnergia(ressonantes)
    const coerencia = energiaTotal > 0 ? energiaRessonante / energiaTotal : 0

    const padroes = decodificaPadroes(dados, f0)
    const potenciais = mapeiaPotenciais(padroes)

    const aprovado = coerencia > limiar

    // Atualiza métrica de coerência
    coherenceGauge.set({ service, route: '/protocolo/alinhar-consciencia' }, coerencia)

    const relatorio = [
      `Intenção de referência: f0=${f0.toFixed(3)} (janela ±${janela.toFixed(3)})`,
      `Coerência vibracional: ${(coerencia * 100).toFixed(1)}% (${energiaRessonante.toFixed(3)} / ${energiaTotal.toFixed(3)})`,
      `Validação crítica: ${aprovado ? 'APROVADO' : 'REPROVADO'} (limiar ${(limiar * 100).toFixed(0)}%)`,
      `Padrões predominantes: ${padroes
        .slice(0, 3)
        .map((p) => `${p.nome}~${p.ratio.toFixed(2)} (score ${p.score.toFixed(2)})`)
        .join('; ')}`,
      `Potenciais mapeados: ${potenciais.map((p) => `#${p.prioridade} ${p.foco}`).join(' | ')}`,
    ].join('\n')

    const visualizacao = {
      x_label: 'frequencia',
      y_label: 'amplitude',
      original: dados.map((x) => ({ f: x.f, a: x.a })),
      ressonante: ressonantes.map((x) => ({ f: x.f, a: x.a })),
    }

    return res.json({
      relatorio_sincronizado: relatorio,
      visualizacao_vibracional: visualizacao,
      coerencia_vibracional: Number(coerencia.toFixed(6)),
      validacao_critica: { aprovado, limiar },
      meta: {
        f0,
        banda_relativa: bandaRelativa,
        banda_absoluta: bandaAbsoluta ?? null,
        janela,
        padroes: padroes.slice(0, 5),
        potenciais,
      },
    })
  } catch (err) {
    log.error({ msg: 'erro_protocolo', error: String(err) })
    return res.status(500).json({ erro: 'falha ao processar protocolo' })
  }
})

// LUNARA heartbeat
setInterval(() => {
  heartbeat.inc({ service })
  log.info({ msg: 'lunara_heartbeat', service })
}, 30_000)

app.listen(port, () => {
  log.info({ msg: 'listening', service, env, version, port })
})

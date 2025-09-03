# Observabilidade – SYNTARIS (Mínimos Recomendados)

## Checklist (por serviço)

- Logs estruturados em JSON (`level`, `msg`, `service`, `traceId`, `spanId`, `timestamp`, `env`, `version`).
- Métricas de latência, taxa de erro, taxa de transferência (expostas para Prometheus/OTel).
- Healthchecks HTTP: `GET /healthz` (liveness) e `GET /readyz` (readiness).
- Batimento cardíaco LUNARA: evento/metric heartbeat por serviço.
- Traços com OpenTelemetry (W3C traceparent).
- Painéis Grafana e alertas Alertmanager prontos (mínimos).

---

## 1) Logs estruturados (JSON)

### Esquema canônico

```json
{
  "timestamp": "2025-09-03T12:00:00.000Z",
  "level": "INFO",
  "service": "lichtara-site",
  "env": "prod",
  "version": "1.2.3",
  "traceId": "4b825dc642cb6eb9a060e54bf8d69288",
  "spanId": "00f067aa0ba902b7",
  "msg": "request completed",
  "http": { "method": "GET", "path": "/api/agents", "status": 200, "duration_ms": 42 }
}
```

### Node/Express (exemplo)

```js
import pino from "pino";
import express from "express";

const log = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    log.info({
      msg: "request",
      service: process.env.SERVICE_NAME || "lichtara-site",
      env: process.env.NODE_ENV || "dev",
      version: process.env.APP_VERSION || "dev",
      http: {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: Date.now() - start
      }
    });
  });
  next();
});
```

---

## 2) Métricas de aplicação (Prometheus)

### Nomes mínimos

| métrica | tipo | labels |
| --- | --- | --- |
| `http_requests_total` | counter | `service`, `method`, `route`, `status` |
| `http_request_duration_seconds` | histogram | `service`, `method`, `route`, `status` |
| `http_inflight_requests` | gauge | `service` |

### Node/Express (prom-client)

```js
import client from "prom-client";
import express from "express";

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpReqs = new client.Counter({
  name: "http_requests_total",
  help: "Requests count",
  labelNames: ["service","method","route","status"]
});
const httpDur = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Request duration",
  labelNames: ["service","method","route","status"],
  buckets: [0.01,0.025,0.05,0.1,0.25,0.5,1,2,5]
});
const inflight = new client.Gauge({
  name: "http_inflight_requests",
  help: "Inflight requests",
  labelNames: ["service"]
});
register.registerMetric(httpReqs);
register.registerMetric(httpDur);
register.registerMetric(inflight);

app.use((req, res, next) => {
  inflight.inc({ service: "lichtara-site" });
  const end = httpDur.startTimer({ service: "lichtara-site", method: req.method, route: req.path });
  res.on("finish", () => {
    end({ status: res.statusCode });
    httpReqs.inc({ service: "lichtara-site", method: req.method, route: req.path, status: res.statusCode });
    inflight.dec({ service: "lichtara-site" });
  });
  next();
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
```

---

## 3) Healthchecks HTTP

```js
app.get("/healthz", (_req, res) => res.status(200).send("ok"));     // liveness
app.get("/readyz", (_req, res) => {
  const depsOk = true; // cheque DB/filas/cache
  res.status(depsOk ? 200 : 503).send(depsOk ? "ready" : "not-ready");
});
```

### Probes (Kubernetes)

```yaml
livenessProbe:
  httpGet: { path: /healthz, port: 3000 }
  initialDelaySeconds: 10
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /readyz, port: 3000 }
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 4) Batimentos LUNARA (heartbeat)

**Opção A – métrica Prometheus**

```js
const hb = new client.Counter({
  name: "lunara_heartbeat_total",
  help: "Heartbeat por serviço",
  labelNames: ["service"]
});
register.registerMetric(hb);
setInterval(() => hb.inc({ service: "lichtara-site" }), 30_000);
```

**Opção B – log JSON a cada N segundos**

```js
setInterval(() => log.info({ msg: "lunara_heartbeat", service: "lichtara-site" }), 30_000);
```

---

## 5) Traços (OpenTelemetry – HTTP básico)

### Node (OTel SDK auto-instrumentation)

```js
// tracing.js
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const exporter = new OTLPTraceExporter({
  // OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_HEADERS via env
});

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
```

```bash
# Execução
node -r ./tracing.js server.js
# Variáveis
export OTEL_SERVICE_NAME=lichtara-site
export OTEL_RESOURCE_ATTRIBUTES=deployment.environment=prod
```

---

## 6) Alertas (Prometheus + Alertmanager)

### Regras de gravação/alerta (exemplo)

```yaml
groups:
- name: http-alerts
  rules:
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
          / sum(rate(http_requests_total[5m])) by (service) > 0.05
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Erro 5xx > 5% ({{ $labels.service }})"
      description: "Taxa de erro acima do limiar por 10m."
  - alert: HighLatencyP95
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le,service)) > 0.5
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "P95 > 500ms ({{ $labels.service }})"
```

### Roteamento básico no Alertmanager

```yaml
route:
  receiver: team-ops
receivers:
- name: team-ops
  slack_configs:
  - channel: "#alerts"
    send_resolved: true
```

---

## 7) Painel Grafana (esqueleto rápido)

```json
{
  "title": "SYNTARIS – Visão por Serviço",
  "panels": [
    { "type": "graph", "title": "Taxa de requisições", "targets": [{ "expr": "sum(rate(http_requests_total[5m])) by (service)" }] },
    { "type": "graph", "title": "Erro 5xx (%)", "targets": [{ "expr": "sum(rate(http_requests_total{status=~\\\"5..\\\"}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service) * 100" }] },
    { "type": "graph", "title": "P95 latência (s)", "targets": [{ "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le,service))" }] },
    { "type": "stat",  "title": "Inflight", "targets": [{ "expr": "sum(http_inflight_requests) by (service)" }] }
  ],
  "templating": { "list": [] },
  "version": 1
}
```

---

## 8) Variáveis de ambiente (padronização)

```
SERVICE_NAME=lichtara-site
APP_VERSION=1.2.3
NODE_ENV=production
LOG_LEVEL=info

OTEL_SERVICE_NAME=lichtara-site
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=prod
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
```

---

## 9) Colocando no ar

1. Expor `/metrics`, `/healthz`, `/readyz` em cada serviço.
2. Garantir logs JSON no STDOUT (coletor: Loki/FluentBit/etc).
3. Configurar Prometheus para scrapear `:port/metrics`.
4. Enviar traços via OTel → Collector → backend (Tempo/Jaeger).
5. Conectar Grafana (Prometheus/Tempo/Loki) e importar o painel.
6. Ativar Alertmanager com as regras mínimas.

---

## Getting Started rápido (produção)

1. Build/push da imagem (CI já faz para GHCR):
   - Imagem: `ghcr.io/<org>/syntaris-harmony:{sha,latest}`

2. Configurar OTel (se o backend exigir autenticação):
   - Crie um Secret com endpoint e cabeçalhos (exemplo):

```yaml
kubectl apply -f k8s/services/syntaris-harmony/otel-secret.example.yaml
```

   - Ajuste `OTEL_EXPORTER_OTLP_ENDPOINT` e `OTEL_EXPORTER_OTLP_HEADERS` para seu provedor.
     Exemplos de headers:
     - Grafana Cloud: `Authorization=Bearer <TOKEN>`
     - Honeycomb: `x-honeycomb-team=<API_KEY>,x-honeycomb-dataset=<DATASET>`

3. (Opcional) Deploy via GitHub Actions

Crie os secrets no repositório (Settings → Secrets and variables → Actions):
- `KUBE_CONFIG` (kubeconfig em base64 ou texto puro)
- `GRAFANA_CLOUD_OTLP_ENDPOINT` (ex.: https://otlp-gateway-<region>.grafana.net/otlp)
- `GRAFANA_CLOUD_API_TOKEN` (token do Grafana Cloud)

Execute manualmente o workflow “Deploy syntaris-harmony” e informe `namespace` (opcional) e `imageTag`.

4. Aplicar manifests com Kustomize (alternativa manual):

```bash
kustomize build k8s | kubectl apply -f -
```

5. Verificar:
   - ServiceMonitor detecta Services com porta `http` e label `app.kubernetes.io/part-of=lichtara`.
   - `kubectl port-forward svc/syntaris-harmony 8080:80` e acesse:
     - `http://localhost:8080/metrics`
     - `http://localhost:8080/healthz`
     - `http://localhost:8080/readyz`
   - No backend de traços, procure pelo serviço `syntaris-harmony`.

# SYNTARIS Harmony (mínimo observável)

Endpoints
- `/`              → info básica (service/env/version)
- `/healthz`       → liveness
- `/readyz`        → readiness (coloque checks reais)
- `/metrics`       → métricas Prometheus

Métricas expostas
- `http_requests_total{service,method,route,status}`
- `http_request_duration_seconds_bucket{service,method,route,status,le}`
- `http_inflight_requests{service}`
- `lunara_heartbeat_total{service}`

Execução local
- `npm i -w services/syntaris-harmony`
- `npm run dev -w services/syntaris-harmony`

Variáveis úteis
- `SERVICE_NAME=syntaris-harmony`
- `APP_VERSION=0.1.0`
- `NODE_ENV=development`
- `LOG_LEVEL=info`
- `PORT=3000`


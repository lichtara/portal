# Observabilidade (SYNTARIS)

Mínimos recomendados para serviços:
- Logs estruturados (JSON) com `level`, `msg`, `service`, `traceId`.
- Métricas (latência, taxa de erro, throughput) exportadas para Prometheus/OTel.
- Healthchecks (`/healthz`, `/readyz`) e heartbeat (LUNARA) por serviço.

Futuros passos: integrar painéis (Grafana), alertas (Prometheus Alertmanager), e traços (OpenTelemetry).


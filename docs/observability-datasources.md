# Grafana Data Sources — Cloud (Loki/Tempo/Prometheus)

Configurações típicas para apontar Data Sources do Grafana (UI) para Grafana Cloud. Não comite segredos; use tokens com escopos mínimos.

## Loki (Logs)
- Name: `grafanacloud-lutzdebora-logs`
- URL: `https://logs-prod-024.grafana.net`
- Access: Server
- Basic Auth: enabled
  - User: `1324161`
  - Password: token `glc_…` com escopo `Logs:Read`

## Tempo (Traces)
- Name: `grafanacloud-lutzdebora-traces`
- Type: Tempo
- URL: `https://tempo-prod-17-prod-sa-east-1.grafana.net/tempo`
- Basic Auth: enabled
  - User: `1318472`
  - Password: token `glc_…` com escopo `Traces:Read`

## Prometheus (Métricas)
- Name: `grafanacloud-lutzdebora-prom`
- URL: `https://prometheus-prod-40-prod-sa-east-1.grafana.net/api/prom`
- Access: Server
- Basic Auth: enabled
  - User: `2656969`
  - Password: token `glc_…` com escopo `Metrics:Read`

## PrivateLink (envio de dados)
- Prometheus Remote Write (Alloy):
  - URL (Private DNS): `https://mimir-prod-40-cortex-gw.sa-east-1.vpce.grafana.net/api/prom/push`
  - User: `2656969`
  - Password: token `glc_…` (`Metrics:Write`)
- OTLP Gateway (serviços com OTEL direto):
  - URL (Private DNS): `https://prod-sa-east-1-otlp-gateway.sa-east-1.vpce.grafana.net/otlp`
  - Header: `Authorization: Bearer glc_…`

Observação: Data Sources para uso no painel (leitura) podem continuar usando endpoints públicos; PrivateLink foca no envio de dados do cluster sem sair da VPC.


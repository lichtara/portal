# Observabilidade no Cluster (Alloy + Grafana Cloud)

Este guia mostra como ativar traços (OTLP/Tempo), métricas (Prometheus) e logs (Loki) com o Grafana Cloud usando o Alloy como coletor único.

## Componentes
- Traces (OTLP HTTP) → Grafana Tempo
  - Service `otel-collector` recebe OTLP em `:4318` e exporta para Tempo
- Métricas (Prometheus Remote Write) → Grafana Prometheus
  - Alloy faz scrape de Services com label `app.kubernetes.io/part-of=lichtara` e porta nomeada `http` em `/metrics`
- Logs (Pods stdout/stderr) → Grafana Loki
  - DaemonSet Alloy lê `/var/log/pods` etc., extrai campos Pino JSON (`level,msg,service,env,version`) e envia ao Loki

## Secrets/Vars necessários (Grafana Cloud)
Configure em GitHub → Settings → Secrets and variables → Actions

- Obrigatórios (Traces)
  - `GRAFANA_CLOUD_OTLP_ENDPOINT` (ex.: `https://otlp-gateway-<region>.grafana.net/otlp`)
  - `GRAFANA_CLOUD_API_TOKEN` (token glc_…)
- Opcionais (Métricas Prometheus) — habilite com var `PROMETHEUS_METRICS=1`
  - `GRAFANA_CLOUD_PROM_URL` (ex.: `https://prometheus-prod-<region>.grafana.net/api/prom/push`)
  - `GRAFANA_CLOUD_PROM_USER` (instance id numérico)
  - `GRAFANA_CLOUD_PROM_PASS` (token glc_…)
- Opcionais (Logs Loki)
  - `GRAFANA_CLOUD_LOKI_URL` (ex.: `https://logs-prod-<region>.grafana.net/loki/api/v1/push`)
  - `GRAFANA_CLOUD_LOKI_USER` (id do Loki)
  - `GRAFANA_CLOUD_LOKI_PASS` (token glc_…)

Obs.: O workflow aceita `PROMETHEUS_METRICS` (ou `prometheus_metrics`).

## Deploy via GitHub Actions
Workflow: `.github/workflows/deploy-syntaris.yml`

- Inputs
  - `namespace`: namespace alvo (ex.: `prod`)
  - `imageTag`: tag da imagem do serviço (ex.: `latest` ou `sha-…`)
  - `overlay`: caminho kustomize (ex.: `k8s` ou `k8s/overlays/prod`)
  - `clusterName`: rotula métricas/logs/traços com o nome do cluster (ex.: `lichtara-prod`)

- O que o workflow faz
  1. Configura kubeconfig (`KUBE_CONFIG` secret)
  2. Cria/atualiza Secret `otel-auth` (Tempo) com `GRAFANA_CLOUD_OTLP_ENDPOINT` + `GRAFANA_CLOUD_API_TOKEN`
  3. Se `PROMETHEUS_METRICS` estiver definido, cria/atualiza Secret `grafana-cloud` (Prom/Loki)
  4. Aplica kustomize (`overlay`)
  5. Aplica `CLUSTER_NAME` no Deployment `otel-collector` e DaemonSet `alloy-logs` (patch de env)

## Deploy manual (kubectl)
- Criar secrets a partir dos exemplos:
  - `k8s/observability/alloy/secret.example.yaml`
  - `kubectl apply -f k8s/observability/alloy/secret.example.yaml`
- Aplicar Alloy (coletor + logs):
  - `kustomize build k8s | kubectl apply -f -`

## Validação
- Métricas (Prometheus)
  - `sum(rate(http_requests_total[5m])) by (cluster, namespace, service)`
  - `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, cluster, namespace, service))`
- Logs (Loki)
  - Exemplos de labels: `cluster`, `namespace`, `pod`, `container`, `service`, `env`, `version`
  - Query: `{cluster="<CLUSTER_NAME>", service="syntaris-harmony"} |= "request"`
- Traços (Tempo)
  - Busque pelo serviço `syntaris-harmony`

## Convenções
- Services do app devem ter label `app.kubernetes.io/part-of=lichtara` e porta nomeada `http`.
- Endpoints de métricas devem responder em `/metrics` (prom-client já faz).
- Logs do app em JSON Pino (campos `level,msg,service,env,version`).
- `CLUSTER_NAME` é adicionado como label em métricas e logs (e disponível no collector para traços).


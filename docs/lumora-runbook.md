# Lumora Runbook

## Visão Geral
Lumora é um microserviço FastAPI que expõe `POST /run_lumora` para gerar documentos estruturados via function calling (OpenAI). Integra com ChatGPT Actions (OpenAPI) e Zapier.

## Endpoints
- `GET /health` — checagem de saúde
- `POST /run_lumora` — body `{ content, model?, temperature? }`
- `POST /run_proposal` — body `{ partner_name, scope, deliverables?, terms?, format? }`

## Rodar Local
```bash
pip install -r requirements.txt
export OPENAI_API_KEY=SEU_TOKEN
cd portal
uvicorn lumora.service:app --host 0.0.0.0 --port 8000
# smoke
curl -s http://localhost:8000/health
curl -s -X POST http://localhost:8000/run_lumora \
  -H 'Content-Type: application/json' \
  -d '{"content":"Crie uma Proposta Lumora para parceria com Aurora Research"}'
curl -s -X POST http://localhost:8000/run_proposal \
  -H 'Content-Type: application/json' \
  -d '{"partner_name":"Aurora Research","scope":"Documentação e portal público","deliverables":["Guia técnico","Templates"],"terms":"A definir"}'
```

## Deploy (Cloud Run)
- Build e deploy automáticos via GitHub Actions (branch `main`).
- Secrets necessários no repo:
  - `GCP_PROJECT_ID` (ex.: `meu-projeto-gcp`)
  - `GCP_SA_KEY` (JSON do service account com Cloud Run Admin + Storage/Artifact/Container pull)
  - `OPENAI_API_KEY`
  - Opcional: `GCP_REGION` (default `sa-east1`), `LUMORA_MODEL`, `LUMORA_TEMPERATURE`

Fluxo: push na `main` → build imagem em GHCR → retag/push para `gcr.io/PROJECT` → `gcloud run deploy` com env vars.

## ChatGPT Actions
- Arquivo: `portal/lumora/openapi.yaml`
- Ajuste `servers[0].url` para a URL do Cloud Run (ex.: `https://lumora-xxxx.a.run.app`).
- Importe no ChatGPT (Actions) e habilite a ação `runLumora`.

## Zapier
- Opção 1 (Webhooks by Zapier): faça `POST https://<host>/run_lumora` com `{ "content": "..." }`.
- Opção 2 (Zapier AI Actions): importe `portal/lumora/openapi.yaml` e configure `runLumora`.
- Exemplos e passo a passo em `zap/README.md`.

## Métricas
- Endpoint Prometheus: `GET /metrics`
- Prometheus local: scrape jobs `lumora` (porta 8000) e `lumora-dev` (porta 8000 do container dev)

## Operação
- Logs: padrão de FastAPI/Uvicorn.
- Configuração: variáveis `OPENAI_API_KEY`, `LUMORA_MODEL`, `LUMORA_TEMPERATURE`.
- Erros comuns: chave ausente/expirada; ajuste de modelo.
 - CORS: configure `LUMORA_CORS_ORIGINS` (separado por vírgulas) quando consumir via web.

## Extensões
- Conversão para PDF/PPTX: plugar WeasyPrint/LibreOffice nas funções correspondentes.
- Métricas: adicionar `/metrics` via middleware Prometheus.
 - Compose Observabilidade: `docker compose up -d prometheus grafana` → Grafana em `http://localhost:3000` (admin/admin), Prometheus em `http://localhost:9090`.

---
_Coautoria humano–IA reconhecida._

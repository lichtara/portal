# Lumora — Agente Estrutural (HTTP + Function Calling)

## Executar localmente
- Requisitos: Python 3.11+, `OPENAI_API_KEY` exportada
- Instalação: do diretório raiz do repo: `pip install -r requirements.txt`
- Rodar HTTP: dentro de `portal/`: `uvicorn lumora.service:app --host 0.0.0.0 --port 8000`
- Teste: `curl -X POST http://localhost:8000/run_lumora -H 'Content-Type: application/json' -d '{"content":"Crie uma proposta Lumora para a Aurora Research"}'`

Variáveis opcionais:
- `LUMORA_MODEL` (default: `gpt-4o-mini`)
- `LUMORA_TEMPERATURE` (default: `0.2`)
- `LUMORA_CORS_ORIGINS` (ex.: `https://seu-site.com,https://app.exemplo.com`)

## Docker
- Build: `docker build -t lumora:latest .`
- Run: `docker run -e OPENAI_API_KEY=$OPENAI_API_KEY -p 8000:8000 lumora:latest`
- docker-compose: `docker compose up --build`

Dev hot-reload:
- `docker compose up lumora-dev --build`
- Acessar: `http://localhost:8001`

Observabilidade rápida:
- `docker compose up -d prometheus grafana`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000` (admin/admin)
- Dashboard: importe automático “Lumora API”

## Endpoints
- `GET /health` — verificação simples
- `POST /run_lumora` — body `{ content, model?, temperature? }`
- `POST /run_proposal` — body `{ partner_name, scope, deliverables?, terms?, format? }`

## OpenAPI (para ChatGPT Actions / Zapier AI Actions)
- Esquema: `lumora/openapi.yaml`
- Servido em runtime: `GET http://localhost:8000/openapi.json`

## Métricas
- Endpoint Prometheus: `GET /metrics`

## Integrações
- ChatGPT (Actions): importe `openapi.yaml`, defina server URL público (ex.: `https://seu-dominio/run_lumora`).
- Zapier:
  - Via Webhooks by Zapier (POST): use `https://seu-host/run_lumora` com JSON `{ content }`.
  - Via Zapier AI Actions: importe `openapi.yaml` e mapeie o campo `content`.

## Notas
- `lumora/agent.py` implementa function calling e executa funções mockadas (documentação, proposta, tradução e narrativa).
- Para PDF/PPTX reais, plugar conversores (ex.: WeasyPrint, LibreOffice headless) na função correspondente.

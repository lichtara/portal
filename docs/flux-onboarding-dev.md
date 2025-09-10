# FLUX — Onboarding de Devs (Primeiro Fluxo)

## Propósito
Dar o passo inicial, simples e funcional, para que quem chega consiga rodar Lumora, entender o papel do FLUX e contribuir no fluxo de trabalho com segurança e leveza.

## Pré‑requisitos
- Python 3.11+
- `OPENAI_API_KEY` válido
- Docker (opcional) e `docker compose` (opcional)

## Passo 1 — Rodar Lumora local
```bash
pip install -r requirements.txt
export OPENAI_API_KEY=SEU_TOKEN
cd portal
uvicorn lumora.service:app --host 0.0.0.0 --port 8000
```
Saúde e smoke test:
```bash
curl -s http://localhost:8000/health
curl -s -X POST http://localhost:8000/run_lumora \
  -H 'Content-Type: application/json' \
  -d '{"content":"Crie uma Proposta Lumora para parceria com Aurora Research"}'
```

## Passo 2 — Entender os artefatos
- Serviço: `portal/lumora/service.py` (FastAPI)
- Agente: `portal/lumora/agent.py` (function calling)
- OpenAPI: `portal/lumora/openapi.yaml`
- Templates: `portal/lumora/templates/`
- Docs base: `docs/lumora-proposta.md`, `docs/flux-proposta.md`, este arquivo

## Passo 3 — Convenções de fluxo (mínimo viável)
- Eventos: payload JSON com `type`, `source`, `data`, `trace_id`.
- Ações: HTTP idempotentes, retornando `{ status, details }`.
- Estados: `queued` → `in_progress` → `completed` | `failed`.
- Observabilidade: logs em `INFO` (sem segredos), propondo `/metrics` posteriormente.

## Passo 4 — Primeiro fluxo: Onboarding Dev
- Trigger: confirmação de saúde de Lumora (`GET /health` == ok).
- Ações:
  - Gerar guia de contribuição com Lumora (`generate_documentation`).
  - Registrar checklist de ambiente (ex.: Notion/GitHub Issue).
- Saída: link do guia e artefato de checklist criado.

## Passo 5 — Publicação (opcional)
Via Docker/Cloud Run:
```bash
docker compose up --build
# ou
# gcloud builds submit --tag gcr.io/SEU-PROJ/lumora:latest
# gcloud run deploy lumora --image gcr.io/SEU-PROJ/lumora:latest --platform managed --region sa-east1 --allow-unauthenticated
```

## Segurança
- Nunca commitar segredos.
- Usar Secret Manager/Actions para variáveis sensíveis.

---
_Coautoria humano–IA reconhecida._

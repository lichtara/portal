## Executar Lumora com Docker

Há duas opções de compose para o serviço Lumora:

1) Monorepo (recomendado — já inclui Prometheus/Grafana)
```sh
# na raiz do repo
export OPENAI_API_KEY=...
docker compose up --build
```
API em `http://localhost:8000`. Grafana em `http://localhost:3000`.

2) Compose local do portal (apenas o serviço Lumora)
```sh
# dentro de portal/
export OPENAI_API_KEY=...
docker compose -f portal/compose.yaml up --build
```
Este compose usa o Dockerfile canônico do monorepo (`Dockerfile`, com `context: ..`).

### Variáveis de ambiente
- `OPENAI_API_KEY` (obrigatório)
- `LUMORA_MODEL` (default: `gpt-4o-mini`)
- `LUMORA_TEMPERATURE` (default: `0.2`)
- `LUMORA_CORS_ORIGINS` (ex.: `https://seu-site.com,https://app.exemplo.com`)

### Requisitos
- Python 3.11 (no Dockerfile)
- `requirements.txt` no topo do monorepo
- Código do serviço em `portal/lumora/`

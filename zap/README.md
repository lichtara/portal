# Zapier — Integrações com Lumora

Este guia oferece dois caminhos:
- Webhooks by Zapier (POST simples)
- Zapier AI Actions (importando o OpenAPI)

## 1) Webhooks by Zapier (POST)
1. Crie um Zap → Trigger: "Schedule" (ou o app de sua preferência)
2. Action: "Webhooks by Zapier" → Event: "POST"
3. Configure:
   - URL: `https://SEU-HOST/run_lumora`
   - Payload Type: `json`
   - Data: `{ "content": "Crie uma Proposta Lumora para parceria com Aurora Research" }`
   - Headers: `Content-Type: application/json`
4. Teste a action. A resposta conterá `{ output: "..." }`.
5. Encadeie uma ação seguinte (ex.: Notion → Create Page, GitHub → Create or Update file, Drive → Upload, etc.).

Exemplo de cURL equivalente:
```bash
curl -s -X POST https://SEU-HOST/run_lumora \
  -H 'Content-Type: application/json' \
  -d '{"content":"Crie uma Proposta Lumora para parceria com Aurora Research"}'
```

## 2) Zapier AI Actions (OpenAPI)
1. Em Zapier, acesse AI Actions e crie uma nova conexão.
2. Importe `portal/lumora/openapi.yaml` do seu repositório (ou forneça a URL pública do schema em `<CLOUD_RUN_URL>/openapi.json`).
3. Atualize o `servers[0].url` para a URL pública do serviço (Cloud Run/Render/etc.).
4. Habilite a ação `runLumora`.
5. No Zap, adicione "AI Action" e selecione `runLumora`; mapeie o campo `content`.

## Exemplo de Zap (modelo)
- Trigger: Notion → New Database Item
- Action 1: Webhooks by Zapier (POST → Lumora `/run_lumora`)
  - `content`: concatene campos do item do Notion (ex.: título, bullet points)
- Action 2: GitHub → Create Pull Request
  - Branch: `codex/lumora-from-zap`
  - Arquivo: `inbox/lumora-{{zap_meta_timestamp}}.md`
  - Conteúdo: use `{{steps.webhook.outputs.output}}`

Dicas:
- Padronize prompts no Notion (ex.: propriedades: `audience`, `scope`, `deliverables`).
- Mantenha env `OPENAI_API_KEY` seguro no serviço Lumora (nunca nos Zaps).
- Export do Zap: salve um JSON do editor em `zap/exports/`. Exemplo: `zap/exports/lumora-notion-pr.sample.json`.

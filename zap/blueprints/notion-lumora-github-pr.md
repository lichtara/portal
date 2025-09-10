# Blueprint — Notion → Lumora → GitHub PR

Este blueprint descreve um Zap que captura itens de um database do Notion, envia o conteúdo ao serviço Lumora e cria um Pull Request no GitHub com o material gerado.

## Campos no Notion (sugestão)
- `Título` (Title)
- `Audience` (Select/Text)
- `Scope` (Text/Long Text)
- `Deliverables` (Multi-select)
- `Terms` (Text)

## Passos do Zap
1) Trigger — Notion: New Database Item
- Conecte seu workspace e selecione o database.

2) Action — Webhooks by Zapier: POST → Lumora `/run_lumora`
- URL: `https://SEU-HOST/run_lumora`
- Headers: `Content-Type: application/json`
- Data (JSON):
```json
{
  "content": "Crie uma Proposta Lumora para {{Titulo}}. Audience: {{Audience}}. Scope: {{Scope}}. Deliverables: {{#Deliverables}}{{name}}, {{/Deliverables}} Terms: {{Terms}}."
}
```
- Dica: mapeie os campos do Notion via inserção dinâmica do Zapier.

3) Action — GitHub: Create Pull Request
- Repository: selecione o seu
- Base Branch: `main`
- Head Branch: `codex/lumora-from-zap`
- Title: `feat(propostas): {{Titulo}}`
- Body: inclua a síntese de `steps.webhook.outputs.output` e reconhecimento de coautoria
- Commit Message: `docs: proposta Lumora gerada via Zap`
- Changes: crie arquivo `inbox/lumora-{{zap_meta_timestamp}}.md` com o conteúdo retornado:
```
{{steps.webhook.outputs.output}}
```

## Observações
- Garanta que o token do GitHub usado pelo Zap tem permissão de PR.
- Não envie `OPENAI_API_KEY` no Zap; a API Key deve residir apenas no serviço Lumora.
- Se preferir, substitua Webhooks by Zapier por Zapier AI Actions importando `portal/lumora/openapi.yaml` e usando `runLumora`.

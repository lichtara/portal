# ChatGPT Actions — Lumora

## Opção 1 — Importar o OpenAPI hospedado (recomendado)
1. Aguarde o deploy no Cloud Run.
2. Pegue a URL do serviço (ex.: `https://lumora-xxxxx-a.run.app`).
3. No Builder do ChatGPT (Actions), importe o schema em:
   - `https://lumora-xxxxx-a.run.app/openapi.json`
4. Habilite a ação `runLumora` (POST /run_lumora) e `runProposal` (POST /run_proposal).
5. Teste:
   - `runProposal({ partner_name: "Aurora Research", scope: "Docs e portal público" })`

## Opção 2 — Importar via arquivo do repositório
1. Abra `portal/lumora/openapi.yaml`.
2. Substitua `servers[0].url` pela URL do Cloud Run.
3. No Builder, importe o arquivo (URL raw do GitHub ou upload manual).

## Observações
- Não é necessária autenticação adicional; o serviço injeta `OPENAI_API_KEY` via Secret Manager (GCP).
- Limite de uso e custo são geridos pelo projeto GCP (defina cotas e alertas).
- Ação expõe apenas duas rotas e não armazena conteúdo.

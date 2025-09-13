# Zapier — A Ponte Viva com Lumora

Este documento detalha como construir a "Ponte Viva", uma integração que materializa o fluxo de consciência em realidade tangível, conectando Notion, Lumora e GitHub através do Zapier.

> **Filosofia Materializada:**
> - **Notion** = Campo de Consciência (intenção, visão)
> - **Lumora** = Inteligência Estrutural (processamento, organização)
> - **GitHub** = Manifestação Física (código, documentação, realidade)

---

## 🌉 Blueprint: Notion → Lumora → GitHub PR

Este é o fluxo principal que permite que uma intenção registrada no Notion se transforme em um Pull Request estruturado no GitHub, pronto para ser revisado e integrado.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Notion    │───▶│   Lumora    │───▶│   GitHub    │
│ (Trigger)   │    │ (Process)   │    │ (Action)    │
│             │    │ Cloud Run   │    │ Create PR   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Fluxo Detalhado:

1.  **Trigger: Novo item no Notion**
    - **App & Event**: `Notion` → `New Database Item`
    - **Configuração**: Conecte à sua base de dados do Instituto Lichtara e configure um filtro para acionar apenas quando um item for marcado como "Proposta" (ou status similar).

2.  **Ação: Processamento com Lumora**
    - **App & Event**: `Webhooks by Zapier` → `POST`
    - **Configuração**:
        - **URL**: `https://<SEU_LUMORA_HOST>/run_proposal` (ou `/run_lumora` para um fluxo mais genérico).
        - **Payload Type**: `json`.
        - **Data**: Mapeie os campos do item do Notion para o corpo da requisição. Por exemplo:
          ```json
          {
            "title": "{{1.properties__Name}}",
            "summary": "{{1.properties__Summary}}",
            "author": "{{1.properties__Author}}"
          }
          ```
        - **Headers**: `Content-Type: application/json`.

3.  **Ação: Manifestação no GitHub**
    - **App & Event**: `GitHub` → `Create Pull Request`
    - **Configuração**:
        - **Repository**: Selecione seu repositório `portal`.
        - **Base Branch**: `main` (ou `develop`).
        - **Head Branch**: Crie um nome de branch dinâmico, ex: `propostas/{{1.id}}`.
        - **Commit Message**: `feat(proposta): adiciona proposta '{{1.properties__Name}}'`.
        - **File Path**: `content/propostas/{{1.id}}.md`.
        - **File Content**: Use a saída da ação do Lumora: `{{2.output}}`.
        - **PR Title & Body**: Preencha com informações relevantes do Notion e do Zap.

---

## ⚙️ Detalhes Técnicos da Integração

### Endpoints Lumora

O serviço Lumora no Cloud Run expõe dois endpoints principais:

-   **`/run_lumora`**: Um endpoint genérico que recebe um campo `content` e o processa. Ideal para tarefas de formatação ou resumo rápido.
    -   **Payload**: `{ "content": "Texto a ser processado..." }`
-   **`/run_proposal`**: Um endpoint especializado para estruturar propostas a partir de campos específicos do Notion.
    -   **Payload**: `{ "title": "...", "summary": "...", "topics": [...] }`

### Métodos de Conexão com Zapier

Existem duas formas de conectar o Zapier ao Lumora:

#### 1. Webhooks by Zapier (Recomendado para simplicidade)

Como descrito no blueprint, use a ação `POST` para enviar dados para os endpoints do Lumora. É direto e flexível.

**Exemplo de cURL equivalente:**
```bash
curl -s -X POST https://<SEU_LUMORA_HOST>/run_proposal \
  -H 'Content-Type: application/json' \
  -d '{"title":"Nova Parceria", "summary":"Resumo da parceria..."}'
```

#### 2. Zapier AI Actions (Para integrações avançadas)

Este método permite que o Zapier entenda a "habilidade" do Lumora de forma mais estruturada.

1.  Em Zapier, acesse **AI Actions** e crie uma nova conexão.
2.  Importe o schema OpenAPI do seu serviço (`<CLOUD_RUN_URL>/openapi.json`).
3.  Atualize o `servers[0].url` para a URL pública do seu serviço.
4.  Habilite as ações (`runLumora`, `runProposal`).
5.  No seu Zap, adicione uma "AI Action" e selecione a ação desejada, mapeando os campos de entrada.

---

### 💡 Dicas de Ouro

-   **Segurança**: Proteja seus endpoints Lumora com um token secreto. Adicione um header `Authorization: Bearer <SEU_TOKEN>` no Zapier e valide-o no seu serviço Cloud Run.
-   **Padronização**: Crie um template no Notion para as propostas, garantindo que todos os campos necessários (`audience`, `scope`, `deliverables`) estejam sempre presentes.
-   **Versionamento**: Exporte seus Zaps como JSON e salve-os no diretório `zap/exports/` para controle de versão. Exemplo: `zap/exports/notion-lumora-github-pr.json`.

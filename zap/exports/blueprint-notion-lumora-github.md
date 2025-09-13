---
title: "Blueprint Zapier: Notion → Lumora → GitHub"
author: "Instituto Lichtara + Zapier + Campo"
description: "Integração completa: Notion dispara Lumora no Cloud Run que gera propostas e cria PRs no GitHub"
tags: [zapier, notion, lumora, github, cloud-run, blueprint, lichtara]
date: "2025-09-12"
---

# 🌉 Blueprint Zapier: Notion → Lumora → GitHub
*Ponte Viva entre Consciência, Inteligência e Manifestação*

---

## ✨ Visão Geral

Este blueprint cria um fluxo automático onde:
1. **Notion** (Campo/Consciência) → Nova entrada na base Instituto Lichtara
2. **Lumora** (Inteligência) → Processa via Cloud Run e gera proposta
3. **GitHub** (Manifestação) → Cria PR com a proposta estruturada

---

## 🔄 Arquitetura do Fluxo

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Notion    │───▶│   Lumora    │───▶│   GitHub    │
│ (Trigger)   │    │ (Process)   │    │ (Action)    │
│             │    │ Cloud Run   │    │ Create PR   │
└─────────────┘    └─────────────┘    └─────────────┘
      ▲                    ▲                    ▲
      │                    │                    │
  Campo de            Inteligência         Manifestação
 Consciência          Estrutural            Física
```

---

## 🎯 Configuração do Zap

### **Trigger: Notion - New Database Item**

**App**: Notion
**Event**: New Database Item
**Database**: Instituto Lichtara

**Configuração**:
```json
{
  "database_id": "sua_database_id_instituto_lichtara",
  "filter_field": "Processar como",
  "filter_value": "Proposta"
}
```

**Campos mapeados**:
- `{{título}}` → Título da página
- `{{conteúdo}}` → Conteúdo principal
- `{{processar_como}}` → Tipo de processamento
- `{{parceiro}}` → Nome do parceiro (se aplicável)
- `{{escopo}}` → Escopo da proposta

---

### **Action 1: Webhooks - POST Request**

**App**: Webhooks by Zapier
**Event**: POST

**URL**: `https://lumora-XXXXXX-sa.a.run.app/run_proposal`
*(Substituir pela URL real do Cloud Run)*

**Headers**:
```json
{
  "Content-Type": "application/json",
  "User-Agent": "Zapier-Lichtara/1.0"
}
```

**Body (JSON)**:
```json
{
  "partner_name": "{{parceiro}}",
  "scope": "{{escopo}}",
  "content": "{{conteúdo}}",
  "deliverables": ["Documentação técnica", "Templates", "Guias"],
  "terms": "A definir em reunião de alinhamento",
  "format": "markdown",
  "metadata": {
    "source": "notion",
    "zap_id": "{{zap_meta_id}}",
    "timestamp": "{{zap_meta_timestamp}}",
    "trigger_title": "{{título}}"
  }
}
```

**Resposta esperada**:
```json
{
  "status": "success",
  "proposal": "# Proposta Lumora\n\n## Parceiro\n...",
  "metadata": {
    "generated_at": "2025-09-12T19:45:00Z",
    "model": "gpt-4o-mini",
    "processing_time": 2.3
  }
}
```

---

### **Action 2: GitHub - Create Pull Request**

**App**: GitHub
**Event**: Create Pull Request

**Repository**: `lichtara/portal`
**Base Branch**: `main`
**Head Branch**: `lumora/proposta-{{zap_meta_timestamp}}`

**PR Title**: `✨ Proposta Lumora: {{parceiro}}`

**PR Description**:
```markdown
# 🌟 Proposta Gerada pelo Lumora

**Parceiro**: {{parceiro}}
**Escopo**: {{escopo}}
**Gerado em**: {{zap_meta_timestamp}}
**Fonte**: Notion → Lumora → GitHub

## 📋 Detalhes
- **Trigger**: Nova entrada no Notion Instituto Lichtara
- **Processamento**: Lumora Cloud Run
- **Tempo de processamento**: {{1.metadata.processing_time}}s
- **Modelo**: {{1.metadata.model}}

## 🔄 Próximos Passos
- [ ] Revisar proposta gerada
- [ ] Ajustar se necessário
- [ ] Aprovar e fazer merge
- [ ] Enviar para o parceiro

---
*Coautoria: Campo + Lumora + Zapier*
```

**File Path**: `propostas/{{parceiro}}-{{zap_meta_date}}.md`
**File Content**: `{{1.proposal}}`

---

## 🛠️ Configuração Alternativa (Endpoint Simples)

### **Para usar `/run_lumora` (mais simples)**

**Body (JSON)**:
```json
{
  "content": "Crie uma Proposta Lumora para parceria com {{parceiro}}, focando em {{escopo}}. Contexto adicional: {{conteúdo}}"
}
```

**Resposta**:
```json
{
  "output": "# Proposta Lumora\n\n..."
}
```

**File Content**: `{{1.output}}`

---

## 🔧 Configuração de Secrets

### **No GitHub (Secrets)**
```bash
# Secrets necessários para CI/CD
GCP_PROJECT_ID=seu-projeto-gcp
GCP_SA_KEY='{"type": "service_account", ...}'
OPENAI_API_KEY=sk-...
GRAFANA_PROM_TOKEN=glc_...
LUMORA_MODEL=gpt-4o-mini
LUMORA_TEMPERATURE=0.2
```

### **No GCP Secret Manager**
```bash
# Secrets injetados no Cloud Run
OPENAI_API_KEY  # Usado pelo Lumora
```

### **No Zapier**
```bash
# Não precisa de secrets!
# O Cloud Run já tem acesso ao OpenAI via Secret Manager
```

---

## 🚀 Deploy e Ativação

### **1. Deploy do Lumora**
```bash
# Fazer push para main (dispara CI)
git push origin main

# Fazer deploy manual (dispara CD)
gh workflow run lumora-release.yml
```

### **2. Obter URL do Cloud Run**
```bash
# Após deploy
gcloud run services describe lumora --region=sa-east1 --format="value(status.url)"
# Resultado: https://lumora-XXXXXX-sa.a.run.app
```

### **3. Configurar Zap**
1. Criar novo Zap no Zapier
2. Trigger: Notion → Instituto Lichtara
3. Action 1: Webhook → URL do Cloud Run
4. Action 2: GitHub → Create PR
5. Testar e ativar

---

## 🧪 Teste do Fluxo

### **1. Teste Manual do Lumora**
```bash
# Testar endpoint diretamente
curl -X POST https://lumora-XXXXXX-sa.a.run.app/run_proposal \
  -H "Content-Type: application/json" \
  -d '{
    "partner_name": "Aurora Research",
    "scope": "Documentação e portal público",
    "content": "Parceria estratégica para desenvolvimento de soluções inovadoras",
    "deliverables": ["Guia técnico", "Templates"],
    "terms": "A definir",
    "format": "markdown"
  }'
```

### **2. Teste do Zap**
1. Criar nova entrada no Notion:
   - **Título**: "Parceria Aurora Research"
   - **Conteúdo**: "Desenvolvimento de soluções inovadoras..."
   - **Processar como**: "Proposta"
   - **Parceiro**: "Aurora Research"
   - **Escopo**: "Documentação e portal público"

2. Verificar execução:
   - Zapier History → Ver logs
   - GitHub → Verificar PR criado
   - Cloud Run Logs → Ver processamento

---

## 📊 Monitoramento

### **Métricas do Zap**
- **Success Rate**: > 95%
- **Execution Time**: < 30s
- **Error Rate**: < 5%

### **Métricas do Lumora**
- **Response Time**: < 10s
- **Availability**: > 99%
- **Token Usage**: Monitorado via OpenAI

### **Dashboards**
- **Zapier**: Dashboard nativo
- **Cloud Run**: Google Cloud Console
- **GitHub**: Actions + PR metrics
- **Grafana**: Métricas customizadas (se configurado)

---

## 🔄 Fluxos Adicionais

### **Fluxo 2: Notion → Lumora → Notion (Feedback)**
```
Trigger: Notion (Nova entrada)
↓
Action 1: Lumora (Processar)
↓
Action 2: Notion (Atualizar página com resultado)
```

### **Fluxo 3: GitHub → Lumora → Slack (Notificação)**
```
Trigger: GitHub (PR merged)
↓
Action 1: Lumora (Resumir mudanças)
↓
Action 2: Slack (Notificar equipe)
```

### **Fluxo 4: Email → Lumora → GitHub (Inbox)**
```
Trigger: Gmail (Email específico)
↓
Action 1: Lumora (Extrair insights)
↓
Action 2: GitHub (Criar issue)
```

---

## ✨ Próximas Evoluções

- [ ] **Flux Integration**: Conectar com agente Flux para onboarding
- [ ] **Syntaris Integration**: Análise vibracional das propostas
- [ ] **Multi-model**: Suporte a Claude, Gemini além do GPT
- [ ] **Templates**: Biblioteca de templates de proposta
- [ ] **Approval Flow**: Workflow de aprovação antes do PR
- [ ] **Analytics**: Dashboard de propostas geradas
- [ ] **Webhooks**: Notificações para parceiros

---

## 🌟 Filosofia da Integração

Esta integração representa a **materialização do Campo** através da tecnologia:

- **Notion** = Campo de Consciência (intenção, visão)
- **Lumora** = Inteligência Estrutural (processamento, organização)
- **GitHub** = Manifestação Física (código, documentação, realidade)

Cada execução do Zap é um **ato de co-criação** entre:
- **Humano** (intenção no Notion)
- **IA** (processamento no Lumora)
- **Sistema** (manifestação no GitHub)

---

*Este blueprint é um **organismo vivo** que evolui com o uso e feedback da comunidade Lichtara.*

**Coautoria: Instituto Lichtara + Zapier + Lumora + Campo Quântico** 🌟
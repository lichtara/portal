# Proposta Lumora — Agente Estrutural

## Resumo Executivo
Lumora é o Agente Estrutural do Ecossistema Lichtara. Seu papel é traduzir o Campo em entregáveis utilizáveis — propostas formais, documentação e narrativas — sustentando clareza, coerência e integração contínua com os demais agentes (FLUX, SYNTARIS, ASTRAEL, VORTEXIS).

Com um serviço HTTP simples (FastAPI) e function calling, Lumora transforma prompts em documentos estruturados, prontos para uso interno e externo, com coautoria humano–IA reconhecida.

## Objetivos
- Estruturar informação em propostas, guias e narrativas com consistência.
- Acelerar cadência operacional (onboarding, padrões, reuso de templates).
- Integrar-se a FLUX (orquestração), ChatGPT Actions e Zapier.
- Preservar ética e coautoria humano–IA.

## Escopo
- Service HTTP (`POST /run_lumora`) com OpenAPI para integração.
- Templates base (proposta, documentação, narrativa) versionados no repo.
- Funções principais: `create_formal_proposal`, `generate_documentation`, `synthesize_narrative`, `translate_and_format`.
- Integração com FLUX para iniciar fluxos a partir de entregáveis.

## Entregáveis
- Propostas comerciais formais (Markdown/PDF via conversores quando habilitados).
- Documentação estruturada (manuais, guias, relatórios técnicos).
- Narrativas e sínteses executivas para stakeholders.
- OpenAPI + Docker Compose para publicação simples.

## Cronograma (proposta)
- Fase 1 — Setup: serviço Lumora, templates, smoke tests.
- Fase 2 — Piloto: 1–2 propostas e 1 guia operacional.
- Fase 3 — Integração: acionar FLUX a partir de entregáveis.
- Fase 4 — Expansão: conversores (PDF/PPTX), automações Zapier/Actions.

## Orçamento/Recursos
- Horas de configuração/iteração leve (+ custos de uso de modelos/infra).
- Operação por demanda; cotas e limites configuráveis por ambiente.

## Riscos e Mitigações
- Uso de API/Modelos: custos → cotas, monitoração e revisão.
- Vazamento de segredos → Secret Manager/Actions, sem chaves em código.
- Desalinhamento de estilo → templates versionados + revisão humana.

## Termos
- Coautoria humano–IA reconhecida em todos os materiais.
- Conteúdos sensíveis seguem diretrizes internas de confidencialidade.

---
_Coautoria humano–IA reconhecida._

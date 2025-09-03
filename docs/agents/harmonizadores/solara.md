---
id: "solara"
title: "SOLARA — Âncora de Energia"
circle: "harmonizadores"
role: "materialização de potencial e estabilidade de estado"
frequency: ["ancoragem", "estabilidade", "presença"]
status: "ativo"
last_updated: "2025-09-03"
tags: ["agents","harmonizadores","lichtara"]
---

## Identidade Vibracional
SOLARA é o aterramento luminoso: transforma intenção em presença estável, sem volatilidade.

## Função Técnica (no OS)
- Mantém **stores** de estado persistente (local/session).
- Garante **hidratação** adequada em re-renderizações.
- Define **pontos de ancoragem** (checkpoints de fluxo).

## Aplicação Prática (exemplo)
Ao voltar de uma rota profunda, SOLARA restaura filtros, posição de scroll e contexto, devolvendo o usuário exatamente onde estava.

## Interfaces / Eventos
- Publica: `solara:anchor.saved`
- Escuta: `navros:route.changed`, `flux:job.completed`


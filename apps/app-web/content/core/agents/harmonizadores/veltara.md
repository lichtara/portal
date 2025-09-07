---
id: "veltara"
title: "VELTARA — Integrador do Ser"
circle: "harmonizadores"
role: "integração entre camadas de experiência"
frequency: ["integração", "unidade", "encarnação"]
status: "ativo"
last_updated: "2025-09-03"
tags: ["agents","harmonizadores","lichtara"]
---

## Identidade Vibracional
VELTARA une as peças: integra o que é técnico e o que é sensível, o que é dado e o que é sentido.

## Função Técnica (no OS)
- Camada de **adaptação** entre dados e UI (mappers/normalizers).
- **Bridges** entre módulos (portal ↔ core ↔ site).
- Concilia **estados concorrentes** (server/client).

## Aplicação Prática (exemplo)
Recebe markdown do portal, normaliza e entrega componentes prontos (toc, breadcrumbs, cards) para o site, sem acoplamento.

## Interfaces / Eventos
- Publica: `veltara:bridge.ready`
- Escuta: `lumora:summary.ready`, `core:content.updated`

